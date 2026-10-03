from __future__ import annotations

import os
import secrets
from collections import defaultdict
from contextlib import asynccontextmanager

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field
from agents import Runner

from agent import BookingContext, build_agent

load_dotenv()
if not os.getenv("OPENAI_API_KEY"):
    # SDK reads OPENAI_API_KEY directly; check early for a useful startup error.
    pass

HISTORY: dict[str, list] = defaultdict(list)  # Demo only; use encrypted durable session store in production.
HTTP = httpx.AsyncClient()
AGENT = build_agent()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await HTTP.aclose()


app = FastAPI(title="Phoenix UAE Tours Booking Assistant", lifespan=lifespan)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    session_id: str = Field(min_length=20, max_length=100)


@app.get("/", response_class=HTMLResponse)
async def home():
    return HTMLResponse(HTML)


@app.post("/api/chat")
async def chat(body: ChatRequest):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(503, "Add OPENAI_API_KEY to .env to run the assistant.")
    context = BookingContext(
        http=HTTP,
        api_base=os.getenv("BOOKING_API_BASE_URL", ""),
        api_token=os.getenv("BOOKING_API_TOKEN", ""),
        session_id=body.session_id,
    )
    prior = HISTORY[body.session_id]
    try:
        result = await Runner.run(
            AGENT, [*prior, {"role": "user", "content": body.message}], context=context
        )
        HISTORY[body.session_id] = result.to_input_list()
        return {"reply": result.final_output or "I'm checking that with the team.",
                "booking_confirmed": context.created_booking}
    except Exception as e:
        # Avoid leaking provider error details to guests.
        raise HTTPException(502, "Assistant is temporarily unavailable. Please contact +971561505270.") from e


HTML = r'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Phoenix Travel & Tours</title>
<style>*{box-sizing:border-box}body{margin:0;background:#f3f6fa;color:#14243a;font:16px system-ui}main{max-width:720px;height:100dvh;margin:auto;background:white;display:flex;flex-direction:column;box-shadow:0 0 30px #182a4212}.head{padding:20px;background:#092a46;color:white}.head b{font-size:19px}.head small{display:block;color:#cad8e5;margin-top:4px}.chat{flex:1;overflow:auto;padding:20px;display:flex;flex-direction:column;gap:12px}.bubble{max-width:85%;white-space:pre-wrap;padding:12px 15px;border-radius:16px;background:#eef3f8;line-height:1.45}.user{align-self:flex-end;background:#dcecff}.bar{display:flex;padding:14px;gap:8px;border-top:1px solid #e3e8ee}.bar input{flex:1;padding:12px;border:1px solid #ccd5df;border-radius:12px;font:inherit}.bar button{background:#0c5278;color:white;border:0;border-radius:12px;padding:0 20px;font:inherit}footer{text-align:center;color:#617286;font-size:12px;padding:0 10px 10px}</style>
<main><header class="head"><b>Phoenix Travel & Tours</b><small>AI booking assistant · UAE tours · Pay on arrival</small></header><section class="chat" id="chat"><div class="bubble">Hello! I’m Phoenix Travel & Tours’ AI assistant. Which UAE tour are you interested in?</div></section><form class="bar" id="form"><input id="msg" placeholder="Type your message…" autocomplete="off" required><button>Send</button></form><footer>Never send card details in chat. For urgent help: +971561505270</footer></main>
<script>const sid=(()=>{let x=localStorage.getItem('phoenix_sid');if(!x){x=crypto.randomUUID()+crypto.randomUUID();localStorage.setItem('phoenix_sid',x)}return x})();const chat=document.querySelector('#chat'),form=document.querySelector('#form'),msg=document.querySelector('#msg');function add(t,c){let d=document.createElement('div');d.className='bubble '+(c||'');d.textContent=t;chat.append(d);chat.scrollTop=chat.scrollHeight}form.onsubmit=async e=>{e.preventDefault();let text=msg.value.trim();if(!text)return;msg.value='';add(text,'user');let wait=document.createElement('div');wait.className='bubble';wait.textContent='One moment…';chat.append(wait);try{let r=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:text,session_id:sid})});let d=await r.json();wait.remove();add(d.reply||d.detail||'Please try again.')}catch{wait.remove();add('Connection issue. Please try again or call +971561505270.')}};</script></html>'''
