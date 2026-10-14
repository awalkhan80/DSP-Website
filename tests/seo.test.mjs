import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
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

const get = (pathname) => fetch(base + pathname);

test('sitemap.xml is served with valid XML and clean canonical URLs', async () => {
  const res = await get('/sitemap.xml');
  assert.equal(res.status, 200);
  const contentType = res.headers.get('content-type') || '';
  assert.ok(contentType.includes('xml'), `Expected XML Content-Type, got ${contentType}`);

  const xmlText = await res.text();
  assert.ok(xmlText.includes('<urlset'), 'Missing <urlset tag in sitemap');
  assert.ok(xmlText.includes('https://desertsafaridxbpro.com'), 'Missing domain in sitemap');
  // Critical Google SEO rule: sitemaps must never contain hash fragments
  assert.ok(!xmlText.includes('#'), 'Sitemap must not contain hash fragments (#)');
});

test('robots.txt is served with proper bot permissions and sitemap link', async () => {
  const res = await get('/robots.txt');
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes('User-agent:'), 'Missing User-agent directive');
  assert.ok(text.includes('Sitemap: https://desertsafaridxbpro.com/sitemap.xml'), 'Missing Sitemap directive');
});

test('index.html contains valid viewport, title, and meta description', () => {
  const indexPath = path.resolve(process.cwd(), 'index.html');
  const html = fs.readFileSync(indexPath, 'utf-8');

  assert.ok(html.includes('<meta name="viewport"'), 'Missing viewport meta tag');
  assert.match(html, /<title>([^<]+)<\/title>/, 'Missing valid <title> tag');

  const metaDescMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  assert.ok(metaDescMatch, 'Missing meta description');
  assert.ok(metaDescMatch[1].length > 40, 'Meta description should be descriptive (>40 chars)');
});

test('index.html includes complete Open Graph and Twitter Card tags', () => {
  const indexPath = path.resolve(process.cwd(), 'index.html');
  const html = fs.readFileSync(indexPath, 'utf-8');

  assert.ok(html.includes('property="og:title"'), 'Missing og:title');
  assert.ok(html.includes('property="og:description"'), 'Missing og:description');
  assert.ok(html.includes('property="og:image"'), 'Missing og:image');
  assert.ok(html.includes('property="og:url"'), 'Missing og:url');

  assert.ok(html.includes('name="twitter:card"'), 'Missing twitter:card');
  assert.ok(html.includes('name="twitter:title"'), 'Missing twitter:title');
  assert.ok(html.includes('name="twitter:description"'), 'Missing twitter:description');
});

test('index.html includes valid, parseable JSON-LD structured data schemas', () => {
  const indexPath = path.resolve(process.cwd(), 'index.html');
  const html = fs.readFileSync(indexPath, 'utf-8');

  const scriptRegex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let match;
  let schemaCount = 0;
  const foundTypes = new Set();

  while ((match = scriptRegex.exec(html)) !== null) {
    schemaCount++;
    const jsonStr = match[1].trim();
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      assert.fail(`Invalid JSON in application/ld+json script: ${e.message}`);
    }

    if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
      for (const item of parsed['@graph']) {
        if (Array.isArray(item['@type'])) {
          item['@type'].forEach(t => foundTypes.add(t));
        } else if (item['@type']) {
          foundTypes.add(item['@type']);
        }
      }
    } else if (Array.isArray(parsed['@type'])) {
      parsed['@type'].forEach(t => foundTypes.add(t));
    } else if (parsed['@type']) {
      foundTypes.add(parsed['@type']);
    }
  }

  assert.ok(schemaCount > 0, 'No JSON-LD scripts found in index.html');
  // Check for presence of essential rich snippets
  const hasBusiness = foundTypes.has('TravelAgency') || foundTypes.has('LocalBusiness');
  assert.ok(hasBusiness, `Expected TravelAgency or LocalBusiness schema, found: ${[...foundTypes].join(', ')}`);
});

test('index.html includes prerendered semantic HTML shell for search engine crawlers', () => {
  const indexPath = path.resolve(process.cwd(), 'index.html');
  const html = fs.readFileSync(indexPath, 'utf-8');

  const rootMatch = html.match(/<div\s+id="root"[^>]*>([\s\S]*?)<\/div>/i);
  assert.ok(rootMatch, 'Missing <div id="root"> element in index.html');
  const rootContent = rootMatch[1].trim();

  // Ensure crawlers see semantic headings and content before client JS executes
  assert.ok(rootContent.length > 200, 'Root element should contain prerendered semantic HTML for crawlers');
  assert.ok(rootContent.includes('<h1') || rootContent.includes('<h2'), 'Root element should have semantic heading tags');
});
