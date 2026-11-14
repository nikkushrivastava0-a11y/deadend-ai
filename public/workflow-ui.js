// Uses the existing request queue/capsule transport; no second workspace or fake role switch.
const workflowPanel=document.createElement('div');
workflowPanel.className='panel spaced';workflowPanel.id='decision-workflows';
document.querySelector('#claimList').before(workflowPanel);
const briefPanel=document.createElement('div');briefPanel.className='panel spaced';
document.querySelector('#handover').append(briefPanel);
let workflowState={disagreements:[],briefs:[],recipients:[]};
let workflowSequence=0;
const wfEscape=escapeHtml;
function wfSourceOptions(){return '<option value="">Choose original source segment</option>'+state.sources.flatMap(s=>(s.segments||[{text:s.text}]).map((p,i)=>`<option value="${wfEscape(JSON.stringify([s.id,i]))}">${wfEscape(s.title)} · segment ${i+1} (${wfEscape(s.visibility)})</option>`)).join('');}
function wfProof(form){const value=form.elements.source.value;if(!value)return null;const [sourceId,segmentIndex]=JSON.parse(value);return {sourceId,segmentIndex,quote:form.elements.quote.value};}
function wfEvidenceFields(){return `<label>Supporting source segment<select name="source">${wfSourceOptions()}</select></label><label>Original segment text<textarea name="original" readonly rows="4" aria-label="Read-only original source segment"></textarea></label><label>Exact supporting excerpt<textarea name="quote" rows="3" maxlength="650" placeholder="Copy an excerpt from the original segment above"></textarea></label>`;}
async function loadWorkflows(){
 const revision=++workflowSequence;
 try{
  const data=await api('/api/workflow-state');if(revision!==workflowSequence)return;workflowState=data;renderWorkflows();
 }catch(e){workflowPanel.textContent='Decision workflows unavailable: '+e.message;}
}
function renderWorkflows(){
 const disclosure=document.querySelector('#handover .disclosure');
 if(disclosure)disclosure.textContent=workflowState.teamMode?'Team access: individual configured roles are enforced by this server. Briefs contain only approved public evidence.':'Public demonstration: anonymous browser workspace. Individual roles and shared receipts require a dedicated team deployment.';
 const role=workflowState.actor?.role,owner=!role||role==='owner',reviewer=!role||['owner','reviewer'].includes(role);
 const options=state.claims.map(c=>`<option value="${wfEscape(c.id)}">${wfEscape(c.title)}</option>`).join('');
 workflowPanel.innerHTML=`<h2>Recheck decisions against today's constraints</h2><p>Historical evidence stays unchanged. A dated human assessment reopens approval. Resolving a disagreement also requires fresh approval.</p><p>${workflowState.teamMode?`Signed in: ${wfEscape(workflowState.actor.username)} · ${wfEscape(role)}`:'Public demonstration: assessments are anonymous and stay in this browser workspace. For individual roles and shared receipts, open Team workspace from navigation.'}</p>`+
 (owner&&options?`<details><summary>Record an owner recheck</summary><form data-wf="recheck"><label>Finding<select name="id">${options}</select></label><label>Checked on (IST)<input name="checkedOn" type="date" value="${new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'})}" max="${new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'})}" required></label><label>Current constraint status<select name="status"><option value="unknown">Unknown / evidence insufficient</option><option value="still-blocked">Still blocked</option><option value="changed">Constraint changed</option></select></label><label>Assessment and current constraint<textarea name="constraint" maxlength="650" required rows="3"></textarea></label>${wfEvidenceFields()}<button class="action" type="submit">Save recheck and reopen review</button></form></details>`:'')+
 (reviewer&&options?`<details><summary>Compare disagreement in two sources</summary><form data-wf="disagreement"><label>Historical finding (first excerpt)<select name="claimId">${options}</select></label><p>The finding's original quote is the first excerpt. Choose a different source and copy the conflicting excerpt below.</p>${wfEvidenceFields()}<button class="action" type="submit">Open disagreement for human review</button></form></details>`:'')+
 state.claims.filter(c=>c.revalidations?.length).map(c=>`<details><summary>Recheck history: ${wfEscape(c.title)}</summary>${c.revalidations.map(r=>`<article class="handover-entry"><b>${wfEscape(r.checkedOn)} · ${wfEscape(r.status)}</b><p>${wfEscape(r.constraint)}</p>${r.evidence?`<blockquote>${wfEscape(r.evidence.quote)}</blockquote><small>${wfEscape(r.evidence.sourceTitle)}</small>`:'<p>No supporting excerpt; current status remains unknown.</p>'}<p>${wfEscape(r.actor)} · version ${r.version}</p></article>`).join('')}</details>`).join('')+
 workflowState.disagreements.map(d=>`<article class="handover-entry"><h3>Two-source disagreement · ${wfEscape(d.status)}</h3><blockquote>${wfEscape(d.left.quote)}</blockquote><small>${wfEscape(d.left.sourceTitle)}</small><blockquote>${wfEscape(d.right.quote)}</blockquote><small>${wfEscape(d.right.sourceTitle)}</small>${d.history.map(h=>`<p><b>Version ${h.version}: ${wfEscape(h.outcome)}</b> · ${wfEscape(h.actor)}</p><p>${wfEscape(h.rationale)}</p><p>Next: ${wfEscape(h.nextStep)}</p>`).join('')}${reviewer?`<form data-wf="resolve" data-id="${wfEscape(d.id)}"><label>Human outcome<select name="outcome"><option value="unresolved">Unresolved</option><option value="left-applies">Original constraint still applies</option><option value="right-applies">Second source applies now</option><option value="context-dependent">Depends on context</option></select></label><label>Rationale<textarea name="rationale" maxlength="650" required></textarea></label><label>Next action<textarea name="nextStep" maxlength="650" required></textarea></label><button class="action" type="submit">Record resolution for review</button></form>`:''}</article>`).join('');
 briefPanel.innerHTML=`<h2>Versioned recipient briefs</h2>`+(workflowState.teamMode?'<p>Issued briefs are snapshots. Later edits do not rewrite an issued version. A receipt acknowledges delivery, not technical correctness.</p>':'<p>Use Team workspace for individual accounts, shared storage and recipient receipts. This anonymous demo remains separate.</p>')+
 (role==='owner'?`<form data-wf="issue"><label>Recipient<select name="recipient">${workflowState.recipients.map(r=>`<option>${wfEscape(r)}</option>`).join('')}</select></label><button class="action" type="submit">Issue approved brief</button></form>`:'')+
 workflowState.briefs.map(b=>`<article class="handover-entry"><h3>Version ${b.version} · ${wfEscape(b.recipient)}</h3><p>Issued ${wfEscape(b.issuedAt)} by ${wfEscape(b.issuedBy)}</p>${b.items.map(x=>`<blockquote>${wfEscape(x.evidence)}</blockquote><p>${wfEscape(x.claim)}</p><p>Source: ${wfEscape(x.url||x.sourceTitle)}</p><p>Next: ${wfEscape(x.nextStep)}</p>${x.revalidation?`<p>Rechecked ${wfEscape(x.revalidation.checkedOn)}: ${wfEscape(x.revalidation.status)} — ${wfEscape(x.revalidation.constraint)}</p>`:''}${(x.resolutions||[]).map(r=>`<p>Human reconciliation: ${wfEscape(r.rationale)}</p><blockquote>${wfEscape(r.left.quote)}</blockquote><blockquote>${wfEscape(r.right.quote)}</blockquote><p>Next: ${wfEscape(r.nextStep)}</p>`).join('')}`).join('')}<p>${b.receipt?'Acknowledged '+wfEscape(b.receipt.at):'Awaiting recipient acknowledgement'}</p>${role==='recipient'&&!b.receipt?`<button class="action" data-ack="${wfEscape(b.id)}">Acknowledge receipt</button>`:''}</article>`).join('');
 if(role==='recipient'){show('handover');$('#demoBtn').disabled=true;$('#stripeJourney').disabled=true;}
}
document.addEventListener('deadend:refresh',loadWorkflows);
document.addEventListener('change',e=>{
 if(e.target.name!=='source'||!e.target.closest('[data-wf]'))return;
 const form=e.target.form;form.elements.quote.value='';if(!e.target.value){form.elements.original.value='';return;}
 const [id,index]=JSON.parse(e.target.value),s=state.sources.find(s=>s.id===id);
 form.elements.original.value=(s.segments||[{text:s.text}])[index].text;
});
document.addEventListener('submit',async e=>{
 const form=e.target.closest('[data-wf]');if(!form)return;e.preventDefault();
 const button=form.querySelector('[type=submit]');if(button.disabled)return;button.disabled=true;
 try{
  const f=form.elements,kind=form.dataset.wf;let route,body;
  if(kind==='recheck'){const c=state.claims.find(c=>c.id===f.id.value);route='revalidate';body={id:c.id,status:f.status.value,constraint:f.constraint.value,checkedOn:f.checkedOn.value,evidence:wfProof(form),expectedVersion:c.revalidations?.length||0};}
  if(kind==='disagreement'){const c=state.claims.find(c=>c.id===f.claimId.value);route='disagreement';body={claimId:c.id,left:{sourceId:c.sourceId,segmentIndex:c.segmentIndex??0,quote:c.quote},right:wfProof(form)};}
  if(kind==='resolve'){const d=workflowState.disagreements.find(d=>d.id===form.dataset.id);route='resolve';body={id:d.id,outcome:f.outcome.value,rationale:f.rationale.value,nextStep:f.nextStep.value,expectedVersion:d.history.length};}
  if(kind==='issue'){route='issue-brief';body={recipient:f.recipient.value};}
  await api('/api/'+route,'POST',body);await refresh();notify('Saved. Evidence retained; review the resulting status before sharing.');
 }catch(error){notify(error.message,true);}finally{button.disabled=false;}
});
document.addEventListener('click',async e=>{
 const button=e.target.closest('[data-ack]');if(!button||button.disabled)return;button.disabled=true;
 try{await api('/api/acknowledge','POST',{id:button.dataset.ack});await loadWorkflows();notify('Receipt acknowledged.');}catch(error){notify(error.message,true);button.disabled=false;}
});
