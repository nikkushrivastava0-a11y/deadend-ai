import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {createServer} from 'node:http';
import {createSandbox,sandboxAction,openSandbox,sandboxHandler} from '../sandbox.js';
import {seal} from '../capsule.js';
process.env.DEADEND_STATE_KEY=randomBytes(32).toString('hex');
const call=(s,route,data={})=>sandboxAction(s,'desk',{workspaceId:s.id,route,data});
test('sandbox role enforcement isolates all synthetic actions from real workspace IDs',()=>{
 const s=createSandbox();assert.throws(()=>sandboxAction(s,'desk',{workspaceId:'11111111-1111-1111-1111-111111111111',route:'state'}),/another workspace/);
 assert.throws(()=>sandboxAction(s,'create',{name:'Real workspace'}),/real accounts/);
 const c=s.db.claims.find(c=>c.quote.startsWith('We tried Stripe'));
 sandboxAction(s,'switch',{role:'reviewer'});assert.ok(call(s,'state').sources.every(x=>x.visibility==='public'));
 assert.throws(()=>call(s,'issue-brief',{recipient:'sandbox-recipient'}),e=>e.status===403);
 call(s,'review',{id:c.id,state:'approved'});sandboxAction(s,'switch',{role:'owner'});
 const brief=call(s,'issue-brief',{recipient:'sandbox-recipient'}).record;assert.equal(call(s,'issue-brief',{recipient:'sandbox-recipient'}).record.id,brief.id);
 sandboxAction(s,'switch',{role:'recipient'});assert.deepEqual(call(s,'state').sources,[]);assert.throws(()=>call(s,'review',{id:c.id,state:'rejected'}),e=>e.status===403);
 const receipt=call(s,'acknowledge',{id:brief.id}).record.receipt;assert.deepEqual(call(s,'acknowledge',{id:brief.id}).record.receipt,receipt);
 assert.throws(()=>call(s,'acknowledge',{id:'some-real-brief'}),e=>e.status===404);
});
test('sandbox capsule refuses expiration, tampering and ordinary public workspace capsules',()=>{
 const s=createSandbox();assert.equal(openSandbox(seal(s)).id,s.id);
 assert.throws(()=>openSandbox(seal(createSandbox(Date.now()-16*60000))),e=>e.status===401);
 assert.throws(()=>openSandbox(seal({sources:[],claims:[]})),e=>e.status===401);
 assert.throws(()=>openSandbox('malformed'),e=>e.status===401);
});
test('sandbox HTTP creation uses only a rate check; never reads a real workspace',async()=>{
 Object.assign(process.env,{DEADEND_SUPABASE_URL:'https://sandbox-fixture.invalid',DEADEND_SUPABASE_KEY:'disposable-fixture',DEADEND_BACKEND_KEY:randomBytes(32).toString('hex')});
 const original=global.fetch;let allowed=true;const actions=[];
 global.fetch=async(url,opt)=>{if(!String(url).startsWith('https://sandbox-fixture.invalid'))return original(url,opt);const b=JSON.parse(opt.body);actions.push(b.p_action);assert.equal(b.p_action,'rate');return Response.json({allowed});};
 const app=createServer(sandboxHandler);await new Promise(r=>app.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.address().port;
 const request=async(body,headers={})=>{const r=await original(base,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});return {status:r.status,data:await r.json()};};
 try{
  let r=await request({path:'start'});assert.equal(r.status,200);const token=r.data.token;
  r=await request({path:'desk',token,data:{workspaceId:'11111111-1111-1111-1111-111111111111',route:'state'}});assert.equal(r.status,403);
  assert.equal((await request({path:'start'},{origin:'https://outside.invalid'})).status,403);
  allowed=false;assert.equal((await request({path:'start'})).status,429);assert.deepEqual(actions,['rate','rate']);
 }finally{global.fetch=original;await new Promise(r=>app.close(r));delete process.env.DEADEND_SUPABASE_URL;delete process.env.DEADEND_SUPABASE_KEY;delete process.env.DEADEND_BACKEND_KEY;}
});
