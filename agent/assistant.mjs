import { Agent, run, tool, setTracingDisabled } from '@openai/agents';
import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { BookingError } from './core.mjs';
setTracingDisabled(true);
const catalogue=JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url),'utf8'));
const instructions=readFileSync(new URL('./instructions.md',import.meta.url),'utf8');
const trip=z.object({productId:z.string(),date:z.string(),adults:z.number().int(),childrenAges:z.array(z.number().int()),pickupZone:z.string()});
const contact=z.object({name:z.string().min(2).max(150),phone:z.string().min(7).max(30),pickupLocation:z.string().min(3).max(300)});
export { contact };
export function makeAssistant(session,store,env=process.env) {
  const invoke=fn=>async args=>{
    if(!store)return {ok:false,needsHuman:true,message:'The booking service is unavailable. Contact +971561505270; do not claim a handoff was recorded.'};
    for(let attempt=0;attempt<2;attempt++)try{return await fn(args);}catch(e){
      if(e instanceof BookingError)return {ok:false,needsHuman:true,message:e.message};
      if(attempt===1)return {ok:false,needsHuman:true,message:'This step failed after a retry. Do not quote, confirm, or claim the team was notified. Offer +971561505270.'};
    }
  };
  const tools=[
    tool({name:'search_knowledge_base',description:'Retrieve approved products, exact pickup-zone names and policies. Website reference rates are not final quotes.',parameters:z.object({query:z.string()}),execute:async({query})=>{
      let approved=[];if(store)try{approved=await store.products();}catch{}
      const terms=query.toLowerCase().split(/\s+/).filter(Boolean);
      const ranked=catalogue.tours.filter(p=>!terms.length||terms.some(t=>`${p.title} ${p.id} ${p.description}`.toLowerCase().includes(t)));
      return {approvedProducts:approved,websiteReference:ranked.slice(0,8),referenceNotice:catalogue.notice};
    }}),
    tool({name:'get_price',description:'Get a final AED quote from approved rates and live dated inventory. Includes policies and transfer costs. Requires exact package/zone names from the knowledge base.',parameters:trip,execute:invoke(async args=>{const q=await store.quote(session.id,args);session.quotes.set(q.id,q);return {ok:true,quote:q};})}),
    tool({name:'check_availability',description:'Check live dated inventory; never infer operating dates or stock from website marketing text.',parameters:trip,execute:invoke(args=>store.check(args))}),
    tool({name:'create_payment_link',description:'Disabled: all agent bookings use pay on arrival.',parameters:z.object({}),execute:async()=>({ok:false,disabled:true,paymentMethod:'pay_on_arrival'})}),
    tool({name:'create_booking',description:'Prepare the selected quote for the guest to accept using the secure confirmation card. This tool cannot itself confirm a reservation.',parameters:z.object({quoteId:z.string(),guest:contact}),execute:async({quoteId,guest})=>{
      const q=session.quotes.get(quoteId);
      if(!q||Date.parse(q.expiresAt)<=Date.now())return {ok:false,message:'Request a fresh price and availability.'};
      session.draft={quote:q,guest};return {status:'awaiting_guest_confirmation',message:'Ask the guest to review the summary and press Confirm pay-on-arrival booking. Do not say confirmed yet.'};
    }}),
    tool({name:'escalate_to_human',description:'Record a support ticket in the operator inbox. Include known guest contact, request, date, pax, language, quote and urgency. No promises unless recorded succeeds.',parameters:z.object({summary:z.string().max(3000),guestName:z.string().max(150),phone:z.string().max(30),language:z.string().max(50),urgent:z.boolean()}),execute:invoke(args=>store.enquiry(session.id,'handoff',args))}),
    tool({name:'log_lead',description:'Record an enquiry for internal follow-up only, without marketing consent.',parameters:z.object({name:z.string().min(2).max(150),phone:z.string().min(7).max(30),tour:z.string().min(1).max(150),date:z.string().max(30),pax:z.string().max(100),language:z.string().max(50)}),execute:invoke(args=>store.enquiry(session.id,'lead',args))}),
  ];
  return new Agent({name:'UAE Inbound Tours Booking Agent (v2)',model:env.OPENAI_MODEL,instructions:instructions+'\nCurrent UAE date/time: '+new Date().toLocaleString('en-GB',{timeZone:'Asia/Dubai'})+'\nMost recent server-confirmed booking in this session: '+JSON.stringify(session.booking||null),modelSettings:{parallelToolCalls:false},tools});
}
export async function reply(session,store,message,env=process.env) {
  if(!env.OPENAI_API_KEY||!env.OPENAI_MODEL)throw new BookingError('AI chat is being set up. Please contact +971561505270.','NOT_CONFIGURED');
  const result=await run(makeAssistant(session,store,env),[...session.history,{role:'user',content:message}],{maxTurns:8,signal:AbortSignal.timeout(60000)});
  session.history=result.history;
  return {reply:result.finalOutput,draft:session.draft||null};
}
