import React, { useEffect, useRef, useState } from 'react';

type Guest = { name: string; phone: string; pickupLocation: string };
type Quote = { id: string; tour: string; date: string; adults: number; childrenAges: number[]; pickupZone: string; transferType: string; totalAED: string; vatPercent: number; paymentMethod: string; inclusions: string[]; exclusions: string[]; pickupWindow: string; cancellationPolicy: string; refundPolicy: string; healthRequirements: string; ageRequirements: string; dressRequirements: string; expiresAt: string };
type Draft = { quote: Quote; guest: Guest };
type Booking = { reference: string; status: string; summary: Quote; guest: Guest; pickupNote: string; driverHelp: string };
const blankGuest = { name: '', phone: '', pickupLocation: '' };
const whatsapp = 'https://wa.me/971561505270';

export function TourAssistant() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{role:string;text:string}[]>([{role:'assistant',text:'Hello! I’m Phoenix Travel & Tours’ AI assistant. Which UAE tour are you interested in?'}]);
  const [draft, setDraft] = useState<Draft|null>(null);
  const [guest, setGuest] = useState<Guest>(blankGuest);
  const [accepted, setAccepted] = useState(false);
  const [booking, setBooking] = useState<Booking|null>(null);
  const [error, setError] = useState('');
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const end = useRef<HTMLDivElement>(null);
  async function api(path:string, body?:unknown) {
    const r=await fetch('/api/agent/'+path,{method:body?'POST':'GET',credentials:'same-origin',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
    if(!r.headers.get('content-type')?.includes('application/json')) throw Error('Chat is being set up. Our team can help on WhatsApp.');
    const data=await r.json(); if(!r.ok) throw Error(data.error||'Please contact our team.');return data;
  }
  useEffect(()=>{const receive=(event:Event)=>{const data=(event as CustomEvent<{message:string}>).detail;if(typeof data?.message==='string'){setMessage(data.message.slice(0,3000));setOpen(true);setDraft(null);setAccepted(false);}};window.addEventListener('phoenix:booking-enquiry',receive);return()=>window.removeEventListener('phoenix:booking-enquiry',receive);},[]);
  useEffect(()=>{if(!open)return;let active=true;setError('');setReady(false);(async()=>{try{const status=await api('status');if(!status.chatAvailable)throw Error('AI chat is being set up. Our team can help on WhatsApp.');await api('session',{});if(active)setReady(true);}catch(e){if(active)setError((e as Error).message);}})();return()=>{active=false;};},[open]);
  useEffect(()=>{end.current?.scrollIntoView({behavior:'smooth',block:'nearest'});},[messages,busy,draft,booking]);
  useEffect(()=>{if(open)input.current?.focus();},[open,ready]);
  function close(){setOpen(false);launcher.current?.focus();}
  async function send(e:React.FormEvent){e.preventDefault();if(!message.trim()||busy||!ready)return;const text=message.trim();setMessage('');setBusy(true);setError('');setMessages(m=>[...m,{role:'user',text}]);try{const data=await api('chat',{message:text});setMessages(m=>[...m,{role:'assistant',text:data.reply||'Please contact our team.'}]);if(data.draft){setDraft(data.draft);setGuest(data.draft.guest||blankGuest);setAccepted(false);setBooking(null);}}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  async function confirm(e:React.FormEvent){e.preventDefault();if(!draft||!accepted||busy)return;setBusy(true);setError('');try{const data=await api('confirm',{quoteId:draft.quote.id,guest,accepted:true});setBooking(data.booking);setDraft(null);setAccepted(false);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  const q=draft?.quote;
  const summaryFields: [string,string][] = q ? [['Pickup window',q.pickupWindow],['Cancellation',q.cancellationPolicy],['Refunds',q.refundPolicy],['Health requirements',q.healthRequirements],['Age requirements',q.ageRequirements],['Dress requirements',q.dressRequirements]] : [];
  return <>
    <button ref={launcher} type="button" aria-expanded={open} aria-controls="tour-assistant-panel" onClick={()=>open?close():setOpen(true)} className="fixed bottom-6 left-4 z-40 rounded-full bg-stone-900 text-white border border-amber-500 px-4 py-3 text-sm font-semibold shadow-xl hover:bg-stone-800">✦ Tour assistant</button>
    {open&&<div ref={panel} id="tour-assistant-panel" role="dialog" aria-label="Phoenix AI tour assistant" onKeyDown={e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const nodes=panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),a[href]');if(nodes?.length){const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}}} className="fixed bottom-24 left-3 right-3 sm:right-auto sm:left-4 sm:w-[420px] z-[60] flex flex-col max-h-[calc(100dvh-7rem)] h-[640px] rounded-2xl bg-white border border-stone-200 shadow-2xl overflow-hidden text-stone-900">
      <header className="flex items-center justify-between p-4 bg-stone-900 text-white"><div><strong>Phoenix Travel & Tours</strong><p className="text-xs text-amber-200">AI assistant · Pay on arrival</p></div><button type="button" aria-label="Close chat" onClick={close} className="p-2 text-xl">×</button></header>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div role="log" aria-live="polite" className="space-y-3">{messages.map((m,i)=><div dir="auto" key={i} className={'p-3 rounded-xl text-sm whitespace-pre-wrap '+(m.role==='user'?'bg-amber-50 ml-6':'bg-stone-100 mr-3')}>{m.text}</div>)}</div>
        {busy&&<p role="status" className="text-sm text-stone-500">One moment…</p>}
        {q&&<form onSubmit={confirm} className="border border-amber-300 rounded-xl p-3 text-sm space-y-3">
          <h3 className="font-bold">Review your booking</h3><p>{q.tour} · {q.date}</p><p>{q.adults} adults{q.childrenAges.length?`, ${q.childrenAges.length} children (ages ${q.childrenAges.join(', ')})`:''}</p><p>{q.transferType} · {q.pickupZone}</p>
          <p className="font-bold">AED {q.totalAED} total — transfers included{q.vatPercent?`, including ${q.vatPercent}% VAT`:`, VAT rate ${q.vatPercent}%`} · Pay on arrival</p>
          <p><strong>Includes:</strong> {q.inclusions.join('; ')}</p><p><strong>Excludes:</strong> {q.exclusions.length?q.exclusions.join('; '):'None'}</p>
          {summaryFields.map(([label,value])=><p key={label}><strong>{label}:</strong> {value}</p>)}
          <p className="text-xs text-stone-500">Quote expires: {new Date(q.expiresAt).toLocaleString()}. Availability is checked again when you confirm.</p>
          {(['name','phone','pickupLocation'] as const).map(key=><label key={key} className="block">{key==='name'?'Full name':key==='phone'?'Phone number':'Hotel / pickup location'}<input required type={key==='phone'?'tel':'text'} maxLength={key==='pickupLocation'?300:key==='name'?150:30} value={guest[key]} onChange={e=>setGuest(g=>({...g,[key]:e.target.value}))} className="block w-full border rounded-lg p-2 mt-1"/></label>)}
          <label className="flex gap-2 items-start"><input type="checkbox" required checked={accepted} onChange={e=>setAccepted(e.target.checked)} className="mt-1"/><span>I accept the price, inclusions, exclusions, cancellation/refund policies and activity requirements above.</span></label>
          <button disabled={!accepted||busy} className="w-full rounded-lg bg-stone-900 text-white p-3 disabled:opacity-50">Confirm pay-on-arrival booking</button>
        </form>}
        {booking&&<section className="border border-green-300 bg-green-50 rounded-xl p-4 text-sm space-y-2"><h3 className="font-bold">Booking confirmed</h3><p className="font-mono break-all">{booking.reference}</p><p>{booking.summary.tour} · {booking.summary.date}</p><p>{booking.guest.name} · {booking.guest.pickupLocation}</p><p>{booking.summary.adults} adults · {booking.summary.childrenAges.length} children</p><p>AED {booking.summary.totalAED} due on arrival · {booking.summary.vatPercent}% VAT rate</p><p>Pickup window: {booking.summary.pickupWindow}</p><p>{booking.pickupNote}</p><p>Driver help: {booking.driverHelp}</p><p className="text-xs">Phoenix Travel & Tours · Licence 102357</p></section>}
        {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
        <div ref={end}/>
      </div>
      <form onSubmit={send} className="flex gap-2 p-3 border-t"><input ref={input} aria-label="Your message" dir="auto" value={message} maxLength={3000} onChange={e=>setMessage(e.target.value)} disabled={!ready||busy} placeholder="Ask about a UAE tour…" className="min-w-0 flex-1 border rounded-lg px-3 py-2 text-sm"/><button disabled={!ready||busy||!message.trim()} className="rounded-lg bg-stone-900 text-white px-3 disabled:opacity-40">Send</button></form>
      <footer className="px-4 pb-3 text-xs text-stone-500">Please don’t share card or ID details. <a className="underline" href={whatsapp} target="_blank" rel="noopener noreferrer">Contact our team</a></footer>
    </div>}
  </>;
}
