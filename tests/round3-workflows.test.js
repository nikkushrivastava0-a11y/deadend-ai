import test from 'node:test';
import assert from 'node:assert/strict';
import {sample} from '../engine.js';
import {revalidate,openDisagreement,resolveDisagreement,handoverItems,issueBrief,acknowledgeBrief} from '../workflows.js';
function fixture(){const db=sample(),c=db.claims.find(c=>c.quote.startsWith('We tried Stripe'));return {db,c,left:{sourceId:c.sourceId,quote:c.quote},right:{sourceId:'demo-issue17',quote:'The blocked Stripe environment was fixed later, however the production decision has not been revisited.'}};}
test('dated recheck preserves original evidence, stores history and invalidates old approval',()=>{
 const {db,c,right}=fixture();c.state='approved';const quote=c.quote;
 const input={id:c.id,status:'changed',constraint:'A later report says regional test checkout was fixed; production is unreviewed.',checkedOn:'2026-11-14',evidence:right,expectedVersion:0};
 const r=revalidate(db,input,'owner',new Date('2026-11-14T10:00:00Z'));
 assert.equal(r.version,1);assert.equal(c.quote,quote);assert.equal(c.state,'needs-review');assert.equal(handoverItems(db).length,0);
 assert.throws(()=>revalidate(db,input,'owner',new Date('2026-11-14T10:00:00Z')),/changed/);
 revalidate(db,{...input,status:'unknown',evidence:null,expectedVersion:1},'owner',new Date('2026-11-14T10:00:00Z'));
 assert.equal(c.revalidations.length,2);assert.deepEqual(c.revalidations[0],r);
 c.state='approved';assert.equal(handoverItems(db)[0].revalidation.status,'unknown');
});
test('recheck refuses impossible dates, future dates, unsupported current claims and restricted evidence',()=>{
 const {db,c,right}=fixture();const b={id:c.id,status:'changed',constraint:'Regional availability changed.',checkedOn:'2026-02-30',evidence:right,expectedVersion:0};
 for(const checkedOn of ['2026-02-30','2999-01-01','invalid'])assert.throws(()=>revalidate(db,{...b,checkedOn}),/date/);
 assert.throws(()=>revalidate(db,{...b,checkedOn:'2026-11-01',evidence:null}),/requires/);
 assert.throws(()=>revalidate(db,{...b,checkedOn:'2026-11-01',evidence:{...right,quote:'invented quote'}}),/Quotation/);
 const restricted=db.sources.find(s=>s.visibility==='restricted');assert.throws(()=>revalidate(db,{...b,checkedOn:'2026-11-01',evidence:{sourceId:restricted.id,quote:restricted.text.slice(0,100)}}),/visibility/);
 assert.equal(c.revalidations,undefined);
});
test('two-source resolver requires human rationale, both citations and fresh approval',()=>{
 const {db,c,left,right}=fixture();c.state='approved';const d=openDisagreement(db,{claimId:c.id,left,right},'reviewer');
 assert.equal(c.state,'disputed');assert.equal(handoverItems(db).length,0);
 assert.equal(openDisagreement(db,{claimId:c.id,left,right}).id,d.id);
 c.state='approved';assert.equal(handoverItems(db).length,0,'unresolved cannot be forced into export');
 const body={id:d.id,outcome:'context-dependent',rationale:'Testing was unblocked, but production readiness has not been established.',nextStep:'Run an authorised production readiness check.',expectedVersion:0};
 resolveDisagreement(db,body,'reviewer');assert.equal(c.state,'needs-review');assert.equal(handoverItems(db).length,0);
 c.state='approved';const [item]=handoverItems(db);assert.equal(item.resolutions[0].right.quote,right.quote);assert.equal(item.resolutions[0].left.quote,c.quote);
 assert.throws(()=>resolveDisagreement(db,body),/changed/);
 resolveDisagreement(db,{...body,outcome:'unresolved',expectedVersion:1});assert.equal(handoverItems(db).length,0);
});
test('resolver refuses same source, wrong finding excerpt and mixed visibility',()=>{
 const {db,c,left,right}=fixture();assert.throws(()=>openDisagreement(db,{claimId:c.id,left,right:left}),/different/);
 assert.throws(()=>openDisagreement(db,{claimId:c.id,left:{...left,quote:'not present'},right}),/Quotation/);
 const source=db.sources.find(s=>s.visibility==='restricted');assert.throws(()=>openDisagreement(db,{claimId:c.id,left,right:{sourceId:source.id,quote:source.text.slice(0,100)}}),/visibility/);
 assert.equal(c.state,'needs-review');
});
test('issued briefs freeze approved public content, version independently and receipt is recipient bound and idempotent',()=>{
 const {db,c}=fixture();c.state='approved';const secret=db.claims.find(c=>c.visibility==='restricted');secret.state='approved';
 const first=issueBrief(db,{recipient:'kanishk'},'owner',['kanishk','nitanshu']);assert.equal(first.items.length,1);
 const original=first.items[0].claim;c.claim='Later corrected interpretation';c.state='rejected';assert.equal(first.items[0].claim,original);
 assert.throws(()=>issueBrief(db,{recipient:'kanishk'},'owner',['kanishk']),/Approve/);
 assert.throws(()=>acknowledgeBrief(db,first.id,'nitanshu'),/not found/);
 const r=acknowledgeBrief(db,first.id,'kanishk').receipt;assert.deepEqual(acknowledgeBrief(db,first.id,'kanishk').receipt,r);
 c.state='approved';const second=issueBrief(db,{recipient:'nitanshu'},'owner',['nitanshu']);assert.equal(second.version,2);assert.equal(first.items[0].claim,original);
});

test('brief idempotency survives database JSONB object key reordering',()=>{
 const {db,c}=fixture();c.state='approved';const first=issueBrief(db,{recipient:'kanishk'},'owner',['kanishk']);
 const reorder=value=>Array.isArray(value)?value.map(reorder):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,reorder(value[key])])):value;
 db.briefs=JSON.parse(JSON.stringify(reorder(db.briefs)));
 assert.equal(issueBrief(db,{recipient:'kanishk'},'owner',['kanishk']).id,first.id);
 assert.equal(db.briefs.length,1);
});
