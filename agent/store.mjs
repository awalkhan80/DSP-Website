import mysql from 'mysql2/promise';
import { randomUUID, createHash } from 'node:crypto';
import { validateProduct, calculatePrice, assertDeparture, publicSummary, revision, BookingError } from './core.mjs';
const object=v=>typeof v==='string'?JSON.parse(v):v;
const sqlDate=d=>new Date(d).toISOString().slice(0,19).replace('T',' ');

export function createStore(env=process.env, injectedPool=null) {
  if(!injectedPool && (!env.AGENT_DB_HOST || !env.AGENT_DB_USER || !env.AGENT_DB_NAME || !env.AGENT_DB_PASSWORD)) return null;
  const pool=injectedPool || mysql.createPool({host:env.AGENT_DB_HOST,port:Number(env.AGENT_DB_PORT||3306),user:env.AGENT_DB_USER,password:env.AGENT_DB_PASSWORD,database:env.AGENT_DB_NAME,connectionLimit:5,timezone:'Z',dateStrings:true,ssl:env.AGENT_DB_SSL==='true'?{}:undefined});
  const transaction=async fn=>{const c=await pool.getConnection();try{await c.beginTransaction();const result=await fn(c);await c.commit();return result;}catch(e){await c.rollback();throw e;}finally{c.release();}};
  async function product(id,c=pool,lock=false){const [rows]=await c.execute(`SELECT document FROM agent_products WHERE id=?${lock?' FOR UPDATE':''}`,[id]);if(!rows.length)throw new BookingError('This package needs an approved price sheet from our team.');return object(rows[0].document);}
  async function departure(trip,c=pool,lock=false){const [rows]=await c.execute(`SELECT capacity,reserved,open,cutoff FROM agent_departures WHERE product_id=? AND tour_date=?${lock?' FOR UPDATE':''}`,[trip.productId,trip.date]);const r=rows[0];return r?{...r,cutoff:r.cutoff.replace(' ','T')+'Z'}:null;}
  return {
    pool,
    async ready(){await pool.query('SELECT id FROM agent_products LIMIT 1');return true;},
    async products(){const [rows]=await pool.query('SELECT document FROM agent_products ORDER BY id');return rows.map(r=>object(r.document));},
    async check(trip){const p=await product(trip.productId),price=calculatePrice(p,trip);assertDeparture(await departure(trip),price.units);return {available:true,trip,units:price.units};},
    async quote(sessionId,trip){const p=await product(trip.productId),price=calculatePrice(p,trip);assertDeparture(await departure(trip),price.units);const id=randomUUID(),expiresAt=new Date(Date.now()+10*60*1000);const doc={trip,revision:revision(p),summary:publicSummary(p,trip,price)};await pool.execute('INSERT INTO agent_quotes(id,session_id,product_id,document,expires_at) VALUES(?,?,?,?,?)',[id,sessionId,p.id,JSON.stringify(doc),sqlDate(expiresAt)]);return {id,expiresAt:expiresAt.toISOString(),...doc.summary};},
    async confirm(sessionId,quoteId,guest){return transaction(async c=>{
      const [quotes]=await c.execute('SELECT document,expires_at FROM agent_quotes WHERE id=? AND session_id=? FOR UPDATE',[quoteId,sessionId]);
      if(!quotes.length)throw new BookingError('Quote not found for this conversation.');
      const [existing]=await c.execute('SELECT document FROM agent_bookings WHERE quote_id=? AND session_id=?',[quoteId,sessionId]);
      if(existing.length)return object(existing[0].document);
      if(Date.parse(quotes[0].expires_at.replace(' ','T')+'Z')<=Date.now())throw new BookingError('Quote expired. Please request a current price and availability.');
      const q=object(quotes[0].document),p=await product(q.trip.productId,c,true);
      if(revision(p)!==q.revision)throw new BookingError('Package details changed. Please review a new quote.');
      const price=calculatePrice(p,q.trip);assertDeparture(await departure(q.trip,c,true),price.units);
      const reference='PHX-'+randomUUID().replaceAll('-','').slice(0,16).toUpperCase();
      const record={reference,status:'confirmed',paymentStatus:'unpaid',paymentMethod:'pay_on_arrival',summary:publicSummary(p,q.trip,price),guest,confirmedAt:new Date().toISOString(),driverHelp:'+971561505270',pickupNote:'Exact pickup time will be provided by our team after booking.'};
      await c.execute('UPDATE agent_departures SET reserved=reserved+? WHERE product_id=? AND tour_date=?',[price.units,p.id,q.trip.date]);
      await c.execute('INSERT INTO agent_bookings(reference,quote_id,session_id,document) VALUES(?,?,?,?)',[reference,quoteId,sessionId,JSON.stringify(record)]);
      return record;
    });},
    async enquiry(sessionId,kind,data){const document={...data,marketingConsent:false};const dedupe=createHash('sha256').update(JSON.stringify({sessionId,kind,document})).digest('hex');const id=randomUUID();await pool.execute('INSERT IGNORE INTO agent_enquiries(id,dedupe,kind,document) VALUES(?,?,?,?)',[id,dedupe,kind,JSON.stringify(document)]);const [rows]=await pool.execute('SELECT id FROM agent_enquiries WHERE dedupe=?',[dedupe]);return {recorded:true,reference:rows[0].id};},
    async saveProduct(p){p=validateProduct(p);await pool.execute('INSERT INTO agent_products(id,document) VALUES(?,?) ON DUPLICATE KEY UPDATE document=VALUES(document)',[p.id,JSON.stringify(p)]);},
    async saveDeparture(d){return transaction(async c=>{await product(d.productId,c,true);const old=await departure({productId:d.productId,date:d.date},c,true);if(old&&d.capacity<old.reserved)throw new BookingError('Capacity cannot be below existing confirmed reservations.');await c.execute('INSERT INTO agent_departures(product_id,tour_date,capacity,open,cutoff) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE capacity=VALUES(capacity),open=VALUES(open),cutoff=VALUES(cutoff)',[d.productId,d.date,d.capacity,d.open,sqlDate(d.cutoff)]);});},
    async departures(){const [rows]=await pool.query('SELECT product_id,tour_date,capacity,reserved,open,cutoff FROM agent_departures ORDER BY tour_date DESC LIMIT 200');return rows;},
    async inbox(){const [bookings]=await pool.query('SELECT document FROM agent_bookings ORDER BY created_at DESC LIMIT 100');const [enquiries]=await pool.query('SELECT id,kind,document,created_at FROM agent_enquiries ORDER BY created_at DESC LIMIT 100');return {bookings:bookings.map(r=>object(r.document)),enquiries:enquiries.map(r=>({...r,document:object(r.document)}))};},
  };
}
