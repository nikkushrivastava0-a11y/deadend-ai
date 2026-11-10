import test from 'node:test';
import assert from 'node:assert/strict';
import {extractCandidates,verifyClaim,publicHandover} from '../engine.js';

test('real issue with reverted-it wording recovers original approach without altering quotation',()=>{
 const url='https://github.com/codeatlasdev/ui/issues/682';
 // Verbatim passage from the publicly accessible issue description.
 const text='We tried to replace a ~190-line board (cross-column drag, pan, fade, mobile status tabs) with `Kanban`. We reverted it because the default look and a missing keyboard contract changed the screen and two end-to-end tests. The original board stays until these are covered.';
 const source={id:'issue-682',title:'Kanban context',url,text,segments:[{text,url}],visibility:'public'};
 const results=extractCandidates(source);
 const item=results.find(x=>x.quote.startsWith('We reverted it because'));
 assert.ok(item);
 assert.match(item.claim,/Kanban/);
 assert.match(item.title,/Kanban/);
 assert.equal(item.quote,'We reverted it because the default look and a missing keyboard contract changed the screen and two end-to-end tests.');
 assert.equal(item.sourceUrl,url);
 assert.equal(verifyClaim(item,source).ok,true);
 item.state='approved';
 const handover=publicHandover({sources:[source],claims:[item]});
 assert.equal(handover.length,1);
 assert.equal(handover[0].evidence,item.quote);
 assert.match(handover[0].claim,/Kanban/);
});

test('a second comment cannot supply missing context for anaphoric rejection',()=>{
 const first='We tried to replace the checkout with Stripe.';
 const second='We reverted it because the integration failed during verification.';
 const url='https://github.com/example/repo/issues/9';
 const segments=[{text:first,url:url+'#issuecomment-1'},{text:second,url:url+'#issuecomment-2'}];
 const src={id:'independent',title:'Two comments',url,text:first+'\n'+second,segments,visibility:'public'};
 const item=extractCandidates(src).find(c=>c.quote===second);
 assert.ok(item);
 assert.doesNotMatch(item.claim,/Stripe/);
 assert.equal(item.sourceUrl,segments[1].url);
 assert.equal(verifyClaim(item,src).ok,true);
});
