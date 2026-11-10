import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV='test';
const {app}=await import('../server.js');

async function withServer(run){
 await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${app.address().port}`;
 try {await run(base);} finally {await new Promise((resolve,reject)=>app.close(e=>e?reject(e):resolve()));}
}
function client(base){
 let cookie='';
 return async (route,method='GET',body)=>{
  const response=await fetch(base+route,{method,headers:{...(cookie?{cookie}:{ }),'content-type':'application/json'},body:body?JSON.stringify(body):undefined});
  const set=response.headers.get('set-cookie');if(set)cookie=set.split(';')[0];
  return {status:response.status,body:await response.json()};
 };
}
test('browser sessions are isolated across demo, review and handover',async()=>{
 await withServer(async(base)=>{
  const a=client(base), b=client(base);
  assert.equal((await a('/api/state')).body.claims.length,0);
  assert.equal((await b('/api/state')).body.claims.length,0);
  const result=await a('/api/demo','POST');assert.ok(result.body.count>=3);
  assert.equal((await b('/api/state')).body.claims.length,0);
  const claims=(await a('/api/state')).body.claims;
  const approved=await a('/api/review','POST',{id:claims.find(c=>c.visibility==='public').id,state:'approved'});
  assert.equal(approved.status,200);
  assert.equal((await a('/api/handover')).body.items.length,1);
  assert.equal((await b('/api/handover')).body.items.length,0);
 });
});
test('restricted findings are excluded despite a review attempt',async()=>{
 await withServer(async(base)=>{
  const a=client(base);await a('/api/demo','POST');
  const restricted=(await a('/api/state')).body.claims.find(c=>c.visibility==='restricted');
  assert.equal((await a('/api/review','POST',{id:restricted.id,state:'approved'})).status,403);
  assert.equal((await a('/api/handover')).body.items.length,0);
 });
});
test('review correction retains source excerpt and identifies a later conflicting report',async()=>{
 await withServer(async base=>{
  const a=client(base);await a('/api/demo','POST');
  const item=(await a('/api/state')).body.claims.find(c=>c.quote.includes('We tried Stripe'));
  assert.match(item.updates[0].quote,/fixed later/);
  const correction='Stripe was deferred during regional checkout testing.';
  await a('/api/review','POST',{id:item.id,state:'approved',correction});
  const [entry]=(await a('/api/handover')).body.items;
  assert.equal(entry.claim,correction);assert.equal(entry.evidence,item.quote);
  await a('/api/review','POST',{id:item.id,state:'rejected'});
  assert.equal((await a('/api/handover')).body.items.length,0);
  assert.equal((await a('/api/import-github','POST',{url:'http://localhost'})).status,400);
 });
});
test('portable workspace survives independent clients and rejects tampering',async()=>{
 process.env.DEADEND_STATE_KEY='integration fixture';
 try{await withServer(async base=>{
  const call=(route,workspace)=>client(base)('/api/desk','POST',{route,workspace});
  const token=(await call('demo')).body.workspace;
  assert.ok((await call('state',token)).body.claims.length);
  assert.equal((await call('state','AABB'+token)).status,400);
  assert.equal((await call('state')).body.claims.length,0);
 });}finally{delete process.env.DEADEND_STATE_KEY;}
});
