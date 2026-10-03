import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { mountPhoenixAgent } from '../agent/routes.mjs';
import { makeAssistant } from '../agent/assistant.mjs';
test('all required SDK tools are registered and payment links are disabled',async()=>{
 const a=makeAssistant({id:'s',quotes:new Map()},null,{OPENAI_MODEL:'test-model'});
 assert.deepEqual(a.tools.map(t=>t.name).sort(),['search_knowledge_base','get_price','check_availability','create_payment_link','create_booking','escalate_to_human','log_lead'].sort());
 const t=a.tools.find(t=>t.name==='create_payment_link');const out=await t.invoke({},'{}');assert.equal(out.disabled,true);
});
test('HTTP endpoints enforce origin, session ownership, explicit acceptance and operator auth',async()=>{
 const app=express();app.use(express.json());let confirmations=0;const quoteId='00000000-0000-4000-8000-000000000001';
 const store={ready:async()=>true,confirm:async()=>{confirmations++;return {reference:'TEST',paymentMethod:'pay_on_arrival'};}};
 const service=mountPhoenixAgent(app,{env:{APP_ORIGIN:'http://localhost',OPENAI_API_KEY:'test',OPENAI_MODEL:'test',AGENT_ADMIN_TOKEN:'x'.repeat(32)},store,runReply:async(s)=>{s.quotes.set(quoteId,{});return {reply:'test'};}});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}/api/agent`;
 const request=(path,body,cookie='',origin='http://localhost')=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify(body)});
 try{
  assert.equal((await request('/session',{},'','https://other.invalid')).status,403);
  const session=await request('/session',{});const cookie=session.headers.get('set-cookie').split(';')[0];assert.match(session.headers.get('set-cookie'),/HttpOnly/);
  const body={quoteId,accepted:true,guest:{name:'Test Guest',phone:'+971500000000',pickupLocation:'Test Hotel'}};
  assert.equal((await request('/confirm',body)).status,401);
  assert.equal((await request('/confirm',body,cookie)).status,409);
  await request('/chat',{message:'test'},cookie);
  assert.equal((await request('/confirm',{...body,accepted:false},cookie)).status,400);
  assert.equal(confirmations,0);
  assert.equal((await request('/confirm',body,cookie)).status,200);assert.equal(confirmations,1);
  assert.equal((await fetch(base+'/admin/inbox')).status,401);
 }finally{await service.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
});
