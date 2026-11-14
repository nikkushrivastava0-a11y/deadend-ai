import {test,expect} from '@playwright/test';
import {randomBytes,createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import pg from 'pg';
const viewports=[{width:1440,height:900},{width:390,height:844},{width:768,height:1024},{width:390,height:844,reducedMotion:'reduce'}];
const stripe='We tried Stripe checkout';
const quote='The blocked Stripe environment was fixed later, however the production decision has not been revisited.';
const notice=p=>p.locator('#team-notice');
async function capture(page,name){await mkdir('docs/evidence',{recursive:true});await page.screenshot({path:`docs/evidence/${name}.png`,fullPage:true,mask:[page.locator('input[type=password]'),page.locator('input[aria-label="Invitation code"]')]});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
async function saved(page){await expect(notice(page)).toContainText(/Saved to the shared database|candidate findings saved|Fictional example saved|Receipt saved/);}
async function refresh(page){await page.getByRole('button',{name:'Refresh workspace',exact:true}).click();await expect(notice(page)).toHaveText('Latest saved revision loaded.');}
const claim=p=>p.locator('article.claim').filter({has:p.locator('blockquote').filter({hasText:stripe})}).first();
async function auth(page,user,mode){await page.goto('/team.html');await page.getByLabel('Handle',{exact:true}).fill(user.username);await page.getByLabel('Password',{exact:true}).fill(user.password);await page.getByRole('button',{name:mode,exact:true}).click();await expect(page.locator('#signed-in')).toContainText(user.username);}
async function invite(page,role){const f=page.locator('form[data-team=invite]');await f.getByLabel('Invite role').selectOption(role);await f.getByRole('button').click();await expect(notice(page)).toContainText('Invitation ready.');return page.getByLabel('Invitation code',{exact:true}).last().inputValue();}
async function join(page,code){await page.locator('form[data-team=join] input').fill(code);await page.getByRole('button',{name:'Join invited workspace',exact:true}).click();await saved(page);}
async function review(page,state){const f=claim(page).locator('form[data-team=review]');await f.getByLabel('Review state').selectOption(state);await f.getByRole('button',{name:'Save review'}).click();}

test('owner → reviewer → recipient browser journeys, viewport matrix and access failures',async({browser,baseURL})=>{
 test.setTimeout(900000);
 const prefix='e2e_'+randomBytes(5).toString('hex');
 const users=Array.from({length:4},(_,i)=>({username:prefix+'_'+i,password:randomBytes(24).toString('hex')}));
 const contexts=await Promise.all(users.map(()=>browser.newContext({baseURL,viewport:viewports[0],acceptDownloads:true})));
 const pages=await Promise.all(contexts.map(c=>c.newPage()));const [owner,reviewer,recipient,outsider]=pages;
 const errors=[];pages.forEach(p=>p.on('pageerror',()=>errors.push('app-pageerror')));
 try{
  await test.step('Register four disposable accounts in isolated browser contexts',async()=>{for(let i=0;i<4;i++)await auth(pages[i],users[i],'Create account');});
  await test.step('Wrong password is refused in the browser',async()=>{
   await outsider.getByRole('button',{name:'Sign out',exact:true}).click();await outsider.getByLabel('Handle',{exact:true}).fill(users[3].username);await outsider.getByLabel('Password',{exact:true}).fill(randomBytes(24).toString('hex'));await outsider.getByRole('button',{name:'Sign in',exact:true}).click();await expect(notice(outsider)).toContainText('incorrect');await auth(outsider,users[3],'Sign in');
  });
  for(let index=0;index<viewports.length;index++){
   const size=viewports[index],tag=`${size.width}x${size.height}${size.reducedMotion?'-reduced-motion':''}`;
   await test.step('Complete signed-in UI flow at '+tag,async()=>{
    for(const p of pages){await p.setViewportSize({width:size.width,height:size.height});await p.emulateMedia({reducedMotion:size.reducedMotion||'no-preference'});}
    await owner.locator('form[data-team=create] input').fill('Disposable browser '+tag);await owner.getByRole('button',{name:'Create workspace as owner'}).click();await saved(owner);
    await expect(owner.getByText('No sources yet.',{exact:false})).toBeVisible();await capture(owner,'team-empty-'+tag);
    const url=owner.url();
    await outsider.goto(url);await expect(outsider.locator('#team-room')).not.toContainText('Disposable browser '+tag);await expect(outsider.locator('#workspace-choice option')).not.toContainText(['Disposable browser '+tag]);
    await owner.getByRole('button',{name:'Load fictional Stripe case'}).click();await saved(owner);await owner.reload();await expect(claim(owner)).toBeVisible();
    const reviewerCode=await invite(owner,'reviewer');await join(reviewer,reviewerCode);
    await outsider.locator('form[data-team=join] input').fill(reviewerCode);await outsider.getByRole('button',{name:'Join invited workspace'}).click();await expect(notice(outsider)).toContainText('already used');
    await outsider.locator('form[data-team=join] input').fill('f'.repeat(64));await outsider.getByRole('button',{name:'Join invited workspace'}).click();await expect(notice(outsider)).toContainText('invalid');
    const recipientCode=await invite(owner,'recipient');await join(recipient,recipientCode);
    await expect(reviewer.locator('#team-room')).not.toContainText('restricted');await expect(recipient.locator('#team-room')).not.toContainText('Original sources');
    if(index===0&&process.env.DEADEND_TEST_DATABASE_URL&&!process.env.DEADEND_BROWSER_BASE_URL){
     const expired=await invite(owner,'reviewer');const db=new pg.Client({connectionString:process.env.DEADEND_TEST_DATABASE_URL});await db.connect();await db.query("update deadend_private.invites set expires_at=now()-interval '1 second' where hash=$1",[createHash('sha256').update(expired).digest('hex')]);await db.end();await outsider.locator('form[data-team=join] input').fill(expired);await outsider.getByRole('button',{name:'Join invited workspace'}).click();await expect(notice(outsider)).toContainText('expired');
    }
    await claim(owner).getByText('Revalidate current constraint',{exact:true}).click();const recheck=claim(owner).locator('form[data-team=recheck]');await recheck.getByLabel('Checked date').fill('2026-11-01');await recheck.getByLabel('Current constraint').fill('Production constraints need an independent check.');await recheck.getByRole('button',{name:'Save dated recheck'}).click();await saved(owner);
    await refresh(reviewer);await claim(reviewer).getByText('Compare against another source',{exact:true}).click();const comparison=claim(reviewer).locator('form[data-team=disagreement]');await comparison.getByLabel('Source segment',{exact:true}).selectOption(JSON.stringify(['demo-issue17',0]));await comparison.getByLabel('Exact excerpt',{exact:true}).fill(quote);await comparison.getByRole('button',{name:'Open disagreement'}).click();await saved(reviewer);
    await review(reviewer,'approved');await expect(notice(reviewer)).toContainText('Resolve the disagreement');
    const resolution=reviewer.locator('form[data-team=resolve]').last();await resolution.getByLabel('Outcome',{exact:true}).selectOption('context-dependent');await resolution.getByLabel('Rationale').fill('A test environment fix is not proof of production readiness.');await resolution.getByLabel('Next step').fill('Verify production constraints before retrying.');await resolution.getByRole('button',{name:'Record resolution'}).click();await saved(reviewer);await review(reviewer,'approved');await saved(reviewer);
    await capture(reviewer,'team-reviewer-'+tag);await refresh(owner);
    const issue=owner.getByRole('button',{name:'Issue approved handover',exact:true});await issue.dblclick();await saved(owner);await expect(owner.getByRole('heading',{name:/Brief version/})).toHaveCount(1);await issue.click();await saved(owner);await expect(owner.getByRole('heading',{name:/Brief version/})).toHaveCount(1);
    await refresh(recipient);await capture(recipient,'team-recipient-'+tag);const download=recipient.waitForEvent('download');await recipient.getByRole('button',{name:'Download brief',exact:true}).click();const file=await download;const content=await readFile(await file.path(),'utf8');expect(content).toContain(quote);expect(content).toContain('Production constraints');
    await recipient.getByRole('button',{name:'Acknowledge receipt',exact:true}).dblclick();await saved(recipient);await expect(recipient.getByText('Acknowledged by '+users[2].username,{exact:false})).toBeVisible();await capture(recipient,'team-receipt-'+tag);
    await recipient.getByRole('button',{name:'Sign out',exact:true}).click();await auth(recipient,users[2],'Sign in');await recipient.locator('#workspace-choice').selectOption(new URL(url).searchParams.get('workspace'));await expect(recipient.getByText('Acknowledged by '+users[2].username,{exact:false})).toBeVisible();
    await review(owner,'rejected');await saved(owner);await refresh(recipient);await expect(recipient.getByRole('heading',{name:/Brief version/})).toHaveCount(1);await expect(recipient.locator('#team-room')).toContainText(quote);
   });
  }
  expect(errors).toEqual([]);
 }finally{for(const c of contexts)await c.close();}
});

test('public demo review, correction and download at all emulated sizes',async({browser,baseURL})=>{
 for(const size of viewports){const tag=`${size.width}x${size.height}${size.reducedMotion?'-reduced-motion':''}`;await test.step('Public UI at '+tag,async()=>{
  const context=await browser.newContext({baseURL,viewport:{width:size.width,height:size.height},reducedMotion:size.reducedMotion||'no-preference'});const p=await context.newPage();try{
   await p.goto('/');await p.getByRole('button',{name:'Trace the Stripe case',exact:true}).click();await expect(p.locator('#notice')).toContainText('Stripe example ready');await p.getByRole('button',{name:'Edit interpretation',exact:true}).click();await p.getByLabel('Reviewed interpretation').fill('Stripe requires a fresh regional production availability check.');await p.getByRole('button',{name:'Save for review',exact:true}).click();await expect(p.locator('#notice')).toContainText('Correction saved');await p.goto('/#findings');const c=p.locator('#claimList article').filter({hasText:stripe}).first();await c.getByRole('button',{name:'Approve',exact:true}).click();await expect(p.locator('#notice')).toContainText('approved');await p.goto('/#handover');await expect(p.locator('#downloadBtn')).toBeEnabled();const download=p.waitForEvent('download');await p.locator('#downloadBtn').click();const content=await readFile(await(await download).path(),'utf8');expect(content).toContain('Stripe requires');expect(content).toContain('We tried Stripe');await capture(p,'public-handover-'+tag);
  }finally{await context.close();}
 });}
});
