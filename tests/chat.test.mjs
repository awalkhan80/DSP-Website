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
    try { await fetch(base); return; } catch {}
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
const chat = (body, path = '/api/agent/chat') => fetch(base + path, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

test('production entry point serves both chat API aliases without an AI key', async () => {
  for (const path of ['/api/agent/chat', '/api/chat']) {
    const response = await chat({ message: 'Hello', history: [] }, path);
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.ok, true);
    assert.ok(data.reply.length > 0);
  }
});
test('malformed messages and history return 400, not internal errors', async () => {
  for (const body of [null, {}, { message: ' ' }, { message: 12 },
    { message: 'Hi', history: {} }, { message: 'Hi', history: [null] },
    { message: 'Hi', history: [{ role: 'system', text: 'test' }] },
    { message: 'x'.repeat(4001) }]) {
    assert.equal((await chat(body)).status, 400);
  }
});
test('availability questions never fabricate inventory or return a price card', async () => {
  for (const message of ['Check availability for Evening Desert Safari for tomorrow', 'Is Burj Khalifa available today?']) {
    const data = await (await chat({ message })).json();
    assert.match(data.reply, /team must confirm availability/i);
    assert.equal(data.actionCard, null);
  }
});
test('safari safety questions are not intercepted by the price calculator', async () => {
  const data = await (await chat({ message: 'Is desert safari safe for pregnant women?' })).json();
  assert.match(data.reply, /not recommended/i);
  assert.equal(data.actionCard, null);
});
test('ordinary price queries still return a quote', async () => {
  const data = await (await chat({ message: 'Price for 2 adults evening safari' })).json();
  assert.equal(data.actionCard.type, 'price_quote');
  assert.equal(data.actionCard.data.total_aed, 240);
});
