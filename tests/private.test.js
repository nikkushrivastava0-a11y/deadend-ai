import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
test('single-process private workspace requires credentials and recovers reviewed data from disk after restart',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'deadend-test-'));
 Object.assign(process.env,{NODE_ENV:'test',DEADEND_DATA_DIR:dir,DEADEND_WORKSPACE_PASSWORD:'fixture-only'});
 const headers={authorization:'Basic '+Buffer.from('reviewer:fixture-only').toString('base64')};
 let app;
 async function start(i){({app}=await import('../server.js?restart='+i));await new Promise(r=>app.listen(0,'127.0.0.1',r));return 'http://127.0.0.1:'+app.address().port;}
 async function close(){if(app?.listening)await new Promise(r=>app.close(r));}
 try{
  let base=await start(1);
  assert.equal((await fetch(base+'/api/state')).status,401);
  const resp=await fetch(base+'/api/demo',{method:'POST',headers});assert.equal(resp.status,200);
  headers.cookie=resp.headers.get('set-cookie').split(';')[0];
  await close();base=await start(2);
  assert.equal((await (await fetch(base+'/api/state',{headers})).json()).claims.length,5);
  assert.equal((await fetch(base+'/api/reset',{method:'POST',headers:{...headers,origin:'https://other.test'}})).status,403);
 }finally{await close();await rm(dir,{recursive:true,force:true});}
});
