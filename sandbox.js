// Explicitly synthetic, single-browser sandbox. Never reads real accounts/workspaces.
import crypto from 'node:crypto';
import {seal,unseal} from './capsule.js';
import {gateway,hostedConfigured} from './hosted-team.js';
import {sample,verifyClaim} from './engine.js';
import {visibleDB,permit} from './identity.js';
import {fail,revalidate,openDisagreement,resolveDisagreement,issueBrief,acknowledgeBrief,handoverItems} from './workflows.js';
const roles=['owner','reviewer','recipient'];
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
export function openSandbox(token,now=Date.now()){
 let data;try{data=unseal(token);}catch{fail('Sandbox expired or invalid. Start a new sandbox.',401);}
 if(data.purpose!=='deadend-judge-sandbox-v1'||!Number.isFinite(data.expiresAt)||data.expiresAt<=now||!roles.includes(data.role)||!data.id?.startsWith('sandbox-'))fail('Sandbox expired or invalid. Start a new sandbox.',401);
 return data;
}
export function createSandbox(now=Date.now()){
 return {purpose:'deadend-judge-sandbox-v1',id:'sandbox-'+crypto.randomUUID(),name:'Judge sandbox · fictional Stripe case',expiresAt:now+15*60*1000,version:0,role:'owner',db:sample()};
}
function actorFor(s){return {username:'sandbox-'+s.role,role:s.role};}
function state(s){const actor=actorFor(s);return {sandbox:true,expiresAt:s.expiresAt,actor,workspace:{id:s.id,name:s.name,version:s.version},...visibleDB(s.db,actor),members:[],recipients:actor.role==='owner'?['sandbox-recipient']:[]};}
export function sandboxAction(s,path,input={}){
 const actor=actorFor(s),db=s.db;
 if(path==='switch'){if(!roles.includes(input.role))fail('Choose a sandbox role');s.role=input.role;return {ok:true};}
 if(path==='session')return {user:actor,workspaces:[{id:s.id,name:s.name,role:s.role}],sandbox:true};
 if(path!=='desk')fail('Use real accounts for workspace creation, imports or invitations.',403);
 if(input.workspaceId!==s.id)fail('Sandbox cannot access another workspace.',403);
 const route=input.route,data=input.data||{},view=visibleDB(db,actor);
 if(route==='state')return state(s);
 if(route==='handover')return {items:actor.role==='recipient'?[]:handoverItems(view)};
 if(input.expectedVersion!==undefined&&input.expectedVersion!==s.version)fail('Sandbox changed. Refresh before saving.',409);
 permit(actor,route==='acknowledge'?['recipient']:['owner','reviewer']);
 if(['revalidate','issue-brief'].includes(route))permit(actor,['owner']);
 let result={ok:true};
 if(route==='review'){
  const c=view.claims.find(c=>c.id===data.id);if(!c)fail('Finding not found',404);
  if(!['approved','rejected','disputed','needs-review'].includes(data.state))fail('Choose a review state');
  if(data.state==='approved'&&(c.visibility!=='public'||!verifyClaim(c,db.sources.find(s=>s.id===c.sourceId)).ok))fail('Only verified public findings can be approved',403);
  if(data.state==='approved'&&(db.disagreements||[]).some(d=>d.claimId===c.id&&d.status!=='resolved'))fail('Resolve the disagreement before approval',409);
  const correction=data.correction??c.claim;if(typeof correction!=='string'||!correction.trim()||correction.trim().length>650)fail('Interpretation must contain 1–650 characters');
  Object.assign(c,{claim:correction.trim(),title:correction.trim().slice(0,95),state:data.state,reviewedAt:new Date().toISOString()});
 }else if(route==='revalidate')result.record=revalidate(db,data,actor.username);
 else if(route==='disagreement'){
  if(!view.claims.some(c=>c.id===data.claimId)||![data.left?.sourceId,data.right?.sourceId].every(id=>view.sources.some(s=>s.id===id)))fail('Finding or source not found',404);
  result.record=openDisagreement(db,data,actor.username);
 }else if(route==='resolve'){
  if(!view.disagreements?.some(d=>d.id===data.id))fail('Disagreement not found',404);
  result.record=resolveDisagreement(db,data,actor.username);
 }else if(route==='issue-brief')result.record=issueBrief(db,data,actor.username,['sandbox-recipient']);
 else if(route==='acknowledge')result.record=acknowledgeBrief(db,data.id,actor.username);
 else fail('This sandbox action is unavailable',403);
 s.version++;return result;
}
export async function sandboxHandler(req,res){
 const send=(status,payload)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'private, no-store'});res.end(JSON.stringify(payload));};
 try{
  if(req.method!=='POST')fail('Method not allowed',405);
  if(req.headers['sec-fetch-site']==='cross-site')fail('Cross-site change refused',403);
  if(req.headers.origin){let host;try{host=new URL(req.headers.origin).host;}catch{fail('Cross-site change refused',403);}if(host!==req.headers.host)fail('Cross-site change refused',403);}
  if(!process.env.DEADEND_STATE_KEY||!hostedConfigured())fail('Judge sandbox is unavailable. Try the public demo or real team accounts.',503);
  let raw='';for await(const chunk of req.iterator({destroyOnReturn:false})){raw+=chunk;if(Buffer.byteLength(raw)>150000){req.resume();fail('Sandbox payload too large',413);}}
  const input=JSON.parse(raw||'{}');let s,result;
  if(input.path==='start'){
   const rate=await gateway('rate',{key:hash('sandbox-start:'+(req.headers['x-forwarded-for']||req.socket.remoteAddress))});
   if(!rate.allowed)fail('Too many sandbox starts. Try again in 15 minutes.',429);
   s=createSandbox();result={ok:true,id:s.id};
  }else{s=openSandbox(input.token);result=sandboxAction(s,input.path,input.data);}
  return send(200,{...result,sandbox:true,expiresAt:s.expiresAt,token:seal(s)});
 }catch(e){return send(e.status||400,{error:e.message||'Sandbox request failed'});}
}
