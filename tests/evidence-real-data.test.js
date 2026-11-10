import test from 'node:test';
import assert from 'node:assert/strict';
import {extractCandidates,relatedUpdates,verifyClaim,publicHandover} from '../engine.js';
// Public, permissionless historical evidence: https://github.com/ruuvi/com.ruuvi.station.webui/issues/501
// Exact text and context retrieved 10 Nov 2026; no synthetic claim presented as real.
const url='https://github.com/ruuvi/com.ruuvi.station.webui/issues/501';
const body="Compare multiple units in comparison chart\nDescription:\n\nPreviously we abandoned idea to compare multiple units in single chart, because there are obvious limitations and we didn't find a pretty solution.\n\nBut we should consider this in the future.\n\nExample: show temperature and dew point in same chart.";
test('public issue #501 yields supported finding, accurate URL and separate reconsideration',()=>{
 const src={id:'ruuvi-501',title:'Compare multiple units in comparison chart',url,visibility:'public',text:body,segments:[{text:body,url}]};
 const claims=extractCandidates(src);assert.equal(claims.length,1);
 assert.equal(claims[0].sourceUrl,url);assert.equal(verifyClaim(claims[0],src).ok,true);
 const updates=relatedUpdates(claims[0],[src]);assert.equal(updates.length,1);
 assert.equal(updates[0].quote,'But we should consider this in the future.');
 claims[0].claim='This chart approach was abandoned historically; re-evaluate before retrying.';
 claims[0].state='approved';
 const handover=publicHandover({sources:[src],claims});
 assert.equal(handover.length,1);assert.equal(handover[0].evidence,claims[0].quote);
 assert.equal(handover[0].updates[0].url,url);
});
test('identical quotes in two comments produce unique reviewable findings with bound provenance',()=>{
 const quote='We dropped the old cache because it served stale values.';
 const segments=[{text:quote,url:'https://github.com/example/repo/issues/1#issuecomment-10'},{text:quote,url:'https://github.com/example/repo/issues/1#issuecomment-11'}];
 const src={id:'duplicate',title:'Cache',url:'https://github.com/example/repo/issues/1',visibility:'public',text:quote+'\n'+quote,segments};
 const c=extractCandidates(src);assert.equal(c.length,2);
 assert.notEqual(c[0].id,c[1].id);
 assert.deepEqual(c.map(x=>x.sourceUrl),segments.map(x=>x.url));
 for(const row of c)assert.equal(verifyClaim(row,src).ok,true);
 assert.equal(verifyClaim({...c[1],sourceUrl:segments[0].url},src).ok,false);
});
test('unrelated reversal with a different technology is not attributed to a decision',()=>{
 const first='We abandoned Stripe checkout because the sandbox rejected accounts.';
 const later='Redis now works, however the cache remains unverified.';
 const src={id:'mix',title:'Mix',visibility:'public',url:null,text:first+'\n'+later};
 const item=extractCandidates(src).find(x=>x.quote===first);
 assert.ok(item);assert.equal(relatedUpdates(item,[src]).length,0);
});
