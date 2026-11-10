import test from 'node:test';
import assert from 'node:assert/strict';
import {extractCandidates, verifyClaim, publicHandover} from '../engine.js';

// Public GitHub issue 867, tinyhumansai/openhuman. The failure lines below are verbatim excerpts from the public issue body;
// non-failure lines are not asserted as a full issue-body reproduction.
test('named unsuccessful approaches in markdown retain source context and exact evidence',()=>{
 const url='https://github.com/tinyhumansai/openhuman/issues/867';
 const text=[
  '## What we tried (and why it didn\'t work cleanly)',
  'Attempted in-session; reverted before merging.',
  '### Approach 1 — React overlay inside the placeholder div',
  '- Added an absolute-positioned `<div>` with a spinner inside `WebviewHost.tsx`.',
  '- **Doesn\'t work**: CEF attaches its native `NSView` subview to the main window\'s view hierarchy. That subview paints *above* the WebKit layer that renders React, so the overlay is obscured by CEF once it paints anything (even white). CSS `z-index` can\'t reach across native layers.',
  '### Approach 2 — Hide the webview via `Webview::hide()` during load',
  '- **Doesn\'t work reliably**: on CEF/macOS (`tauri-cef/crates/tauri-runtime-cef/src/cef_webview/macos.rs`), `set_visible(0)` resolves the browser\'s NSView via `self.host()?.window_handle()`. CEF browser creation is asynchronous relative to `add_child`, so when the Hide message is processed the NSView often doesn\'t exist yet and `set_visible` silently no-ops. Retrying in a loop doesn\'t help because `Webview::hide()` always returns Ok (it\'s just queuing a message).'
 ].join('\n');
 const source={id:'issue-867',title:'Webview loader',url,visibility:'public',text,segments:[{text,url}]};
 const findings=extractCandidates(source);
 const failed=findings.filter(f=>/Doesn\'t work/i.test(f.quote));
 assert.equal(failed.length,2,'both failed approaches should be surfaced');
 assert.match(failed[0].claim,/Approach 1 — React overlay/);
 assert.match(failed[1].claim,/Approach 2 — Hide the webview/);
 assert.equal(failed[0].quote.startsWith('- **Doesn\'t work**:'),true);
 assert.equal(failed[0].sourceUrl,url);
 for(const claim of failed) assert.equal(verifyClaim(claim,source).ok,true);
 failed[0].state='approved';
 const [entry]=publicHandover({sources:[source],claims:failed});
 assert.match(entry.claim,/React overlay/);
 assert.equal(entry.evidence,failed[0].quote,'original quotation must remain untouched');
 assert.equal(entry.url,url);
});

test('headings never leak across separate GitHub comments',()=>{
 const url='https://github.com/example/repo/issues/8';
 const segs=[
  {text:'### Approach 1 — The abandoned overlay\n- **Doesn\'t work**: Native views paint over the browser surface.',url:url+'#issuecomment-11'},
  {text:'- **Doesn\'t work**: Here the request is timing out due to retry limits.',url:url+'#issuecomment-12'}
 ];
 const source={id:'two-comments',title:'Independent comments',url,visibility:'public',segments:segs,text:segs.map(s=>s.text).join('\n')};
 const findings=extractCandidates(source);
 assert.equal(findings.length,2);
 assert.match(findings[0].claim,/Approach 1/);
 assert.doesNotMatch(findings[1].claim,/Approach 1/);
 assert.equal(findings[1].sourceUrl,segs[1].url);
 assert.equal(verifyClaim({...findings[1],sourceUrl:segs[0].url},source).ok,false);
});
