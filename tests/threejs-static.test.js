import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
process.env.NODE_ENV='test';
const {app}=await import('../server.js');

test('The evidence atlas ships compiled WebGL locally with an accessible semantic fallback',async()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 assert.doesNotMatch(html,/<script src="\/scene3d\.bundle\.js"/); const clientSource=readFileSync(new URL('../public/app.js',import.meta.url),'utf8'); assert.match(clientSource,/lazilyLoadWebGL/);
 assert.match(html,/site\.bundle\.css/);
 assert.match(html,/data-node="source"/);
 assert.match(html,/data-node="evidence"/);
 assert.match(html,/data-node="review"/);
 assert.ok(statSync(new URL('../public/scene3d.bundle.js',import.meta.url)).size>150000,
   'The generated WebGL scene must include real 3D rendering code');
 await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+app.address().port;
 try{
  for(const [route,expected] of [
   ['/scene3d.bundle.js','text/javascript'],
   ['/atmosphere.css','text/css'],
   ['/fonts/dm-sans.woff2','font/woff2'],
   ['/fonts/space-grotesk.woff2','font/woff2']
  ]){
   const res=await fetch(base+route);
   assert.equal(res.status,200,route);
   assert.match(res.headers.get('content-type'),new RegExp(expected),route);
   assert.ok((await res.arrayBuffer()).byteLength>100,route);
  }
  const fallback=await fetch(base+'/');
  assert.equal(fallback.status,200);
  assert.match(fallback.headers.get('content-security-policy'),/script-src 'self'/);
  assert.match(fallback.headers.get('content-security-policy'),/font-src 'self'/);
 }finally{await new Promise(resolve=>app.close(resolve));}
});
