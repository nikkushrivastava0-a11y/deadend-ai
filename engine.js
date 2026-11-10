/** Evidence-first deterministic extraction; no LLM claims or fabricated citations. */
import crypto from 'node:crypto';
const patterns = [
  /(?:we\s+)?(?:tried|tested|attempted|explored|evaluated|considered|prototyped|used)\b/i,
  /(?:rejected|abandoned|dropped|rolled\s+back|reverted|ruled\s+out|won't\s+use|not\s+using|stopped)\b/i,
  /(?:blocked|failed|broken|incompatible|unreliable|too\s+slow|rate\s+limit|deprecated|doesn['’]t\s+work|didn['’]t\s+work|did\s+not\s+work|not\s+viable)\b/i,
];
const reason = /(?:because|due to|since|blocked by|after finding|as a result of|the reason was)\b/i;
const reversal = /(?:actually|however|now works|fixed|resolved|reconsider|no longer|changed|works now|unblocked)\b/i;
export const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0,12);
export function extractCandidates(source) {
  if (!source || typeof source.text !== 'string' || source.text.length > 70000) throw Error('Invalid source or source too large (max 70 KB)');
  // Keep comment-level provenance: two reviewers may independently write the same sentence.
  const segments=Array.isArray(source.segments) && source.segments.length
    ? source.segments : [{text:source.text,url:source.url||null}];
  const records=[];
  for(const [segmentIndex,part] of segments.entries()){
    if(typeof part.text!=='string')continue;
    const sentences=part.text.split(/(?<=[.!?])\s+|\n+/).map(x=>x.trim());
    let approachHeading=null;
    for(const [sentenceIndex,sentence] of sentences.entries()){
      // Headings in the same original comment give failed attempts their names.
      // Never borrow context across different GitHub comments.
      if(/^#{2,5}\s+Approach\s+\d+\s*[-—:]/i.test(sentence)){
        approachHeading=sentence.replace(/^#{2,5}\s+/,'').slice(0,180);
        continue;
      }
      if(/^#{1,5}\s+/.test(sentence)){approachHeading=null;continue;} // headings describe context, not standalone evidence
      if(sentence.length<20 || sentence.length>650)continue;
      if(!patterns[1].test(sentence) && !patterns[2].test(sentence))continue;
      const isFailureExplanation=/doesn['’]t\s+work|didn['’]t\s+work|did\s+not\s+work/i.test(sentence) && /:\s*\S.{15,}/.test(sentence);
      const reasons=reason.test(sentence)||isFailureExplanation;
      // A statement like 'We reverted it because...' needs its named approach.
      // Only use the immediately preceding sentence from the SAME source segment.
      const previous=sentenceIndex>0?sentences[sentenceIndex-1]:null;
      const anaphoric=/\b(?:it|this|that)\b/i.test(sentence) && /\b(?:reverted|rejected|abandoned|dropped|rolled\s+back|stopped)\b/i.test(sentence);
      const priorContext=anaphoric && previous && patterns[0].test(previous) ? previous : null;
      const context=approachHeading && isFailureExplanation ? approachHeading : priorContext;
      const interpretation=context ? `Context: ${context} Evidence: ${sentence}` : sentence;
      records.push({
        id:hash(source.id+':'+segmentIndex+':'+sentenceIndex+':'+sentence),sourceId:source.id,
        title:context ? (context.length>95?'…'+context.slice(-94):context) : sentence.slice(0,95)+(sentence.length>95?'…':''),
        claim:interpretation,quote:sentence,context,
        sourceUrl:part.url||source.url||null,segmentIndex,sourceAuthor:part.author||null,sourceCreatedAt:part.createdAt||null,sourceTitle:source.title,
        visibility:source.visibility||'public',
        evidenceStatus:reasons?'supported':'needs-context',
        state:reversal.test(sentence)?'disputed':'needs-review',
        reviewerNote:'',reviewedAt:null,
        nextStep:reasons?'Verify whether the original constraint still applies before retrying.':'Ask the previous owner for the missing reason and current status.'
      });
    }
  }
  return records;
}
export function verifyClaim(claim, source){
  if(!claim||!source) return {ok:false,reason:'Source is missing'};
  if(!claim.quote || !source.text.includes(claim.quote))return {ok:false,reason:'Evidence quotation not found in source'};
  if(claim.visibility!==source.visibility)return {ok:false,reason:'Source visibility mismatch'};
  if(Array.isArray(source.segments)){
    if(Number.isInteger(claim.segmentIndex)){
      const segment=source.segments[claim.segmentIndex];
      if(!segment || segment.url!==claim.sourceUrl || !segment.text.includes(claim.quote))return {ok:false,reason:'Claim is not supported by its original comment segment'};
    }else if(!source.segments.some(s=>s.url===claim.sourceUrl && s.text.includes(claim.quote)))return {ok:false,reason:'Original comment link does not support quotation'};
  }
  return {ok:true,reason:'Exact supporting quotation found'};
}
export function publicHandover(state){
  return state.claims.filter(c => c.state==='approved' && c.visibility==='public' && verifyClaim(c,state.sources.find(s=>s.id===c.sourceId)).ok)
    .map(c=>({id:c.id,title:c.title,claim:c.claim,evidence:c.quote,url:c.sourceUrl,nextStep:c.nextStep,sourceTitle:c.sourceTitle,sourceAuthor:c.sourceAuthor||null,sourceCreatedAt:c.sourceCreatedAt||null,updates:relatedUpdates(c,state.sources),reviewedAt:c.reviewedAt}));
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

// Possible reversals and plans to revisit are leads for human review, never proof a blocker is fixed.
const futureRevisit=/\b(?:revisit|reconsider|should consider|consider (?:this|it)|try (?:this|it) again)\b/i;
export function relatedUpdates(item,sources){
 const terms=((item.context||item.quote).match(/\b(?:[A-Z][a-zA-Z0-9]+|[A-Z]{2,})\b/g)||[])
  .filter(t=>!['The','We','Our','This','After','However','Later','Team','They','That','Previously','But','Example'].includes(t));
 const named=(line)=>terms.some(term=>new RegExp('\\b'+term+'\\b','i').test(line));
 const seen=new Set(),hits=[];
 for(const source of sources.filter(s=>s.visibility===item.visibility)){
  for(const part of source.segments||[{text:source.text,url:source.url}]){
   const sentences=part.text.split(/(?<=[.!?])\s+|\n+/).map(s=>s.trim()).filter(Boolean);
   for(let i=0;i<sentences.length;i++){
    const line=sentences[i];
    if(line===item.quote)continue;
    const adjacentRevisit=sentences[i-1]===item.quote && futureRevisit.test(line) && /\b(?:this|it|again|approach|idea)\b/i.test(line);
    if(!adjacentRevisit && !(reversal.test(line)&&named(line)))continue;
    const key=[source.id,part.url,line].join('|');
    if(seen.has(key))continue;seen.add(key);
    hits.push({quote:line,source:source.title,url:part.url||source.url||null});
   }
  }
 }
 return hits.slice(0,3);
}
