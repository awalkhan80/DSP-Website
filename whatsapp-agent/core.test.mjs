import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createAgent, openDatabase, ingest, validDate, verifySignature } from './core.mjs';
const now = Date.parse('2026-09-24T12:00:00Z');
const catalog = { tours: [{id:'safari',title:'Safari',priceAED:120,priceUnit:'per adult',unit:'adult',enabled:true},{id:'vip',title:'VIP',priceAED:850,priceUnit:'per car',unit:'car',maxGuests:6,enabled:true},{id:'buggy',title:'Buggy',priceAED:1000,enabled:false}] };
function setup(capacity = 10) {
  const db = openDatabase(':memory:');
  db.prepare('INSERT INTO slots VALUES(?,?,?)').run('safari','2026-09-25',capacity);
  db.prepare('INSERT INTO slots VALUES(?,?,?)').run('vip','2026-09-25',2);
  const agent = createAgent(db, catalog, { notifyEmail: 'awalgsm@gmail.com' });
  let id=0;
  const say = (text, phone='971500000001', timestamp=now) => {
    const message={id:String(++id),phone,text,timestamp};
    db.prepare('INSERT INTO inbox(id,phone,text,timestamp) VALUES(?,?,?,?)').run(message.id,phone,text,timestamp);
    return {reply:agent.process(message,null,timestamp),message};
  };
  const draft = (phone='971500000001',tour='1',guests='2, 0') => {
    for(const text of [tour,'2026-09-25',guests,'Test Guest','Dubai Marina Hotel']) say(text,phone);
  };
  return {db,agent,say,draft};
}
test('only a reviewed quote and explicit CONFIRM reserve inventory and email owner',()=>{
  const {db,say,draft}=setup();draft();
  say('yes');assert.equal(db.prepare('SELECT count(*) n FROM bookings').get().n,0);
  assert.match(say('CONFIRM').reply,/Booking confirmed: PHX-/);
  const booking=JSON.parse(db.prepare('SELECT body FROM bookings').get().body);
  assert.equal(booking.total,240);
  assert.equal(db.prepare("SELECT remaining FROM slots WHERE tour='safari'").get().remaining,8);
  const email=db.prepare("SELECT * FROM outbox WHERE kind='email'").get();
  assert.equal(email.recipient,'awalgsm@gmail.com');assert.match(email.body,/Payment status: unpaid/);
  db.close();
});
test('replayed webhook and repeated confirmation never double book',()=>{
  const {db,agent,say,draft}=setup();draft();const {message}=say('CONFIRM');agent.process(message,null,now);say('CONFIRM');
  assert.equal(db.prepare('SELECT count(*) n FROM bookings').get().n,1);
  assert.equal(db.prepare("SELECT count(*) n FROM outbox WHERE kind='email'").get().n,1);db.close();
});
test('two competing customers cannot oversell final capacity',()=>{
  const {db,say,draft}=setup(2);draft('971500000001');draft('971500000002');
  say('CONFIRM','971500000001');assert.match(say('CONFIRM','971500000002').reply,/sold out/);
  assert.equal(db.prepare('SELECT count(*) n FROM bookings').get().n,1);db.close();
});
test('VIP charges per car and consumes one car',()=>{
  const {db,say,draft}=setup();draft('971500000001','2','6, 0');say('CONFIRM');
  assert.equal(JSON.parse(db.prepare('SELECT body FROM bookings').get().body).total,850);
  assert.equal(db.prepare("SELECT remaining FROM slots WHERE tour='vip'").get().remaining,1);db.close();
});
test('disabled tours hand over and pause',()=>{
  const {db,say}=setup();assert.match(say('3').reply,/paused/);assert.equal(say('hello').reply,null);
  assert.equal(db.prepare("SELECT count(*) n FROM outbox WHERE kind='email'").get().n,1);
  assert.match(say('RESUME').reply,/Welcome/);db.close();
});
test('children require staff to review ages and rates',()=>{
  const {db,say}=setup();say('1');say('2026-09-25');assert.match(say('2, 1').reply,/paused/);db.close();
});
test('unopened dates never create availability',()=>{
  const {db,say}=setup();say('1');assert.match(say('2026-09-26').reply,/not open/);db.close();
});
test('stale quote requires fresh review',()=>{
  const {db,say,draft}=setup();draft();assert.match(say('CONFIRM','971500000001',now+901000).reply,/expired/);
  assert.equal(db.prepare('SELECT count(*) n FROM bookings').get().n,0);db.close();
});
test('stale inbound is suppressed outside customer service window',()=>{
  const {db,agent}=setup();const message={id:'old',phone:'971500000001',text:'hello',timestamp:now-24*3600000};
  db.prepare('INSERT INTO inbox(id,phone,text,timestamp) VALUES(?,?,?,?)').run(message.id,message.phone,message.text,message.timestamp);
  agent.process(message,null,now);assert.equal(db.prepare('SELECT count(*) n FROM outbox').get().n,0);db.close();
});
test('date validation rejects rollover, today and past dates in Dubai timezone',()=>{
  assert.equal(validDate('2026-02-30',now),false);assert.equal(validDate('2026-09-24',now),false);
  assert.equal(validDate('2026-09-25',Date.parse('2026-09-24T21:00:00Z')),false);
  assert.equal(validDate('2026-09-25',now),true);
});
test('HMAC verifies original bytes and rejects tampering',()=>{
  const body=Buffer.from('{"test":true}');const signature='sha256='+createHmac('sha256','secret').update(body).digest('hex');
  assert.equal(verifySignature(body,signature,'secret'),true);assert.equal(verifySignature(Buffer.from('{}'),signature,'secret'),false);
  assert.equal(verifySignature(body,'broken','secret'),false);
});
test('inbox deduplicates and ignores wrong business number and status events',()=>{
  const db=openDatabase(':memory:');
  const payload={object:'whatsapp_business_account',entry:[{changes:[{field:'messages',value:{metadata:{phone_number_id:'123'},messages:[{id:'abc',from:'971500000001',type:'text',text:{body:'hi'},timestamp:String(now/1000)}]}}]}]};
  ingest(db,payload,'other');assert.equal(db.prepare('SELECT count(*) n FROM inbox').get().n,0);
  ingest(db,payload,'123');ingest(db,payload,'123');assert.equal(db.prepare('SELECT count(*) n FROM inbox').get().n,1);db.close();
});
test('transaction rolls back reservation when notification cannot be saved',()=>{
  const {db,say,draft}=setup();draft();
  db.exec("CREATE TRIGGER reject_email BEFORE INSERT ON outbox WHEN NEW.kind='email' BEGIN SELECT RAISE(ABORT,'test'); END;");
  assert.throws(()=>say('CONFIRM'));assert.equal(db.prepare('SELECT count(*) n FROM bookings').get().n,0);
  assert.equal(db.prepare("SELECT remaining FROM slots WHERE tour='safari'").get().remaining,10);db.close();
});
