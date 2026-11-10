import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeText} from '../engine.js';
import {enrich} from '../extraction.js';
test('model-selected excerpts must exist in the named segment; outage preserves rules',async()=>{
 process.env.OPENAI_API_KEY='fixture';
 const quote='Our earlier indexing strategy consumed the entire memory budget.';
 try{
  const result=await enrich(analyzeText(quote),async()=>({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({items:[{segment:0,quote},{segment:0,quote:'Fabricated quote with no evidence whatsoever.'}]})}}]})}));
  assert.deepEqual(result.claims.map(x=>x.quote),[quote]);
  const fallback=await enrich(analyzeText('We rejected the plan because it failed during indexing.'),async()=>({ok:false}));
  assert.match(fallback.method,/unavailable/);assert.equal(fallback.claims.length,1);
 }finally{delete process.env.OPENAI_API_KEY;}
});
