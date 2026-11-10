import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('Vercel serves security response headers on all public routes',()=>{
 const config=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
 const global=config.headers.find(rule=>rule.source==='/(.*)');
 assert.ok(global,'expected a global route header policy');
 const actual=Object.fromEntries(global.headers.map(x=>[x.key.toLowerCase(),x.value]));
 assert.equal(actual['x-content-type-options'],'nosniff');
 assert.equal(actual['referrer-policy'],'no-referrer');
 assert.equal(actual['x-frame-options'],'DENY');
 assert.equal(actual['permissions-policy'],'camera=(), microphone=(), geolocation=()');
 const api=config.headers.find(rule=>rule.source==='/api/:path*');
 assert.ok(api);
 assert.ok(api.headers.some(x=>x.key==='Cache-Control' && /no-store/.test(x.value)));
});
