import test from 'node:test';import assert from 'node:assert/strict';
import {sample,extractCandidates,verifyClaim,publicHandover,analyzeText} from '../engine.js';
test('synthetic sample extracts historical decisions',()=>{const s=sample();assert.ok(s.claims.length>=3);assert.ok(s.claims.some(c=>c.title.includes('Stripe')));});
test('claim stores exact source evidence',()=>{const s=sample();for(const c of s.claims)assert.equal(verifyClaim(c,s.sources.find(x=>x.id===c.sourceId)).ok,true);});
test('tampered quote fails validation',()=>{const s=sample();assert.equal(verifyClaim({...s.claims[0],quote:'made up'},s.sources[0]).ok,false);});
test('restricted claims never leave through public handover',()=>{const s=sample();for(const c of s.claims)c.state='approved';const out=publicHandover(s);assert.ok(out.length>0);assert.ok(!out.some(c=>c.title.includes('production token')));});
test('plain text requires explicit language of failure or rejection',()=>{const s=analyzeText('We used PostgreSQL for our database because we like it.','note','public');assert.equal(s.claims.length,0);});
test('invalid source rejected',()=>assert.throws(()=>analyzeText('', 'note','public')));
test('comment link must identify exact supporting GitHub comment',()=>{
 const src={id:'gh',title:'test',visibility:'public',url:'https://github.com/o/r/issues/4',text:'We tried a queue but dropped it because ordering broke.',segments:[{text:'We tried a queue but dropped it because ordering broke.',url:'https://github.com/o/r/issues/4#issuecomment-7'}]};
 const [claim]=extractCandidates(src);
 assert.equal(claim.sourceUrl,src.segments[0].url);
 assert.equal(verifyClaim(claim,src).ok,true);
 assert.equal(verifyClaim({...claim,sourceUrl:'https://github.com/o/r/issues/4#issuecomment-fake'},src).ok,false);
});
