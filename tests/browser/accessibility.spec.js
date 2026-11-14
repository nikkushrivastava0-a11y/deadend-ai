import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {randomBytes} from 'node:crypto';
import {writeFile,mkdir} from 'node:fs/promises';
async function audit(page,name,results){
 const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 const row={page:name,violations:r.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,failureSummary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target}))}))};results.push(row);
 await mkdir('docs/evidence',{recursive:true});await writeFile('docs/evidence/axe-results.json',JSON.stringify({date:new Date().toISOString(),engine:r.testEngine,scope:'Automated axe checks; manual keyboard is separate',results},null,2));
 expect(row.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
}
async function tabTo(page,target){
 for(let n=0;n<220;n++){
  if(await target.evaluate(el=>el===document.activeElement)){
   expect(await target.evaluate(el=>{const s=getComputedStyle(el);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0;})).toBe(true);return;
  }
  await page.keyboard.press('Tab');
 }
 throw Error('Keyboard cannot reach labelled control');
}
async function enter(page,target){await tabTo(page,target);await page.keyboard.press('Enter');}
async function type(page,target,text){await tabTo(page,target);await page.keyboard.type(text);}

test('axe audits public views, team sign-in and signed-in owner workspace',async({page})=>{
 const results=[];
 await page.goto('/');await expect(page.locator('#featuredFinding')).toHaveAttribute('aria-busy','false');await audit(page,'public-overview',results);
 for(const view of ['sources','findings','handover']){await page.goto('/#'+view);await expect(page.locator('#'+view)).toBeVisible();await audit(page,'public-'+view,results);}
 await page.goto('/team.html');await audit(page,'team-sign-in',results);
 const name='axe_'+randomBytes(5).toString('hex');await page.getByLabel('Handle',{exact:true}).fill(name);await page.getByLabel('Password',{exact:true}).fill(randomBytes(24).toString('hex'));await page.getByRole('button',{name:'Create account',exact:true}).click();await expect(page.locator('#signed-in')).toContainText(name);
 await page.locator('form[data-team=create] input').fill('Synthetic accessibility audit');await page.getByRole('button',{name:'Create workspace as owner'}).click();await expect(page.locator('#team-notice')).toContainText('Saved');await page.getByRole('button',{name:'Load fictional Stripe case'}).click();await expect(page.locator('#team-notice')).toContainText('Fictional example saved');await audit(page,'team-owner-loaded',results);
});

test('keyboard-only public journey and team registration, workspace, invitation and review',async({page})=>{
 const record=[];
 await page.goto('/');await expect(page.locator('#demoBtn')).toBeEnabled();await enter(page,page.locator('#demoBtn'));await expect(page.locator('#notice')).toContainText('Stripe example ready');await enter(page,page.locator('#featuredEdit'));await tabTo(page,page.getByLabel('Reviewed interpretation'));await page.keyboard.press('ControlOrMeta+A');await page.keyboard.type('Keyboard-reviewed Stripe decision needs a production recheck.');await enter(page,page.getByRole('button',{name:'Save for review',exact:true}));await expect(page.locator('#notice')).toContainText('Correction saved');await enter(page,page.locator('#claimList article').filter({hasText:'We tried Stripe checkout'}).first().getByRole('button',{name:'Approve',exact:true}));await expect(page.locator('#notice')).toContainText('approved');
 // Mobile navigation is tested by the viewport suite; this keyboard route uses desktop.
 await enter(page,page.locator('[data-view=handover]'));const download=page.waitForEvent('download');await enter(page,page.locator('#downloadBtn'));await download;record.push('Public: load, edit dialog, save, approve, navigate, download using Tab/Enter');
 await page.goto('/team.html');await type(page,page.getByLabel('Handle',{exact:true}),'key_'+randomBytes(5).toString('hex'));await type(page,page.getByLabel('Password',{exact:true}),randomBytes(24).toString('hex'));await enter(page,page.getByRole('button',{name:'Create account',exact:true}));await expect(page.locator('#signed-in')).toContainText('Signed in');
 await type(page,page.locator('form[data-team=create] input'),'Keyboard workspace');await enter(page,page.getByRole('button',{name:'Create workspace as owner'}));await expect(page.locator('#team-notice')).toContainText('Saved');await enter(page,page.getByRole('button',{name:'Load fictional Stripe case'}));await expect(page.locator('#team-notice')).toContainText('Fictional example saved');
 await enter(page,page.getByRole('button',{name:'Create one-use invitation'}));await expect(page.locator('#team-notice')).toContainText('Invitation ready');const c=page.locator('article.claim').filter({hasText:'We tried Stripe checkout'}).first();await tabTo(page,c.getByLabel('Review state'));await page.keyboard.press('a');await enter(page,c.getByRole('button',{name:'Save review'}));await expect(page.locator('#team-notice')).toContainText('Saved');record.push('Team: signup, workspace, sample import, invitation and review using keyboard; multi-role keyboard completion remains unverified');
 await mkdir('docs/evidence',{recursive:true});await writeFile('docs/evidence/keyboard-results.json',JSON.stringify({observedInBrowser:record,limits:['Desktop keyboard only','No physical phone','Multi-role keyboard completion not yet proven']},null,2));
});
