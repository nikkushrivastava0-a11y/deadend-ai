import {sandboxHandler} from './sandbox.js';
import {teamHandler,hostedConfigured,hostedHealth} from './hosted-team.js';
import {revalidate,openDisagreement,resolveDisagreement,handoverItems,issueBrief,acknowledgeBrief,fail} from './workflows.js';
import {loadTeam,authenticate,permit,visibleDB} from './identity.js';
import {seal,unseal} from './capsule.js';
import {enrich} from './extraction.js';
import {relatedUpdates} from './engine.js';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {sample,extractCandidates,verifyClaim,publicHandover,analyzeText,hash} from './engine.js';
const root=path.dirname(fileURLToPath(import.meta.url));
const portArgument=process.argv.indexOf('--port');
const port=Number(process.env.PORT||(portArgument>=0?process.argv[portArgument+1]:3001));
// Every anonymous visitor receives a separate workspace. This is a demo boundary,
// NOT authentication or an authorisation system. Data remains volatile.
const sessions = new Map();
const SESSION_AGE_MS = 2 * 60 * 60 * 1000;
const dataDir=process.env.DEADEND_DATA_DIR;
const password=process.env.DEADEND_WORKSPACE_PASSWORD;
const teamUsers=loadTeam();
let teamSession;
function sharedWorkspace(){
 if(!teamSession){
  try{teamSession=JSON.parse(fs.readFileSync(path.join(dataDir,'team.json'),'utf8'));}
  catch(e){if(e.code!=='ENOENT')throw Error('Shared workspace could not be read');teamSession={id:'team',db:emptyDB(),lastSeen:Date.now()};}
 }
 return teamSession;
}
if(dataDir)fs.mkdirSync(dataDir,{recursive:true,mode:0o700});
function fileFor(id){return path.join(dataDir,id+'.json');}
function persist(session){
 if(!dataDir)return;
 const file=fileFor(session.id);
 fs.writeFileSync(file+'.tmp',JSON.stringify(session),{mode:0o600});
 fs.renameSync(file+'.tmp',file);
}
const MAX_SESSIONS = 200;
const emptyDB=()=>({sources:[],claims:[],events:[]});
function workspace(req,res){
 const cookies=(req.headers.cookie||'').split(';').map(x=>x.trim());
 const found=cookies.find(x=>x.startsWith('deadend_session='));
 let id=found?.slice('deadend_session='.length);
 const now=Date.now();
 if(dataDir && /^[0-9a-f]{48}$/.test(id||'') && !sessions.has(id)){
  try{const saved=JSON.parse(fs.readFileSync(fileFor(id),'utf8'));if(now-saved.lastSeen<=SESSION_AGE_MS)sessions.set(id,saved);else fs.unlinkSync(fileFor(id));}catch{}
 }
 if(!id || !/^[0-9a-f]{48}$/.test(id) || !sessions.has(id) || now-sessions.get(id).lastSeen>SESSION_AGE_MS){
  id=crypto.randomBytes(24).toString('hex');
  const secure=(req.socket.encrypted || req.headers['x-forwarded-proto']==='https') ? '; Secure' : '';
  res.setHeader('Set-Cookie',`deadend_session=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=7200${secure}`);
  sessions.set(id,{id,db:emptyDB(),lastSeen:now});
 }
 const current=sessions.get(id);current.lastSeen=now;
 if(sessions.size>MAX_SESSIONS){
  const oldest=[...sessions.entries()].sort((a,b)=>a[1].lastSeen-b[1].lastSeen);
  for(const [key] of oldest.slice(0,sessions.size-MAX_SESSIONS))sessions.delete(key);
 }
 return current;
}
const json=(res,status,payload)=>{if(res.persistSession&&status===200){try{persist(res.persistSession);}catch{fail('Workspace could not be saved. Retry after checking server storage.',503);}}if(res.snapshot&&status===200)payload.workspace=seal(res.snapshot.db);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(payload));};
function event(db,action,description){db.events.unshift({at:new Date().toISOString(),action,description});db.events=db.events.slice(0,100);}
async function parseBody(req,limit=100000){
 if(req.deskBody!==undefined)return req.deskBody;
 const chunks=[];let size=0;
 for await(const chunk of req.iterator({destroyOnReturn:false})){
  size+=chunk.length;if(size>limit){req.resume();fail('Payload too large',413);}chunks.push(chunk);
 }
 const body=JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');
 if(!body||typeof body!=='object'||Array.isArray(body))fail('Expected a JSON object');
 return body;
}
function addSource(db,source,claims){if(db.sources.length>=30)throw Error('Workspace source limit reached');if(db.sources.some(s=>s.id===source.id))return {source,claims:[]};db.sources.push(source);db.claims.push(...claims);event(db,'source-imported',source.title);return {source,claims};}
async function githubImport(input){
 // Only public GitHub REST endpoints. No personal access tokens, private repos or credentials.
 const url=String(input.url||'');const match=url.match(/^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/(issues|pull)\/(\d+)\/?$/i);
 if(!match)throw Error('Use a GitHub issue or pull-request URL such as https://github.com/owner/repo/issues/12');
 const [,owner,repo,kind,number]=match;const api=`https://api.github.com/repos/${owner}/${repo}`;
 const headers={'Accept':'application/vnd.github+json','User-Agent':'deadend-hackathon-mvp'};
 async function get(endpoint){const r=await fetch(endpoint,{headers,signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Public GitHub API returned '+r.status);return r.json();}
 const issue=await get(`${api}/issues/${number}`);
 const comments=await get(`${api}/issues/${number}/comments?per_page=100`);
 // Pull requests have both general issue comments and line-specific review comments.
 // Both must be included so that important technical decisions in code review are not lost.
 const reviewComments=kind==='pull'?await get(`${api}/pulls/${number}/comments?per_page=100`):[];
 const reviews=kind==='pull'?await get(`${api}/pulls/${number}/reviews?per_page=100`):[];
 const segments=[
  {text:[issue.title,issue.body].filter(Boolean).join('\n'),url:issue.html_url,author:issue.user?.login||null,createdAt:issue.created_at||null},
  ...reviews.filter(c=>c.body).map(c=>({text:c.body,url:c.html_url,author:c.user?.login||null,createdAt:c.submitted_at||c.created_at||null})),
  ...comments.filter(c=>c.body).map(c=>({text:c.body,url:c.html_url,author:c.user?.login||null,createdAt:c.created_at||null})),
  ...reviewComments.filter(c=>c.body).map(c=>({text:c.body,url:c.html_url,author:c.user?.login||null,createdAt:c.created_at||null}))
 ];
 const data=segments.map(s=>s.text).filter(Boolean).join('\n');
 if(data.length>70000)throw Error('GitHub discussion too long for MVP');
 const src={id:hash(url),title:`${owner}/${repo} #${number}: ${issue.title}`.slice(0,140),url:issue.html_url,visibility:'public',text:data,segments};
 return {source:src,claims:extractCandidates(src)};
}
const app=http.createServer(async(req,res)=>{
 try{
 let pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/api/health'){
  if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Method not allowed'});
  const database=await hostedHealth();const ok=!database.configured||database.reachable;
  return json(res,ok?200:503,{ok,publicDemo:true,teamMode:database.configured||!!teamUsers,teamAvailable:database.configured?database.reachable:!!teamUsers,database,capsules:!!process.env.DEADEND_STATE_KEY,aiConfigured:!!process.env.OPENAI_API_KEY});
 }
 if(pathname==='/api/sandbox')return sandboxHandler(req,res);
 if(pathname.startsWith('/api/team/'))return teamHandler(req,res,{githubImport});
 const actor=authenticate(teamUsers,req.headers.authorization);
 if(teamUsers&&!actor){res.setHeader('WWW-Authenticate','Basic realm="DeadEnd team"');return json(res,401,{error:'Team sign-in required'});}
 if(password&&!teamUsers){
  const expected=crypto.createHash('sha256').update('Basic '+Buffer.from('reviewer:'+password).toString('base64')).digest();
  const actual=crypto.createHash('sha256').update(req.headers.authorization||'').digest();
  if(!crypto.timingSafeEqual(expected,actual)){res.setHeader('WWW-Authenticate','Basic realm="DeadEnd private workspace"');return json(res,401,{error:'Reviewer sign-in required'});}
 }
 if(req.method==='POST' && (req.headers['sec-fetch-site']==='cross-site'||(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)))return json(res,403,{error:'Cross-site change refused'});
  let session;
  if(!teamUsers && pathname==='/api/desk' && req.method==='POST' && process.env.DEADEND_STATE_KEY){
   const envelope=await parseBody(req,1500000);
   if(!['state','demo','reset','import-notes','import-github','review','handover','revalidate','disagreement','resolve','workflow-state'].includes(envelope.route))throw Error('Invalid route');
   session={db:unseal(envelope.workspace)};
   pathname='/api/'+envelope.route;
   req.method=['state','handover','workflow-state'].includes(envelope.route)?'GET':'POST';
   req.deskBody=envelope.data||{};
   if(req.method==='POST')res.snapshot=session;
  }else{session=teamUsers?sharedWorkspace():workspace(req,res);}
  let db=session.db;
  if(req.method==='POST'&&!res.snapshot)res.persistSession=session;
  if(pathname.startsWith('/api/')&&req.method==='POST'){
   permit(actor,pathname==='/api/acknowledge'?['recipient']:['owner','reviewer']);
   if(['/api/reset','/api/demo','/api/import-notes','/api/import-github','/api/revalidate','/api/issue-brief'].includes(pathname))permit(actor,['owner']);
  }
  if(teamUsers&&req.method==='POST'&&['/api/demo','/api/reset'].includes(pathname)&&(db.briefs||[]).length)fail('Issued brief history must be retained. Use a new dedicated workspace to start over.',409);
  const view=visibleDB(db,actor);
  if(pathname==='/api/state'&&req.method==='GET')return json(res,200,{actor,sources:view.sources.map(s=>({...s,textLength:s.text.length})),claims:view.claims.map(c=>({...c,updates:relatedUpdates(c,view.sources)})),events:view.events});
  if(pathname==='/api/demo'&&req.method==='POST'){db=sample();session.db=db;return json(res,200,{ok:true,count:db.claims.length});}
  if(pathname==='/api/reset'&&req.method==='POST'){db=emptyDB();session.db=db;return json(res,200,{ok:true});}
  if(pathname==='/api/import-notes'&&req.method==='POST'){const b=await parseBody(req);if(b.visibility!=='public'&&b.visibility!=='restricted')throw Error('Invalid visibility');const out=analyzeText(b.text,b.title,b.visibility);await enrich(out);if(session.db!==db)throw Error("Workspace changed during import");out.source.method=out.method;const result=addSource(db,out.source,out.claims);return json(res,200,{ok:true,count:result.claims.length,method:out.method});}
  if(pathname==='/api/import-github'&&req.method==='POST'){const b=await parseBody(req);const out=await githubImport(b);await enrich(out);if(session.db!==db)throw Error("Workspace changed during import");out.source.method=out.method;const result=addSource(db,out.source,out.claims);return json(res,200,{ok:true,count:result.claims.length,method:out.method});}
  if(pathname==='/api/review'&&req.method==='POST'){
   const b=await parseBody(req);const item=view.claims.find(c=>c.id===b.id);if(!item)return json(res,404,{error:'Claim not found'});
   if(!['approved','rejected','needs-review','disputed'].includes(b.state))throw Error('Invalid review status');
   const correction=b.correction===undefined?item.claim:String(b.correction).trim();
   if(!correction||correction.length>650)throw Error('Correction must contain 1 to 650 characters');
   if(b.state==='approved'){
    const src=db.sources.find(s=>s.id===item.sourceId), check=verifyClaim(item,src);
    if(!check.ok)return json(res,409,{error:check.reason});
    if(item.visibility!=='public')return json(res,403,{error:'Restricted source cannot enter a public handover'});
   }
   if(b.state==='approved'&&(db.disagreements||[]).some(d=>d.claimId===item.id&&d.status!=='resolved'))return json(res,409,{error:'Resolve the open disagreement before approval'});
   item.claim=correction;item.title=correction.slice(0,95);item.state=b.state;item.reviewerNote=String(b.note||'').slice(0,500);item.reviewedAt=new Date().toISOString();
   event(db,'review',`${item.state}: ${item.title.slice(0,60)}`);
   return json(res,200,{ok:true,claim:item});
  }
  if(pathname==='/api/handover'&&req.method==='GET')return json(res,200,{title:'DeadEnd — Approved Handover',generatedAt:new Date().toISOString(),scope:'Public claims only',items:actor?.role==='recipient'?[]:handoverItems(view),disclosure:'Synthetic records are examples; citations must be checked against original sources.'});
  if(pathname==='/api/workflow-state'&&req.method==='GET')return json(res,200,{actor,disagreements:view.disagreements||[],briefs:view.briefs||[],recipients:actor?.role==='owner'?teamUsers.filter(u=>u.role==='recipient').map(u=>u.username):[],teamMode:!!teamUsers});
  if(pathname==='/api/revalidate'&&req.method==='POST'){
   const record=revalidate(db,await parseBody(req),actor?.username);event(db,'revalidated',`Constraint rechecked: ${record.status}`);return json(res,200,{ok:true,record});
  }
  if(pathname==='/api/disagreement'&&req.method==='POST'){
   const b=await parseBody(req);
   if(!view.claims.some(c=>c.id===b.claimId)||![b.left?.sourceId,b.right?.sourceId].every(id=>view.sources.some(s=>s.id===id)))fail('Finding or source not found',404);
   const record=openDisagreement(db,b,actor?.username);event(db,'disagreement','Two original source excerpts require reconciliation');return json(res,200,{ok:true,record});
  }
  if(pathname==='/api/resolve'&&req.method==='POST'){
   const b=await parseBody(req);if(!view.disagreements?.some(d=>d.id===b.id))fail('Disagreement not found',404);
   const record=resolveDisagreement(db,b,actor?.username);event(db,'resolved',`Human decision: ${record.status}`);return json(res,200,{ok:true,record});
  }
  if(pathname==='/api/issue-brief'&&req.method==='POST'){
   if(!teamUsers)fail('Authenticated team deployment required for recipient handovers',409);
   const record=issueBrief(db,await parseBody(req),actor.username,teamUsers.filter(u=>u.role==='recipient').map(u=>u.username));event(db,'brief-issued',`Brief version ${record.version} issued`);return json(res,200,{ok:true,record});
  }
  if(pathname==='/api/acknowledge'&&req.method==='POST'){
   if(!teamUsers)fail('Team sign-in required',401);
   const b=await parseBody(req);return json(res,200,{ok:true,record:acknowledgeBrief(db,b.id,actor.username)});
  }
  if(req.method!=='GET' && req.method!=='HEAD')return json(res,405,{error:'Method not allowed'});
  const lookup={'/':'index.html','/index.html':'index.html','/team':'team.html','/team.html':'team.html','/team.js':'team.js','/team.css':'team.css','/workflow-ui.js':'workflow-ui.js','/app.js':'app.js','/style.css':'style.css','/immersive.css':'immersive.css','/atmosphere.css':'atmosphere.css','/matte.css':'matte.css','/site.bundle.css':'site.bundle.css','/design-system.css':'design-system.css','/site-polish.css':'site-polish.css','/about.html':'about.html','/privacy.html':'privacy.html','/404.html':'404.html','/favicon.svg':'favicon.svg','/favicon.png':'favicon.png','/team-lead.jpg':'team-lead.jpg','/apple-touch-icon.png':'apple-touch-icon.png','/og-deadend.png':'og-deadend.png','/robots.txt':'robots.txt','/sitemap.xml':'sitemap.xml','/llms.txt':'llms.txt','/LLMs.txt':'LLMs.txt','/scene3d.bundle.js':'scene3d.bundle.js','/fonts/dm-sans.woff2':'fonts/dm-sans.woff2','/fonts/space-grotesk.woff2':'fonts/space-grotesk.woff2','/fonts/space-mono-400.woff2':'fonts/space-mono-400.woff2','/fonts/space-mono-700.woff2':'fonts/space-mono-700.woff2'};
  const file=lookup[pathname]||null;
  if(!file && pathname.startsWith('/api/'))return json(res,404,{error:'Unknown API route'});
  const target=file||'404.html';
  const mime=target.endsWith('.woff2')?'font/woff2':target.endsWith('.js')?'text/javascript':target.endsWith('.css')?'text/css':target.endsWith('.svg')?'image/svg+xml':target.endsWith('.png')?'image/png':target.endsWith('.jpg')?'image/jpeg':target.endsWith('.xml')?'application/xml':target.endsWith('.txt')?'text/plain':'text/html';
  // Permit only our exact, non-executable JSON-LD snippet under the CSP.
  const source=fs.readFileSync(path.join(root,'public','index.html'),'utf8');
  const marker='<script type="application/ld+json">';
  const offset=source.indexOf(marker);
  const close=offset>=0?source.indexOf('</script>',offset+marker.length):-1;
  const ld=close>offset?source.slice(offset+marker.length,close):null;
  const ldHash=ld?" 'sha256-"+crypto.createHash('sha256').update(ld).digest('base64')+"'":'';
  const policy="default-src 'self'; style-src 'self'; script-src 'self'"+ldHash+"; connect-src 'self'; img-src 'self' data:; font-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";
  res.writeHead(file?200:404,{'Content-Type':mime+'; charset=utf-8','X-Content-Type-Options':'nosniff','Content-Security-Policy':policy});
  if(req.method==='HEAD')return res.end();
  fs.createReadStream(path.join(root,'public',target)).pipe(res);
 }catch(err){json(res,err.status||400,{error:err.message||'Unexpected error'});}
});
if(process.env.NODE_ENV!=='test' && process.env.VERCEL!=='1')app.listen(port,()=>console.log(`DeadEnd MVP: http://localhost:${port}`));
export {app};
