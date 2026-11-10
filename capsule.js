import crypto from 'node:crypto';
const aad=Buffer.from('DeadEnd-workspace-v1');
function key(){return crypto.createHash('sha256').update(process.env.DEADEND_STATE_KEY).digest();}
export function seal(db){
 const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key(),iv);
 cipher.setAAD(aad);
 const bytes=Buffer.from(JSON.stringify({until:Date.now()+7200000,db}));
 if(bytes.length>900000)throw Error('Workspace is full. Download the handover and start a new case.');
 const encrypted=Buffer.concat([cipher.update(bytes),cipher.final()]);
 return Buffer.concat([iv,cipher.getAuthTag(),encrypted]).toString('base64url');
}
export function unseal(token){
 if(!token)return {sources:[],claims:[],events:[]};
 try{
  const bytes=Buffer.from(token,'base64url'),dec=crypto.createDecipheriv('aes-256-gcm',key(),bytes.subarray(0,12));
  dec.setAAD(aad);dec.setAuthTag(bytes.subarray(12,28));
  const payload=JSON.parse(Buffer.concat([dec.update(bytes.subarray(28)),dec.final()]));
  if(payload.until<Date.now())throw Error();
  return payload.db;
 }catch{throw Error('Workspace expired or invalid. Start a fresh case in another tab.');}
}
