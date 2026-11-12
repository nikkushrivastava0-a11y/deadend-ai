import {readFileSync,writeFileSync} from 'node:fs';
import {transform} from 'esbuild';
import sharp from 'sharp';
import fontkit from 'fontkit';
const parts=['style.css','immersive.css','atmosphere.css','matte.css','site-polish.css'];
let css=parts.map(name=>readFileSync('public/'+name,'utf8')).join('\n');
// Exactly two font families: Space Grotesk headlines and DM Sans UI/body.
css=css.replace(/@font-face\{font-family:'Space Mono';[^}]*\}/g,'').replaceAll("'Space Mono'","'DM Sans'");
const result=await transform(css,{loader:'css',minify:true,target:'chrome105'});
writeFileSync('public/site.bundle.css',result.code);
// Build the Open Graph artwork from real glyph paths so it renders correctly
// in CI and on Vercel even if the operating system has NO fonts installed.
const heading=fontkit.openSync('node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2');
const body=fontkit.openSync('node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2');
function lettering(font,text,x,baseline,size,fill){
 const layout=font.layout(text),scale=size/font.unitsPerEm;
 let dx=0;const paths=[];
 for(let i=0;i<layout.glyphs.length;i++){
  const glyph=layout.glyphs[i],pos=layout.positions[i];
  const path=glyph.path.toSVG();
  if(path)paths.push('<path d="'+path+'" transform="translate('+(dx+pos.xOffset)+' '+(pos.yOffset||0)+')"/>');
  dx+=pos.xAdvance;
 }
 return '<g fill="'+fill+'" transform="translate('+x+' '+baseline+') scale('+scale+' '+(-scale)+')">'+paths.join('')+'</g>';
}
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">'+
 '<rect width="1200" height="630" fill="#101113"/>'+
 '<rect x="64" y="62" width="1072" height="506" rx="22" fill="#191b1d" stroke="#51534f" stroke-width="2"/>'+
 '<rect x="108" y="108" width="50" height="50" rx="9" fill="#e3e0d6"/>'+
 lettering(heading,'D',119,148,34,'#17191a')+
 lettering(heading,'deadend.',180,147,32,'#e6e3da')+
 '<rect x="108" y="220" width="78" height="5" fill="#b0afa7"/>'+
 lettering(heading,'Remember the why.',108,317,79,'#f1efe7')+
 lettering(body,'Evidence-led technical decision handovers.',111,391,36,'#c5c3bc')+
 lettering(body,'PUBLIC GITHUB EVIDENCE  /  HUMAN REVIEW  /  APPROVED HANDOVER',111,513,21,'#aaa9a3')+
 '<rect x="933" y="125" width="126" height="86" rx="7" fill="#414443" stroke="#7a7d79"/>'+
 '<rect x="966" y="171" width="126" height="86" rx="7" fill="#313436" stroke="#7a7d79"/>'+
 '<rect x="920" y="216" width="126" height="86" rx="7" fill="#56564f" stroke="#aaa8a0"/>'+
 '</svg>';
await sharp(Buffer.from(svg)).png({compressionLevel:9,palette:true}).toFile('public/og-deadend.png');
await sharp('public/favicon.svg').resize(180,180).png({compressionLevel:9}).toFile('public/apple-touch-icon.png');
await sharp('public/favicon.svg').resize(48,48).png({compressionLevel:9}).toFile('public/favicon.png');
console.log('Built CSS and deterministic vector-lettered social images', {cssBytes:result.code.length});
