import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const read=path=>readFileSync(new URL('../public/'+path,import.meta.url),'utf8');
process.env.NODE_ENV='test';
const {app}=await import('../server.js');

test('SEO metadata, canonical URLs, meaningful schema and social assets are published',()=>{
 const html=read('index.html');
 assert.match(html,/<title>DeadEnd AI — Trace Rejected Technical Decisions<\/title>/);
 assert.match(html,/<meta name="description" content="[^\"]{60,}/);
 assert.match(html,/<link rel="canonical" href="https:\/\/deadend-ai-codersinpune\.vercel\.app\/"/);
 assert.match(html,/<meta property="og:image:alt"/);
 assert.match(html,/<link rel="icon" type="image\/svg\+xml"/);
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 assert.equal(schema['@type'],'SoftwareApplication');
 assert.equal(schema.applicationCategory,'DeveloperApplication');
 assert.ok(!html.includes('LocalBusiness'));
 for(const [path,title] of [['about.html','About DeadEnd AI'],['privacy.html','Privacy & Data Handling'],['404.html','404 — Page Not Found']]){
  const body=read(path);assert.match(body,new RegExp('<title>'+title));
  assert.equal((body.match(/<h1\b/g)||[]).length,1,path+' has one heading');
  assert.match(body,/rel="canonical"/);assert.match(body,/aria-label="Breadcrumb"/);
 }
 assert.match(read('sitemap.xml'),/deadend-ai-codersinpune\.vercel\.app\/about\.html/);
 assert.match(read('robots.txt'),/Sitemap:/);
 assert.match(read('llms.txt'),/deterministic/);
 assert.ok(statSync(new URL('../public/og-deadend.png',import.meta.url)).size>8000,'Social artwork must have legible glyph paths');
 assert.ok(statSync(new URL('../public/favicon.png',import.meta.url)).size>500);
});

test('navigation is accessible and the 3D bundle is not eager-loaded on mobile',()=>{
 const html=read('index.html');
 assert.match(html,/id="menuToggle"[^>]*aria-controls="sidebarNav"/);
 assert.match(html,/href="\/" aria-label="DeadEnd AI home"/);
 assert.match(html,/aria-label="Footer links"/);
 assert.match(html,/href="mailto:nikkushrivastava0@gmail\.com"/);
 assert.equal((html.match(/data-view="/g)||[]).length,4);assert.match(html,/<a class="subtle secondary-link" href="#sources"/);assert.match(html,/id="downloadBtn" disabled/);
 assert.doesNotMatch(html,/<script src="\/scene3d\.bundle\.js"/);
 const js=read('app.js');assert.match(js,/lazilyLoadWebGL/);assert.match(js,/menuToggle/);
 assert.match(js,/handoverCount/);assert.match(js,/Nothing ready to export/);assert.match(js,/new Option\('Load an example case to explore findings'/);assert.match(js,/finally\{btn.disabled=false;/);
 const css=read('site.bundle.css');assert.ok(css.length<65000);assert.doesNotMatch(css,/Space Mono/);
 assert.match(css,/\.skip-link/);
});

test('all public routes, SEO resources, 404 pages and HEAD requests have correct status and MIME',async()=>{
 await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+app.address().port;
 try{
  for(const [route,mime] of [['/','text/html'],['/about.html','text/html'],['/privacy.html','text/html'],['/sitemap.xml','application/xml'],['/robots.txt','text/plain'],['/llms.txt','text/plain'],['/LLMs.txt','text/plain'],['/og-deadend.png','image/png'],['/favicon.svg','image/svg+xml'],['/site.bundle.css','text/css']]){
   const res=await fetch(base+route);assert.equal(res.status,200,route);assert.ok(res.headers.get('content-type').startsWith(mime),route);
  }
  const notFound=await fetch(base+'/broken-page');assert.equal(notFound.status,404);assert.match(await notFound.text(),/This trail ends here/);
  const api404=await fetch(base+'/api/unknown-route');assert.equal(api404.status,404);assert.match(api404.headers.get('content-type'),/application\/json/);
  const head=await fetch(base+'/about.html',{method:'HEAD'});assert.equal(head.status,200);assert.equal((await head.text()).length,0);
 }finally{await new Promise(resolve=>app.close(resolve));}
});
