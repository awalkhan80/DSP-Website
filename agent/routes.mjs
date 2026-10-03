import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { createStore } from './store.mjs';
import { reply, contact } from './assistant.mjs';
import { BookingError } from './core.mjs';
const safe=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const guestSchema=contact.extend({phone:z.string().regex(/^\+?[0-9 ()-]{7,30}$/)});
const departureSchema=z.object({productId:z.string().regex(/^[a-z0-9-]{1,100}$/),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),capacity:z.number().int().min(0).max(10000),open:z.boolean(),cutoff:z.string().datetime({offset:true})}).refine(d=>Number.isFinite(Date.parse(d.date))&&new Date(d.date).toISOString().slice(0,10)===d.date,{message:'Invalid departure date'});
export function mountPhoenixAgent(app,{env=process.env,store=createStore(env),runReply=reply}={}) {
  const sessions=new Map(),limits=new Map();
  const origin=env.APP_ORIGIN||'http://localhost:3000';
  const cleanup=setInterval(()=>{const now=Date.now();for(const [k,v] of sessions)if(v.expires<now)sessions.delete(k);for(const [k,v] of limits)if(v.reset<now)limits.delete(k);},60000);cleanup.unref();
  app.get('/agent-operations',(_req,res)=>res.type('html').send(readFileSync(new URL('./operations.html',import.meta.url),'utf8')));
  app.use('/api/agent',(req,res,next)=>{
    res.set('Cache-Control','no-store');res.set('X-Content-Type-Options','nosniff');
    if(req.method!=='GET'&&(req.get('origin')!==origin||!req.is('application/json')))return res.status(403).json({error:'Use the website on its configured origin.'});
    const key=req.ip||'unknown',now=Date.now();let limit=limits.get(key);
    if(!limit||limit.reset<now){if(limits.size>=10000)return res.status(503).json({error:'Please try later.'});limit={count:0,reset:now+600000};limits.set(key,limit);}
    if(++limit.count>80)return res.status(429).json({error:'Please wait before sending more requests.'});
    next();
  });
  app.get('/api/agent/status',safe(async(_req,res)=>{
    let database=false;if(store)try{database=await store.ready();}catch{}
    res.json({chatAvailable:Boolean(env.OPENAI_API_KEY&&env.OPENAI_MODEL),bookingAvailable:database,paymentMethod:'pay_on_arrival',phone:'+971561505270'});
  }));
  function getSession(req){const token=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('phoenix_agent='))?.slice(14);const s=token&&sessions.get(token);if(!s||s.expires<Date.now())return null;s.expires=Date.now()+30*60000;return s;}
  app.post('/api/agent/session',(req,res)=>{
    let session=getSession(req);
    if(!session){if(sessions.size>=500)return res.status(503).json({error:'Please try again later.'});const id=randomBytes(32).toString('hex');session={id,expires:Date.now()+30*60000,history:[],quotes:new Map(),turns:0,busy:false,draft:null,booking:null};sessions.set(id,session);res.cookie('phoenix_agent',id,{httpOnly:true,sameSite:'strict',secure:origin.startsWith('https:'),maxAge:30*60000,path:'/api/agent'});}
    res.json({ready:true});
  });
  const sessionRequired=(req,res,next)=>{const s=getSession(req);if(!s)return res.status(401).json({error:'Please reopen the chat to start a new session.'});req.agentSession=s;next();};
  app.post('/api/agent/chat',sessionRequired,safe(async(req,res)=>{
    const s=req.agentSession;
    const body=z.object({message:z.string().trim().min(1).max(3000)}).parse(req.body);
    if(s.busy)return res.status(409).json({error:'Please wait for the current response.'});
    if(s.turns>=30)return res.status(429).json({error:'Please contact our team to continue this conversation.'});
    s.busy=true;s.turns++;
    try{const answer=await runReply(s,store,body.message,env);res.json(answer);}finally{s.busy=false;}
  }));
  app.post('/api/agent/confirm',sessionRequired,safe(async(req,res)=>{
    const s=req.agentSession;
    const body=z.object({quoteId:z.string().uuid(),accepted:z.literal(true),guest:guestSchema}).parse(req.body);
    if(s.busy)return res.status(409).json({error:'Please wait for the current response.'});
    if(!store)throw new BookingError('Our team must complete this booking. Please call +971561505270.');
    if(!s.quotes.has(body.quoteId))throw new BookingError('Review a current quote in this conversation first.');
    s.busy=true;
    try{const booking=await store.confirm(s.id,body.quoteId,body.guest);s.booking=booking;s.draft=null;res.json({booking});}finally{s.busy=false;}
  }));
  app.use('/api/agent/admin',(req,res,next)=>{
    const expected=env.AGENT_ADMIN_TOKEN;
    const token=(req.get('authorization')||'').replace(/^Bearer /,'');
    if(!expected||expected.length<32||!timingSafeEqual(createHash('sha256').update(token).digest(),createHash('sha256').update(expected).digest()))return res.status(401).json({error:'Operator authentication required.'});
    if(!store)return res.status(503).json({error:'Configure the agent database and run its migration first.'});
    next();
  });
  app.get('/api/agent/admin/products',safe(async(_req,res)=>res.json({products:await store.products(),catalogue:JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url),'utf8'))})));
  app.put('/api/agent/admin/products',safe(async(req,res)=>{await store.saveProduct(req.body);res.json({saved:true});}));
  app.get('/api/agent/admin/departures',safe(async(_req,res)=>res.json({departures:await store.departures()})));
  app.put('/api/agent/admin/departures',safe(async(req,res)=>{await store.saveDeparture(departureSchema.parse(req.body));res.json({saved:true});}));
  app.get('/api/agent/admin/inbox',safe(async(_req,res)=>res.json(await store.inbox())));
  app.use('/api/agent',(err,req,res,_next)=>{
    if(err instanceof z.ZodError)return res.status(400).json({error:'Please check the submitted fields.'});
    if(err instanceof BookingError)return res.status(409).json({error:err.message});
    console.error('[Phoenix Agent]',err?.name||'ServiceError');
    res.status(503).json({error:'The service is temporarily unavailable. Please contact +971561505270.'});
  });
  return {close:async()=>{clearInterval(cleanup);await store?.pool?.end();}};
}
