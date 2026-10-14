// chatbot.js - mount into your existing Express app: app.use(require('./chatbot'));
require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const tours = require('./tours.json');

const router = express.Router();
router.use('/chatbot', express.static(path.join(__dirname, 'public')));
router.use('/api/chat', express.json({ limit: '50kb' }), rateLimit({ windowMs: 60_000, max: 20 }));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.MODEL || 'claude-sonnet-5-5';

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT || 465) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const SYSTEM = `You are the booking assistant for Phoenix Desert Safari Dubai (Phoenix Travel & Tours), website desertsafaridxbpro.com.
Tourism licence no. 102357. Office: Damac XL Tower, Business Bay, Dubai. Phone/WhatsApp and emergency/pickup support: +971561505270.

JOB: answer questions about tours and prices, then collect booking details and submit them to the team.

RULES
- Use ONLY the TOUR DATA below. If a price or detail is null/empty/missing, say the team will confirm it. Never invent prices, times or inclusions.
- No discounts, ever. If asked, politely say prices are fixed.
- Maximum group size is 100. Larger groups: ask them to call the team.
- Never promise availability, weather or pickup times. The team confirms every booking.
- Complaints, refunds, custom packages or anything unclear: give the phone number and offer to take their details.
- Team hours 9:00-18:00 (Dubai time). The team replies within 30 minutes in working hours. A payment link, if sent, is valid for 24 hours.
- Reply in the customer's language. Be warm and brief (2-4 short sentences). Ask for one or two things at a time.

BOOKING FLOW
Collect: full name, phone/WhatsApp, email, tour and option, date, adults, children (with ages), pickup location/hotel, special requests.
Then show a short summary and ask "Shall I send this to our team?". Call submit_booking ONLY after the customer says yes, and only once per booking. After it succeeds, tell them the team will contact them shortly.

TOUR DATA
${JSON.stringify(tours)}`;

const TOOLS = [{
  name: 'submit_booking',
  description: 'Send the confirmed booking request to the Phoenix team by email. Call only after the customer confirms the summary.',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string' }, phone: { type: 'string' }, email: { type: 'string' },
      tour: { type: 'string', description: 'Tour and option' },
      date: { type: 'string', description: 'YYYY-MM-DD' },
      adults: { type: 'integer' }, children: { type: 'integer' },
      children_ages: { type: 'string' }, pickup: { type: 'string' }, notes: { type: 'string' },
    },
    required: ['name', 'phone', 'email', 'tour', 'date', 'adults', 'pickup'],
  },
}];

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function validate(b) {
  const total = (b.adults || 0) + (b.children || 0);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email || '')) return 'Invalid email address.';
  if (!/^\+?[\d\s()-]{7,20}$/.test(b.phone || '')) return 'Invalid phone number.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '') || new Date(b.date) < new Date(new Date().toDateString())) return 'Date must be today or later (YYYY-MM-DD).';
  if (!(b.adults >= 1)) return 'At least 1 adult is required.';
  if (total > 100) return 'Group size above 100 must be handled by phone.';
  return null;
}

async function sendBooking(b) {
  const err = validate(b);
  if (err) return { ok: false, error: err };
  const rows = [['Name', b.name], ['Phone', b.phone], ['Email', b.email], ['Tour', b.tour], ['Date', b.date],
    ['Adults', b.adults], ['Children', b.children || 0], ['Children ages', b.children_ages], ['Pickup', b.pickup], ['Notes', b.notes]];
  const html = `<h2>New booking request</h2><table cellpadding="6" border="1" style="border-collapse:collapse">` +
    rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v) || '-'}</td></tr>`).join('') + `</table>`;
  try {
    await mailer.sendMail({
      from: `"Phoenix Chatbot" <${process.env.SMTP_USER}>`,
      to: process.env.BOOKING_TO, replyTo: b.email,
      subject: `New Booking Request - ${b.tour} - ${b.date} - ${b.name}`.replace(/[\r\n]/g, ' '),
      html,
    });
    return { ok: true };
  } catch (e) {
    console.error('Email failed:', e.message);
    return { ok: false, error: 'Email could not be sent. Ask the customer to call +971561505270.' };
  }
}

router.post('/api/chat', async (req, res) => {
  const raw = Array.isArray(req.body.messages) ? req.body.messages.slice(-20) : [];
  const messages = raw
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') return res.status(400).json({ error: 'Bad request' });

  try {
    let convo = [...messages];
    let response = await client.messages.create({ model: MODEL, max_tokens: 600, system: SYSTEM, tools: TOOLS, messages: convo });
    for (let i = 0; i < 2 && response.stop_reason === 'tool_use'; i++) {
      const use = response.content.find(c => c.type === 'tool_use');
      const result = await sendBooking(use.input);
      convo = [...convo, { role: 'assistant', content: response.content },
        { role: 'user', content: [{ type: 'tool_result', tool_use_id: use.id, content: JSON.stringify(result), is_error: !result.ok }] }];
      response = await client.messages.create({ model: MODEL, max_tokens: 600, system: SYSTEM, tools: TOOLS, messages: convo });
    }
    const reply = response.content.filter(c => c.type === 'text').map(c => c.text).join('\n').trim();
    res.json({ reply: reply || 'Sorry, please call us on +971561505270.' });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ reply: 'Sorry, something went wrong. Please call or WhatsApp +971561505270.' });
  }
});

module.exports = router;
