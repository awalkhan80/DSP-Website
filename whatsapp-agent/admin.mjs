import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, validDate } from './core.mjs';
const dir = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(process.env.DB_PATH || path.join(dir, 'data/bookings.sqlite'));
fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
const db = openDatabase(file);
const [cmd, tour, day, count] = process.argv.slice(2);
if (cmd === 'slot') {
  const catalog = JSON.parse(fs.readFileSync(path.join(dir, 'catalog.json')));
  if (!catalog.tours.some(t => t.id === tour && t.enabled) || !validDate(day || '') || !/^\d+$/.test(count || '') || Number(count) > 1000) {
    throw new Error('Usage: slot ENABLED_TOUR_ID YYYY-MM-DD REMAINING_UNITS (0-1000). Date must be tomorrow or later.');
  }
  db.prepare('INSERT INTO slots(tour,day,remaining) VALUES(?,?,?) ON CONFLICT(tour,day) DO UPDATE SET remaining=excluded.remaining').run(tour, day, Number(count));
  console.log('Remaining inventory set. Use only capacity reserved exclusively for this agent.');
} else if (cmd === 'bookings') console.log(JSON.stringify(db.prepare('SELECT * FROM bookings ORDER BY created DESC LIMIT 100').all(), null, 2));
else if (cmd === 'status') console.log(JSON.stringify(db.prepare('SELECT kind,status,count(*) AS count FROM outbox GROUP BY kind,status').all(), null, 2));
else if (cmd === 'failed') console.log(JSON.stringify(db.prepare("SELECT id,kind,status,attempts FROM outbox WHERE status IN ('failed','expired')").all(), null, 2));
else console.log('Commands: slot TOUR_ID YYYY-MM-DD REMAINING_UNITS | bookings | status | failed');
db.close();
