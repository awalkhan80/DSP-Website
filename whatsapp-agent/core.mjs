import { DatabaseSync } from 'node:sqlite';
import { randomUUID, createHmac, timingSafeEqual } from 'node:crypto';

export const dubaiDate = (now = Date.now()) => new Date(now + 4 * 3600000).toISOString().slice(0, 10);
export function validDate(s, now = Date.now()) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) &&
    new Date(s).toISOString().slice(0, 10) === s && s > dubaiDate(now) &&
    Date.parse(s) < now + 366 * 86400000;
}
export function verifySignature(raw, signature, secret) {
  if (!secret || !/^sha256=[a-f0-9]{64}$/.test(signature || '')) return false;
  return timingSafeEqual(createHmac('sha256', secret).update(raw).digest(), Buffer.from(signature.slice(7), 'hex'));
}
export function openDatabase(file) {
  const db = new DatabaseSync(file);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS sessions(phone TEXT PRIMARY KEY, body TEXT NOT NULL, updated INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS slots(tour TEXT, day TEXT, remaining INTEGER NOT NULL CHECK(remaining>=0), PRIMARY KEY(tour,day));
    CREATE TABLE IF NOT EXISTS bookings(ref TEXT PRIMARY KEY, phone TEXT NOT NULL, body TEXT NOT NULL, created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS inbox(id TEXT PRIMARY KEY, phone TEXT NOT NULL, text TEXT NOT NULL, timestamp INTEGER NOT NULL, done INTEGER DEFAULT 0);
    CREATE TABLE IF NOT EXISTS outbox(id TEXT PRIMARY KEY, kind TEXT NOT NULL, recipient TEXT NOT NULL, body TEXT NOT NULL,
      created INTEGER NOT NULL, attempts INTEGER DEFAULT 0, next INTEGER DEFAULT 0, status TEXT DEFAULT 'pending', provider_id TEXT);
  `);
  return db;
}
export function transaction(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const result = fn(); db.exec('COMMIT'); return result; }
  catch (e) { db.exec('ROLLBACK'); throw e; }
}
export function enqueue(db, kind, recipient, body, now = Date.now()) {
  db.prepare('INSERT INTO outbox(id,kind,recipient,body,created) VALUES(?,?,?,?,?)')
    .run(randomUUID(), kind, recipient, body, now);
}
export function ingest(db, payload, phoneId, businessPhone) {
  if (payload.object !== 'whatsapp_business_account') return;
  transaction(db, () => {
    for (const e of payload.entry || []) for (const c of e.changes || []) {
      if (c.field !== 'messages' || c.value?.metadata?.phone_number_id !== phoneId) continue;
      if (businessPhone && String(c.value?.metadata?.display_phone_number || '').replace(/\D/g, '') !== businessPhone) continue;
      for (const m of c.value.messages || []) {
        const timestamp = Number(m.timestamp) * 1000;
        if (typeof m.id !== 'string' || !/^\d{7,15}$/.test(m.from || '') || !Number.isFinite(timestamp) || timestamp > Date.now() + 300000) continue;
        const body = m.type === 'text' ? m.text?.body : '/unsupported';
        if (typeof body !== 'string') continue;
        db.prepare('INSERT OR IGNORE INTO inbox(id,phone,text,timestamp) VALUES(?,?,?,?)')
          .run(m.id, m.from, body.slice(0, 2000), timestamp);
      }
    }
  });
}
export function createAgent(db, catalog, config) {
  const tours = catalog.tours;
  const menu = () => 'Welcome to The Phoenix! I am your automated booking assistant.\n' +
    tours.map((t, i) => `${i + 1}. ${t.title} — from AED ${t.priceAED} ${t.priceUnit}`).join('\n') +
    '\nReply with a tour number. Type HUMAN for our team. Your booking details will be stored and emailed to our reservations team.';
  const prompt = s => ({
    tour: menu(), date: 'What date? Please use YYYY-MM-DD. Online booking is available from tomorrow; type HUMAN for today.',
    guests: 'How many adults and children? Reply with two numbers, e.g. 2, 0. Include every child; child ages and special requirements are handled by our team.',
    name: 'What is the full name for the booking?', pickup: 'Please send your Dubai hotel name or pickup address. Pickup requests will be checked by our team.',
    confirm: `${s.quote || ''}\nReply CONFIRM to reserve this exact booking, or RESTART to change it.`,
    done: `Your booking reference is ${s.ref}. Type NEW for another booking or HUMAN for changes.`,
    handoff: 'Our team has been notified. The automated assistant is paused; type RESUME to return to it.'
  })[s.step || 'tour'];
  function process(message, faqAnswer = null, now = Date.now()) {
    return transaction(db, () => {
      if (db.prepare('SELECT done FROM inbox WHERE id=?').get(message.id)?.done) return;
      if (now - message.timestamp > 23 * 3600000) {
        db.prepare('UPDATE inbox SET done=1 WHERE id=?').run(message.id); return;
      }
      let s = JSON.parse(db.prepare('SELECT body FROM sessions WHERE phone=?').get(message.phone)?.body || '{}');
      if (!s.step) s = { step: 'tour' };
      const text = message.text.trim(); const cmd = text.toUpperCase();
      const notify = body => enqueue(db, 'email', config.notifyEmail, body, now);
      const handoff = reason => {
        if (s.step !== 'handoff') notify(`Customer assistance requested\nWhatsApp: +${message.phone}\nReason: ${reason}\nBooking draft: ${JSON.stringify(s)}`);
        s.step = 'handoff'; return prompt(s);
      };
      let reply;
      if (['HUMAN', 'AGENT', 'HELP', 'CANCEL', 'REFUND'].includes(cmd)) reply = handoff(text);
      else if (s.step === 'handoff' && cmd !== 'RESUME') reply = null;
      else if (['NEW', 'RESTART', 'RESUME', 'MENU'].includes(cmd)) { s = { step: 'tour' }; reply = menu(); }
      else if (text === '/unsupported') reply = 'Please send a text message, or type HUMAN for help with images or voice messages.';
      else if (faqAnswer) reply = `${faqAnswer}\n\n${prompt(s)}`;
      else if (s.step === 'tour') {
        const t = /^\d+$/.test(text) ? tours[Number(text) - 1] : tours.find(t => t.title.toLowerCase() === text.toLowerCase());
        if (!t) reply = menu();
        else if (!t.enabled) reply = handoff(`${t.title}: package needs a staff quote or approval.`);
        else { s = { step: 'date', tour: t.id }; reply = prompt(s); }
      } else if (s.step === 'date') {
        if (!validDate(text, now)) reply = prompt(s);
        else {
          const slot = db.prepare('SELECT remaining FROM slots WHERE tour=? AND day=?').get(s.tour, text);
          if (!slot?.remaining) reply = 'That date is not open for automatic booking. Try another date or type HUMAN.';
          else { s.day = text; s.step = 'guests'; reply = prompt(s); }
        }
      } else if (s.step === 'guests') {
        const match = /^(\d{1,2})\s*[, ]\s*(\d{1,2})$/.exec(text);
        const t = tours.find(t => t.id === s.tour);
        if (!match || +match[1] < 1 || +match[1] + +match[2] > 20) reply = prompt(s);
        else if (+match[2] > 0) reply = handoff('Child ages, eligibility and pricing need staff review.');
        else if (t.unit === 'car' && +match[1] > t.maxGuests) reply = handoff('Group exceeds one vehicle capacity.');
        else { s.adults = +match[1]; s.children = 0; s.step = 'name'; reply = prompt(s); }
      } else if (s.step === 'name') {
        if (text.length < 2 || text.length > 100 || !/\p{L}/u.test(text)) reply = prompt(s);
        else { s.name = text; s.step = 'pickup'; reply = prompt(s); }
      } else if (s.step === 'pickup') {
        if (text.length < 4 || text.length > 250) reply = prompt(s);
        else {
          const t = tours.find(t => t.id === s.tour);
          s.pickup = text; s.total = t.unit === 'car' ? t.priceAED : t.priceAED * s.adults;
          s.unit = t.unit; s.price = t.priceAED; s.quotedAt = now; s.step = 'confirm';
          s.quote = `${t.title}\nDate: ${s.day} (Dubai time)\nGuests: ${s.adults} adults\nName: ${s.name}\nPickup requested: ${s.pickup}\nTotal: AED ${s.total}\nPayment on arrival. Exact pickup time/location will be confirmed by our team. Quote valid for 15 minutes; availability rechecked on confirmation.`;
          reply = prompt(s);
        }
      } else if (s.step === 'confirm') {
        if (cmd !== 'CONFIRM') reply = prompt(s);
        else {
          const t = tours.find(t => t.id === s.tour);
          if (!t?.enabled || t.priceAED !== s.price || t.unit !== s.unit || now - s.quotedAt > 900000 || !validDate(s.day, now)) {
            s = { step: 'tour' }; reply = 'Your quote expired or the price changed. Please select your tour again.\n' + menu();
          } else {
            const units = t.unit === 'car' ? 1 : s.adults;
            const changed = db.prepare('UPDATE slots SET remaining=remaining-? WHERE tour=? AND day=? AND remaining>=?').run(units, s.tour, s.day, units);
            if (!changed.changes) { s.step = 'date'; reply = 'That slot has sold out for your group. Please choose another date or type HUMAN.'; }
            else {
              s.ref = 'PHX-' + randomUUID().slice(0, 8).toUpperCase(); s.step = 'done';
              db.prepare('INSERT INTO bookings(ref,phone,body,created) VALUES(?,?,?,?)').run(s.ref, message.phone, JSON.stringify(s), now);
              notify(`Booking confirmed: ${s.ref}\nCustomer WhatsApp: +${message.phone}\n${s.quote}\nSource: WhatsApp agent. Payment status: unpaid. Please arrange pickup.`);
              reply = `Booking confirmed: ${s.ref}\n${s.quote.split('\nQuote valid')[0].replace(' Quote valid for 15 minutes; availability rechecked on confirmation.', '')}\nOur reservations team will arrange pickup. Type HUMAN for changes.`;
            }
          }
        }
      } else reply = prompt(s);
      db.prepare('INSERT INTO sessions(phone,body,updated) VALUES(?,?,?) ON CONFLICT(phone) DO UPDATE SET body=excluded.body,updated=excluded.updated')
        .run(message.phone, JSON.stringify(s), now);
      if (reply) enqueue(db, 'whatsapp', message.phone, reply.slice(0, 4000), message.timestamp);
      db.prepare('UPDATE inbox SET done=1 WHERE id=?').run(message.id);
      return reply;
    });
  }
  return { process, menu };
}
