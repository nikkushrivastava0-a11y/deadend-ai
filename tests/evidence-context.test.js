import test from 'node:test';
import assert from 'node:assert/strict';
import {extractCandidates,verifyClaim,publicHandover} from '../engine.js';

const issue='https://github.com/codeatlasdev/ui/issues/682';
const first='We tried to replace a ~190-line board (cross-column drag, pan, fade, mobile status tabs) with `Kanban`.';
const second='We reverted it because the default look and a missing keyboard contract changed the screen and two end-to-end tests.';

test('public GitHub issue retains attempted approach as context, never as substituted evidence',()=>{
 const src={id:'issue-682',title:'Kanban issue',url:issue,visibility:'public',text:first+' '+second,segments:[{text:first+' '+second,url:issue}]};
 const items=extractCandidates(src);assert.equal(items.length,1);
 assert.equal(items[0].quote,second);
 assert.match(items[0].claim,/Kanban/);
 assert.equal(items[0].sourceUrl,issue);
 assert.ok(verifyClaim(items[0],src).ok);
 items[0].state='approved';
 const [entry]=publicHandover({sources:[src],claims:items});
 assert.equal(entry.evidence,second);
 assert.match(entry.claim,/Kanban/);
});

test('identical quotes in separate comments have distinct IDs and exact permalinks',()=>{
 const quote='We rejected the queue because it dropped events.';
 const urls=[issue+'#issuecomment-1',issue+'#issuecomment-2'];
 const src={id:'dup',title:'comments',url:issue,visibility:'public',text:quote+'\n'+quote,segments:urls.map(url=>({text:quote,url}))};
 const items=extractCandidates(src);assert.equal(items.length,2);
 assert.notEqual(items[0].id,items[1].id);
 assert.deepEqual(items.map(x=>x.sourceUrl),urls);
 assert.ok(items.every(x=>verifyClaim(x,src).ok));
});

test('context never crosses from one GitHub commenter into another',()=>{
 const src={id:'cross',title:'comments',url:issue,visibility:'public',text:first+'\n'+second,segments:[{text:first,url:issue+'#one'},{text:second,url:issue+'#two'}]};
 const [item]=extractCandidates(src);
 assert.equal(item.context,null);
 assert.doesNotMatch(item.claim,/Kanban/);
});
