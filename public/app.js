const $ = s=>document.querySelector(s);let state={sources:[],claims:[],events:[]};
const escapeHtml = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const notify=(msg,error=false)=>{const n=$('#notice');n.textContent=msg;n.classList.toggle('error',error);n.setAttribute('role',error?'alert':'status');n.dataset.kind=error?'error':'success';if(error)n.scrollIntoView({block:'nearest',behavior:'smooth'});};
const capabilities=fetch('/api/health').then(r=>r.json());
let nextRequest=Promise.resolve();
function api(url,method='GET',data){
 const run=async()=>{
 const health=await capabilities;
 if(health.capsules){
  const route=url.slice(5);
  const envelope={route,data,workspace:sessionStorage.getItem('deadend-case')};
  const response=await fetch('/api/desk',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(envelope)});
  const obj=await response.json();
  if(!response.ok){if(obj.error?.includes('expired or invalid'))sessionStorage.removeItem('deadend-case');throw Error(obj.error||'Request failed');}
  if(obj.workspace)sessionStorage.setItem('deadend-case',obj.workspace);
  return obj;
 }
const resp=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});const obj=await resp.json();if(!resp.ok)throw Error(obj.error||'Request failed');return obj;};const result=nextRequest.then(run);nextRequest=result.catch(()=>{});return result;}
const viewMeta={overview:{name:'The desk',title:'DeadEnd AI — Trace Rejected Technical Decisions',description:'Find out why technical approaches failed. Inspect the original evidence and approve a developer handover.'},sources:{name:'Add evidence',title:'Add Public Evidence | DeadEnd AI',description:'Import public GitHub issues and PRs or permitted notes into your DeadEnd investigation.'},findings:{name:'Case files',title:'Review Technical Decisions | DeadEnd AI',description:'Review candidate rejected approaches, original quotations and source permalinks.'},handover:{name:'Handover',title:'Approved Evidence Handover | DeadEnd AI',description:'Export reviewed technical lessons as an approved Markdown handover.'}};
function closeMenu(){const sidebar=document.querySelector('.sidebar');sidebar?.classList.remove('menu-open');const toggle=$('#menuToggle');if(toggle){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');}}
function show(name,options={}){if(!Object.hasOwn(viewMeta,name))name='overview';document.querySelectorAll('.view').forEach(x=>x.classList.toggle('hidden',x.id!==name));document.querySelectorAll('.nav').forEach(x=>{const active=x.dataset.view===name;x.classList.toggle('active',active);if(active)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current');});const m=viewMeta[name];document.title=m.title;document.querySelector('meta[name="description"]')?.setAttribute('content',m.description);$('#breadcrumbCurrent').textContent=m.name;$('#notice').textContent='';closeMenu();if(options.push){const next=name==='overview'?location.pathname:location.pathname+'#'+name;history.pushState({view:name},'',next);}window.scrollTo(0,0);}
async function refresh(){state=await api('/api/state');const c=state.claims;$('#findingsCount').textContent=c.length;$('#statSources').textContent=state.sources.length;$('#statFindings').textContent=c.length;$('#statPending').textContent=c.filter(x=>['needs-review','disputed'].includes(x.state)).length;$('#statApproved').textContent=c.filter(x=>x.state==='approved').length;$('#sourceTotal').textContent=state.sources.length+' sources';renderSources();renderClaims();renderTrace();await renderHandover();}
function renderSources(){const box=$('#sourceList');box.classList.toggle('empty',!state.sources.length);box.innerHTML=state.sources.length?state.sources.map(s=>`<div class="source-row"><div><details><summary>${escapeHtml(s.title)}</summary><pre>${escapeHtml(s.text)}</pre></details><small>${s.textLength.toLocaleString()} characters · ${escapeHtml(s.id)}</small></div><span class="pill ${s.visibility==='restricted'?'restricted':''}">${escapeHtml(s.visibility)}</span></div>`).join(''):'No sources yet. Load the guided demo from Overview to explore.';}
function renderClaims(){const q=$('#search').value.toLowerCase(),f=$('#filter').value;const ignore=new Set(['should','would','could','again','please','with','what','when','where','does','have','this','that','were','there','about','from','into','the','and','try','can','we','why']);const terms=(q.match(/[a-z0-9][a-z0-9._-]*/g)||[]).filter(t=>t.length>2&&!ignore.has(t));const list=state.claims.filter(c=>(f==='all'||c.state===f)&&terms.every(t=>[c.title,c.claim,c.quote,c.sourceTitle,...(c.updates||[]).map(u=>u.quote)].join(' ').toLowerCase().includes(t)));const box=$('#claimList');box.classList.toggle('empty',!list.length);box.innerHTML=list.length?list.map(c=>`<article class="claim"><div class="claimtop"><span class="pill ${escapeHtml(c.state)}">${escapeHtml(c.state.replace('-',' '))}</span><span class="pill ${c.visibility==='restricted'?'restricted':''}">${escapeHtml(c.visibility)} evidence</span></div><h3>${escapeHtml(c.claim)}</h3><div class="claimmeta">SOURCE: ${escapeHtml(c.sourceTitle)}${c.sourceAuthor?` · ${escapeHtml(c.sourceAuthor)}`:""}${c.sourceCreatedAt?` · ${escapeHtml(String(c.sourceCreatedAt).slice(0,10))}`:""} ${c.sourceUrl?`· <a href="${escapeHtml(c.sourceUrl)}" target="_blank" rel="noopener noreferrer">Inspect original ↗</a>`:`· <button class="text-link" data-source="${c.sourceId}">Read source</button>`}</div><blockquote>“${escapeHtml(c.quote)}”</blockquote><div class="claimmeta">EVIDENCE CHECK: ${escapeHtml(c.evidenceStatus)} · NEXT: ${escapeHtml(c.nextStep)}</div>${c.reviewerNote?`<small>Reviewer note: ${escapeHtml(c.reviewerNote)}</small>`:''}${(c.updates||[]).map(u=>`<aside class="counter"><b>Possible change in circumstances</b><p>${escapeHtml(u.quote)}</p><small>${escapeHtml(u.source)}${u.url?` · <a href="${escapeHtml(u.url)}" target="_blank" rel="noopener noreferrer">Read update ↗</a>`:""}</small></aside>`).join('')}<div class="review-actions"><button class="action" data-edit="${c.id}">Edit finding</button><button class="action" data-review="approved" data-id="${c.id}" ${c.visibility==='restricted'?'disabled title="Restricted evidence cannot be publicly approved"':''}>✓ Approve</button><button class="action" data-review="disputed" data-id="${c.id}">? Dispute</button><button class="action" data-review="rejected" data-id="${c.id}">× Reject</button><button class="action" data-review="needs-review" data-id="${c.id}">↻ Reopen</button></div></article>`).join(''):'No matching findings. Try another search or import sources.';}
async function renderHandover(){const d=await api('/api/handover');$('#downloadBtn').disabled=d.items.length===0;$('#downloadBtn').title=d.items.length?'Download the reviewed public findings':'Approve a public finding to enable download';$('#handoverCount').textContent=d.items.length+' approved findings';const box=$('#handoverList');box.classList.toggle('empty',!d.items.length);box.innerHTML=d.items.length?d.items.map((x,i)=>`<article class="handover-entry"><span class="pill approved">LESSON ${String(i+1).padStart(2,'0')}</span><h3>${escapeHtml(x.title)}</h3><p><strong>What we know:</strong> ${escapeHtml(x.claim)}</p><p><strong>What to do next:</strong> ${escapeHtml(x.nextStep)}</p>${(x.updates||[]).map(u=>`<p><strong>Recheck:</strong> ${escapeHtml(u.quote)} · ${escapeHtml(u.source)}${u.url?` · <a href="${escapeHtml(u.url)}" target="_blank" rel="noopener noreferrer">Original update ↗</a>`:""}</p>`).join('')}<small>${escapeHtml(x.sourceTitle)}${x.sourceAuthor?` · ${escapeHtml(x.sourceAuthor)}`:""}${x.sourceCreatedAt?` · ${escapeHtml(String(x.sourceCreatedAt).slice(0,10))}`:""} · Evidence: ${escapeHtml(x.evidence)} ${x.url?`· <a href="${escapeHtml(x.url)}" target="_blank" rel="noopener noreferrer">Source ↗</a>`:''}</small></article>`).join(''):'Nothing approved yet. Review and approve a public finding to build a handover.';}
let navRevision=0;
document.addEventListener('click',async e=>{const nav=e.target.closest('[data-view],[data-goto]');if(nav){if(nav.tagName==='A')e.preventDefault();navRevision++;show(nav.dataset.view||nav.dataset.goto,{push:true});return;}const btn=e.target.closest('[data-review]');if(!btn)return;const id=btn.dataset.id,stateValue=btn.dataset.review;let note='';if(stateValue==='disputed')note=prompt('Why is this evidence disputed? (optional)')||'';try{await api('/api/review','POST',{id,state:stateValue,note});await refresh();notify(`Finding marked ${stateValue}.`);}catch(err){notify(err.message,true);}});
$('#stripeJourney').addEventListener('click',async e=>{e.preventDefault();
 const revision=++navRevision;
 try{
  if(!state.claims.some(c=>/\bStripe\b/i.test(c.claim))){
   if(state.sources.length && !confirm('Replace this workspace with the synthetic Stripe example?'))return;
   await api('/api/demo','POST');await refresh();
  }
  if(revision!==navRevision)return;
  show('findings');$('#filter').value='all';$('#search').value='Should we try Stripe again?';renderClaims();$('#search').focus();
 }catch(err){notify(err.message,true);}
});
$('#demoBtn').addEventListener('click',async()=>{const revision=++navRevision;if(state.sources.length && !confirm('Replace current workspace with synthetic demo data?'))return;$('#demoBtn').disabled=true;$('#stripeJourney').disabled=true;try{await api('/api/demo','POST');await refresh();if(revision!==navRevision)return;show('overview');document.querySelector('[data-node=decision]').click();scene.scrollIntoView({block:'center'});notify('Example case loaded. Select an evidence card to inspect the workflow.');}catch(err){notify(err.message,true);}finally{$('#demoBtn').disabled=false;$('#stripeJourney').disabled=false;}});
$('#notesForm').addEventListener('submit',async e=>{e.preventDefault();const btn=e.currentTarget.querySelector('[type=submit]');if(btn.disabled)return;btn.disabled=true;try{const r=await api('/api/import-notes','POST',{title:$('#noteTitle').value,text:$('#noteText').value,visibility:$('#visibility').value});await refresh();show('findings');notify(`${r.count} candidate findings from the supplied text. Review exact evidence before approval.`);}catch(err){notify(err.message,true);}finally{btn.disabled=false;}});
$('#realCaseBtn')?.addEventListener('click',async()=>{
 try{
  const r=await api('/api/import-github','POST',{url:'https://github.com/ruuvi/com.ruuvi.station.webui/issues/501'});
  await refresh();show('findings');$('#filter').value='all';$('#search').value='compare multiple units';renderClaims();
  notify('Real public GitHub case imported. Inspect the original source, then review its historical decision and possible reconsideration.');
 }catch(err){notify('Public example could not be imported: '+err.message,true);}
});
$('#githubForm').addEventListener('submit',async e=>{e.preventDefault();const btn=e.currentTarget.querySelector('[type=submit]');if(btn.disabled)return;btn.disabled=true;try{const url=$('#githubUrl').value.trim();if(!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(issues|pull)\/\d+\/?$/i.test(url)){notify('Enter a full public GitHub issue or pull-request URL (for example, https://github.com/owner/repo/issues/12).',true);return;}const r=await api('/api/import-github','POST',{url});await refresh();show('findings');notify(`${r.count} candidate findings imported from the public GitHub discussion.`);}catch(err){notify(err.message,true);}finally{btn.disabled=false;}});
$('#search').addEventListener('input',renderClaims);$('#filter').addEventListener('change',renderClaims);
$('#downloadBtn').addEventListener('click',async()=>{const button=$('#downloadBtn');if(button.dataset.loading==='true')return;button.dataset.loading='true';button.disabled=true;try{const d=await api('/api/handover');if(!d.items.length){notify('Nothing ready to export. Approve a public finding first.',true);return;}const lines=['# DeadEnd — Approved Handover','',`Generated: ${d.generatedAt}`,'Scope: Public evidence only','',...d.items.flatMap((x,i)=>[`## ${i+1}. ${x.title}`,'',x.claim,'',`Evidence: ${x.evidence}`,`Source: ${x.url||x.sourceTitle}`,...(x.updates||[]).map(u=>`Recheck: ${u.quote} (${u.source})${u.url?` — ${u.url}`:""}`),`Next action: ${x.nextStep}`,''])];const blob=new Blob([lines.join('\n')],{type:'text/markdown'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='deadend-handover.md';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);notify('Approved handover downloaded. Keep the source links with the file.');}catch(err){notify('Could not download handover: '+err.message,true);}finally{delete button.dataset.loading;button.disabled=!state.claims.some(c=>c.state==='approved'&&c.visibility==='public');}});
$('#date').textContent=new Date().toLocaleDateString('en-GB',{month:'short',day:'numeric',year:'numeric'});
$('#menuToggle')?.addEventListener('click',()=>{const el=document.querySelector('.sidebar');const open=el.classList.toggle('menu-open');$('#menuToggle').setAttribute('aria-expanded',String(open));$('#menuToggle').setAttribute('aria-label',open?'Close navigation':'Open navigation');});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
document.addEventListener('click',e=>{if(!e.target.closest('.sidebar'))closeMenu();});
const restoreView=()=>show(location.hash.slice(1)||'overview');
window.addEventListener('popstate',restoreView);window.addEventListener('hashchange',restoreView);restoreView();
const lazilyLoadWebGL=()=>{
 if(!window.matchMedia('(min-width: 701px)').matches||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 if(document.querySelector('#scene3dScript')||!document.querySelector('#scene'))return;
 // Actual Three.js is fetched only if this scene enters (or approaches) the viewport.
 const target=document.querySelector('#scene');
 const observer=new IntersectionObserver(entries=>{
  if(!entries.some(entry=>entry.isIntersecting))return;observer.disconnect();
  const script=document.createElement('script');script.id='scene3dScript';script.src='/scene3d.bundle.js';script.async=true;
  script.onerror=()=>{script.remove();};document.body.append(script);
 },{rootMargin:'300px'});
 observer.observe(target);
};
window.addEventListener('resize',lazilyLoadWebGL,{passive:true});
lazilyLoadWebGL();

// Perspective-based interactive 3D evidence constellation (CSS 3D, not WebGL).
const scene = document.querySelector('#scene');
const orbit = document.querySelector('#sceneOrbit');
const nodes = [...document.querySelectorAll('[data-node]')];
let rotX=-29,rotY=-23,dragging=false,dragMoved=false,lastX=0,lastY=0;
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const sceneInfo={
 source:['SOURCE / 01','Start with authorised evidence.','Import a public GitHub discussion or a permitted project note. The source text is retained so every candidate has an original quotation.','sources','IMPORT SOURCE ↗'],
 decision:['RECONSTRUCT / 02','Recover the abandoned approach.','The extractor identifies candidate rejected approaches and blockers. It does not claim a closed pull request proves a failed approach.','findings','SEE FINDINGS ↗'],
 evidence:['VERIFY / 03','No quotation, no conclusion.','Exact supporting excerpts are checked against the imported source. Contradictions and missing reasoning remain open questions.','findings','CHECK EVIDENCE ↗'],
 review:['REVIEW / 04','A human makes the call.','An authorised reviewer must inspect and approve a finding. This prototype does not implement identity-based reviewer authentication.','findings','REVIEW CASES ↗'],
 handover:['HANDOVER / 05','Pass on the reason.','Only approved findings from public sources enter the generated handover. Restricted examples are excluded.','handover','OPEN HANDOVER ↗']
};
function positionScene(){if(orbit)orbit.style.transform=`rotateX(${rotX}deg) rotateY(${rotY}deg)`;}
positionScene();
scene?.addEventListener('keydown',e=>{
 if(e.target!==scene || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
 if(reduceMotion.matches || matchMedia('(max-width:600px)').matches)return;
 e.preventDefault();
 rotY=Math.max(-75,Math.min(75,rotY+(e.key==='ArrowLeft'?-7:e.key==='ArrowRight'?7:0)));
 rotX=Math.max(-62,Math.min(8,rotX+(e.key==='ArrowUp'?7:e.key==='ArrowDown'?-7:0)));
 positionScene();
});
scene?.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;dragging=true;dragMoved=false;lastX=e.clientX;lastY=e.clientY;scene.classList.add('dragging');scene.setPointerCapture(e.pointerId);});
scene?.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(dx)+Math.abs(dy)>1)dragMoved=true;rotY=Math.max(-75,Math.min(75,rotY+dx*.32));rotX=Math.max(-62,Math.min(8,rotX-dy*.24));lastX=e.clientX;lastY=e.clientY;positionScene();});
const endDrag=()=>{dragging=false;scene?.classList.remove('dragging')};
scene?.addEventListener('pointerup',endDrag);scene?.addEventListener('pointercancel',endDrag);
document.querySelector('#resetCamera')?.addEventListener('click',()=>{rotX=-29;rotY=-23;positionScene();});
nodes.forEach(node=>node.addEventListener('click',()=>{
 const key=node.dataset.node;const [tag,title,body,target,label]=activeTrace()[key];
 nodes.forEach(n=>n.classList.toggle('selected',n===node));
 document.querySelector('#inspectorTag').textContent=tag;
 document.querySelector('#inspectorTitle').textContent=title;
 document.querySelector('#inspectorBody').textContent=body;
 const btn=document.querySelector('#inspectorAction');btn.onclick=()=>{if(target==='findings'){const c=state.claims.find(x=>x.id===$('#tracePick').value);$('#search').value=c?.claim||'';$('#filter').value='all';renderClaims();}};btn.dataset.goto=target;btn.textContent=label;
 document.querySelector('#sceneSelection').textContent=`SELECTED / ${tag}`;
}));

function activeTrace(){
 const c=state.claims.find(x=>x.id===$('#tracePick').value);
 if(!c)return sceneInfo;
 return {
  source:['SOURCE',c.sourceTitle,c.sourceUrl||'Uploaded note','sources','VIEW SOURCES'],
  decision:['FINDING',c.title,c.claim,'findings','REVIEW FINDING'],
  evidence:['ORIGINAL EXCERPT',c.sourceTitle,c.quote,'findings','INSPECT QUOTE'],
  review:['REVIEW',c.state,(c.updates?.[0]?.quote)||c.reviewerNote||'Inspect the original wording before approving.','findings','OPEN REVIEW'],
  handover:['NEXT ACTION',c.state==='approved'?'Approved for handover':'Awaiting approval',c.nextStep,'handover','OPEN HANDOVER']
 };
}
function renderTrace(){
 const picker=$('#tracePick'), old=picker.value;
 picker.replaceChildren(...(state.claims.length?state.claims.map(c=>new Option(c.title,c.id)):[new Option('Load an example case to explore findings','',true,true)]));
 picker.disabled=!state.claims.length;
 if(state.claims.some(c=>c.id===old))picker.value=old;
 const trace=activeTrace();
 for(const node of nodes)node.querySelector('.node-caption').textContent=trace[node.dataset.node][1];
 $('#sceneMode').textContent=state.claims.length?'WORKSPACE TRACE':'WORKFLOW PREVIEW';
 (nodes.find(n=>n.classList.contains('selected'))||nodes[1]).click();
}
$('#tracePick').onchange=renderTrace;
document.addEventListener('click',e=>{
 const src=e.target.closest('[data-source]');if(src){show('sources');const i=state.sources.findIndex(s=>s.id===src.dataset.source);const detail=document.querySelectorAll('#sourceList details')[i];if(detail){detail.open=true;detail.scrollIntoView({block:'center'});}return;}
 const button=e.target.closest('[data-edit]');if(!button)return;
 const c=state.claims.find(x=>x.id===button.dataset.edit);
 const dialog=$('#editor');dialog.returnValue='cancel';dialog.dataset.id=c.id;
 $('#correctText').value=c.claim;$('#editQuote').textContent=c.quote;dialog.showModal();
});
$('#editor').onclose=async function(){
 if(this.returnValue!=='save')return;
 const list=$('#claimList');list.setAttribute('aria-busy','true');notify('Saving correction…');
 try{await api('/api/review','POST',{id:this.dataset.id,state:'needs-review',correction:$('#correctText').value});$('#search').value='';await refresh();notify('Correction saved for review.');}catch(e){notify(e.message,true);}finally{list.removeAttribute('aria-busy');}
};
refresh().catch(e=>notify(e.message,true));
