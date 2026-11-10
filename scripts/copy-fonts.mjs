import {mkdirSync, copyFileSync} from 'node:fs';
import {resolve} from 'node:path';
const output=resolve('public/fonts');
mkdirSync(output,{recursive:true});
const files=[
  ['@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2','dm-sans.woff2'],
  ['@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2','space-grotesk.woff2'],
  ['@fontsource/space-mono/files/space-mono-latin-400-normal.woff2','space-mono-400.woff2'],
  ['@fontsource/space-mono/files/space-mono-latin-700-normal.woff2','space-mono-700.woff2']
];
for(const [from,to] of files){copyFileSync(resolve('node_modules',from),resolve(output,to));}
console.log('Local fonts prepared: DM Sans / Space Grotesk / Space Mono');
