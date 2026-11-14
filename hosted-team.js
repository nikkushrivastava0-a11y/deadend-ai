import crypto from 'node:crypto';
import {promisify} from 'node:util';
import {sample,analyzeText,verifyClaim} from './engine.js';
import {revalidate,openDisagreement,resolveDisagreement,handoverItems,issueBrief,acknowledgeBrief,fail} from './workflows.js';
import {visibleDB,permit} from './identity.js';
const scrypt=promisify(crypto.scrypt);
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const empty=()=>({sources:[],claims:[],events:[]});
export function hostedConfigured(){return !!(process.env.DEADEND_SUPABASE_URL&&process.env.DEADEND_SUPABASE_KEY&&process.env.DEADEND_BACKEND_KEY);}
export async function gateway(action,payload={}){
 if(!hostedConfigured())fail('Team workspace is not configured',503);
 let response;
 try{response=await fetch(process.env.DEADEND_SUPABASE_URL+'/rest/v1/rpc/deadend_gateway',{
  method:'POST',headers:{apikey:process.env.DEADEND_SUPABASE_KEY,'Content-Type':'application/json'},
  body:JSON.stringify({p_secret:process.env.DEADEND_BACKEND_KEY,p_action:action,p_payload:payload}),signal:AbortSignal.timeout(12000)
 });}catch{fail('Team database is unavailable. Your changes were not saved.',503);}
 const data=await response.json();
 if(!response.ok){
  const status={'42501':403,'28000':401,'40001':409,'23505':409}[data.code]||400;
  const message=data.code==='23505'?'That account or membership already exists.':data.message||'Team database request failed';
  fail(message,status);
 }
 return data;
}
function sessionToken(req){return (req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('deadend_team='))?.slice(13)||'';}
function setCookie(req,res,token){
 const secure=req.socket.encrypted||req.headers['x-forwarded-proto']==='https';
 res.setHeader('Set-Cookie',`deadend_team=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${token?28800:0}${secure?'; Secure':''}`);
}
function username(s){if(typeof s!=='string'||! /^[a-z0-9_-]{3,40}$/.test(s))fail('Use a lowercase handle of 3–40 letters, numbers, hyphens or underscores.');return s;}
function password(s){if(typeof s!=='string'||s.length<12||s.length>128)fail('Use a password of 12–128 characters.');return s;}
const send=(res,status,obj)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store'});res.end(JSON.stringify(obj));};
async function body(req){let size=0,parts=[];for await(const chunk of req.iterator({destroyOnReturn:false})){size+=chunk.length;if(size>100000){req.resume();fail('Payload too large',413);}parts.push(chunk);}const b=JSON.parse(Buffer.concat(parts).toString()||'{}');if(!b||typeof b!=='object'||Array.isArray(b))fail('Expected a JSON object');return b;}
async function rate(key){const r=await gateway('rate',{key:hash(key)});if(!r.allowed)fail('Too many attempts. Try again in 15 minutes.',429);}
function add(db,out){if(db.sources.some(s=>s.id===out.source.id))return 0;if(db.sources.length>=30)fail('Workspace source limit reached');db.sources.push(out.source);db.claims.push(...out.claims);return out.claims.length;}
export async function teamHandler(req,res,{githubImport}){
 const path=new URL(req.url,'http://localhost').pathname;
 try{
 if(!hostedConfigured())return send(res,503,{error:'Hosted team workspace is not configured'});
 if(req.method==='POST'){
  let valid=true;if(req.headers.origin){try{const origin=new URL(req.headers.origin);valid=['http:','https:'].includes(origin.protocol)&&origin.host===req.headers.host;}catch{valid=false;}}
  if(!valid||req.headers['sec-fetch-site']==='cross-site')fail('Cross-site change refused',403);
 }
 if(!['GET','POST'].includes(req.method))fail('Method not allowed',405);
 if(path==='/api/team/register'||path==='/api/team/login'){
  if(req.method!=='POST')fail('Method not allowed',405);
  const input=await body(req),name=username(input.username),pass=password(input.password);
  // Database-backed limits survive cold starts. Key only the untrusted input's hash.
  await Promise.all([rate('login:'+name),rate('auth-ip:'+(req.headers['x-forwarded-for']||req.socket.remoteAddress))]);
  let account;
  if(path.endsWith('/register')){
   const salt=crypto.randomBytes(16).toString('hex');const derived=await scrypt(pass,salt,64);
   account=await gateway('register',{username:name,salt,passwordHash:derived.toString('hex')});
  }else{
   account=await gateway('login-info',{username:name});
   const derived=await scrypt(pass,account?.salt||'0'.repeat(32),64);
   if(!account||!crypto.timingSafeEqual(derived,Buffer.from(account.passwordHash,'hex')))fail('Handle or password is incorrect',401);
  }
  const token=crypto.randomBytes(32).toString('hex');
  await gateway('session-create',{accountId:account.id,hash:hash(token)});setCookie(req,res,token);
  return send(res,200,{ok:true,user:{username:name}});
 }
 const token=sessionToken(req);if(!/^[a-f0-9]{64}$/.test(token))fail('Sign in required',401);
 const sessionHash=hash(token),user=await gateway('session-read',{sessionHash});
 if(path==='/api/team/session'&&req.method==='GET')return send(res,200,{user,workspaces:await gateway('list',{sessionHash})});
 if(req.method!=='POST')fail('Route not found',404);
 const input=await body(req);
 if(path==='/api/team/logout'){await gateway('session-delete',{sessionHash});setCookie(req,res,'');return send(res,200,{ok:true});}
 if(path==='/api/team/create'){
  if(typeof input.name!=='string'||!input.name.trim()||input.name.trim().length>100)fail('Enter a workspace name (1–100 characters)');
  return send(res,200,{ok:true,...await gateway('create',{sessionHash,name:input.name.trim()})});
 }
 if(path==='/api/team/join'){
  if(typeof input.code!=='string'||! /^[a-f0-9]{64}$/.test(input.code))fail('Enter the full invitation code');
  return send(res,200,{ok:true,...await gateway('join',{sessionHash,inviteHash:hash(input.code)})});
 }
 if(!/^[a-f0-9-]{36}$/.test(input.workspaceId||''))fail('Choose a workspace');
 const row=await gateway('read',{sessionHash,workspaceId:input.workspaceId});
 const actor={username:user.username,role:row.role},db=row.db,view=visibleDB(db,actor);
 const recipients=row.members.filter(m=>m.role==='recipient').map(m=>m.username);
 if(path==='/api/team/invite'){
  permit(actor,['owner']);if(!['reviewer','recipient'].includes(input.role))fail('Choose reviewer or recipient');
  const code=crypto.randomBytes(32).toString('hex');
  await gateway('invite',{sessionHash,workspaceId:row.id,role:input.role,inviteHash:hash(code)});
  return send(res,200,{ok:true,code,expiresIn:'24 hours; one use'});
 }
 if(path!=='/api/team/desk')fail('Route not found',404);
 const route=input.route,data=input.data||{};
 if(route==='state')return send(res,200,{actor,workspace:{id:row.id,name:row.name,version:row.version},...view,members:actor.role==='owner'?row.members:[],recipients:actor.role==='owner'?recipients:[]});
 if(route==='handover')return send(res,200,{items:actor.role==='recipient'?[]:handoverItems(view)});
 permit(actor,route==='acknowledge'?['recipient']:['owner','reviewer']);
 if(['demo','import-notes','import-github','revalidate','issue-brief'].includes(route))permit(actor,['owner']);
 let result={ok:true};
 if(route==='demo'){
  if((db.briefs||[]).length||db.sources.length)fail('Load an example only into an empty workspace. Existing team history is retained.',409);
  Object.assign(db,sample());
 }else if(route==='import-notes'){
  const out=analyzeText(data.text,data.title,data.visibility);if(!['public','restricted'].includes(data.visibility))fail('Invalid visibility');
  result.count=add(db,out);
 }else if(route==='import-github'){result.count=add(db,await githubImport(data));}
 else if(route==='review'){
  const c=view.claims.find(c=>c.id===data.id);if(!c)fail('Finding not found',404);
  if(!['approved','rejected','disputed','needs-review'].includes(data.state))fail('Choose a review state');
  if(data.state==='approved'&&(c.visibility!=='public'||!verifyClaim(c,db.sources.find(s=>s.id===c.sourceId)).ok))fail('Only verified public findings can be approved',403);
  if(data.state==='approved'&&(db.disagreements||[]).some(d=>d.claimId===c.id&&d.status!=='resolved'))fail('Resolve the disagreement before approval',409);
  const correction=data.correction===undefined?c.claim:data.correction;
  if(typeof correction!=='string'||!correction.trim()||correction.trim().length>650)fail('Interpretation must contain 1–650 characters');
  Object.assign(c,{claim:correction.trim(),title:correction.trim().slice(0,95),state:data.state,reviewedAt:new Date().toISOString()});
 }else if(route==='revalidate')result.record=revalidate(db,data,user.username);
 else if(route==='disagreement'){
  if(!view.claims.some(c=>c.id===data.claimId)||![data.left?.sourceId,data.right?.sourceId].every(id=>view.sources.some(s=>s.id===id)))fail('Finding or source not found',404);
  result.record=openDisagreement(db,data,user.username);
 }else if(route==='resolve'){
  if(!view.disagreements?.some(d=>d.id===data.id))fail('Disagreement not found',404);
  result.record=resolveDisagreement(db,data,user.username);
 }else if(route==='issue-brief')result.record=issueBrief(db,data,user.username,recipients);
 else if(route==='acknowledge')result.record=acknowledgeBrief(db,data.id,user.username);
 else fail('Unknown workspace action');
 db.events.unshift({at:new Date().toISOString(),action:route,description:`${user.username}: ${route}`});db.events=db.events.slice(0,100);
 await gateway('save',{sessionHash,workspaceId:row.id,version:row.version,db});
 return send(res,200,result);
 }catch(e){if(e.status===401)setCookie(req,res,'');return send(res,e.status||400,{error:e.message||'Team request failed'});}
}
