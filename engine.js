/** Evidence-first deterministic extraction; no LLM claims or fabricated citations. */
import crypto from 'node:crypto';
const patterns = [
  /(?:we\s+)?(?:tried|tested|attempted|explored|evaluated|considered|prototyped|used)\b/i,
  /(?:rejected|abandoned|dropped|rolled\s+back|reverted|ruled\s+out|won't\s+use|not\s+using|stopped)\b/i,
  /(?:blocked|failed|broken|incompatible|unreliable|too\s+slow|rate\s+limit|deprecated)\b/i,
];
const reason = /(?:because|due to|since|blocked by|after finding|as a result of|the reason was)\b/i;
const reversal = /(?:actually|however|now works|fixed|resolved|reconsider|no longer|changed|works now|unblocked)\b/i;
export const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0,12);
export function extractCandidates(source) {
  if (!source || typeof source.text !== 'string' || source.text.length > 70000) throw Error('Invalid source or source too large (max 70 KB)');
  const sentences = source.text.split(/(?<=[.!?])\s+|\n+/).map(x => x.trim()).filter(x=>x.length >= 20 && x.length <= 650);
  const records=[];
  for (const sentence of sentences) {
    const matchCount = patterns.filter(p=>p.test(sentence)).length;
    if (!matchCount) continue;
    if (!patterns[1].test(sentence) && !patterns[2].test(sentence)) continue;
    const reasons = reason.test(sentence);
    const matchingSegment = Array.isArray(source.segments) ? source.segments.find(s=>s.text.includes(sentence)) : null;
    records.push({
      id:hash(source.id+':'+sentence),sourceId:source.id,
      title: sentence.slice(0,95)+(sentence.length>95?'…':''),
      claim:sentence,quote:sentence,
      sourceUrl:matchingSegment?.url||source.url||null,sourceTitle:source.title,
      visibility:source.visibility||'public',
      evidenceStatus:reasons?'supported':'needs-context',
      state:reversal.test(sentence)?'disputed': 'needs-review',
      reviewerNote:'',reviewedAt:null,
      nextStep:reasons?'Verify whether the original constraint still applies before retrying.':'Ask the previous owner for the missing reason and current status.'
    });
  }
  return records;
}
export function verifyClaim(claim, source){
  if(!claim||!source) return {ok:false,reason:'Source is missing'};
  if(!claim.quote || !source.text.includes(claim.quote))return {ok:false,reason:'Evidence quotation not found in source'};
  if(claim.visibility!==source.visibility)return {ok:false,reason:'Source visibility mismatch'};
  if(Array.isArray(source.segments) && !source.segments.some(s=>s.url===claim.sourceUrl && s.text.includes(claim.quote))) return {ok:false,reason:'Original comment link does not support quotation'};
  return {ok:true,reason:'Exact supporting quotation found'};
}
export function publicHandover(state){
  return state.claims.filter(c => c.state==='approved' && c.visibility==='public' && verifyClaim(c,state.sources.find(s=>s.id===c.sourceId)).ok)
    .map(c=>({id:c.id,title:c.title,claim:c.claim,evidence:c.quote,url:c.sourceUrl,nextStep:c.nextStep,sourceTitle:c.sourceTitle,updates:relatedUpdates(c,state.sources),reviewedAt:c.reviewedAt}));
}
export function sample(){
 const sources=[
  {id:'demo-pr42',title:'PR #42 — Checkout integration investigation',url:null,visibility:'public',text:'We tried Stripe checkout but dropped the approach because our test environment could not complete the required regional checkout flow. Follow-up owner should revalidate regional availability before trying again.\nWe tested a homegrown payment retry loop and abandoned it because duplicate callbacks could cause repeated charges.'},
  {id:'demo-issue17',title:'Issue #17 — Checkout blocker',url:null,visibility:'public',text:'We evaluated a custom checkout solution and rejected it because idempotency guarantees were not implemented.\nThe blocked Stripe environment was fixed later, however the production decision has not been revisited.'},
  {id:'demo-secret',title:'Internal incident note (restricted example)',url:null,visibility:'restricted',text:'We tried a manual production token workflow and dropped it because credentials were copied into chat. This note is restricted and must never enter a public handover.'}
 ];
 return {sources,claims:sources.flatMap(extractCandidates),events:[{at:new Date().toISOString(),action:'demo-loaded',description:'Synthetic sources loaded (not real GitHub activity).'}]};
}
export function analyzeText(text,title='Uploaded project notes',visibility='public'){
 if(typeof text!=='string'||!text.trim()||text.length>70000)throw Error('Notes must be between 1 and 70,000 characters');
 const src={id:hash(title+text+Date.now()),title:title.slice(0,140),url:null,visibility,text};
 return {source:src,claims:extractCandidates(src)};
}

// A reversal mentioning the same named technology is a review lead, not proof.
export function relatedUpdates(item,sources){
 const terms=item.quote.match(/\b(?:[A-Z][a-zA-Z0-9]+|[A-Z]{2,})\b/g)||[];
 const names=terms.filter(t=>!['The','We','Our','This','After','However','Later','Team','They','That','Previously'].includes(t));
 const hits=[];
 for(const source of sources.filter(s=>s.visibility===item.visibility)){
  for(const part of source.segments||[{text:source.text,url:source.url}]){
   for(const line of part.text.split(/(?<=[.!?])\s+|\n+/).map(s=>s.trim())){
    if(line!==item.quote && reversal.test(line) && names.some(name=>line.toLowerCase().includes(name.toLowerCase())))hits.push({quote:line,source:source.title,url:part.url});
   }
  }
 }
 return hits.slice(0,3);
}
