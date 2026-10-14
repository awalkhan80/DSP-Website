import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';

let server, base, output = '';

before(async () => {
  const probe = net.createServer();
  await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  base = `http://127.0.0.1:${port}`;

  server = spawn(process.execPath, ['server.js'], {
    env: { ...process.env, PORT: String(port), NODE_ENV: 'production', GEMINI_API_KEY: '' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  server.stdout.on('data', chunk => { output += chunk; });
  server.stderr.on('data', chunk => { output += chunk; });

  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(output);
    try {
      await fetch(base);
      return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Server failed to start: ${output}`);
});

after(async () => {
  if (server && server.exitCode === null) {
    const exited = new Promise(resolve => server.once('exit', resolve));
    server.kill();
    await exited;
  }
});

const post = (path, body) => fetch(base + path, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const get = (path) => fetch(base + path);

test('booking email rejects invalid or missing email with 400', async () => {
  const res1 = await post('/api/send-booking-email', {});
  assert.equal(res1.status, 400);

  const res2 = await post('/api/send-booking-email', { guestEmail: 'invalid-email' });
  assert.equal(res2.status, 400);
});

test('tours availability endpoint returns active status and rules', async () => {
  const res = await get('/api/availability');
  assert.equal(res.status, 200);
  const data = await res.json();
  const rules = data.data?.globalRules || data.globalRules;
  assert.ok(rules);
  assert.equal(rules.defaultStatus, 'available');
});

test('check_availability API validates date and returns availability', async () => {
  const res = await post('/check_availability', {
    tour: 'Evening Desert Safari',
    date: '2026-12-01',
    pax: 4,
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.available, true);
});

test('get_price API accurately computes tour prices in AED', async () => {
  const res = await post('/get_price', {
    tour: 'Evening Desert Safari',
    adults: 2,
    children_ages: [],
    private_or_shared: 'shared',
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.total_aed, 240);
  assert.equal(data.payment_method_supported, 'pay_on_arrival');
});

test('create_booking endpoint enforces summary acceptance', async () => {
  const res = await post('/create_booking', {
    tour: 'Evening Desert Safari',
    summary_accepted: false,
  });
  assert.equal(res.status, 400);
});

test('create_booking succeeds when summary accepted and issues valid PHX reference', async () => {
  const res = await post('/create_booking', {
    tour: 'Evening Desert Safari',
    full_name: 'Test Traveler',
    phone: '+971500000000',
    adults: 2,
    summary_accepted: true,
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.status, 'confirmed');
  const ref = data.booking_reference || data.booking_ref;
  assert.ok(ref.startsWith('PHX-'));
  assert.ok(data.voucher.includes('THE PHOENIX DESERT SAFARI DUBAI'));
});

test('B2B API endpoints report credential requirement and list bookings', async () => {
  // Without B2B_TICKETS_API_KEY, status returns 503 connected: false
  const statusRes = await get('/api/b2b/status');
  assert.equal(statusRes.status, 503);
  const statusData = await statusRes.json();
  assert.equal(statusData.connected, false);

  // Booking records list is accessible
  const bookingsRes = await get('/api/b2b/bookings');
  assert.equal(bookingsRes.status, 200);
  const bookingsData = await bookingsRes.json();
  assert.equal(typeof bookingsData.total, 'number');
  assert.ok(Array.isArray(bookingsData.records));
});
