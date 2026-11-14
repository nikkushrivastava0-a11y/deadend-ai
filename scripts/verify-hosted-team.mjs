import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createInterface} from 'node:readline';
if(process.argv.includes('--config-stdin')){
 const lines=createInterface({input:process.stdin,terminal:false});
 const value=await new Promise(resolve=>lines.once('line',line=>{lines.close();resolve(JSON.parse(line));}));Object.assign(process.env,value);
}
process.env.NODE_ENV='test';
const {app}=await import('../server.js');
let base=process.env.DEADEND_TEST_URL;
if(!base){await new Promise(r=>app.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+app.address().port;}
const prefix='qa_'+crypto.randomBytes(5).toString('hex');
const users=[0,1,2,3].map(i=>({username:prefix+'_'+i,password:crypto.randomBytes(24).toString('hex'),cookie:''}));
async function call(user,path,data,expected=200){
 const response=await fetch(base+'/api/team/'+path,{method:data?'POST':'GET',headers:{'Content-Type':'application/json',...(user?.cookie?{cookie:user.cookie}:{})},body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(90000)});
 const out=await response.json();assert.equal(response.status,expected,JSON.stringify({path,expected,status:response.status,error:out.error}));
 if(user&&response.headers.get('set-cookie'))user.cookie=response.headers.get('set-cookie').split(';')[0];return out;
}
let workspaceId;
try{
 for(const u of users)await call(u,'register',{username:u.username,password:u.password});
 const [owner,reviewer,recipient,outsider]=users;
 workspaceId=(await call(owner,'create',{name:'Disposable hosted team QA '+prefix})).id;
 const desk=(u,route,data={},status=200)=>call(u,'desk',{workspaceId,route,data},status);
 for(const [u,role] of [[reviewer,'reviewer'],[recipient,'recipient']]){
  const invite=await call(owner,'invite',{workspaceId,role});
  await call(u,'join',{code:invite.code});await call(outsider,'join',{code:invite.code},403);
 }
 await call(reviewer,'invite',{workspaceId,role:'recipient'},403);
 await desk(outsider,'state',{},403);
 await desk(owner,'demo');
 let full=await desk(owner,'state'),filtered=await desk(reviewer,'state');
 assert.ok(full.sources.some(s=>s.visibility==='restricted'));assert.ok(filtered.sources.every(s=>s.visibility==='public'));
 assert.equal((await desk(recipient,'state')).sources.length,0);
 const c=full.claims.find(c=>c.quote.startsWith('We tried Stripe'));
 await desk(recipient,'review',{id:c.id,state:'approved'},403);
 await desk(reviewer,'revalidate',{id:c.id},403);
 await desk(owner,'revalidate',{id:c.id,status:'unknown',constraint:'Current production readiness has not been independently established.',checkedOn:'2026-11-01',expectedVersion:0});
 const d=(await desk(reviewer,'disagreement',{claimId:c.id,left:{sourceId:c.sourceId,quote:c.quote},right:{sourceId:'demo-issue17',quote:'The blocked Stripe environment was fixed later, however the production decision has not been revisited.'}})).record;
 await desk(reviewer,'review',{id:c.id,state:'approved'},409);
 await desk(reviewer,'resolve',{id:d.id,outcome:'context-dependent',rationale:'A test environment fix does not prove production readiness.',nextStep:'Recheck current production constraints.',expectedVersion:0});
 await desk(reviewer,'review',{id:c.id,state:'approved'});
 await desk(reviewer,'issue-brief',{recipient:recipient.username},403);
 const brief=(await desk(owner,'issue-brief',{recipient:recipient.username})).record;
 assert.equal(brief.items.length,1);assert.equal(brief.items[0].evidence,c.quote);
 assert.equal((await desk(owner,'issue-brief',{recipient:recipient.username})).record.id,brief.id);
 await desk(owner,'review',{id:c.id,state:'rejected'});
 const received=(await desk(recipient,'state')).briefs[0];assert.equal(received.items[0].evidence,c.quote);
 await desk(outsider,'acknowledge',{id:brief.id},403);
 const ack=(await desk(recipient,'acknowledge',{id:brief.id})).record.receipt;
 assert.deepEqual((await desk(recipient,'acknowledge',{id:brief.id})).record.receipt,ack);
 assert.equal((await desk(reviewer,'state')).briefs.length,0);
 const oldCookie=recipient.cookie;await call(recipient,'logout',{});
 await call({cookie:oldCookie},'session',undefined,401);
 await call(recipient,'login',{username:recipient.username,password:recipient.password});
 assert.deepEqual((await desk(recipient,'state')).briefs[0].receipt,ack);
 // Independent process/runtime reads the same durable record.
 const second=(await import('../server.js?cold-start='+Date.now())).app;
 if(!process.env.DEADEND_TEST_URL){await new Promise(r=>second.listen(0,'127.0.0.1',r));const saved=base;base='http://127.0.0.1:'+second.address().port;assert.deepEqual((await desk(recipient,'state')).briefs[0].receipt,ack);base=saved;await new Promise(r=>second.close(r));}
 console.log(JSON.stringify({passed:true,prefix,workspaceId,checks:['registration/login','one-use role invitations','workspace isolation','restricted-source filtering','owner-only revalidation','two-source human resolution','fresh approval','immutable versions','recipient-only receipt','duplicate issue/receipt','logout revocation','durable reload/cold-start']}));
}catch(e){console.error(JSON.stringify({passed:false,prefix,workspaceId,error:e.message}));process.exitCode=1;}
finally{if(app.listening)await new Promise(r=>app.close(r));}
