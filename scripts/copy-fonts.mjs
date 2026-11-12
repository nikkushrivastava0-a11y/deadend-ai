import {mkdirSync, copyFileSync} from 'node:fs';
import {resolve} from 'node:path';
const output=resolve('public/fonts');
mkdirSync(output,{recursive:true});
const files=[
  ['@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2','dm-sans.woff2']
];
for(const [from,to] of files){copyFileSync(resolve('node_modules',from),resolve(output,to));}
console.log('Local fonts prepared: DM Sans (UI), platform monospace (evidence)');
