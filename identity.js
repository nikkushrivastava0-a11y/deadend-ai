import {scryptSync,timingSafeEqual} from 'node:crypto';
import {fail} from './workflows.js';

// Dedicated single-process deployment only. A capsule is not a shared authority store.
export function loadTeam() {
  if(!process.env.DEADEND_TEAM_USERS)return null;
  if(!process.env.DEADEND_DATA_DIR||process.env.VERCEL==='1')throw Error('Team mode requires a dedicated single-process service with DEADEND_DATA_DIR on durable storage');
  let users;
  try {users=JSON.parse(process.env.DEADEND_TEAM_USERS);}catch {throw Error('Invalid DEADEND_TEAM_USERS JSON');}
  if(!Array.isArray(users)||users.length<2||users.length>16||!users.some(u=>u.role==='owner')||!users.some(u=>u.role==='recipient'))throw Error('Configure 2–16 team users including owner and recipient');
  const seen=new Set();
  for(const u of users){
    if(!/^[a-zA-Z0-9_-]{1,80}$/.test(u.username)||seen.has(u.username)||!['owner','reviewer','recipient'].includes(u.role)||!/^[a-f0-9]{32}$/.test(u.salt)||!/^[a-f0-9]{128}$/.test(u.passwordHash))throw Error('Invalid or duplicate team identity');
    seen.add(u.username);
  }
  return users;
}
export function authenticate(users,authorization) {
  if(!users)return null;
  if(typeof authorization!=='string'||authorization.length>2048||!authorization.startsWith('Basic '))return null;
  const value=Buffer.from(authorization.slice(6),'base64').toString('utf8'),split=value.indexOf(':');
  if(split<1)return null;
  const user=users.find(u=>u.username===value.slice(0,split));
  // Same expensive work for unknown users. Do not reveal configured identities.
  const actual=scryptSync(value.slice(split+1),user?.salt||'0'.repeat(32),64);
  const expected=Buffer.from(user?.passwordHash||'0'.repeat(128),'hex');
  return timingSafeEqual(actual,expected)&&user?{username:user.username,role:user.role}:null;
}
export function permit(actor,roles) {
  if(actor&&!roles.includes(actor.role))fail('Your role cannot perform this action',403);
}
export function visibleDB(db,actor) {
  if(!actor||actor.role==='owner')return db;
  if(actor.role==='recipient')return {sources:[],claims:[],events:[],disagreements:[],briefs:(db.briefs||[]).filter(b=>b.recipient===actor.username)};
  const sources=db.sources.filter(s=>s.visibility==='public'),ids=new Set(sources.map(s=>s.id));
  return {...db,sources,claims:db.claims.filter(c=>ids.has(c.sourceId)),events:[],disagreements:(db.disagreements||[]).filter(d=>ids.has(d.left.sourceId)&&ids.has(d.right.sourceId)),briefs:[]};
}
