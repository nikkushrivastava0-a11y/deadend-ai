/**
 * DEADEND / THE EVIDENCE ATLAS
 * Actual GPU-rendered 3D investigation scene. The original HTML remains the
 * keyboard/screen-reader interface and fallback when WebGL is unavailable.
 */
import * as THREE from 'three';

const root = document.querySelector('#scene');
const fallbackNodes = [...document.querySelectorAll('#sceneOrbit [data-node]')];
const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const mediaNarrow = window.matchMedia('(max-width: 700px)');

if (root && fallbackNodes.length === 5 && !mediaReduced.matches && !mediaNarrow.matches) {
  try { initialize(); }
  catch (error) {
    document.documentElement.classList.remove('has-webgl');
    console.warn('DeadEnd: accessible 2D evidence view retained.', error?.message);
  }
}

function initialize() {
  const canvas = document.createElement('canvas');
  canvas.className = 'evidence-webgl-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl2', { alpha:true, antialias:true, powerPreference:'high-performance' });
  if (!gl) return;

  const renderer = new THREE.WebGLRenderer({canvas,context:gl,alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.13;
  renderer.setClearColor(0x101114, 0);
  root.prepend(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(41, 1, 0.1, 100);
  camera.position.set(0, 0, 13.9);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xd8d5cf, 1.05));
  const cyan = new THREE.PointLight(0xe2dfd6, 25, 23); cyan.position.set(-5, 5, 8); scene.add(cyan);
  const lilac = new THREE.PointLight(0x919497, 18, 20); lilac.position.set(4, -2, 7); scene.add(lilac);
  const white = new THREE.DirectionalLight(0xf1eee7, 1.95); white.position.set(4, 8, 12); scene.add(white);

  const world = new THREE.Group();
  world.rotation.set(-0.12, -0.10, -0.09);
  scene.add(world);

  const configuration = [
    {key:'source',   title:'SOURCE',     prefix:'01 // CONNECT',accent:0xb8b6b0, position:[-3.16, 1.43, -0.68], note:'PROJECT MEMORY', rotation:-0.10},
    {key:'decision', title:'DEAD END',   prefix:'02 // RECONSTRUCT',accent:0xd6d0c5,position:[-0.14, 1.68, 0.25], note:'REJECTED PATH',rotation:0.08},
    {key:'evidence', title:'EVIDENCE',   prefix:'03 // VERIFY',accent:0xa3aaa9,position:[2.88, 1.06, -0.34],note:'ORIGINAL QUOTE',rotation:0.11},
    {key:'review',   title:'HUMAN REVIEW',prefix:'04 // REVIEW',accent:0xc0bdb5,position:[-2.18,-1.48,0.82],note:'HUMAN SIGN-OFF',rotation:0.06},
    {key:'handover', title:'HANDOVER',   prefix:'05 // TRANSFER',accent:0xaab1ae,position:[1.19,-1.52,1.12],note:'APPROVED ONLY',rotation:-0.10}
  ];
  const cards = [];
  const hitMeshes = [];
  const connections = [];
  const hitRay = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const lineMaterial = new THREE.MeshBasicMaterial({color:0x929794,transparent:true,opacity:0.15});
  const accents = {};

  for (const option of configuration) {
    const group = new THREE.Group();
    group.position.set(...option.position);
    group.rotation.z = option.rotation;
    world.add(group);

    for (let layer = 2; layer >= 0; layer--) {
      const z = (layer - 2) * -0.13;
      const under = new THREE.Mesh(new THREE.BoxGeometry(2.44,1.65,0.09),
        new THREE.MeshStandardMaterial({
          color:layer===0 ? 0x2c3034 : layer===1 ? 0x25282c : 0x1e2125,
          emissive:0x888782, emissiveIntensity:layer===0 ? 0.022 : 0.008,
          metalness:0.10, roughness:0.88, transparent:true,opacity:layer===2?0.97:0.91
        }));
      under.position.set((2-layer)*0.045, -(2-layer)*0.062, z-0.055);
      group.add(under);
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(under.geometry),
        new THREE.LineBasicMaterial({color:option.accent,transparent:true,opacity:layer===0?0.40:0.15}));
      under.add(edge);
    }

    const faceTexture = renderFace(option);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(2.39,1.60),
      new THREE.MeshBasicMaterial({map:faceTexture,transparent:true,opacity:0.995,side:THREE.DoubleSide,depthWrite:false}));
    face.position.z=0.13;
    face.userData.key=option.key;
    face.userData.card=group;
    group.add(face);
    hitMeshes.push(face);

    const outline = new THREE.Mesh(new THREE.PlaneGeometry(2.49,1.68),
      new THREE.MeshBasicMaterial({color:option.accent,transparent:true,opacity:0.012,side:THREE.DoubleSide}));
    outline.position.z=0.1;
    group.add(outline);

    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.62,1.84),
      new THREE.MeshBasicMaterial({color:option.accent,transparent:true,opacity:0.0,side:THREE.DoubleSide,depthWrite:false}));
    glow.position.z = -0.24;
    group.add(glow);
    cards.push({option,group,face,texture:faceTexture,glow,under:group.children[0]});
    accents[option.key] = new THREE.Color(option.accent);
  }

  // The explicit pathway is a part of the scene, not an illustration baked into a background.
  const chains = [[0,1],[1,2],[1,3],[2,4],[3,4]];
  for (const [a,b] of chains) {
    const A = cards[a].group.position, B = cards[b].group.position;
    const center = A.clone().lerp(B,0.5);
    center.z-=0.38;
    const curve = new THREE.QuadraticBezierCurve3(A.clone().add(new THREE.Vector3(0,0,-0.22)),center,B.clone().add(new THREE.Vector3(0,0,-0.22)));
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve,48,0.012,7,false),
      new THREE.MeshBasicMaterial({color:0x8e9391,transparent:true,opacity:0.24}));
    world.add(tube);
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.026,10,10),
      new THREE.MeshBasicMaterial({color:0xc1c2bb,transparent:true,opacity:0.37}));
    world.add(pulse);connections.push({curve,pulse,speed:0.075+0.025*a,offset:a*0.13});
  }

  // A restrained field of stars adds parallax and camera-space depth.
  const particles = new Float32Array(130*3);
  for(let i=0;i<130;i++){
    particles[3*i]=(pseudo(i*7+3)-0.5)*12.2;
    particles[3*i+1]=(pseudo(i*13+2)-0.5)*8.3;
    particles[3*i+2]=(pseudo(i*19+5)-0.5)*4-2.4;
  }
  const dotsGeom = new THREE.BufferGeometry();
  dotsGeom.setAttribute('position',new THREE.BufferAttribute(particles,3));
  // No floating particle glitter: let the 3D evidence geometry carry the scene.

  const ground = new THREE.GridHelper(19, 18, 0x484c4e, 0x2a2d30);
  ground.rotation.x=Math.PI/2;
  ground.position.set(0,0,-2.9);
  ground.material.transparent=true;ground.material.opacity=0.09;
  world.add(ground);

  // Keep the original five semantic buttons in the DOM for keyboard and fallback.
  document.documentElement.classList.add('has-webgl');
  const heads = root.parentElement.querySelector('.scene-head span:last-child');
  if(heads)heads.textContent='GPU RENDERED 3D  /  DRAG TO ORBIT';
  const caption=root.parentElement.querySelector('#sceneSelection');
  let selectedKey='decision';
  let hoveredKey=null;
  let isDragging=false, dragDistance=0, lastX=0,lastY=0;
  let targetYaw=-0.10, targetPitch=-0.12, visible=true;
  let renderId=0;
  let width=1,height=1;

  function readSelection() {
    const chosen=fallbackNodes.find(n=>n.classList.contains('selected'));
    selectedKey=chosen?.dataset.node || 'decision';
  }
  for(const node of fallbackNodes){
    node.addEventListener('click',()=>{
      selectedKey=node.dataset.node;
      if(caption)caption.dataset.webglSelection=selectedKey;
    });
  }
  readSelection();

  const mutation=new MutationObserver(readSelection);
  mutation.observe(document.querySelector('#sceneOrbit'),{subtree:true,attributes:true,attributeFilter:['class']});

  function refreshTextures(){
    for(const entry of cards){
      const label=document.querySelector('[data-node="'+entry.option.key+'"] .node-caption');
      const latest=label?.textContent?.trim();
      if(latest&&latest!==entry.option.note){
        entry.option.note=latest;entry.texture.dispose();
        entry.texture=renderFace(entry.option);
        entry.face.material.map=entry.texture;
        entry.face.material.needsUpdate=true;
      }
    }
  }
  let lastSubtitles='';
  function updateTexts(){
    const values=fallbackNodes.map(x=>x.querySelector('.node-caption')?.textContent||'').join('|');
    if(values!==lastSubtitles){lastSubtitles=values;refreshTextures();}
  }

  function bounds(){
    const rect=root.getBoundingClientRect();
    width=Math.max(2,rect.width);height=Math.max(2,rect.height);
    camera.aspect=width/height;
    camera.fov=width<650?47:41;
    camera.updateProjectionMatrix();
    renderer.setSize(width,height,false);
  }
  const resize=new ResizeObserver(bounds);resize.observe(root);bounds();

  function raycast(event) {
    const rect=canvas.getBoundingClientRect();
    mouse.set(((event.clientX-rect.left)/rect.width)*2-1, -((event.clientY-rect.top)/rect.height)*2+1);
    hitRay.setFromCamera(mouse,camera);
    const hit=hitRay.intersectObjects(hitMeshes,false)[0];
    return hit?.object?.userData?.key||null;
  }
  root.addEventListener('pointerdown',e=>{
    if(e.target!==canvas)return;
    isDragging=true;dragDistance=0;lastX=e.clientX;lastY=e.clientY;
  });
  root.addEventListener('pointermove',e=>{
    if(isDragging){
      const dx=e.clientX-lastX,dy=e.clientY-lastY;
      dragDistance+=Math.abs(dx)+Math.abs(dy);
      targetYaw=THREE.MathUtils.clamp(targetYaw+dx*0.004,-0.65,0.53);
      targetPitch=THREE.MathUtils.clamp(targetPitch+dy*0.003,-0.48,0.30);
      lastX=e.clientX;lastY=e.clientY;
    }
    hoveredKey=raycast(e);
    canvas.style.cursor=hoveredKey?'pointer':isDragging?'grabbing':'grab';
  });
  root.addEventListener('pointerup',e=>{
    if(!isDragging)return;
    isDragging=false;
    if(dragDistance<8){
      const key=raycast(e);
      if(key){
        document.querySelector('#sceneOrbit [data-node="'+key+'"]')?.click();
        selectedKey=key;
      }
    }
  });
  root.addEventListener('pointercancel',()=>{isDragging=false;});
  root.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
    targetYaw=THREE.MathUtils.clamp(targetYaw+(e.key==='ArrowLeft'?-0.10:e.key==='ArrowRight'?0.10:0),-0.65,0.53);
    targetPitch=THREE.MathUtils.clamp(targetPitch+(e.key==='ArrowUp'?-0.08:e.key==='ArrowDown'?0.08:0),-0.48,0.30);
  });
  document.getElementById('resetCamera')?.addEventListener('click',()=>{targetYaw=-0.10;targetPitch=-0.12;});
  const observer=new IntersectionObserver(entries=>{
    visible=entries[0]?.isIntersecting??false;
    if(visible&&!renderId)renderId=requestAnimationFrame(frame);
  },{threshold:0.02});
  observer.observe(root);

  const clock=new THREE.Clock();
  function frame(){
    renderId=0;
    if(!visible||document.hidden)return;
    const t=clock.getElapsedTime();
    world.rotation.x=THREE.MathUtils.lerp(world.rotation.x,targetPitch,0.060);
    world.rotation.y=THREE.MathUtils.lerp(world.rotation.y,targetYaw,0.060);
    for(let i=0;i<cards.length;i++){
      const entry=cards[i],active=entry.option.key===selectedKey,hovered=entry.option.key===hoveredKey;
      entry.group.position.y=entry.option.position[1]+Math.sin(t*0.78+i*1.23)*0.085;
      entry.group.position.z=THREE.MathUtils.lerp(entry.group.position.z,entry.option.position[2]+(active?0.18:hovered?0.12:0),0.09);
      entry.glow.material.opacity=0; // matte cards do not emit artificial halos
      entry.under.material.emissiveIntensity=THREE.MathUtils.lerp(entry.under.material.emissiveIntensity,active?0.045:hovered?0.03:0.012,0.10);
    }
    for(const connection of connections){
      const point=connection.curve.getPoint((t*connection.speed+connection.offset)%1);
      connection.pulse.position.copy(point);
    }
    cyan.position.x=-5+Math.sin(t*0.21)*0.5;
    lilac.position.y=-2+Math.cos(t*0.18)*0.4;
    updateTexts();
    renderer.render(scene,camera);
    renderId=requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!renderId&&visible)renderId=requestAnimationFrame(frame);});
  renderId=requestAnimationFrame(frame);
  document.getElementById('sceneMode')?.setAttribute('title','Live WebGL depth: original evidence remains in accessible review panels.');
}

function pseudo(x){const n=Math.sin(x*127.1+52.5)*43758.5453;return n-Math.floor(n);}
function renderFace(item){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=684;
  const c=canvas.getContext('2d');
  const color='#'+item.accent.toString(16).padStart(6,'0');
  c.fillStyle='#24272b';c.fillRect(0,0,1024,684);
  const grad=c.createLinearGradient(0,0,1024,684);
  grad.addColorStop(0,'rgba(210,208,202,.07)');grad.addColorStop(0.28,'rgba(122,125,124,.025)');grad.addColorStop(1,'rgba(9,10,11,.13)');
  c.fillStyle=grad;c.fillRect(0,0,1024,684);
  c.strokeStyle=color;c.globalAlpha=0.7;c.lineWidth=5;c.strokeRect(12,12,1000,660);c.globalAlpha=1;
  c.fillStyle=color;c.fillRect(36,36,122,6);
  c.font='600 29px monospace';c.fillStyle='#a7a9a5';c.fillText(item.prefix,37,103);
  c.font='700 88px sans-serif';c.fillStyle='#eceae3';c.fillText(item.title,37,305,960);
  c.lineWidth=2;c.strokeStyle='#686c6b';c.beginPath();c.moveTo(37,368);c.lineTo(979,368);c.stroke();
  c.font='500 37px sans-serif';c.fillStyle='#c1c1bb';let subtitle=item.note||'ORIGINAL SOURCE';
  if(subtitle.length>40)subtitle=subtitle.slice(0,37)+'...';
  c.fillText(subtitle,37,447,950);
  c.font='700 30px monospace';c.fillStyle=color;c.fillText('SELECT TO INSPECT   /   →',37,616);
  c.strokeStyle='#666b6c';c.lineWidth=3;c.strokeRect(856,534,119,100);
  c.strokeStyle=color;c.beginPath();c.arc(917,584,34,0,Math.PI*2);c.stroke();
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=4;
  return texture;
}
