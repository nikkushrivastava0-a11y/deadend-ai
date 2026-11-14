import {test,expect} from '@playwright/test';

test('a delayed sandbox refresh cannot replace a newer approval capsule',async({page})=>{
 await page.goto('/team.html');await page.getByRole('button',{name:'Start disposable judge sandbox'}).click();await expect(page.locator('#team-notice')).toContainText('Sandbox ready');
 await page.getByLabel('Sandbox role',{exact:true}).selectOption('reviewer');await expect(page.locator('#team-notice')).toContainText('Sandbox role changed');
 let release,signal;const gate=new Promise(r=>release=r),held=new Promise(r=>signal=r);let holdNext=true,reviewStarted=false;
 page.on('request',request=>{if(request.url().endsWith('/api/sandbox')&&request.postDataJSON()?.data?.route==='review')reviewStarted=true;});
 await page.route('**/api/sandbox',async route=>{
  const body=route.request().postDataJSON();
  if(holdNext&&body.path==='desk'&&body.data?.route==='state'){
   holdNext=false;const response=await route.fetch();signal();await gate;await route.fulfill({response});
  }else await route.continue();
 });
 try{
  await page.getByRole('button',{name:'Refresh workspace',exact:true}).click();await held;
  const claim=page.locator('article.claim').filter({hasText:'We tried Stripe checkout'}).first();await claim.getByLabel('Review state').selectOption('approved');await claim.getByRole('button',{name:'Save review'}).click();
  // An intentional short response window exercises overlapping read/write requests.
  await page.waitForTimeout(250);expect(reviewStarted).toBe(false);release();
  await expect.poll(()=>reviewStarted).toBe(true);await expect(page.locator('#team-notice')).toContainText('Saved to the shared database');
  await page.getByLabel('Sandbox role',{exact:true}).selectOption('owner');await expect(page.locator('#team-notice')).toContainText('Sandbox role changed');
  await expect(page.getByRole('button',{name:'Issue approved handover',exact:true})).toBeEnabled();await page.getByRole('button',{name:'Issue approved handover',exact:true}).click();await expect(page.locator('#team-notice')).toContainText('Saved to the shared database');await expect(page.getByRole('heading',{name:/Brief version/})).toHaveCount(1);
 }finally{release();await page.unroute('**/api/sandbox');}
});
