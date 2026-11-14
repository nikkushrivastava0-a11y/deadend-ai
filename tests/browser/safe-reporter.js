// Never serialize Playwright call logs, form values, request bodies or storage state.
import {mkdirSync,writeFileSync} from 'node:fs';
export default class SafeReporter {
 constructor(){this.results=[];}
 onStepEnd(test,result,step){if(step.category==='test.step')console.log(JSON.stringify({step:step.title,status:step.error?'failed':'passed'}));}
 onTestEnd(test,result){const row={test:test.title,status:result.status,durationMs:result.duration,failure:result.errors.map(e=>({location:e.location,message:(e.message||'').replace(/\u001b\[[0-9;]*m/g,'').replace(/[a-f0-9]{32,}/gi,'[REDACTED]').slice(0,1400)}))};this.results.push(row);console.log(JSON.stringify(row));}
 onError(){console.error('Browser runner error; check browser installation, test DB availability and named step. Raw logs suppressed.');}
 onEnd(result){mkdirSync('docs/evidence',{recursive:true});writeFileSync('docs/evidence/browser-results.json',JSON.stringify({status:result.status,date:new Date().toISOString(),target:process.env.DEADEND_BROWSER_BASE_URL?'external deployment':'local Node server + real disposable PostgreSQL via RPC adapter',physicalPhone:false,tests:this.results},null,2));console.log('Browser suite: '+result.status);}
}
