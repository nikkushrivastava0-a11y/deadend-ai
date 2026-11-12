import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {transform} from 'esbuild';
import sharp from 'sharp';
const parts=['style.css','immersive.css','atmosphere.css','matte.css','site-polish.css'];
let css=parts.map(name=>readFileSync('public/'+name,'utf8')).join('\n');
// One cohesive font pair: Space Grotesk headlines and DM Sans UI/body.
css=css.replace(/@font-face\{font-family:'Space Mono';[^}]*\}/g,'').replaceAll("'Space Mono'","'DM Sans'");
const result=await transform(css,{loader:'css',minify:true,target:'chrome105'});
writeFileSync('public/site.bundle.css',result.code);
// Social card is original vector artwork rendered once at build time; no fake photography.
const card=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#101113"/>
<rect x="67" y="65" width="1066" height="500" rx="18" fill="#191b1d" stroke="#4d504f" stroke-width="2"/>
<rect x="112" y="110" width="53" height="53" rx="8" fill="#e3e0d6"/>
<text x="125" y="145" fill="#17191a" font-family="Arial,sans-serif" font-size="34" font-weight="bold">D</text>
<text x="188" y="146" fill="#e6e3da" font-family="Arial,sans-serif" font-size="30" font-weight="bold">deadend.</text>
<rect x="112" y="222" width="74" height="5" fill="#adada6"/>
<text x="112" y="308" fill="#f1efe7" font-family="Arial,sans-serif" font-size="67" font-weight="bold">Remember the why.</text>
<text x="113" y="368" fill="#c1c1bb" font-family="Arial,sans-serif" font-size="30">Evidence-led technical decision handovers.</text>
<text x="113" y="509" fill="#9f9f99" font-family="Arial,sans-serif" font-size="21">PUBLIC GITHUB EVIDENCE  /  HUMAN REVIEW  /  APPROVED HANDOVER</text>
</svg>`;
await sharp(Buffer.from(card)).png({compressionLevel:9,palette:true}).toFile('public/og-deadend.png');
await sharp('public/favicon.svg').resize(180,180).png({compressionLevel:9}).toFile('public/apple-touch-icon.png');
await sharp('public/favicon.svg').resize(48,48).png({compressionLevel:9}).toFile('public/favicon.png');
console.log('Built compact CSS, social card, and favicons', {css:result.code.length});
