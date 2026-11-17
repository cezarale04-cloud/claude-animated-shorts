// Zero Gravity City — deterministic three.js film, 1080x1920, 30 fps.
// window.renderFrame(f) draws frame f. No text anywhere in the world.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const params = new URLSearchParams(location.search);
const W = +(params.get('w') || 1080), H = +(params.get('h') || 1920);
const FPS = 30, DURATION = 16, FRAMES = FPS * DURATION;

// ---------- seeded random ----------
let seed = 1337;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const R = (a, b) => a + (b - a) * rnd();
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const ease = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const FOG = new THREE.Color(0xbcd6ee);
scene.fog = new THREE.Fog(FOG, 120, 900);
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 4000);

// ---------- sky ----------
const SUN_DIR = new THREE.Vector3(-0.45, 0.42, -0.78).normalize();
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { sunDir: { value: SUN_DIR } },
  vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*p; gl_Position.z = gl_Position.w; }`,
  fragmentShader: `varying vec3 vDir; uniform vec3 sunDir;
    void main(){
      float h = clamp(vDir.y, -0.2, 1.0);
      vec3 zen = vec3(0.12, 0.36, 0.82);
      vec3 mid = vec3(0.36, 0.62, 0.95);
      vec3 hor = vec3(0.80, 0.89, 0.97);
      vec3 c = mix(hor, mid, smoothstep(0.0, 0.25, h));
      c = mix(c, zen, smoothstep(0.25, 0.95, h));
      float s = max(dot(normalize(vDir), sunDir), 0.0);
      c += vec3(1.0, 0.86, 0.62) * pow(s, 8.0) * 0.45;
      c += vec3(1.0, 0.95, 0.85) * pow(s, 64.0) * 1.2;
      c += vec3(1.0) * smoothstep(0.9993, 0.9997, s) * 6.0;
      gl_FragColor = vec4(c, 1.0);
    }`,
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 24), skyMat);
scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight(0xcfe6ff, 0x8a7a66, 0.9);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d8, 3.2);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.04;
const sc = sun.shadow.camera; sc.left = -45; sc.right = 45; sc.top = 45; sc.bottom = -45; sc.near = 1; sc.far = 400;
scene.add(sun); scene.add(sun.target);
const fill = new THREE.DirectionalLight(0x9fc4ff, 0.6);
fill.position.copy(SUN_DIR).multiplyScalar(-1).setY(0.3);
scene.add(fill);

// environment map from the sky (reflections on cars and glass)
{
  const pm = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), skyMat.clone()));
  envScene.children[0].material.uniforms.sunDir.value = SUN_DIR;
  const g = new THREE.Mesh(new THREE.CircleGeometry(100, 24), new THREE.MeshBasicMaterial({ color: 0x8c8478 }));
  g.rotation.x = -Math.PI / 2; g.position.y = -5; envScene.add(g);
  scene.environment = pm.fromScene(envScene, 0.02).texture;
  scene.environmentIntensity = 0.55;
}

// ---------- textures ----------
function canvasTex(w, h, draw, repeat = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
// facade: one tile = 4 floors x 4 bays (each floor 3.5 m, bay 3 m) => tile 12 m x 14 m
const facadeTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#e9e4da'; g.fillRect(0, 0, w, h);
  const bw = w / 4, fh = h / 4;
  for (let fy = 0; fy < 4; fy++) for (let bx = 0; bx < 4; bx++) {
    const x = bx * bw, y = fy * fh;
    const lit = rnd();
    const grd = g.createLinearGradient(x, y, x + bw, y + fh);
    const base = 60 + Math.floor(rnd() * 40);
    grd.addColorStop(0, `rgb(${base * 0.55},${base * 0.85},${base * 1.25 + 40})`);
    grd.addColorStop(1, `rgb(${base * 0.35},${base * 0.55},${base * 0.95 + 20})`);
    g.fillStyle = grd;
    g.fillRect(x + bw * 0.1, y + fh * 0.16, bw * 0.8, fh * 0.68);
    // sky reflection streak
    g.fillStyle = `rgba(220,235,255,${0.15 + lit * 0.25})`;
    g.beginPath(); g.moveTo(x + bw * 0.1, y + fh * 0.84); g.lineTo(x + bw * 0.5, y + fh * 0.16); g.lineTo(x + bw * 0.7, y + fh * 0.16); g.lineTo(x + bw * 0.3, y + fh * 0.84); g.fill();
    // mullion
    g.fillStyle = 'rgba(40,45,55,0.6)'; g.fillRect(x + bw * 0.49, y + fh * 0.16, bw * 0.02, fh * 0.68);
    // occasional curtain / warm interior
    if (lit > 0.8) { g.fillStyle = 'rgba(255,214,150,0.55)'; g.fillRect(x + bw * 0.12, y + fh * 0.5, bw * 0.36, fh * 0.32); }
  }
  // slab lines
  g.fillStyle = 'rgba(0,0,0,0.12)';
  for (let fy = 0; fy < 4; fy++) g.fillRect(0, fy * fh + fh * 0.9, w, fh * 0.06);
});
const glassTex = canvasTex(256, 256, (g, w, h) => {
  const grd = g.createLinearGradient(0, 0, w, h);
  grd.addColorStop(0, '#9cc4e8'); grd.addColorStop(1, '#3f6f9e');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(30,40,60,0.7)'; g.lineWidth = 3;
  for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); }
  g.lineWidth = 2;
  for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); }
});
const roadTex = canvasTex(256, 1024, (g, w, h) => {
  g.fillStyle = '#4a4c52'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${rnd() > 0.5 ? 255 : 0},${rnd() > 0.5 ? 255 : 0},255,0.04)`; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
  g.fillStyle = '#e8d27a'; g.fillRect(w / 2 - 5, 0, 4, h); g.fillRect(w / 2 + 3, 0, 4, h);
  g.fillStyle = '#eeeeee';
  for (let y = 0; y < h; y += 128) { g.fillRect(w * 0.25 - 3, y, 6, 64); g.fillRect(w * 0.75 - 3, y, 6, 64); }
});
const walkTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#c9c2b6'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(90,80,70,0.35)'; g.lineWidth = 2;
  for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); }
});
const cloudTex = (() => {
  const t = canvasTex(512, 256, (g, w, h) => {
    for (let i = 0; i < 70; i++) {
      const x = w * (0.15 + 0.7 * rnd()), y = h * (0.45 + 0.3 * rnd() - 0.25 * Math.sin(Math.PI * (x / w)));
      const r = h * (0.12 + 0.18 * rnd()) * Math.sin(Math.PI * x / w);
      const gr = g.createRadialGradient(x, y - r * 0.3, r * 0.1, x, y, r);
      gr.addColorStop(0, 'rgba(255,255,255,0.95)');
      gr.addColorStop(0.6, 'rgba(244,247,252,0.7)');
      gr.addColorStop(1, 'rgba(225,233,245,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    // soft shaded underside
    const sh = g.createLinearGradient(0, h * 0.55, 0, h);
    sh.addColorStop(0, 'rgba(160,180,210,0)'); sh.addColorStop(1, 'rgba(150,170,205,0.5)');
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = sh; g.fillRect(0, 0, w, h);
  }, false);
  return t;
})();

// ---------- geometry helpers ----------
const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpS = new THREE.Vector3(), tmpP = new THREE.Vector3();
function colored(geo, color) {
  geo = geo.index ? geo.toNonIndexed() : geo;
  const c = new THREE.Color(color), n = geo.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(a, 3));
  if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
  return geo;
}
function place(geo, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  tmpQ.setFromEuler(tmpE.set(rx, ry, rz));
  tmpM.compose(tmpP.set(x, y, z), tmpQ, tmpS.set(sx, sy, sz));
  return geo.applyMatrix4(tmpM);
}
const part = (geo, color, ...t) => place(colored(geo, color), ...t);
const merge = (parts) => mergeGeometries(parts);

const vcMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.0 });
const vcShiny = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.22, metalness: 0.35 });
const skinMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 });

// ---------- city ----------
// Main avenue runs along Z; camera travels down it. Blocks on both sides plus a grid beyond.
const ROAD_W = 16, WALK_W = 5;
const cityParts = { facade: [], glass: [], roof: [] };
function boxUV(w, h, d, tileW, tileH) {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv;
  // faces order: +x,-x,+y,-y,+z,-z; 4 verts each
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) {
    const i = f * 4 + v; uv.setXY(i, uv.getX(i) * dims[f][0] / tileW, uv.getY(i) * dims[f][1] / tileH);
  }
  return g;
}
const tint = ['#f1e7d8', '#e6d5bf', '#d9cbb8', '#f4efe6', '#e8d9cf', '#d6dde6', '#efe0c8', '#cfd7d2', '#e9cdb8'];
function building(x, z, w, d, h, style) {
  if (style === 'glass') {
    const g = boxUV(w, h, d, 12, 14); place(g, x, h / 2, z);
    cityParts.glass.push(colored(g, '#ffffff'));
    // crown
    cityParts.roof.push(part(new THREE.BoxGeometry(w * 0.7, 3, d * 0.7), '#5d6670', x, h + 1.5, z));
    if (rnd() > 0.5) cityParts.roof.push(part(new THREE.CylinderGeometry(0.25, 0.25, 14, 6), '#8b929b', x, h + 9, z));
  } else {
    const col = pick(tint);
    let y = 0, cw = w, cd = d, remaining = h;
    const tiers = h > 70 ? 3 : h > 35 ? 2 : 1;
    for (let t = 0; t < tiers; t++) {
      const th = t === tiers - 1 ? remaining : remaining * R(0.45, 0.65);
      const g = boxUV(cw, th, cd, 12, 14); place(g, x, y + th / 2, z);
      cityParts.facade.push(colored(g, col));
      cityParts.roof.push(part(new THREE.BoxGeometry(cw + 0.6, 0.8, cd + 0.6), '#bdb3a5', x, y + th + 0.4, z));
      y += th; remaining -= th; cw *= R(0.7, 0.85); cd *= R(0.7, 0.85);
    }
    // rooftop clutter
    for (let i = 0; i < 3; i++) cityParts.roof.push(part(new THREE.BoxGeometry(R(1.5, 4), R(1, 3), R(1.5, 4)), pick(['#8e8a84', '#a7a29a', '#6f7a83']), x + R(-cw / 3, cw / 3), y + 1.2, z + R(-cd / 3, cd / 3)));
    if (rnd() > 0.6) { // water tower
      cityParts.roof.push(part(new THREE.CylinderGeometry(1.6, 1.6, 3, 12), '#8a5a3c', x + cw * 0.2, y + 4, z));
      cityParts.roof.push(part(new THREE.ConeGeometry(1.8, 1.4, 12), '#5a3a2a', x + cw * 0.2, y + 6.2, z));
    }
  }
}
// sides of the avenue: buildings from z=+60 to z=-700
for (const side of [-1, 1]) {
  let z = 60;
  while (z > -760) {
    const d = R(18, 34), w = R(20, 32);
    const near = z > -200;
    const h = near ? R(40, 150) : R(30, 200);
    const x = side * (ROAD_W / 2 + WALK_W + w / 2);
    building(x, z - d / 2, w, d - 2, h, rnd() > 0.55 ? 'glass' : 'stone');
    z -= d + (rnd() > 0.75 ? 14 : 2);
  }
}
// outer grid for skyline depth
for (let gx = -6; gx <= 6; gx++) for (let gz = -14; gz <= 2; gz++) {
  if (Math.abs(gx) <= 1) continue;
  const x = gx * 48 + R(-6, 6), z = gz * 52 + R(-6, 6);
  const w = R(18, 34), d = R(18, 34);
  const dist = Math.hypot(x, z + 300);
  building(x, z, w, d, R(25, 120) + Math.max(0, 260 - dist) * R(0.2, 0.8), rnd() > 0.5 ? 'glass' : 'stone');
}
// distant landmark towers
building(-160, -620, 40, 40, 330, 'glass');
building(120, -680, 34, 34, 290, 'glass');
building(30, -820, 46, 46, 380, 'glass');

const facadeMat = new THREE.MeshStandardMaterial({ map: facadeTex, vertexColors: true, roughness: 0.75 });
const glassMat = new THREE.MeshStandardMaterial({ map: glassTex, roughness: 0.08, metalness: 0.6, envMapIntensity: 1.4 });
const roofMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
for (const [k, mat] of [['facade', facadeMat], ['glass', glassMat], ['roof', roofMat]]) {
  const m = new THREE.Mesh(mergeGeometries(cityParts[k]), mat);
  m.castShadow = true; m.receiveShadow = true; scene.add(m);
}

// ground: road, sidewalks, outer ground
{
  const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_W, 1000), new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.9 }));
  roadTex.repeat.set(1, 1000 / 40);
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, -400); road.receiveShadow = true; scene.add(road);
  walkTex.repeat.set(WALK_W / 4, 1000 / 4);
  for (const s of [-1, 1]) {
    const wk = new THREE.Mesh(new THREE.BoxGeometry(WALK_W, 0.2, 1000), new THREE.MeshStandardMaterial({ map: walkTex, roughness: 0.9 }));
    wk.position.set(s * (ROAD_W / 2 + WALK_W / 2), 0.1, -400); wk.receiveShadow = true; scene.add(wk);
  }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshStandardMaterial({ color: 0x9c968c, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.05; ground.receiveShadow = true; scene.add(ground);
  // street trees and lamps along the near avenue
  const props = [];
  for (const s of [-1, 1]) for (let z = 40; z > -300; z -= 14) {
    const x = s * (ROAD_W / 2 + 1.2);
    props.push(part(new THREE.CylinderGeometry(0.09, 0.12, 6, 8), '#3b3f45', x, 3, z));
    props.push(part(new THREE.BoxGeometry(1.4, 0.15, 0.3), '#3b3f45', x - s * 0.6, 6, z));
    props.push(part(new THREE.CylinderGeometry(0.15, 0.25, 2.4, 6), '#6b4a32', x + s * 2.6, 1.2, z - 7));
    props.push(part(new THREE.IcosahedronGeometry(1.6, 1), pick(['#5f9a4a', '#6aa654', '#4f8a41']), x + s * 2.6, 3.4, z - 7, 0, 0, 0, 1, 1.15, 1));
  }
  const pm = new THREE.Mesh(mergeGeometries(props), roofMat); pm.castShadow = true; pm.receiveShadow = true; scene.add(pm);
}

// ---------- clouds ----------
const clouds = [];
for (let i = 0; i < 46; i++) {
  const m = new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false, opacity: R(0.75, 1) });
  const s = new THREE.Sprite(m);
  const ang = R(-Math.PI, Math.PI), dist = R(500, 1600);
  s.position.set(Math.sin(ang) * dist, R(180, 520), -Math.cos(ang) * dist - 300);
  const sz = R(260, 520); s.scale.set(sz, sz * 0.45, 1);
  s.userData.v = R(1.5, 3.5);
  scene.add(s); clouds.push(s);
}
// a few closer, lower wisps that the camera rises past
for (let i = 0; i < 10; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, opacity: R(0.35, 0.6) }));
  s.position.set(R(-160, 160), R(120, 200), R(-500, -200));
  const sz = R(80, 160); s.scale.set(sz, sz * 0.45, 1);
  s.userData.v = R(2, 4); scene.add(s); clouds.push(s);
}

// ---------- floating things ----------
const floaters = []; // {obj, p0, v, r0, w, lift, t0, update?}
function addFloater(obj, p0, opts = {}) {
  obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(obj);
  const f = {
    obj, p0: p0.clone(),
    v: opts.v || new THREE.Vector3(R(-0.25, 0.25), R(0.25, 0.9), R(-0.25, 0.25)),
    r0: opts.r0 || new THREE.Euler(R(-0.4, 0.4), R(0, 6.28), R(-0.4, 0.4)),
    w: opts.w || new THREE.Vector3(R(-0.18, 0.18), R(-0.15, 0.15), R(-0.18, 0.18)),
    t0: opts.t0 ?? 0, // time gravity "lets go" (for grounded objects)
    ph: R(0, 6.28), bob: opts.bob ?? R(0.05, 0.25), update: opts.update,
  };
  floaters.push(f); return f;
}
function floaterAt(f, t) {
  // gravity release ramps in smoothly over ~2.5 s after t0
  const tt = Math.max(0, t - f.t0);
  const ramp = tt < 2.5 ? (tt * tt) / 5 : tt - 1.25; // integrated velocity of a smooth start
  f.obj.position.set(
    f.p0.x + f.v.x * ramp,
    f.p0.y + f.v.y * ramp + Math.sin(t * 0.7 + f.ph) * f.bob * smooth(tt),
    f.p0.z + f.v.z * ramp);
  f.obj.rotation.set(f.r0.x + f.w.x * ramp, f.r0.y + f.w.y * ramp, f.r0.z + f.w.z * ramp);
  if (f.update) f.update(t, tt);
}

// cars
const carColors = ['#d8342c', '#f2b632', '#2f6fd6', '#f4f1ea', '#1f2a36', '#3aa37a', '#e86f2c', '#8e44ad', '#5bc0de', '#c0c6cc'];
function makeCar(color, kind = pick(['sedan', 'hatch', 'taxi', 'van'])) {
  if (kind === 'taxi') color = '#f4c430';
  const L = kind === 'van' ? 5.2 : kind === 'hatch' ? 3.9 : 4.6, Wd = 1.85;
  const parts = [];
  const bodyH = kind === 'van' ? 1.6 : 0.75;
  parts.push(part(new THREE.BoxGeometry(Wd, bodyH, L), color, 0, 0.45 + bodyH / 2, 0));
  if (kind !== 'van') parts.push(part(new THREE.BoxGeometry(Wd * 0.9, 0.62, L * (kind === 'hatch' ? 0.55 : 0.5)), color, 0, 1.12 + 0.3, kind === 'hatch' ? -0.35 : -0.15));
  const glassC = '#20324a';
  const cabY = kind === 'van' ? 1.65 : 1.42, cabL = kind === 'van' ? L * 0.9 : L * (kind === 'hatch' ? 0.56 : 0.51);
  parts.push(part(new THREE.BoxGeometry(Wd * 0.92, kind === 'van' ? 0.6 : 0.5, cabL * 0.96), glassC, 0, cabY, kind === 'van' ? 0.05 : kind === 'hatch' ? -0.35 : -0.15));
  if (kind === 'van') parts.push(part(new THREE.BoxGeometry(Wd * 1.01, 0.62, cabL * 0.7), color, 0, cabY, -0.6));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    parts.push(part(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 16), '#1b1b1d', sx * Wd / 2, 0.38, sz * L * 0.32, 0, 0, Math.PI / 2));
    parts.push(part(new THREE.CylinderGeometry(0.2, 0.2, 0.28, 10), '#c9ccd1', sx * Wd / 2, 0.38, sz * L * 0.32, 0, 0, Math.PI / 2));
  }
  for (const sx of [-1, 1]) {
    parts.push(part(new THREE.BoxGeometry(0.35, 0.16, 0.05), '#fff6d8', sx * 0.6, 0.85, L / 2 + 0.01));
    parts.push(part(new THREE.BoxGeometry(0.35, 0.14, 0.05), '#c4161c', sx * 0.65, 0.88, -L / 2 - 0.01));
  }
  parts.push(part(new THREE.BoxGeometry(Wd * 1.02, 0.18, 0.12), '#2a2a2c', 0, 0.5, L / 2));
  parts.push(part(new THREE.BoxGeometry(Wd * 1.02, 0.18, 0.12), '#2a2a2c', 0, 0.5, -L / 2));
  if (kind === 'taxi') parts.push(part(new THREE.BoxGeometry(0.7, 0.2, 0.3), '#fff2c0', 0, 1.82, -0.15));
  const g = mergeGeometries(parts); g.translate(0, -0.9, 0);
  return new THREE.Mesh(g, vcShiny);
}
function makeBike(color) {
  const parts = [];
  for (const z of [-0.55, 0.55]) {
    parts.push(part(new THREE.TorusGeometry(0.34, 0.035, 8, 28), '#1d1d1f', 0, 0, z, 0, Math.PI / 2, 0));
    parts.push(part(new THREE.CylinderGeometry(0.03, 0.03, 0.66, 6), '#bbbbbb', 0, 0, z, Math.PI / 2, 0, 0));
  }
  const tube = (a, b, r = 0.03) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), len = A.distanceTo(B);
    const g = colored(new THREE.CylinderGeometry(r, r, len, 6), color);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    g.applyMatrix4(new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
    parts.push(g);
  };
  tube([0, 0, -0.55], [0, 0.05, 0]); tube([0, 0.05, 0], [0, 0.5, -0.15]); tube([0, 0.5, -0.15], [0, 0, -0.55]);
  tube([0, 0.05, 0], [0, 0.55, 0.4]); tube([0, 0.5, -0.15], [0, 0.55, 0.4]); tube([0, 0.55, 0.4], [0, 0, 0.55]);
  tube([0, 0.55, 0.4], [0, 0.78, 0.45]);
  tube([-0.25, 0.8, 0.45], [0.25, 0.8, 0.45], 0.025);
  parts.push(part(new THREE.BoxGeometry(0.14, 0.06, 0.28), '#222222', 0, 0.6, -0.17));
  const g = mergeGeometries(parts); g.translate(0, -0.3, 0);
  return new THREE.Mesh(g, vcShiny);
}
// people with surprised faces
const skinTones = ['#f2c9a5', '#e0ac85', '#c68a62', '#8d5a3b', '#f6d7bd', '#a8704c'];
const shirtCols = ['#e94f37', '#3f88c5', '#f6ae2d', '#44bba4', '#e2e2e2', '#7b4b94', '#ff7aa2', '#2d3047', '#9bc53d', '#f08a4b'];
const pantsCols = ['#2d3047', '#3a506b', '#6b4f3a', '#1f1f24', '#5c6b73', '#c2b280'];
const hairCols = ['#2b1d14', '#4a3020', '#d9b26b', '#9c4a24', '#151515', '#7a7a7a'];
const capsule = (r, l, col) => colored(new THREE.CapsuleGeometry(r, l, 6, 14), col);
function makePerson(opts = {}) {
  const skin = opts.skin || pick(skinTones), shirt = opts.shirt || pick(shirtCols), pants = opts.pants || pick(pantsCols), hair = opts.hair || pick(hairCols);
  const dress = opts.dress ?? rnd() > 0.7;
  const root = new THREE.Group();
  // torso + head merged (static)
  const bp = [];
  bp.push(place(capsule(0.2, 0.42, shirt), 0, 0.15, 0, 0, 0, 0, 1, 1, 0.75));
  if (dress) bp.push(part(new THREE.ConeGeometry(0.34, 0.6, 16, 1, true), shirt, 0, -0.18, 0));
  bp.push(part(new THREE.CylinderGeometry(0.07, 0.08, 0.14, 10), skin, 0, 0.55, 0));
  // head (slightly big, animated-film proportions)
  const HY = 0.82;
  bp.push(part(new THREE.SphereGeometry(0.25, 28, 20), skin, 0, HY, 0, 0, 0, 0, 1, 1.08, 1));
  bp.push(part(new THREE.SphereGeometry(0.06, 10, 8), skin, 0, HY - 0.02, 0.25)); // nose
  for (const s of [-1, 1]) bp.push(part(new THREE.SphereGeometry(0.055, 10, 8), skin, s * 0.25, HY, 0, 0, 0, 0, 0.6, 1, 1)); // ears
  // hair: back/top cap
  const hairStyle = opts.hairStyle || pick(['cap', 'bun', 'long', 'curly', 'short']);
  bp.push(part(new THREE.SphereGeometry(0.265, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.42), hair, 0, HY + 0.02, -0.01, -0.35, 0, 0, 1, 1.05, 1));
  bp.push(part(new THREE.SphereGeometry(0.262, 24, 16, 0, Math.PI, 0, Math.PI * 0.7), hair, 0, HY + 0.01, -0.02, 0, Math.PI / 2, 0, 1, 1.06, 1));
  if (hairStyle === 'bun') bp.push(part(new THREE.SphereGeometry(0.11, 14, 10), hair, 0, HY + 0.22, -0.16));
  if (hairStyle === 'long') bp.push(part(new THREE.BoxGeometry(0.46, 0.42, 0.14), hair, 0, HY - 0.18, -0.15));
  if (hairStyle === 'curly') for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; bp.push(part(new THREE.SphereGeometry(0.09, 10, 8), hair, Math.cos(a) * 0.2, HY + 0.14 + Math.sin(a * 2) * 0.03, Math.sin(a) * 0.2 - 0.04)); }
  // face — surprised: big eyes, tiny pupils, raised brows, round open mouth
  for (const s of [-1, 1]) {
    bp.push(part(new THREE.SphereGeometry(0.07, 16, 12), '#fbfbf8', s * 0.095, HY + 0.05, 0.205, 0, 0, 0, 1, 1.25, 0.6));
    bp.push(part(new THREE.SphereGeometry(0.032, 12, 10), '#2a1e16', s * 0.093, HY + 0.05, 0.245, 0, 0, 0, 1, 1.15, 0.5));
    bp.push(part(new THREE.SphereGeometry(0.012, 6, 6), '#ffffff', s * 0.085, HY + 0.07, 0.262));
    bp.push(part(new THREE.BoxGeometry(0.1, 0.022, 0.03), hair, s * 0.1, HY + 0.185, 0.215, 0, 0, s * -0.28));
    bp.push(part(new THREE.SphereGeometry(0.04, 10, 8), '#f29c9c', s * 0.15, HY - 0.06, 0.19, 0, 0, 0, 1, 0.6, 0.3)); // blush
  }
  bp.push(part(new THREE.SphereGeometry(0.055, 14, 12), '#5a1f22', 0, HY - 0.12, 0.215, 0, 0, 0, 0.85, 1.15, 0.5));
  bp.push(part(new THREE.SphereGeometry(0.03, 10, 8), '#c94c5a', 0, HY - 0.145, 0.235, 0, 0, 0, 1, 0.6, 0.4)); // tongue
  if (hairStyle === 'cap') {
    const capC = pick(['#d23c3c', '#2d5fa8', '#1f1f1f', '#e8b630']);
    bp.push(part(new THREE.SphereGeometry(0.275, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), capC, 0, HY + 0.03, 0));
    bp.push(part(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 20, 1, false, -Math.PI / 2, Math.PI), capC, 0, HY + 0.1, 0.17, 0.25, 0, 0));
  }
  const body = new THREE.Mesh(mergeGeometries(bp), skinMat);
  root.add(body);
  // limbs with pivots
  const limb = (len, r, col, endCol, endGeo) => {
    const piv = new THREE.Group();
    const lp = [place(capsule(r, len, col), 0, -len / 2 - r * 0.5, 0)];
    lp.push(endGeo(endCol, -len - r * 1.2));
    piv.add(new THREE.Mesh(mergeGeometries(lp), skinMat));
    return piv;
  };
  const hand = (c, y) => part(new THREE.SphereGeometry(0.065, 12, 10), c, 0, y, 0);
  const shoe = (c, y) => part(new THREE.BoxGeometry(0.13, 0.09, 0.26), c, 0, y + 0.02, 0.05);
  const arms = [], legs = [];
  for (const s of [-1, 1]) {
    const a = limb(0.42, 0.06, shirt, skin, hand); a.position.set(s * 0.24, 0.42, 0); root.add(a); arms.push(a);
    const l = limb(0.5, 0.08, dress ? skin : pants, pick(['#222', '#f4f4f4', '#8b3a2a', '#c0392b']), shoe); l.position.set(s * 0.1, -0.1, 0); root.add(l); legs.push(l);
  }
  const ph = R(0, 6.28), sp = R(0.8, 1.4);
  root.userData.animate = (t, amt = 1) => {
    // arms flung up in surprise, slow swimming flail; legs pedal gently
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      arms[i].rotation.z = s * (2.2 + 0.35 * Math.sin(t * sp * 1.7 + ph + i)) * amt + s * 0.1;
      arms[i].rotation.x = 0.3 * Math.sin(t * sp + ph + i * 1.3);
      legs[i].rotation.x = 0.45 * Math.sin(t * sp * 1.2 + ph + i * Math.PI) * amt + 0.15;
      legs[i].rotation.z = s * 0.18 * amt;
    }
  };
  root.userData.animate(0, 1);
  return root;
}
// small things
function makeSmall(kind) {
  let g;
  switch (kind) {
    case 'paper': g = part(new THREE.PlaneGeometry(0.3, 0.42, 3, 3), '#f7f5ee'); { const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 9) * 0.03); } break;
    case 'ball': g = part(new THREE.SphereGeometry(0.22, 16, 12), pick(['#e94f37', '#f6ae2d', '#3f88c5', '#ffffff'])); break;
    case 'balloon': return (() => {
      const grp = new THREE.Group();
      grp.add(new THREE.Mesh(part(new THREE.SphereGeometry(0.35, 18, 14), pick(['#ff4d6d', '#ffd23f', '#3ec1d3', '#9b5de5', '#00bb7f']), 0, 0, 0, 0, 0, 0, 1, 1.2, 1), vcShiny));
      grp.add(new THREE.Mesh(part(new THREE.CylinderGeometry(0.005, 0.005, 1.2, 4), '#dddddd', 0, -1.0, 0), vcMat)); return grp; })();
    case 'box': g = part(new THREE.BoxGeometry(0.6, 0.45, 0.5), '#c49a6c'); break;
    case 'bin': g = merge([part(new THREE.CylinderGeometry(0.32, 0.28, 0.95, 14), '#3d6b4f'), part(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 14), '#2c4c39', 0, 0.5, 0)]); break;
    case 'umbrella': g = merge([part(new THREE.ConeGeometry(0.8, 0.35, 10, 1, true), pick(['#d7263d', '#1b998b', '#f46036', '#2e294e']), 0, 0.5, 0), part(new THREE.CylinderGeometry(0.015, 0.015, 1.1, 5), '#333', 0, 0, 0)]); break;
    case 'bench': g = merge([part(new THREE.BoxGeometry(1.8, 0.08, 0.5), '#8b5a2b', 0, 0.45, 0), part(new THREE.BoxGeometry(1.8, 0.4, 0.06), '#8b5a2b', 0, 0.75, -0.24), part(new THREE.BoxGeometry(0.08, 0.45, 0.45), '#333', -0.8, 0.22, 0), part(new THREE.BoxGeometry(0.08, 0.45, 0.45), '#333', 0.8, 0.22, 0)]); break;
    case 'hydrant': g = merge([part(new THREE.CylinderGeometry(0.16, 0.18, 0.7, 12), '#d62828'), part(new THREE.SphereGeometry(0.17, 12, 8), '#d62828', 0, 0.35, 0), part(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 8), '#d62828', 0, 0.1, 0, 0, 0, Math.PI / 2)]); break;
    case 'cup': g = part(new THREE.CylinderGeometry(0.06, 0.045, 0.16, 12), '#f2efe6'); break;
    case 'book': g = merge([part(new THREE.BoxGeometry(0.24, 0.04, 0.32), pick(['#2b59c3', '#c3342b', '#2b9348']), 0, 0, 0), part(new THREE.BoxGeometry(0.23, 0.036, 0.31), '#f4f0e4', 0.006, 0, 0)]); break;
    case 'plant': g = merge([part(new THREE.CylinderGeometry(0.2, 0.15, 0.3, 12), '#b5562f'), part(new THREE.IcosahedronGeometry(0.3, 1), '#4f9a3f', 0, 0.35, 0)]); break;
    case 'dog': return makeDog();
    default: g = part(new THREE.BoxGeometry(0.3, 0.3, 0.3), '#888');
  }
  const m = new THREE.Mesh(g, vcMat); if (kind === 'paper') m.material = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.9 });
  return m;
}
function makeDog() {
  const c = pick(['#c8955f', '#f1e3c8', '#3b2f2a', '#8a5a3b']);
  const p = [
    part(new THREE.CapsuleGeometry(0.17, 0.4, 6, 12), c, 0, 0, 0, Math.PI / 2, 0, 0),
    part(new THREE.SphereGeometry(0.17, 14, 12), c, 0, 0.12, 0.38),
    part(new THREE.SphereGeometry(0.08, 10, 8), c, 0, 0.08, 0.53),
    part(new THREE.SphereGeometry(0.03, 8, 6), '#1a1a1a', 0, 0.1, 0.61),
    part(new THREE.SphereGeometry(0.04, 8, 6), '#fbfbf8', -0.07, 0.19, 0.51), part(new THREE.SphereGeometry(0.04, 8, 6), '#fbfbf8', 0.07, 0.19, 0.51),
    part(new THREE.SphereGeometry(0.02, 8, 6), '#111', -0.07, 0.19, 0.545), part(new THREE.SphereGeometry(0.02, 8, 6), '#111', 0.07, 0.19, 0.545),
    part(new THREE.SphereGeometry(0.03, 8, 6), '#6a1f24', 0, 0.02, 0.56, 0, 0, 0, 1, 1.3, 0.6),
    part(new THREE.BoxGeometry(0.06, 0.16, 0.1), c, -0.12, 0.25, 0.33, 0, 0, 0.5), part(new THREE.BoxGeometry(0.06, 0.16, 0.1), c, 0.12, 0.25, 0.33, 0, 0, -0.5),
    part(new THREE.CylinderGeometry(0.025, 0.02, 0.25, 6), c, 0, 0.1, -0.35, -0.8, 0, 0),
  ];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.push(part(new THREE.CylinderGeometry(0.045, 0.04, 0.3, 8), c, sx * 0.1, -0.18, sz * 0.2, sz * 0.4, 0, sx * 0.3));
  return new THREE.Mesh(mergeGeometries(p), vcMat);
}

// ---------- camera path ----------
// Act 1 (0-4 s): street level, gravity lets go. Act 2 (4-10 s): crane up past a floating
// woman who turns to us, mouth open. Act 3 (10-16 s): rise over the rooftops, reveal sky full of drift.
const camKeys = [
  [0.0, [1.5, 1.5, 22], [0.0, 2.2, 6]],
  [3.5, [1.0, 2.6, 15], [-0.5, 4.5, 2]],
  [6.5, [-1.2, 9.5, 6], [-2.0, 12.5, -6]],
  [9.0, [-2.6, 22, -6], [-1.0, 28, -30]],
  [12.5, [-1.5, 58, -28], [8.0, 70, -140]],
  [16.0, [2.0, 112, -58], [18.0, 112, -260]],
];
const posCurve = new THREE.CatmullRomCurve3(camKeys.map(k => new THREE.Vector3(...k[1])), false, 'centripetal');
const lookCurve = new THREE.CatmullRomCurve3(camKeys.map(k => new THREE.Vector3(...k[2])), false, 'centripetal');
function camU(t) {
  // map time to curve parameter through key times, eased overall
  const te = DURATION * (0.5 * ease(t / DURATION) + 0.5 * (t / DURATION));
  for (let i = 0; i < camKeys.length - 1; i++) {
    const a = camKeys[i][0], b = camKeys[i + 1][0];
    if (te <= b) return (i + (te - a) / (b - a)) / (camKeys.length - 1);
  }
  return 1;
}
const camPosAt = (t) => posCurve.getPoint(clamp(camU(t)));
const camLookAt = (t) => lookCurve.getPoint(clamp(camU(t)));
function frameRel(t, right, up, fwd) {
  const p = camPosAt(t), l = camLookAt(t);
  const f = l.clone().sub(p).normalize(), r = f.clone().cross(new THREE.Vector3(0, 1, 0)).normalize(), u = r.clone().cross(f);
  return p.add(r.multiplyScalar(right)).add(u.multiplyScalar(up)).add(f.multiplyScalar(fwd));
}

// ---------- populate ----------
// Hero moments placed relative to the camera path so they frame correctly.
// 1) The car right in front of us lifts off the road.
{
  const car = makeCar('#d8342c', 'sedan');
  addFloater(car, new THREE.Vector3(-1.8, 0.9, 6), { t0: 0.4, v: new THREE.Vector3(0.05, 0.75, 0.05), r0: new THREE.Euler(0, 0.25, 0), w: new THREE.Vector3(0.05, 0.03, -0.09), bob: 0 });
  const taxi = makeCar('#f4c430', 'taxi');
  addFloater(taxi, new THREE.Vector3(3.6, 0.9, 0), { t0: 0.9, v: new THREE.Vector3(-0.05, 0.6, 0), r0: new THREE.Euler(0, -0.15, 0), w: new THREE.Vector3(-0.07, 0.04, 0.06), bob: 0 });
  const bus = makeCar('#2f6fd6', 'van');
  addFloater(bus, new THREE.Vector3(-4, 0.9, -12), { t0: 0.2, v: new THREE.Vector3(0.0, 0.9, 0.1), r0: new THREE.Euler(0, 0.1, 0), w: new THREE.Vector3(0.04, -0.02, 0.05), bob: 0 });
  // a man on the sidewalk lifting off with his bike
  const man = makePerson({ shirt: '#3f88c5', hairStyle: 'cap', dress: false });
  addFloater(man, new THREE.Vector3(5.2, 1.0, 10), { t0: 0.0, v: new THREE.Vector3(-0.08, 0.65, 0.05), r0: new THREE.Euler(0, -0.9, 0), w: new THREE.Vector3(0.03, 0.06, 0.12), bob: 0.05, update: (t, tt) => man.userData.animate(t, smooth(tt / 1.5)) });
  const bike = makeBike('#e94f37');
  addFloater(bike, new THREE.Vector3(5.8, 0.4, 11), { t0: 0.1, v: new THREE.Vector3(0.05, 0.55, 0.02), r0: new THREE.Euler(0, 0.6, 0), w: new THREE.Vector3(0.12, 0.08, 0.2), bob: 0 });
  const dog = makeDog();
  addFloater(dog, new THREE.Vector3(-6.3, 0.45, 13), { t0: 0.6, v: new THREE.Vector3(0.06, 0.5, -0.03), r0: new THREE.Euler(0, 0.9, 0), w: new THREE.Vector3(0.1, 0.15, 0.2), bob: 0 });
  // papers and cups swirling up from the sidewalk near the camera
  for (let i = 0; i < 40; i++) {
    const k = pick(['paper', 'paper', 'paper', 'cup', 'book', 'ball']);
    addFloater(makeSmall(k), new THREE.Vector3(R(-7, 7), R(0.2, 3.5), R(-6, 18)), { t0: R(0, 1.5), v: new THREE.Vector3(R(-0.3, 0.3), R(0.4, 1.4), R(-0.3, 0.3)), w: new THREE.Vector3(R(-1, 1), R(-1, 1), R(-1, 1)) });
  }
}
// 2) Hero woman at ~7.3 s: close to camera, turning to face it.
{
  const T = 7.3;
  const pos = frameRel(T, 0.35, -0.55, 4.0);
  const woman = makePerson({ shirt: '#ff7aa2', hair: '#2b1d14', hairStyle: 'curly', dress: true, skin: '#c68a62' });
  const camP = camPosAt(T);
  const f = addFloater(woman, pos, { t0: -20, v: new THREE.Vector3(0.0, 0.35, 0.0), bob: 0.06, w: new THREE.Vector3(0, 0, 0) });
  f.p0.y -= 0.35 * (T + 20 - 1.25); // so she is at pos at time T
  f.update = (t) => {
    woman.userData.animate(t, 1);
    // slowly rotates to look at the camera, with a gentle tilt
    const cp = camPosAt(t);
    const yawTo = Math.atan2(cp.x - woman.position.x, cp.z - woman.position.z);
    const k = smooth((t - 4.5) / 3.0);
    woman.rotation.set(0.25 * Math.sin(t * 0.5), yawTo - (1 - k) * 1.8, -0.18 + 0.1 * Math.sin(t * 0.7));
  };
  void camP;
  // her friend and a floating umbrella nearby
  const friend = makePerson({ shirt: '#f6ae2d', hairStyle: 'short', dress: false });
  addFloater(friend, frameRel(T, -1.6, 1.4, 6.5).sub(new THREE.Vector3(0, 0.3 * (T + 20 - 1.25), 0)), { t0: -20, v: new THREE.Vector3(0.02, 0.3, 0), r0: new THREE.Euler(0.3, 2.4, 0.5), w: new THREE.Vector3(0.05, 0.12, 0.08), update: (t) => friend.userData.animate(t, 1) });
  addFloater(makeSmall('umbrella'), frameRel(T, 1.9, -1.2, 5).sub(new THREE.Vector3(0, 0.25 * (T + 20 - 1.25), 0)), { t0: -20, v: new THREE.Vector3(0, 0.25, 0), w: new THREE.Vector3(0.2, 0.3, 0.1) });
}
// 3) Crowd of everything already drifting at all heights along the avenue (been floating a while).
const pastStart = -30; // these released 30 s before the film starts
function scatter(n, make, region) {
  for (let i = 0; i < n; i++) {
    const p = new THREE.Vector3(R(region.x[0], region.x[1]), R(region.y[0], region.y[1]), R(region.z[0], region.z[1]));
    const v = new THREE.Vector3(R(-0.2, 0.2), R(0.15, 0.6), R(-0.2, 0.2));
    const obj = make();
    const target = p.clone();
    // set p0 so object is at `target` around t=8 s
    const p0 = target.clone().sub(v.clone().multiplyScalar(8 - pastStart - 1.25));
    const f = addFloater(obj, p0, { t0: pastStart, v, update: obj.userData.animate ? (t) => obj.userData.animate(t, 1) : undefined });
    void f;
  }
}
const avenue = { x: [-10, 10], y: [3, 40], z: [-60, 10] };
// keep a clear tube along the camera path so nothing hits the lens
function scatterClear(n, make, region, minD = 3.5) {
  let placed = 0, guard = 0;
  while (placed < n && guard++ < n * 20) {
    const p = new THREE.Vector3(R(region.x[0], region.x[1]), R(region.y[0], region.y[1]), R(region.z[0], region.z[1]));
    let ok = true;
    for (let s = 0; s <= 40 && ok; s++) if (posCurve.getPoint(s / 40).distanceTo(p) < minD) ok = false;
    if (!ok) continue;
    const v = new THREE.Vector3(R(-0.2, 0.2), R(0.15, 0.55), R(-0.2, 0.2));
    const obj = make();
    const p0 = p.clone().sub(v.clone().multiplyScalar(8 - pastStart - 1.25));
    addFloater(obj, p0, { t0: pastStart, v, update: obj.userData.animate ? (t) => obj.userData.animate(t, 1) : undefined });
    placed++;
  }
}
scatterClear(26, () => makePerson(), avenue, 3.5);
scatterClear(16, () => makeCar(pick(carColors)), { x: [-12, 12], y: [6, 60], z: [-90, 0] }, 6);
scatterClear(14, () => makeBike(pick(carColors)), avenue, 3);
scatterClear(60, () => makeSmall(pick(['paper', 'paper', 'balloon', 'balloon', 'ball', 'box', 'bin', 'umbrella', 'bench', 'hydrant', 'book', 'plant', 'dog', 'cup'])), avenue, 2.5);
// higher, farther layer for the reveal
const high = { x: [-40, 50], y: [50, 140], z: [-220, -40] };
scatterClear(40, () => makePerson(), high, 6);
scatterClear(34, () => makeCar(pick(carColors)), high, 10);
scatterClear(16, () => makeBike(pick(carColors)), high, 6);
scatterClear(60, () => makeSmall(pick(['balloon', 'balloon', 'umbrella', 'box', 'bench', 'paper', 'bin', 'dog', 'plant'])), high, 5);
// cars that are just starting to lift off further down the avenue (gravity wave travels away)
for (let i = 0; i < 26; i++) {
  const lane = pick([-6, -2, 2, 6]), z = R(-260, -20);
  addFloater(makeCar(pick(carColors)), new THREE.Vector3(lane, 0.9, z), { t0: R(0, 6), v: new THREE.Vector3(R(-0.1, 0.1), R(0.4, 1.0), R(-0.1, 0.1)), r0: new THREE.Euler(0, lane < 0 ? 0 : Math.PI, 0), w: new THREE.Vector3(R(-0.06, 0.06), R(-0.04, 0.04), R(-0.06, 0.06)), bob: 0 });
}
// a few sidewalk crowds on the far avenue lifting off too
for (let i = 0; i < 20; i++) {
  const s = pick([-1, 1]);
  const pp = makePerson();
  addFloater(pp, new THREE.Vector3(s * R(9, 12), 1.0, R(-200, -20)), { t0: R(0, 6), v: new THREE.Vector3(R(-0.1, 0.1), R(0.4, 0.8), R(-0.1, 0.1)), update: (t, tt) => pp.userData.animate(t, smooth(tt / 1.5)) });
}

// ---------- post ----------
const composer = new EffectComposer(renderer);
composer.setPixelRatio(1); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.35, 0.6, 0.92);
composer.addPass(bloom);
composer.addPass(new OutputPass());
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, fade: { value: 1 }, time: { value: 0 }, res: { value: new THREE.Vector2(W, H) } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float fade; uniform float time; uniform vec2 res; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + time*7.13) * 43758.5453); }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      // gentle cinematic grade: warm highlights, teal-ish shadows, slight contrast
      float l = dot(c.rgb, vec3(0.299,0.587,0.114));
      c.rgb = mix(c.rgb, c.rgb*vec3(1.04,1.0,0.94), smoothstep(0.4,1.0,l));
      c.rgb = mix(c.rgb, c.rgb*vec3(0.94,1.0,1.06), 1.0-smoothstep(0.0,0.5,l));
      c.rgb = (c.rgb-0.5)*1.06+0.5;
      vec2 q = vUv-0.5; q.x *= res.x/res.y;
      c.rgb *= 1.0 - 0.38*smoothstep(0.35, 0.95, length(q)*1.25);
      c.rgb += (h(vUv*res)-0.5)*0.018;
      gl_FragColor = vec4(c.rgb*fade, 1.0);
    }`,
});
composer.addPass(grade);

// ---------- frame ----------
window.FRAMES = FRAMES;
window.renderFrame = (f) => {
  const t = f / FPS;
  for (const fl of floaters) floaterAt(fl, t);
  for (const c of clouds) c.position.x += 0; // positions set below (deterministic)
  clouds.forEach((c, i) => { if (c.userData.x0 === undefined) c.userData.x0 = c.position.x; c.position.x = c.userData.x0 + c.userData.v * t; void i; });
  const p = camPosAt(t), l = camLookAt(t);
  camera.position.copy(p);
  camera.up.set(Math.sin(t * 0.35) * 0.02, 1, 0); // tiny handheld-crane roll
  camera.lookAt(l);
  camera.fov = 52 - 8 * smooth((t - 5.5) / 2.5) + 10 * smooth((t - 10) / 5);
  camera.updateProjectionMatrix();
  // shadow camera follows the viewer
  const sp = p.clone().add(l.clone().sub(p).normalize().multiplyScalar(18));
  sun.target.position.copy(sp); sun.position.copy(sp).add(SUN_DIR.clone().multiplyScalar(200));
  grade.uniforms.fade.value = smooth(t / 0.8) * (1 - smooth((t - (DURATION - 0.9)) / 0.9));
  grade.uniforms.time.value = f;
  composer.render();
  return true;
};
window.__scene = scene; window.ready = true;
if (!params.has('render')) { // live preview
  let f = +(params.get('f') || 0);
  const loop = () => { window.renderFrame(f); f = (f + 1) % FRAMES; requestAnimationFrame(loop); };
  if (params.has('still')) window.renderFrame(f); else loop();
}
