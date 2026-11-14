import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV='test';
const {hostedHealth}=await import('../hosted-team.js');
const {app}=await import('../server.js');
test('health probes actual gateway reachability, caches briefly and hides provider credentials',async()=>{
 const original=global.fetch;let outage=false,calls=0;
 Object.assign(process.env,{DEADEND_SUPABASE_URL:'https://health-fixture.invalid',DEADEND_SUPABASE_KEY:'do-not-expose',DEADEND_BACKEND_KEY:'not-a-client-key'});
 global.fetch=async(url,options)=>{if(!String(url).startsWith('https://health-fixture.invalid'))return original(url,options);calls++;assert.equal(JSON.parse(options.body).p_action,'login-info');if(outage)throw Error('private upstream details');return Response.json(null);};
 await new Promise(r=>app.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.address().port;
 try{
  assert.equal((await hostedHealth({force:true})).reachable,true);let r=await original(base+'/api/health');assert.equal(r.status,200);const health=await r.json();assert.equal(health.teamMode,true);assert.equal(health.teamAvailable,true);assert.equal(calls,1);assert.ok(!JSON.stringify(health).includes('fixture.invalid'));assert.ok(!JSON.stringify(health).includes('do-not-expose'));
  outage=true;await hostedHealth({force:true});r=await original(base+'/api/health');assert.equal(r.status,503);assert.equal((await r.json()).database.reachable,false);assert.equal(calls,2);
  delete process.env.DEADEND_SUPABASE_URL;assert.deepEqual(await hostedHealth(),{configured:false,reachable:false,checkedAt:null});
 }finally{global.fetch=original;await new Promise(r=>app.close(r));for(const key of ['DEADEND_SUPABASE_URL','DEADEND_SUPABASE_KEY','DEADEND_BACKEND_KEY'])delete process.env[key];}
});
