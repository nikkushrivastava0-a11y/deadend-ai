import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV = 'test';
const {app} = await import('../server.js');

test('public GitHub failure descriptions produce named, citable approved handover', async () => {
 const originalFetch=globalThis.fetch;
 const url='https://github.com/tinyhumansai/openhuman/issues/867';
 // Verbatim issue excerpts; external HTTP is stubbed so test remains deterministic.
 const body=[
  "## What we tried (and why it didn't work cleanly)",
  "Attempted in-session; reverted before merging. Captured here so the next attempt doesn't redo the same dead ends.",
  "### Approach 1 — React overlay inside the placeholder div",
  "- **Doesn't work**: CEF attaches its native `NSView` subview to the main window's view hierarchy. That subview paints *above* the WebKit layer that renders React, so the overlay is obscured by CEF once it paints anything (even white). CSS `z-index` can't reach across native layers.",
  "### Approach 2 — Hide the webview via `Webview::hide()` during load",
  "- **Doesn't work reliably**: on CEF/macOS (`tauri-cef/crates/tauri-runtime-cef/src/cef_webview/macos.rs`), `set_visible(0)` resolves the browser's NSView via `self.host()?.window_handle()`. CEF browser creation is asynchronous relative to `add_child`, so when the Hide message is processed the NSView often doesn't exist yet and `set_visible` silently no-ops. Retrying in a loop doesn't help because `Webview::hide()` always returns Ok (it's just queuing a message)."
 ].join('\n');
 globalThis.fetch=async (target,options)=>{
  const u=String(target);
  if(u==='https://api.github.com/repos/tinyhumansai/openhuman/issues/867')
   return new Response(JSON.stringify({title:'Show loading overlay over account webviews during first-time load',body,html_url:url}),{status:200});
  if(u==='https://api.github.com/repos/tinyhumansai/openhuman/issues/867/comments?per_page=100')
   return new Response('[]',{status:200});
  return originalFetch(target,options);
 };
 await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+app.address().port;
 let cookie='';
 async function call(route,method='GET',payload){
  const res=await originalFetch(base+route,{method,headers:{'Content-Type':'application/json',...(cookie?{cookie}:{})},body:payload?JSON.stringify(payload):undefined});
  cookie=res.headers.get('set-cookie')?.split(';')[0]||cookie;
  return {status:res.status,data:await res.json()};
 }
 try {
  const result=await call('/api/import-github','POST',{url});
  assert.equal(result.status,200,JSON.stringify(result.data));
  const state=(await call('/api/state')).data;
  const cases=state.claims.filter(c=>/Approach [12]/.test(c.claim));
  assert.equal(cases.length,2);
  assert.ok(cases.every(c=>c.sourceUrl===url));
  assert.ok(cases.every(c=>c.quote.startsWith("- **Doesn't work")));
  assert.ok(!state.claims.some(c=>c.quote.startsWith('##')));
  const correction='React overlay cannot cover the native CEF child view; investigate a native-surface loader.';
  const approved=await call('/api/review','POST',{id:cases[0].id,state:'approved',correction});
  assert.equal(approved.status,200,JSON.stringify(approved.data));
  const handover=(await call('/api/handover')).data;
  assert.equal(handover.items.length,1);
  assert.equal(handover.items[0].claim,correction);
  assert.equal(handover.items[0].evidence,cases[0].quote);
  assert.equal(handover.items[0].url,url);
 }finally{
  globalThis.fetch=originalFetch;
  await new Promise(resolve=>app.close(resolve));
 }
});