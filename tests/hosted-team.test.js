import test from 'node:test';
import assert from 'node:assert/strict';
import {sample} from '../engine.js';
import crypto from 'node:crypto';
process.env.NODE_ENV='test';
Object.assign(process.env,{DEADEND_SUPABASE_URL:'https://fixture.invalid',DEADEND_SUPABASE_KEY:'publishable-fixture',DEADEND_BACKEND_KEY:'server-only-fixture'});
const {app}=await import('../server.js');
const originalFetch=global.fetch;
const session='a'.repeat(64);const sessionHash=crypto.createHash('sha256').update(session).digest('hex');
let role='recipient',failDatabase=false,saved=0;
global.fetch=async(url,options)=>{
 if(!String(url).startsWith('https://fixture.invalid'))return originalFetch(url,options);
 if(failDatabase)throw Error('upstream outage');
 const {p_action:action,p_payload:p}=JSON.parse(options.body);
 assert.equal(JSON.parse(options.body).p_secret,'server-only-fixture');
 if(action==='session-read'){assert.equal(p.sessionHash,sessionHash);return Response.json({id:'fixture-account',username:'incoming-dev'});}
 if(action==='read'){const db=sample();db.briefs=[{id:'own',recipient:'incoming-dev',items:[],version:1},{id:'other',recipient:'other-dev',items:[{claim:'Not for this recipient'}],version:2}];return Response.json({id:p.workspaceId,name:'Shared test',version:4,db,role,username:'incoming-dev',members:[{username:'incoming-dev',role},{username:'other-dev',role:'recipient'}]});}
 if(action==='save'){saved++;return Response.json({code:'40001',message:'Workspace changed. Refresh and retry.'},{status:409});}
 throw Error('Unexpected fixture action '+action);
};
test('hosted role boundary filters raw sources, other recipients and member directory on the server',async()=>{
 await new Promise(r=>app.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.address().port;
 const call=async(data,extra={})=>{const r=await originalFetch(base+'/api/team/desk',{method:'POST',headers:{'Content-Type':'application/json',cookie:'deadend_team='+session,...extra},body:JSON.stringify({workspaceId:'11111111-1111-1111-1111-111111111111',...data})});return {status:r.status,body:await r.json()};};
 try{
  let out=await call({route:'state'});assert.equal(out.status,200);assert.deepEqual(out.body.sources,[]);assert.equal(out.body.briefs.length,1);assert.equal(out.body.briefs[0].id,'own');assert.deepEqual(out.body.members,[]);
  assert.equal((await call({route:'review',data:{}})).status,403);assert.equal(saved,0);
  assert.equal((await call({route:'state'},{origin:'https://evil.invalid'})).status,403);
  role='reviewer';out=await call({route:'state'});assert.ok(out.body.sources.every(s=>s.visibility==='public'));assert.equal(out.body.briefs.length,0);
  role='recipient';out=await call({route:'acknowledge',expectedVersion:3,data:{id:'own'}});assert.equal(out.status,409);assert.equal(saved,0);
  out=await call({route:'acknowledge',data:{id:'own'}});assert.equal(out.status,409);assert.match(out.body.error,/Refresh/);
  failDatabase=true;out=await call({route:'state'});assert.equal(out.status,503);assert.ok(!out.body.sources,'no anonymous fallback after database failure');
 }finally{global.fetch=originalFetch;await new Promise(r=>app.close(r));}
});
