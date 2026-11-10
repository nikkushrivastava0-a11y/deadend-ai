import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const PORT=3877;
const root='http://127.0.0.1:'+PORT;
const server=spawn(process.execPath,['server.js'],{env:{...process.env,PORT:String(PORT),DEADEND_STATE_KEY:''},stdio:'pipe'});
server.stderr.on('data',b=>process.stderr.write(b));
async function ready(){
 for(let i=0;i<100;i++){
  try{const r=await fetch(root+'/api/health');if(r.ok)return;}catch{}
  await new Promise(r=>setTimeout(r,100));
 }
 throw Error('Server did not become ready');
}
let browser;
try{
 await ready();
 browser=await chromium.launch({headless:true});
 await mkdir('qa-output',{recursive:true});
 for(const [label,width,height,motion] of [
  ['phone',390,844,'reduce'],['tablet',768,1024,'no-preference'],['desktop',1440,900,'no-preference']
 ]){
  const context=await browser.newContext({viewport:{width,height},acceptDownloads:true,reducedMotion:motion});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(root,{waitUntil:'networkidle'});
  const visible=await page.evaluate(()=>{
    const frame=document.querySelector('#scene').getBoundingClientRect();
    const nodes=[...document.querySelectorAll('.node3d')].map(node=>{
      const rect=node.getBoundingClientRect();
      return {name:node.dataset.node,left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,
        inside:rect.left>=frame.left-2&&rect.right<=frame.right+2&&rect.top>=frame.top-2&&rect.bottom<=frame.bottom+2};
    });
    const nav=[...document.querySelectorAll('.nav')].map(node=>node.getBoundingClientRect().right<=window.innerWidth+2);
    return {nodes,nav};
  });
  if(width>600)assert.ok(visible.nodes.every(x=>x.inside),label+' clipped 3D cards: '+JSON.stringify(visible.nodes));
  else assert.ok(visible.nav.every(Boolean),'mobile navigation is clipped');
  await page.screenshot({path:'qa-output/'+label+'-overview.png',fullPage:true});
  await page.locator('#demoBtn').click();
  await page.waitForFunction(()=>Number(document.querySelector('#statFindings')?.textContent)>0);
  await page.locator('[data-view="findings"]').click();
  assert.ok(await page.locator('.claim').count()>0,label+' should display findings');
  await page.locator('[data-review="approved"]:not([disabled])').first().click();
  await page.waitForFunction(()=>Number(document.querySelector('#statApproved')?.textContent)>0);
  await page.locator('[data-view="handover"]').click();
  assert.ok(await page.locator('.handover-entry').count()>0,label+' should display approved handover');
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#downloadBtn').click();
  const download=await downloadPromise;
  const file=await download.path();
  const markdown=await readFile(file,'utf8');
  assert.match(markdown,/Approved Handover/);
  assert.match(markdown,/Evidence:/);
  await page.screenshot({path:'qa-output/'+label+'-handover.png',fullPage:true});
  const dimensions=await page.evaluate(()=>({width:window.innerWidth,scrollWidth:document.documentElement.scrollWidth}));
  assert.ok(dimensions.scrollWidth<=dimensions.width+2,label+' horizontal overflow '+JSON.stringify(dimensions));
  assert.deepEqual(errors,[],label+' client errors');
  if(motion==='reduce'){
   const flat=await page.locator('#sceneOrbit').evaluate(el=>getComputedStyle(el).transform==='none');
   assert.equal(flat,true,'reduced motion has a flat scene');
  }
  console.log(JSON.stringify({viewport:label,dimensions,findings:'found',handover:'approved+download',jsErrors:errors.length,motion}));
  await context.close();
 }
}finally{
 if(browser)await browser.close();
 server.kill('SIGTERM');
}
