(function () {
  var API = (document.currentScript && document.currentScript.dataset.api) || '/api/chat';
  var css = `
  #pdc-btn{position:fixed;right:18px;bottom:18px;z-index:99999;background:#14293D;color:#fff;border:0;border-radius:28px;padding:14px 20px;font:600 15px system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25)}
  #pdc-btn:focus-visible,#pdc-send:focus-visible,#pdc-in:focus-visible{outline:3px solid #E39B2D;outline-offset:2px}
  #pdc-box{position:fixed;right:18px;bottom:78px;z-index:99999;width:min(370px,calc(100vw - 24px));height:min(540px,calc(100vh - 110px));background:#fff;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.28);display:none;flex-direction:column;overflow:hidden;font:15px/1.4 system-ui,sans-serif}
  #pdc-box.open{display:flex}
  #pdc-head{background:#14293D;color:#fff;padding:14px 16px;font-weight:600}
  #pdc-head small{display:block;font-weight:400;opacity:.8}
  #pdc-log{flex:1;overflow-y:auto;padding:12px;background:#f6f4ef}
  .pdc-m{max-width:85%;margin:6px 0;padding:9px 12px;border-radius:12px;white-space:pre-wrap;word-wrap:break-word}
  .pdc-u{background:#E39B2D;color:#1b1b1b;margin-left:auto;border-bottom-right-radius:3px}
  .pdc-b{background:#fff;color:#1b1b1b;border-bottom-left-radius:3px;border:1px solid #e4dfd3}
  #pdc-form{display:flex;gap:8px;padding:10px;border-top:1px solid #e4dfd3;background:#fff}
  #pdc-in{flex:1;border:1px solid #c9c2b0;border-radius:8px;padding:10px;font:inherit}
  #pdc-send{background:#14293D;color:#fff;border:0;border-radius:8px;padding:0 16px;font:600 15px system-ui;cursor:pointer}
  #pdc-wa{text-align:center;padding:6px;font-size:13px;background:#fff}
  #pdc-wa a{color:#14293D}`;
  var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

  var btn = document.createElement('button'); btn.id = 'pdc-btn'; btn.textContent = 'Chat with us';
  var box = document.createElement('div'); box.id = 'pdc-box';
  box.innerHTML = '<div id="pdc-head">Phoenix Desert Safari<small>Prices, tour details and bookings</small></div><div id="pdc-log" aria-live="polite"></div><div id="pdc-wa">Prefer WhatsApp? <a href="https://wa.me/971561505270" target="_blank" rel="noopener">+971 56 150 5270</a></div><form id="pdc-form"><input id="pdc-in" placeholder="Ask about a tour..." maxlength="1000" autocomplete="off" aria-label="Your message"><button id="pdc-send">Send</button></form>';
  document.body.append(box, btn);

  var log = box.querySelector('#pdc-log'), form = box.querySelector('#pdc-form'), input = box.querySelector('#pdc-in');
  var history = [], busy = false;

  function add(text, who) {
    var d = document.createElement('div'); d.className = 'pdc-m ' + (who === 'u' ? 'pdc-u' : 'pdc-b');
    d.textContent = text; log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  btn.onclick = function () {
    box.classList.toggle('open');
    if (box.classList.contains('open')) {
      if (!log.children.length) add('Hello! I can help with desert safari, quad bikes, buggies and city tours. What would you like to know?', 'b');
      input.focus();
    }
  };
  form.onsubmit = async function (e) {
    e.preventDefault();
    var text = input.value.trim(); if (!text || busy) return;
    input.value = ''; add(text, 'u'); history.push({ role: 'user', content: text });
    busy = true; var wait = add('...', 'b');
    try {
      var r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) });
      var data = await r.json();
      wait.textContent = data.reply || 'Sorry, please call +971561505270.';
      history.push({ role: 'assistant', content: wait.textContent });
    } catch (err) {
      wait.textContent = 'Connection problem. Please call or WhatsApp +971561505270.';
      history.pop();
    }
    busy = false; log.scrollTop = log.scrollHeight;
  };
})();
