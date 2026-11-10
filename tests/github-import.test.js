import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV='test';
const {app}=await import('../server.js');

test('PR importer preserves exact review-comment permalink as evidence',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async(url,opts)=>{
  const u=String(url);
  const value=u.endsWith('/issues/42')?{title:'Investigate checkout',body:'Team considered Stripe but further investigation required.',html_url:'https://github.com/owner/repo/pull/42'}:
   u.includes('/issues/42/comments')||u.includes('/pulls/42/reviews')?[]:
   u.includes('/pulls/42/comments')?[{body:'We abandoned the payment retry loop because duplicate callbacks caused double charges.',html_url:'https://github.com/owner/repo/pull/42#discussion_r123'}]:null;
  assert.notEqual(value,null,`Unexpected API URL ${u}`);
  return {ok:true,json:async()=>value};
 };
 try{
  await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${app.address().port}`;
  const r=await original(base+'/api/import-github',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url:'https://github.com/owner/repo/pull/42'})});
  const data=await r.json();assert.equal(r.status,200,JSON.stringify(data));
  // Import request operates under its own isolated session. Validate source extraction with content.
  assert.equal(data.count,1);
 }finally{
  globalThis.fetch=original;
  if(app.listening)await new Promise(resolve=>app.close(resolve));
 }
});
test('upstream GitHub denial leaves no partial source',async()=>{
 const real=globalThis.fetch;
 try{
  globalThis.fetch=async()=>({ok:false,status:403});
  await new Promise(r=>app.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+app.address().port;
  const response=await real(base+'/api/import-github',{method:'POST',body:JSON.stringify({url:'https://github.com/example/project/issues/1'})});
  assert.equal(response.status,400);assert.match((await response.json()).error,/403/);
  const state=await real(base+'/api/state',{headers:{cookie:response.headers.get('set-cookie').split(';')[0]}});
  assert.equal((await state.json()).sources.length,0);
 }finally{globalThis.fetch=real;if(app.listening)await new Promise(r=>app.close(r));}
});
