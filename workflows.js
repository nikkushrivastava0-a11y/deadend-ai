import {randomUUID} from 'node:crypto';
import {verifyClaim, publicHandover} from './engine.js';

export function fail(message, status=400) { throw Object.assign(Error(message), {status}); }
function text(value, name, max=650) {
  if(typeof value!=='string'||!value.trim()||value.trim().length>max)fail(`${name} must contain 1 to ${max} characters`);
  return value.trim();
}
function evidence(db, input) {
  if(!input || typeof input!=='object')fail('Choose original evidence');
  const source=db.sources.find(s=>s.id===input.sourceId);
  const quote=text(input.quote,'Evidence quotation');
  const parts=source?.segments||[{text:source?.text,url:source?.url||null}];
  const index=input.segmentIndex??0;
  const part=Number.isInteger(index)?parts[index]:null;
  if(!source||!part||typeof part.text!=='string'||!part.text.includes(quote))fail('Quotation is not in the selected original source segment',409);
  return {sourceId:source.id,segmentIndex:index,quote,url:part.url||null,sourceTitle:source.title,visibility:source.visibility};
}
function claim(db,id) {
  const item=db.claims.find(c=>c.id===id);
  if(!item)fail('Finding not found',404);
  if(!verifyClaim(item,db.sources.find(s=>s.id===item.sourceId)).ok)fail('Original finding evidence is invalid',409);
  return item;
}
export function revalidate(db,input,actor='demo reviewer',now=new Date()) {
  const item=claim(db,input.id);
  if(!['still-blocked','changed','unknown'].includes(input.status))fail('Choose still-blocked, changed or unknown');
  const constraint=text(input.constraint,'Current constraint');
  const date=text(input.checkedOn,'Checked date',10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||date>now.toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'}))fail('Use a valid checked date that is not in the future');
  const proof=input.evidence?evidence(db,input.evidence):null;
  if(input.status!=='unknown'&&!proof)fail('Changed or still-blocked status requires a supporting source excerpt');
  if(proof&&proof.visibility!==item.visibility)fail('Recheck and finding must have the same visibility',403);
  const history=item.revalidations||[];
  if(history.length>=100)fail('Recheck history is full');
  if(input.expectedVersion!==history.length)fail('Finding changed. Refresh before saving the recheck.',409);
  const record={id:randomUUID(),version:history.length+1,status:input.status,constraint,checkedOn:date,evidence:proof,actor,recordedAt:now.toISOString(),disclosure:'Human assessment; source matching verifies quotation, not current technical truth.'};
  item.revalidations=[...history,record];
  // A changed constraint requires fresh review; old approval must not imply current validity.
  item.state='needs-review';item.reviewedAt=null;
  return record;
}
export function openDisagreement(db,input,actor='demo reviewer') {
  const item=claim(db,input.claimId);
  const left=evidence(db,input.left),right=evidence(db,input.right);
  if(left.sourceId===right.sourceId)fail('Select two different sources');
  if(left.sourceId!==item.sourceId||left.quote!==item.quote||left.url!==(item.sourceUrl||null)||(Number.isInteger(item.segmentIndex)&&left.segmentIndex!==item.segmentIndex))fail('First excerpt must be the finding’s original evidence',409);
  if(left.visibility!==right.visibility||left.visibility!==item.visibility)fail('Disagreement sources must have the same visibility',403);
  db.disagreements??=[];
  const duplicate=db.disagreements.find(d=>d.claimId===item.id&&d.left.sourceId===left.sourceId&&d.left.segmentIndex===left.segmentIndex&&d.right.sourceId===right.sourceId&&d.right.segmentIndex===right.segmentIndex&&d.right.quote===right.quote);
  if(duplicate)return duplicate;
  if(db.disagreements.length>=100)fail('Disagreement limit reached');
  const record={id:randomUUID(),claimId:item.id,left,right,openedBy:actor,openedAt:new Date().toISOString(),history:[],status:'open'};
  db.disagreements.push(record);item.state='disputed';item.reviewedAt=null;
  return record;
}
export function resolveDisagreement(db,input,actor='demo reviewer') {
  const d=db.disagreements?.find(d=>d.id===input.id);
  if(!d)fail('Disagreement not found',404);
  if(!['left-applies','right-applies','context-dependent','unresolved'].includes(input.outcome))fail('Choose an explicit resolution outcome');
  const rationale=text(input.rationale,'Resolution rationale');
  const nextStep=text(input.nextStep,'Next action');
  if(input.expectedVersion!==d.history.length)fail('Resolution changed. Refresh before saving.',409);
  // Recheck both citations on every resolution, never just at creation time.
  evidence(db,d.left);evidence(db,d.right);
  const record={version:d.history.length+1,outcome:input.outcome,rationale,nextStep,actor,at:new Date().toISOString()};
  d.history.push(record);d.status=input.outcome==='unresolved'?'open':'resolved';
  const item=claim(db,d.claimId);item.state=d.status==='open'?'disputed':'needs-review';item.reviewedAt=null;
  return d;
}
export function handoverItems(db) {
  return publicHandover(db).filter(c=>!(db.disagreements||[]).some(d=>d.claimId===c.id&&d.status!=='resolved')).map(c=>{
    const item=db.claims.find(x=>x.id===c.id);
    return {...c,revalidation:item.revalidations?.at(-1)||null,resolutions:(db.disagreements||[]).filter(d=>d.claimId===c.id&&d.status==='resolved').map(d=>({left:d.left,right:d.right,...d.history.at(-1)}))};
  });
}
export function issueBrief(db,input,actor,recipients) {
  const recipient=text(input.recipient,'Recipient',80);
  if(!recipients.includes(recipient))fail('Choose a configured recipient',400);
  const items=handoverItems(db);
  if(!items.length)fail('Approve public findings before issuing a brief',409);
  db.briefs??=[];
  const existing=db.briefs.findLast(b=>b.recipient===recipient&&JSON.stringify(b.items)===JSON.stringify(items));
  if(existing)return existing;
  if(db.briefs.length>=100)fail('Brief version limit reached');
  const record={id:randomUUID(),version:db.briefs.length+1,recipient,issuedBy:actor,issuedAt:new Date().toISOString(),items:structuredClone(items),receipt:null};
  db.briefs.push(record);return record;
}
export function acknowledgeBrief(db,id,actor) {
  const brief=db.briefs?.find(b=>b.id===id&&b.recipient===actor);
  if(!brief)fail('Brief not found',404);
  brief.receipt??={recipient:actor,at:new Date().toISOString(),meaning:'Receipt acknowledged; this does not certify technical correctness.'};
  return brief;
}
