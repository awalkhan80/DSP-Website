import { createHash } from 'node:crypto';

export class BookingError extends Error {
  constructor(message, code = 'NEEDS_TEAM') { super(message); this.code = code; }
}
export const todayDubai = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function validateTrip(trip) {
  if (!trip || !/^[a-z0-9-]{1,100}$/.test(trip.productId || '')) throw new BookingError('Select a valid package.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trip.date || '') || !Number.isFinite(Date.parse(trip.date)) || new Date(trip.date).toISOString().slice(0,10) !== trip.date || trip.date < todayDubai()) throw new BookingError('Choose a valid current or future tour date.');
  if (!Number.isInteger(trip.adults) || trip.adults < 1 || !Array.isArray(trip.childrenAges) || trip.childrenAges.some(a => !Number.isInteger(a) || a < 0 || a > 17)) throw new BookingError('Enter adults and valid child ages.');
  if (trip.adults + trip.childrenAges.length >= 15) throw new BookingError('Groups of 15 or more require our team.');
  if (typeof trip.pickupZone !== 'string' || !trip.pickupZone.trim() || trip.pickupZone.length > 100) throw new BookingError('Choose an approved pickup zone.');
  return trip;
}
export function validateProduct(p) {
  const nonempty = v => typeof v === 'string' && v.trim().length > 0;
  const integer = v => Number.isSafeInteger(v) && v >= 0;
  if (!p || !/^[a-z0-9-]{1,100}$/.test(p.id || '') || p.approved !== true || !nonempty(p.title)) throw new BookingError('Approved product ID and title required.');
  if (!['per_person','per_vehicle'].includes(p.pricingUnit) || !['shared','private','meeting_point'].includes(p.transferType) || !integer(p.adultPriceFils)) throw new BookingError('Explicit unit price in fils and transfer type required.');
  if (!Number.isInteger(p.maxPax) || p.maxPax < 1 || p.maxPax > 14) throw new BookingError('Set a single-vehicle passenger limit between 1 and 14.');
  if (typeof p.vatIncluded !== 'boolean' || ![0,5].includes(p.vatPercent)) throw new BookingError('Explicit VAT inclusion and applicable VAT percentage required.');
  if (!Array.isArray(p.inclusions) || !p.inclusions.length || !p.inclusions.every(nonempty) || !Array.isArray(p.exclusions) || !p.exclusions.every(nonempty)) throw new BookingError('Complete inclusions and exclusions required.');
  for (const field of ['pickupWindow','cancellationPolicy','refundPolicy','healthRequirements','ageRequirements','dressRequirements']) if (!nonempty(p[field])) throw new BookingError(`Missing ${field}. Enter the approved policy, including explicit "None" if applicable.`);
  if (!Number.isInteger(p.minAge) || p.minAge < 0 || p.minAge > 100) throw new BookingError('Explicit minimum activity age required.');
  if (!Array.isArray(p.pickupZones) || !p.pickupZones.length || p.pickupZones.some(z => !nonempty(z.name) || !integer(z.surchargeFils))) throw new BookingError('Pickup zones and transfer surcharges required.');
  if (new Set(p.pickupZones.map(z=>z.name)).size !== p.pickupZones.length) throw new BookingError('Duplicate pickup zones.');
  if (!Array.isArray(p.childRates) || p.childRates.some(r => !Number.isInteger(r.minAge) || !Number.isInteger(r.maxAge) || r.minAge < 0 || r.maxAge > 17 || r.maxAge < r.minAge || !integer(r.priceFils))) throw new BookingError('Explicit child rate age bands required; use [] to refer children to the team.');
  for(let age=0;age<=17;age++) if(p.childRates.filter(r=>age>=r.minAge&&age<=r.maxAge).length>1) throw new BookingError('Child age bands must not overlap.');
  const fields=['id','title','approved','pricingUnit','transferType','adultPriceFils','maxPax','minAge','vatIncluded','vatPercent','inclusions','exclusions','pickupWindow','cancellationPolicy','refundPolicy','healthRequirements','ageRequirements','dressRequirements'];
  return {...Object.fromEntries(fields.map(k=>[k,p[k]])),childRates:p.childRates.map(({minAge,maxAge,priceFils})=>({minAge,maxAge,priceFils})),pickupZones:p.pickupZones.map(({name,surchargeFils})=>({name,surchargeFils}))};
}
export function calculatePrice(product, trip) {
  const p = validateProduct(product); validateTrip(trip);
  if (p.id !== trip.productId) throw new BookingError('Quote product does not match.');
  const pax = trip.adults + trip.childrenAges.length;
  if (pax > p.maxPax) throw new BookingError('This group needs more than one vehicle; our team must arrange it.');
  if (p.minAge > 18 || trip.childrenAges.some(a=>a<p.minAge)) throw new BookingError('Age eligibility must be checked by our team.');
  const zone = p.pickupZones.find(z=>z.name===trip.pickupZone);
  if(!zone) throw new BookingError('Pickup zone is not in the approved price sheet.');
  let subtotal = p.pricingUnit === 'per_vehicle' ? p.adultPriceFils : p.adultPriceFils * trip.adults;
  for(const age of trip.childrenAges) {
    const rate=p.childRates.find(r=>age>=r.minAge&&age<=r.maxAge);
    if(!rate) throw new BookingError('No approved child rate for that age.');
    if(p.pricingUnit==='per_person') subtotal+=rate.priceFils;
  }
  subtotal+=zone.surchargeFils;
  const total = p.vatIncluded ? subtotal : subtotal * (100+p.vatPercent)/100;
  if(!Number.isSafeInteger(total)) throw new BookingError('Tax needs an approved rounding rule; our team must quote this.');
  return {currency:'AED',totalFils:total,totalAED:(total/100).toFixed(2),vatIncluded:true,vatPercent:p.vatPercent,sourcePricesIncludeVAT:p.vatIncluded,transferFils:zone.surchargeFils,units:p.pricingUnit==='per_vehicle'?1:pax};
}
export const revision = p => createHash('sha256').update(JSON.stringify(p)).digest('hex');
export function assertDeparture(row, units, now=Date.now()) {
  if(!row || !row.open || new Date(row.cutoff).getTime()<=now || !Number.isFinite(new Date(row.cutoff).getTime())) throw new BookingError('The tour is not confirmed to operate for this date.');
  if(row.capacity-row.reserved<units) throw new BookingError('Not enough live availability for this party.','SOLD_OUT');
}
export function publicSummary(product,trip,price) {
  return {productId:product.id,tour:product.title,date:trip.date,adults:trip.adults,childrenAges:trip.childrenAges,pickupZone:trip.pickupZone,transferType:product.transferType,...price,paymentMethod:'pay_on_arrival',licence:'102357',inclusions:product.inclusions,exclusions:product.exclusions,pickupWindow:product.pickupWindow,cancellationPolicy:product.cancellationPolicy,refundPolicy:product.refundPolicy,healthRequirements:product.healthRequirements,ageRequirements:product.ageRequirements,dressRequirements:product.dressRequirements};
}
