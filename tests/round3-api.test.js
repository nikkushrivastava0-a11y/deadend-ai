import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {scryptSync} from 'node:crypto';
process.env.NODE_ENV='test';
test('authenticated team: server visibility, workflow, versioned handover, receipt isolation and restart recovery',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'deadend-team-'));
 const users=['owner','reviewer','recipient','recipient2'].map((username,i)=>({username,role:username==='recipient2'?'recipient':username,salt:String(i+1).repeat(32),passwordHash:scryptSync('fixture-password-strong',String(i+1).repeat(32),64).toString('hex')}));
 Object.assign(process.env,{DEADEND_TEAM_USERS:JSON.stringify(users),DEADEND_DATA_DIR:dir});let app,base;
 const start=async n=>{({app}=await import('../server.js?team='+n));await new Promise(r=>app.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+app.address().port;};
 const call=async(user,route,body)=>{
  const response=await fetch(base+'/api/'+route,{method:body?'POST':'GET',headers:{...(user?{authorization:'Basic '+Buffer.from(user+':fixture-password-strong').toString('base64')}:{}),'content-type':'application/json'},body:body?JSON.stringify(body):undefined});
  return {status:response.status,body:await response.json()};
 };
 try{
  await start(1);assert.equal((await call(null,'state')).status,401);
  assert.equal((await call('recipient','demo',{})).status,403);
  assert.equal((await call('reviewer','import-notes',{title:'No',text:'No',visibility:'public'})).status,403);
  await call('owner','demo',{});
  const full=(await call('owner','state')).body,visible=(await call('reviewer','state')).body;
  assert.ok(full.sources.some(s=>s.visibility==='restricted'));assert.ok(visible.sources.every(s=>s.visibility==='public'));
  assert.equal((await call('recipient','state')).body.sources.length,0);
  const c=full.claims.find(c=>c.quote.startsWith('We tried Stripe'));
  assert.equal((await call('reviewer','revalidate',{id:c.id})).status,403);
  const recheck={id:c.id,checkedOn:'2026-11-01',status:'unknown',constraint:'Production availability has not been independently checked.',expectedVersion:0};
  assert.equal((await call('owner','revalidate',recheck)).status,200);
  assert.equal((await call('owner','revalidate',recheck)).status,409);
  const left={sourceId:c.sourceId,quote:c.quote},right={sourceId:'demo-issue17',quote:'The blocked Stripe environment was fixed later, however the production decision has not been revisited.'};
  const d=(await call('reviewer','disagreement',{claimId:c.id,left,right})).body.record;
  assert.equal((await call('reviewer','review',{id:c.id,state:'approved'})).status,409);
  assert.equal((await call('reviewer','resolve',{id:d.id,outcome:'context-dependent',rationale:'Test fix does not establish production readiness.',nextStep:'Recheck production constraints.',expectedVersion:0})).status,200);
  await call('reviewer','review',{id:c.id,state:'approved'});
  assert.equal((await call('reviewer','issue-brief',{recipient:'recipient'})).status,403);
  const brief=(await call('owner','issue-brief',{recipient:'recipient'})).body.record;
  assert.equal(brief.items[0].resolutions[0].right.quote,right.quote);
  assert.equal((await call('owner','issue-brief',{recipient:'recipient'})).body.record.id,brief.id);
  assert.equal((await call('owner','reset',{})).status,409);
  assert.equal((await call('recipient2','workflow-state')).body.briefs.length,0);
  assert.equal((await call('recipient2','acknowledge',{id:brief.id})).status,404);
  const receipt=(await call('recipient','acknowledge',{id:brief.id})).body.record.receipt;
  assert.deepEqual((await call('recipient','acknowledge',{id:brief.id})).body.record.receipt,receipt);
  await call('owner','review',{id:c.id,state:'rejected'});
  assert.equal((await call('recipient','workflow-state')).body.briefs[0].items.length,1);
  await new Promise(r=>app.close(r));await start(2);
  assert.deepEqual((await call('recipient','workflow-state')).body.briefs[0].receipt,receipt);
  assert.equal((await call('reviewer','workflow-state')).body.briefs.length,0);
  assert.equal((await call('recipient','handover')).body.items.length,0);
 }finally{if(app?.listening)await new Promise(r=>app.close(r));delete process.env.DEADEND_TEAM_USERS;delete process.env.DEADEND_DATA_DIR;await rm(dir,{recursive:true,force:true});}
});
test('team configuration fails closed without durable server storage',async()=>{
 const {loadTeam}=await import('../identity.js');process.env.DEADEND_TEAM_USERS='[]';
 try{assert.throws(loadTeam,/durable/);}finally{delete process.env.DEADEND_TEAM_USERS;}
});
