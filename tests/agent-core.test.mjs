import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePrice, assertDeparture, revision } from '../agent/core.mjs';
import { createStore } from '../agent/store.mjs';
export const product={id:'test-safari',title:'Test fixture ONLY',approved:true,pricingUnit:'per_person',transferType:'shared',adultPriceFils:10000,childRates:[{minAge:5,maxAge:17,priceFils:7000}],maxPax:6,minAge:5,vatIncluded:true,vatPercent:5,pickupZones:[{name:'test-zone',surchargeFils:5000}],inclusions:['Test'],exclusions:[],pickupWindow:'Test window',cancellationPolicy:'Test policy',refundPolicy:'Test refund policy',healthRequirements:'Test warnings',ageRequirements:'Test ages',dressRequirements:'Test dress'};
const trip={productId:product.id,date:'2099-01-02',adults:2,childrenAges:[8],pickupZone:'test-zone'};
test('quote uses explicit child rates and transfer amount in integer fils',()=>{assert.equal(calculatePrice(product,trip).totalAED,'320.00');});
test('VAT exclusive source produces exact total with VAT included',()=>{assert.equal(calculatePrice({...product,vatIncluded:false},trip).totalAED,'336.00');});
test('missing child age rate, unknown zone, >vehicle capacity, and 15+ groups are blocked',()=>{for(const t of [{...trip,childrenAges:[4]},{...trip,pickupZone:'unknown'},{...trip,adults:7},{...trip,adults:15}])assert.throws(()=>calculatePrice(product,t));});
test('missing policies, VAT and fractional-fils tax prevent invented quotes',()=>{for(const p of [{...product,refundPolicy:''},{...product,vatIncluded:undefined},{...product,vatIncluded:false,adultPriceFils:10001}])assert.throws(()=>calculatePrice(p,trip));});
test('dates and product binding validated',()=>{for(const t of [{...trip,date:'2099-02-30'},{...trip,date:'2000-01-01'},{...trip,productId:'different'}])assert.throws(()=>calculatePrice(product,t));});
test('closed, past-cutoff and sold-out departures blocked',()=>{for(const d of [null,{open:false},{open:true,cutoff:'2000-01-01Z'},{open:true,cutoff:'2099-01-01Z',capacity:2,reserved:2}])assert.throws(()=>assertDeparture(d,1));});
function fakeStore({existing=null,expired=false,changed=false,soldOut=false,missingSession=false}={}) {
 const writes=[];
 const c={beginTransaction:async()=>{},commit:async()=>writes.push('COMMIT'),rollback:async()=>writes.push('ROLLBACK'),release:()=>{},execute:async(sql,args)=>{
  if(sql.includes('FROM agent_quotes'))return [missingSession?[]:[{document:{trip,revision:revision(product)},expires_at:expired?'2000-01-01 00:00:00':'2099-01-01 00:00:00'}]];
  if(sql.includes('FROM agent_bookings'))return [existing?[{document:existing}]:[]];
  if(sql.includes('FROM agent_products'))return [[{document:changed?{...product,adultPriceFils:20000}:product}]];
  if(sql.includes('FROM agent_departures')){assert.match(sql,/FOR UPDATE/);return [[{open:1,cutoff:'2099-01-01 00:00:00',capacity:6,reserved:soldOut?6:0}]];}
  writes.push({sql,args});return [{affectedRows:1}];
 }};
 return {store:createStore({}, {getConnection:async()=>c}),writes};
}
test('confirmation stores an unpaid pay-on-arrival booking and reserves stock in transaction',async()=>{const {store,writes}=fakeStore();const b=await store.confirm('session','quote',{name:'Test',phone:'00000000',pickupLocation:'Test'});assert.equal(b.paymentStatus,'unpaid');assert.equal(b.paymentMethod,'pay_on_arrival');assert.equal(b.summary.totalAED,'320.00');assert(writes.find(w=>w.sql?.startsWith('UPDATE agent_departures')));assert.equal(writes.at(-1),'COMMIT');});
test('duplicate confirmation returns original reservation without reserving again',async()=>{const original={reference:'original'};const {store,writes}=fakeStore({existing:original});assert.deepEqual(await store.confirm('session','quote',{}),original);assert.equal(writes.filter(w=>w.sql).length,0);});
test('expired/changed/sold-out/cross-session quotes never write a booking',async()=>{for(const option of ['expired','changed','soldOut','missingSession']){const {store,writes}=fakeStore({[option]:true});await assert.rejects(store.confirm('session','quote',{}));assert.equal(writes.filter(w=>w.sql).length,0);assert.equal(writes.at(-1),'ROLLBACK');}});
