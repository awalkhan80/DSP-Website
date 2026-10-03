import { readFile, writeFile } from 'node:fs/promises';
import { EXPERIENCES } from '../src/data/safaris.ts';
const tours=EXPERIENCES.map(({id,title,description,priceAED,priceUnit,highlights,departureTime,returnTime,hotelPickup,vehicleType})=>({id,title,description,startingPriceAED:priceAED,priceUnit,highlights,departureTime,returnTime,hotelPickup,vehicleType}));
await writeFile(new URL('../agent/catalog.json',import.meta.url),JSON.stringify({source:'src/data/safaris.ts',notice:'Website reference catalogue only. Starting rates are not final quotes. Approved database products control all bookings.',tours},null,2)+'\n');
console.log(`Exported ${tours.length} website tours for the agent.`);
