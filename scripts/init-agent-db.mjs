import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { createStore } from '../agent/store.mjs';
const store=createStore();
if(!store)throw new Error('Set AGENT_DB_HOST, AGENT_DB_NAME, AGENT_DB_USER and AGENT_DB_PASSWORD in server environment.');
try{for(const sql of readFileSync(new URL('../agent/schema.sql',import.meta.url),'utf8').split(';').map(v=>v.trim()).filter(Boolean))await store.pool.query(sql);console.log('Agent tables ready. No stock or rates were invented or enabled.');}finally{await store.pool.end();}
