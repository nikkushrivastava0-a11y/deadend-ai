// Disposable local PostgreSQL only. This adapter is never imported by production.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {randomBytes,createHash} from 'node:crypto';
import pg from 'pg';
const connectionString=process.env.DEADEND_TEST_DATABASE_URL;
if(!connectionString)throw Error('Set DEADEND_TEST_DATABASE_URL to an EMPTY disposable local PostgreSQL database.');
const target=new URL(connectionString);
if(!['localhost','127.0.0.1','postgres'].includes(target.hostname)||!target.pathname.startsWith('/deadend_test'))throw Error('Refusing a non-local or non-test database.');
const pool=new pg.Pool({connectionString});
const exists=await pool.query("select 1 from information_schema.schemata where schema_name='deadend_private'");
if(exists.rowCount)throw Error('Test database must be empty; create a new disposable database.');
await pool.query("do $$ begin create role anon; exception when duplicate_object then null; end $$; do $$ begin create role authenticated; exception when duplicate_object then null; end $$;");
await pool.query(await readFile(new URL('../database/hosted-team.sql',import.meta.url),'utf8'));
const capability=randomBytes(32).toString('hex');
await pool.query('insert into deadend_private.backend_keys(hash) values($1)',[createHash('sha256').update(capability).digest('hex')]);
const gateway=http.createServer(async(req,res)=>{
 try{
  if(req.url!=='/rest/v1/rpc/deadend_gateway'||req.method!=='POST'){res.writeHead(404).end();return;}
  let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>1100000)throw Error('Payload too large');}
  const p=JSON.parse(raw);
  const out=await pool.query('select public.deadend_gateway($1,$2,$3::jsonb) as result',[p.p_secret,p.p_action,JSON.stringify(p.p_payload)]);
  res.setHeader('Content-Type','application/json');res.end(JSON.stringify(out.rows[0].result));
 }catch(e){res.writeHead(e.code==='40001'?409:400,{'Content-Type':'application/json'}).end(JSON.stringify({code:e.code,message:e.message}));}
});
await new Promise(r=>gateway.listen(0,'127.0.0.1',r));
Object.assign(process.env,{NODE_ENV:'test',DEADEND_STATE_KEY:randomBytes(32).toString('hex'),DEADEND_SUPABASE_URL:'http://127.0.0.1:'+gateway.address().port,DEADEND_SUPABASE_KEY:'disposable-local-test',DEADEND_BACKEND_KEY:capability});
const {app}=await import('../server.js');
await new Promise(r=>app.listen(3001,'127.0.0.1',r));
console.log('Disposable browser test server ready at http://127.0.0.1:3001');
async function stop(){await new Promise(r=>app.close(r));await new Promise(r=>gateway.close(r));await pool.end();process.exit(0);}
process.on('SIGTERM',stop);process.on('SIGINT',stop);
