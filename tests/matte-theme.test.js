import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
process.env.NODE_ENV='test';
const {app} = await import('../server.js');

test('matte graphite theme loads after old CSS and WebGL uses neutral studio lighting', async()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 assert.ok(html.indexOf('/matte.css')>html.indexOf('/atmosphere.css'));
 const css=readFileSync(new URL('../public/matte.css',import.meta.url),'utf8');
 assert.match(css,/--paper:#101113/);
 assert.match(css,/\.highlight-word\s*\{/);
 assert.match(css,/\.scene-wrap\.immersive\s*\{/);
 assert.match(css,/box-shadow:none!important/);
 const engine=readFileSync(new URL('../src/scene3d.js',import.meta.url),'utf8');
 assert.match(engine,/new THREE\.MeshStandardMaterial/);
 assert.match(engine,/roughness:0\.88/);
 assert.doesNotMatch(engine,/0x40eaff|0xbf82ff|0xc99eff|0xd4aaff/);
 await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
 try{
  const res=await fetch('http://127.0.0.1:'+app.address().port+'/matte.css');
  assert.equal(res.status,200);
  assert.match(res.headers.get('content-type'),/text\/css/);
 }finally{await new Promise(resolve=>app.close(resolve))}
});
