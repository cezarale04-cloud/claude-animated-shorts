// Franklin, the curiosity scientist — deterministic three.js presenter film, 1080x1920, 30 fps.
// window.renderFrame(f) draws frame f. Timing comes from timing.json / mouth.json (voice.py).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const params = new URLSearchParams(location.search);
const W = +(params.get('w') || 1080), H = +(params.get('h') || 1920);
const FPS = 30;
const MOUTH = await (await fetch('./mouth.json')).json();
const TIMING = await (await fetch('./timing.json')).json();
const DURATION = TIMING.duration;
const FRAMES = Math.ceil(DURATION * FPS);

// ---------- helpers ----------
let seed = 7;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const R = (a, b) => a + (b - a) * rnd();
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const ease = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const backOut = (x) => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

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
const S = (r, ws = 24, hs = 18) => new THREE.SphereGeometry(r, ws, hs);
const mat = (o = {}) => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, ...o });
const M = { base: mat(), cloth: mat({ roughness: 0.85 }), skin: mat({ roughness: 0.55 }), shiny: mat({ roughness: 0.2, metalness: 0.2 }), hair: mat({ roughness: 0.95 }) };
const mesh = (parts, m = M.base) => { const x = new THREE.Mesh(mergeGeometries(parts), m); x.castShadow = true; x.receiveShadow = true; return x; };

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1d2a33);
scene.fog = new THREE.Fog(0x1d2a33, 4, 11);
const camera = new THREE.PerspectiveCamera(36, W / H, 0.05, 50);

// environment for reflections (glass, lenses)
{
  const pm = new THREE.PMREMGenerator(renderer);
  const es = new THREE.Scene();
  es.add(new THREE.Mesh(new THREE.SphereGeometry(10, 16, 8), new THREE.MeshBasicMaterial({ color: 0x2a3a44, side: THREE.BackSide })));
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffe2b0 })); lamp.position.set(-4, 6, 4); es.add(lamp);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: 0xbfe0ff, side: THREE.DoubleSide })); win.position.set(6, 3, -4); win.lookAt(0, 0, 0); es.add(win);
  scene.environment = pm.fromScene(es, 0.04).texture;
  scene.environmentIntensity = 0.6;
}

// lights
scene.add(new THREE.HemisphereLight(0xbcd8e8, 0x4a3a2e, 0.55));
const key = new THREE.SpotLight(0xffe4c4, 9, 12, 0.6, 0.6, 1.4);
key.position.set(-1.6, 3.4, 2.6); key.target.position.set(0, 1.4, 0);
key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02;
scene.add(key, key.target);
const rim = new THREE.DirectionalLight(0x8fd0ff, 2.2); rim.position.set(2.5, 2.8, -2.5); scene.add(rim);
const fillL = new THREE.PointLight(0xff9a5c, 3.5, 5, 1.6); fillL.position.set(1.3, 1.2, 1.4); scene.add(fillL);

// ---------- textures ----------
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
// chalkboard: diagrams only, no lettering
const boardTex = canvasTex(1024, 640, (g, w, h) => {
  g.fillStyle = '#23402f'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(255,255,255,${R(0, 0.04)})`; g.fillRect(R(0, w), R(0, h), R(1, 6), R(1, 3)); }
  g.strokeStyle = 'rgba(240,240,230,0.85)'; g.lineWidth = 4; g.lineCap = 'round';
  // atom
  const cx = 230, cy = 230;
  for (let k = 0; k < 3; k++) { g.save(); g.translate(cx, cy); g.rotate(k * Math.PI / 3); g.beginPath(); g.ellipse(0, 0, 150, 52, 0, 0, Math.PI * 2); g.stroke(); g.restore(); }
  g.beginPath(); g.arc(cx, cy, 16, 0, Math.PI * 2); g.fillStyle = 'rgba(240,240,230,0.85)'; g.fill();
  // sine wave + axes
  g.beginPath(); g.moveTo(470, 140); g.lineTo(470, 340); g.lineTo(940, 340); g.stroke();
  g.beginPath(); for (let x = 0; x <= 460; x += 4) g.lineTo(474 + x, 240 - 80 * Math.sin(x / 40) * Math.exp(-x / 500)); g.stroke();
  // triangle with angle arc
  g.beginPath(); g.moveTo(120, 560); g.lineTo(380, 560); g.lineTo(380, 420); g.closePath(); g.stroke();
  g.beginPath(); g.arc(120, 560, 60, -0.49, 0); g.stroke();
  g.strokeRect(355, 535, 25, 25);
  // molecule
  const pts = [[620, 480], [700, 440], [780, 480], [780, 560], [700, 600], [620, 560]];
  g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); g.stroke();
  pts.forEach(p => { g.beginPath(); g.arc(p[0], p[1], 12, 0, Math.PI * 2); g.stroke(); });
  g.beginPath(); g.moveTo(780, 480); g.lineTo(860, 440); g.stroke(); g.beginPath(); g.arc(872, 434, 12, 0, Math.PI * 2); g.stroke();
  // planet with ring
  g.strokeStyle = 'rgba(255,214,120,0.8)';
  g.beginPath(); g.arc(560, 560, 0, 0, 1); g.stroke();
  g.beginPath(); g.arc(930, 560, 40, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.ellipse(930, 560, 70, 16, -0.3, 0, Math.PI * 2); g.stroke();
  // arrows
  g.strokeStyle = 'rgba(140,210,255,0.8)';
  g.beginPath(); g.moveTo(400, 230); g.lineTo(455, 230); g.moveTo(440, 215); g.lineTo(455, 230); g.lineTo(440, 245); g.stroke();
});
const woodTex = canvasTex(512, 256, (g, w, h) => {
  g.fillStyle = '#8a5a36'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(${R(40, 90)},${R(20, 45)},10,${R(0.15, 0.4)})`; g.lineWidth = R(1, 4); g.beginPath(); const y = R(0, h); g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + 6 * Math.sin(x / R(30, 80) + i)); g.stroke(); }
});
const wallTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#2f4d55'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 64) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x, 0, 4, h); g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(x + 4, 0, 2, h); }
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(255,255,255,${R(0, 0.03)})`; g.fillRect(R(0, w), R(0, h), 2, 2); }
});
wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping; wallTex.repeat.set(4, 2);

// ---------- lab set ----------
{
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 }));
  wall.position.set(0, 2.2, -2.4); wall.receiveShadow = true; scene.add(wall);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), new THREE.MeshStandardMaterial({ color: 0x3b3430, roughness: 0.8 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  // chalkboard behind, slightly to screen right
  const frame = mesh([part(new THREE.BoxGeometry(2.3, 1.5, 0.06), '#6b4a2e')]); frame.position.set(0.55, 2.15, -2.33); scene.add(frame);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(2.16, 1.36), new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.95 }));
  board.position.set(0.55, 2.15, -2.295); scene.add(board);
  // shelves with glowing jars, screen left
  const shelf = [];
  const jarGlow = [];
  for (let s = 0; s < 4; s++) {
    const y = 0.9 + s * 0.55;
    shelf.push(part(new THREE.BoxGeometry(1.3, 0.04, 0.3), '#6b4a2e', -1.55, y, -2.2));
    for (let j = 0; j < 5; j++) {
      const x = -2.1 + j * 0.27 + R(-0.04, 0.04), hgt = R(0.14, 0.3);
      if (rnd() > 0.5) { shelf.push(part(new THREE.BoxGeometry(0.06, hgt, 0.2), ['#a83232', '#2f5fa8', '#d9a441', '#3d7a4f'][j % 4], x, y + hgt / 2 + 0.02, -2.2)); continue; }
      const col = ['#3ef0c0', '#ff6ad5', '#ffd23f', '#5ab4ff', '#9bff6a'][(s * 5 + j) % 5];
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, hgt * 0.7, 14), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.6, roughness: 0.3 }));
      m.position.set(x, y + 0.02 + hgt * 0.35, -2.2); scene.add(m); jarGlow.push(m);
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, hgt, 14), new THREE.MeshStandardMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.18, roughness: 0.05 }));
      glass.position.set(x, y + 0.02 + hgt / 2, -2.2); scene.add(glass);
    }
  }
  scene.add(mesh(shelf));
  // hanging lamps
  for (const x of [-0.9, 0.9]) {
    scene.add(mesh([part(new THREE.CylinderGeometry(0.005, 0.005, 1.0, 4), '#222', x, 3.4, -0.9), part(new THREE.ConeGeometry(0.22, 0.2, 20, 1, true), '#2b5d4a', x, 2.85, -0.9)], M.shiny));
    const bulb = new THREE.Mesh(S(0.06), new THREE.MeshStandardMaterial({ color: 0xffe2a8, emissive: 0xffd08a, emissiveIntensity: 4 })); bulb.position.set(x, 2.78, -0.9); scene.add(bulb);
    const pl = new THREE.PointLight(0xffcf8f, 2.2, 4, 1.8); pl.position.set(x, 2.7, -0.9); scene.add(pl);
  }
  // round window with daylight, far right
  const win = new THREE.Mesh(new THREE.CircleGeometry(0.45, 40), new THREE.MeshStandardMaterial({ color: 0xbfe6ff, emissive: 0x9fd4ff, emissiveIntensity: 1.3 }));
  win.position.set(2.0, 2.5, -2.38); scene.add(win);
  scene.add(mesh([part(new THREE.TorusGeometry(0.47, 0.04, 10, 48), '#b08a4a', 2.0, 2.5, -2.36), part(new THREE.BoxGeometry(0.9, 0.025, 0.02), '#b08a4a', 2.0, 2.5, -2.36), part(new THREE.BoxGeometry(0.025, 0.9, 0.02), '#b08a4a', 2.0, 2.5, -2.36)], M.shiny));
  // plant in the corner
  const leaves = [part(new THREE.CylinderGeometry(0.16, 0.12, 0.3, 16), '#b5562f', 1.6, 0.15, -1.8)];
  for (let i = 0; i < 14; i++) { const a = i * 2.4, r = R(0.05, 0.2); leaves.push(part(S(0.09, 10, 8), ['#4f9a3f', '#5fae4b', '#3e8a35'][i % 3], 1.6 + Math.cos(a) * r, 0.4 + R(0, 0.5), -1.8 + Math.sin(a) * r, 0, a, 0.5, 0.6, 1.6, 0.4)); }
  scene.add(mesh(leaves));
  window.__jars = jarGlow;
}

// desk + props
const DESK_Y = 0.92;
const bubbles = [];
{
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.06, 0.75), new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.55 }));
  top.position.set(0, DESK_Y, 0.25); top.castShadow = top.receiveShadow = true; scene.add(top);
  const front = mesh([part(new THREE.BoxGeometry(1.86, 0.88, 0.04), '#5b3b24', 0, DESK_Y / 2, 0.6), part(new THREE.BoxGeometry(1.7, 0.02, 0.01), '#3e2816', 0, 0.6, 0.625)]);
  scene.add(front);
  // erlenmeyer flasks with glowing liquid
  const flask = (x, z, col, s = 1) => {
    const g = new THREE.Group();
    const liq = new THREE.Mesh(new THREE.ConeGeometry(0.085 * s, 0.11 * s, 24), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.4, roughness: 0.2 }));
    liq.position.y = 0.055 * s; g.add(liq);
    const glass = new THREE.Mesh(mergeGeometries([colored(new THREE.CylinderGeometry(0.025 * s, 0.1 * s, 0.17 * s, 24, 1, true), '#ffffff').translate(0, 0.085 * s, 0), colored(new THREE.CylinderGeometry(0.027 * s, 0.025 * s, 0.09 * s, 16, 1, true), '#ffffff').translate(0, 0.21 * s, 0)]),
      new THREE.MeshStandardMaterial({ color: 0xe6f6ff, transparent: true, opacity: 0.25, roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide }));
    g.add(glass); g.position.set(x, DESK_Y + 0.03, z); scene.add(g);
    const pl = new THREE.PointLight(col, 0.6, 0.8, 2); pl.position.set(x, DESK_Y + 0.15, z); scene.add(pl);
    for (let i = 0; i < 8; i++) {
      const b = new THREE.Mesh(S(0.008 * s + 0.004 * hash(i + x * 10), 8, 6), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 2, transparent: true, opacity: 0.85 }));
      b.userData = { x, z, s, ph: hash(i * 3.7 + x), sp: 0.6 + hash(i + 9.1 + x) * 0.6 }; scene.add(b); bubbles.push(b);
    }
  };
  flask(-0.62, 0.3, '#3ef0c0', 1.15); flask(0.66, 0.38, '#ff6ad5', 0.95); flask(0.48, 0.2, '#ffd23f', 0.75);
  // test tube rack
  const rack = [part(new THREE.BoxGeometry(0.34, 0.03, 0.08), '#7a5232', -0.32, DESK_Y + 0.1, 0.42), part(new THREE.BoxGeometry(0.34, 0.02, 0.08), '#7a5232', -0.32, DESK_Y + 0.04, 0.42)];
  for (const sx of [-0.16, 0.16]) rack.push(part(new THREE.BoxGeometry(0.02, 0.1, 0.08), '#7a5232', -0.32 + sx, DESK_Y + 0.08, 0.42));
  scene.add(mesh(rack));
  ['#5ab4ff', '#9bff6a', '#ff8a3d', '#ff6ad5'].forEach((c, i) => {
    const tt = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.09, 10), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.2 }));
    tt.position.set(-0.44 + i * 0.08, DESK_Y + 0.085, 0.42); scene.add(tt);
  });
  // book stack
  scene.add(mesh([part(new THREE.BoxGeometry(0.26, 0.05, 0.19), '#2b59c3', 0.72, DESK_Y + 0.055, 0.1, 0, 0.2, 0), part(new THREE.BoxGeometry(0.24, 0.045, 0.18), '#c3342b', 0.73, DESK_Y + 0.1, 0.1, 0, -0.1, 0), part(new THREE.BoxGeometry(0.22, 0.04, 0.17), '#2b9348', 0.72, DESK_Y + 0.143, 0.09, 0, 0.35, 0)], M.cloth));
}

// ---------- Franklin ----------
const SKIN = '#f0c6a0', COAT = '#e9ebe8', SHIRT = '#3d8fa6', HAIRC = '#d9d6d0', TIE = '#c8322f';
const F = { root: new THREE.Group() };
scene.add(F.root);
F.root.position.set(0, 0, -0.12);
{
  // torso pivot at hips (y 0.95)
  const torso = new THREE.Group(); torso.position.y = 0.95; F.root.add(torso); F.torso = torso;
  const tp = [];
  // lab coat body (tapered), open at front showing shirt
  tp.push(part(new THREE.CylinderGeometry(0.2, 0.25, 0.58, 28), COAT, 0, 0.27, 0, 0, 0, 0, 1, 1, 0.72));
  tp.push(part(new THREE.CylinderGeometry(0.25, 0.28, 0.45, 28), COAT, 0, -0.2, 0, 0, 0, 0, 1, 1, 0.72)); // coat skirt (behind desk)
  tp.push(part(S(0.2, 28, 14), COAT, 0, 0.55, 0, 0, 0, 0, 1.12, 0.45, 0.75)); // shoulders
  tp.push(part(new THREE.BoxGeometry(0.14, 0.5, 0.02), SHIRT, 0, 0.3, 0.15, -0.08, 0, 0)); // shirt wedge
  tp.push(part(new THREE.BoxGeometry(0.035, 0.03, 0.03), SHIRT, 0, 0.57, 0.135));
  // lapels
  for (const s of [-1, 1]) {
    tp.push(part(new THREE.BoxGeometry(0.075, 0.36, 0.015), '#e6e6e1', s * 0.085, 0.38, 0.155, -0.12, 0, s * 0.28));
    tp.push(part(new THREE.BoxGeometry(0.02, 0.55, 0.012), '#dcdcd6', s * 0.075, 0.05, 0.172)); // coat front edge
  }
  // bow tie
  for (const s of [-1, 1]) tp.push(part(new THREE.ConeGeometry(0.035, 0.06, 4), TIE, s * 0.032, 0.555, 0.15, 0, 0, s * Math.PI / 2, 1, 1, 0.5));
  tp.push(part(S(0.016, 10, 8), TIE, 0, 0.555, 0.158));
  // buttons and pocket with pens
  for (let i = 0; i < 3; i++) tp.push(part(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 10), '#cfcfca', 0.1, 0.25 - i * 0.12, 0.178, Math.PI / 2, 0, 0));
  tp.push(part(new THREE.BoxGeometry(0.08, 0.07, 0.01), '#e3e3de', -0.115, 0.38, 0.17, -0.1, 0, 0));
  ['#2f5fa8', '#c8322f', '#3d7a4f'].forEach((c, i) => tp.push(part(new THREE.CylinderGeometry(0.0065, 0.0065, 0.07, 8), c, -0.135 + i * 0.018, 0.415, 0.17)));
  // name badge (blank)
  tp.push(part(new THREE.BoxGeometry(0.06, 0.035, 0.006), '#ffd23f', 0.105, 0.4, 0.176, -0.1, 0, 0));
  torso.add(mesh(tp, M.cloth));
  // neck + head
  const neck = new THREE.Group(); neck.position.set(0, 0.6, 0); torso.add(neck); F.neck = neck;
  neck.add(mesh([part(new THREE.CylinderGeometry(0.055, 0.06, 0.1, 16), SKIN, 0, 0.04, 0)], M.skin));
  const head = new THREE.Group(); head.position.set(0, 0.2, 0); neck.add(head); F.head = head;
  const hp = [];
  hp.push(part(S(0.16, 40, 30), SKIN, 0, 0, 0, 0, 0, 0, 1, 1.06, 0.98));
  hp.push(part(S(0.13, 30, 20), SKIN, 0, -0.07, 0.02, 0, 0, 0, 1, 0.8, 1)); // jaw/cheeks
  hp.push(part(S(0.04, 16, 12), '#e9a888', 0, -0.015, 0.165, 0, 0, 0, 1, 0.95, 1)); // round nose
  for (const s of [-1, 1]) {
    hp.push(part(S(0.035, 14, 10), SKIN, s * 0.158, -0.005, 0, 0, 0, 0, 0.55, 1, 0.8)); // ears
    hp.push(part(S(0.032, 12, 10), '#f2a0a0', s * 0.085, -0.055, 0.13, 0, 0, 0, 1, 0.6, 0.3)); // cheeks blush
  }
  F.headMesh = mesh(hp, M.skin); head.add(F.headMesh);
  // hair: fluffy grey tufts on the sides and back, thinning top with one tuft
  const hr = [];
  for (let i = 0; i < 26; i++) {
    const a = Math.PI * (0.47 + 1.06 * (i / 25)); // from one side, around the back, to the other
    for (const yy of [0.0, 0.07]) {
      const r = 0.158;
      hr.push(part(S(0.048 + 0.018 * hash(i * 2 + yy * 10), 12, 10), HAIRC, Math.sin(a) * r * 1.05, yy + 0.02 * hash(i), Math.cos(a) * r * 0.95 - 0.02));
    }
  }
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) hr.push(part(S(0.045, 12, 10), HAIRC, s * (0.165 + 0.015 * i), 0.03 + 0.035 * i, -0.05 - 0.025 * i, 0, 0, 0, 1.2, 0.9, 1)); // wild side puffs
  hr.push(part(new THREE.ConeGeometry(0.03, 0.08, 10), HAIRC, 0.02, 0.19, 0.0, 0.2, 0, -0.4)); // top tuft
  hr.push(part(new THREE.ConeGeometry(0.025, 0.07, 10), HAIRC, -0.03, 0.185, -0.02, -0.1, 0, 0.5));
  // mustache
  for (const s of [-1, 1]) hr.push(part(S(0.042, 16, 12), HAIRC, s * 0.038, -0.058, 0.148, 0, 0, s * -0.35, 1.3, 0.62, 0.7));
  head.add(mesh(hr, M.hair));
  // eyebrows (animated)
  F.brows = [-1, 1].map(s => { const b = new THREE.Mesh(mergeGeometries([part(new THREE.CapsuleGeometry(0.014, 0.05, 4, 10), HAIRC, 0, 0, 0, 0, 0, Math.PI / 2)]), M.hair); b.position.set(s * 0.06, 0.085, 0.145); head.add(b); return b; });
  // eyes
  F.eyes = [-1, 1].map(s => {
    const g = new THREE.Group(); g.position.set(s * 0.058, 0.03, 0.13); head.add(g);
    g.add(new THREE.Mesh(colored(S(0.036, 24, 18), '#fbfbf7'), M.shiny));
    const iris = new THREE.Group(); g.add(iris);
    iris.add(new THREE.Mesh(mergeGeometries([part(S(0.019, 18, 14), '#5c8a4a', 0, 0, 0.026, 0, 0, 0, 1, 1, 0.5), part(S(0.01, 12, 10), '#14100c', 0, 0, 0.034, 0, 0, 0, 1, 1, 0.5), part(S(0.0045, 8, 6), '#ffffff', 0.006, 0.007, 0.038)]), M.shiny));
    // eyelid: upper skin cap that rotates down to blink
    const lid = new THREE.Mesh(colored(new THREE.SphereGeometry(0.039, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), SKIN), M.skin);
    g.add(lid);
    return { g, iris, lid };
  });
  // round glasses
  const gl = [];
  for (const s of [-1, 1]) {
    gl.push(part(new THREE.TorusGeometry(0.047, 0.007, 10, 36), '#5a3a22', s * 0.06, 0.03, 0.172));
    gl.push(part(new THREE.CylinderGeometry(0.004, 0.004, 0.17, 6), '#5a3a22', s * 0.152, 0.035, 0.09, Math.PI / 2, 0, 0)); // temples
  }
  gl.push(part(new THREE.TorusGeometry(0.018, 0.005, 8, 16, Math.PI), '#5a3a22', 0, 0.035, 0.175));
  head.add(mesh(gl, M.shiny));
  const lensMat = new THREE.MeshStandardMaterial({ color: 0xdff0ff, transparent: true, opacity: 0.16, roughness: 0.02, metalness: 0.4, envMapIntensity: 2 });
  for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.CircleGeometry(0.045, 32), lensMat); l.position.set(s * 0.06, 0.03, 0.173); head.add(l); }
  // safety goggles pushed up on the forehead
  const gg = [part(new THREE.TorusGeometry(0.165, 0.012, 8, 48), '#26323a', 0, 0.115, -0.005, Math.PI / 2 - 0.25, 0, 0, 1, 1.02, 1)];
  for (const s of [-1, 1]) {
    gg.push(part(new THREE.CylinderGeometry(0.042, 0.046, 0.035, 24), '#3a4a52', s * 0.055, 0.135, 0.135, Math.PI / 2 - 0.55, 0, 0));
  }
  gg.push(part(new THREE.BoxGeometry(0.03, 0.015, 0.02), '#3a4a52', 0, 0.138, 0.16, -0.5, 0, 0));
  head.add(mesh(gg, M.shiny));
  for (const s of [-1, 1]) {
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.036, 28), new THREE.MeshStandardMaterial({ color: 0xffb347, emissive: 0x6a3a00, transparent: true, opacity: 0.75, roughness: 0.05, metalness: 0.3 }));
    lens.position.set(s * 0.055, 0.145, 0.154); lens.rotation.x = -0.55 - 0.47; head.add(lens);
  }
  // mouth: dark interior that opens, teeth, tongue, smile line
  const mouth = new THREE.Group(); mouth.position.set(0, -0.085, 0.142); head.add(mouth); F.mouth = mouth;
  F.mouthIn = new THREE.Mesh(mergeGeometries([part(S(0.03, 18, 12), '#4a1a1c', 0, 0, 0, 0, 0, 0, 1.25, 1, 0.45)]), M.base); mouth.add(F.mouthIn);
  F.teeth = new THREE.Mesh(mergeGeometries([part(new THREE.BoxGeometry(0.05, 0.012, 0.01), '#fbfaf2', 0, 0, 0.01)]), M.shiny); mouth.add(F.teeth);
  F.tongue = new THREE.Mesh(mergeGeometries([part(S(0.018, 12, 8), '#d8636e', 0, 0, 0, 0, 0, 0, 1.3, 0.6, 0.6)]), M.base); mouth.add(F.tongue);
  F.smile = new THREE.Mesh(mergeGeometries([part(new THREE.TorusGeometry(0.035, 0.0055, 8, 24, Math.PI), '#9c4a42', 0, 0.012, 0.004, 0, 0, Math.PI)]), M.base); mouth.add(F.smile);

  // arms: shoulder -> upper arm -> elbow -> forearm -> wrist -> hand with fingers
  const UPPER = 0.27, FORE = 0.25;
  F.arms = [-1, 1].map(s => {
    const sh = new THREE.Group(); sh.position.set(s * 0.215, 0.5, 0); sh.rotation.order = 'ZXY'; torso.add(sh);
    sh.add(mesh([part(new THREE.CapsuleGeometry(0.058, UPPER - 0.05, 6, 16), COAT, 0, -UPPER / 2, 0)], M.cloth));
    const el = new THREE.Group(); el.position.y = -UPPER; sh.add(el);
    el.add(mesh([part(new THREE.CapsuleGeometry(0.05, FORE - 0.05, 6, 16), COAT, 0, -FORE / 2, 0), part(new THREE.CylinderGeometry(0.056, 0.056, 0.035, 18), '#e2e2dc', 0, -FORE + 0.03, 0)], M.cloth));
    const wr = new THREE.Group(); wr.position.y = -FORE; wr.rotation.order = 'YXZ'; el.add(wr);
    wr.add(mesh([part(S(0.045, 18, 14), SKIN, 0, -0.04, 0, 0, 0, 0, 0.95, 1.05, 0.5)], M.skin));
    const fingers = [];
    for (let i = 0; i < 4; i++) {
      const fp = new THREE.Group(); fp.position.set((i - 1.5) * 0.02 * -s * -1, -0.075, 0.0); wr.add(fp);
      const len = [0.045, 0.052, 0.05, 0.04][i];
      fp.add(mesh([part(new THREE.CapsuleGeometry(0.0105, len, 4, 8), SKIN, 0, -len / 2 - 0.005, 0)], M.skin));
      fingers.push(fp);
    }
    const th = new THREE.Group(); th.position.set(s * 0.035, -0.035, 0.012); wr.add(th);
    th.add(mesh([part(new THREE.CapsuleGeometry(0.012, 0.035, 4, 8), SKIN, 0, -0.025, 0)], M.skin));
    return { s, sh, el, wr, fingers, th };
  });
}

// ---------- poses ----------
// arm pose: f forward raise, a abduction (out to the side), t twist, b elbow bend, wx/wz wrist, c finger curl [i,m,r,p], th thumb curl
const P = {
  idle:    { f: 0.25, a: 0.12, t: -0.3, b: 1.25, wx: 0.0, wz: 0.0, c: [0.35, 0.4, 0.45, 0.5], th: 0.3 },
  wave:    { f: 0.25, a: 1.25, t: 1.45, b: 1.75, wx: 0, wz: 0.0, c: [0, 0, 0.05, 0.1], th: 0 },
  chest:   { f: 0.55, a: -0.15, t: 0.3, b: 2.2, wx: 0.2, wz: 0.0, c: [0.1, 0.1, 0.15, 0.2], th: 0.2 },
  indexUp: { f: 0.35, a: 0.35, t: 1.3, b: 2.0, wx: 0, wz: 0, c: [0, 1, 1, 1], th: 1 },
  present: { f: 0.75, a: 0.45, t: -1.0, b: 0.75, wx: -0.4, wz: 0, c: [0.05, 0.1, 0.15, 0.2], th: 0 },
  reachUp: { f: 0.6, a: 1.9, t: -0.9, b: 0.35, wx: -0.5, wz: 0, c: [0.05, 0.1, 0.15, 0.2], th: 0 },
  steeple: { f: 0.75, a: -0.25, t: 0.5, b: 1.55, wx: 0.2, wz: 0, c: [0.05, 0.05, 0.1, 0.1], th: 0.2 },
  pointUp: { f: 0.3, a: 2.8, t: 0.2, b: 0.1, wx: 0.0, wz: 0, c: [0, 1, 1, 1], th: 1 },
  pointCam:{ f: 1.35, a: 0.12, t: 0.6, b: 0.25, wx: 0.15, wz: 0, c: [0, 1, 1, 1], th: 1 },
  wide:    { f: 0.6, a: 1.0, t: -1.1, b: 0.45, wx: -0.4, wz: 0, c: [0.05, 0.1, 0.1, 0.15], th: 0 },
};
const SEG = Object.fromEntries(TIMING.segments.map(s => [s.id, s]));
// keyframes per arm: [time, poseName]; transitions take `dur` seconds ending at the time
// right arm = character's right = screen left (arms[0], s=-1); left arm = screen right (arms[1])
const KR = [[0, 'idle'], [0.75, 'wave'], [2.35, 'wave'], [2.75, 'idle'], [6.0, 'present'], [8.3, 'present'], [8.7, 'reachUp'], [11.9, 'reachUp'], [12.6, 'steeple'], [15.2, 'steeple'], [15.9, 'idle'], [17.35, 'pointUp'], [19.2, 'pointUp'], [19.8, 'wide'], [21.4, 'wide'], [22.25, 'pointCam'], [23.15, 'pointCam'], [23.55, 'wave'], [24.8, 'wave'], [25.4, 'idle']];
const KL = [[0, 'idle'], [2.7, 'idle'], [3.05, 'chest'], [4.0, 'chest'], [4.35, 'indexUp'], [5.5, 'indexUp'], [6.0, 'present'], [8.4, 'present'], [8.9, 'idle'], [12.6, 'steeple'], [15.2, 'steeple'], [15.95, 'indexUp'], [17.2, 'indexUp'], [17.7, 'idle'], [19.8, 'wide'], [21.4, 'wide'], [22.0, 'idle'], [23.6, 'idle'], [24.0, 'wide'], [25.6, 'wide']];
const TRANS = 0.45;
function poseAt(keys, t) {
  let i = 0; while (i < keys.length - 1 && keys[i + 1][0] <= t) i++;
  const cur = P[keys[i][1]];
  if (i < keys.length - 1) {
    const [tn, pn] = keys[i + 1];
    const k = ease((t - (tn - TRANS)) / TRANS);
    if (k > 0) return blendPose(cur, P[pn], k);
  }
  return cur;
}
function blendPose(a, b, k) {
  const o = {}; for (const key of Object.keys(a)) o[key] = Array.isArray(a[key]) ? a[key].map((v, i) => lerp(v, b[key][i], k)) : lerp(a[key], b[key], k);
  return o;
}
function applyArm(arm, p, t, talk) {
  const s = arm.s;
  arm.sh.rotation.set(-p.f, s * p.t, s * p.a);
  arm.el.rotation.set(-p.b, 0, 0);
  arm.wr.rotation.set(p.wx, 0, s * p.wz);
  p.c.forEach((c, i) => { arm.fingers[i].rotation.set(-c * 1.7, 0, 0); });
  arm.th.rotation.set(-p.th * 0.9, 0, s * (0.5 - p.th * 0.9));
  void t; void talk;
}

// ---------- holographic topic icons ----------
const holo = (col, k = 1.5) => new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: k, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.95 });
function iconAtom() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(S(0.025), holo('#ff6ad5', 2)));
  for (let k = 0; k < 3; k++) {
    const o = new THREE.Group(); o.rotation.set(Math.PI / 2, k * Math.PI / 3, 0.0); o.rotation.order = 'YXZ'; o.rotation.y = k * Math.PI / 3;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.004, 8, 48), holo('#5ab4ff', 1.8)); ring.scale.set(1, 0.38, 1); o.add(ring);
    const e = new THREE.Mesh(S(0.011, 10, 8), holo('#ffffff', 2.5)); o.add(e); o.userData.e = e; o.userData.k = k;
    g.add(o);
  }
  g.userData.spin = (t) => g.children.forEach(o => { if (o.userData.e) { const a = t * 3 + o.userData.k * 2.1; o.userData.e.position.set(Math.cos(a) * 0.075, Math.sin(a) * 0.075 * 0.38, 0); } });
  return g;
}
function iconLeaf() {
  const g = new THREE.Group();
  const shape = new THREE.Shape(); shape.moveTo(0, -0.07); shape.bezierCurveTo(0.07, -0.03, 0.06, 0.05, 0, 0.08); shape.bezierCurveTo(-0.06, 0.05, -0.07, -0.03, 0, -0.07);
  const leaf = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.01, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2 }), holo('#5fe07a', 1.4));
  leaf.position.z = -0.005; g.add(leaf);
  const vein = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.15, 6), holo('#d8ffcf', 2)); vein.position.set(0, 0.0, 0.012); g.add(vein);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.04, 6), holo('#9b6a3a', 1)); stem.position.y = -0.085; g.add(stem);
  g.rotation.z = -0.4;
  return g;
}
function iconPlanet() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(S(0.05), holo('#ffb347', 1.3)));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.008, 8, 48), holo('#ffe8a8', 1.8)); ring.rotation.x = Math.PI / 2 - 0.35; ring.scale.set(1, 1, 0.3); g.add(ring);
  const moon = new THREE.Mesh(S(0.012, 10, 8), holo('#cfe6ff', 2)); g.add(moon); g.userData.spin = (t) => moon.position.set(Math.cos(t * 1.5) * 0.11, 0.03, Math.sin(t * 1.5) * 0.11);
  return g;
}
function iconHeart() {
  const g = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(0, -0.07); s.bezierCurveTo(-0.09, -0.01, -0.07, 0.07, 0, 0.035); s.bezierCurveTo(0.07, 0.07, 0.09, -0.01, 0, -0.07);
  const h = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 3 }), holo('#ff4d6d', 1.6));
  h.position.z = -0.01; g.add(h); g.userData.spin = (t) => { const b = 1 + 0.08 * Math.max(0, Math.sin(t * 7)) ** 8; h.scale.setScalar(b); };
  return g;
}
function iconHourglass() {
  const g = new THREE.Group();
  const m = holo('#c9a0ff', 1.4);
  const c1 = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.06, 20, 1, true), m); c1.position.y = 0.03; c1.rotation.x = Math.PI; g.add(c1);
  const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.06, 20, 1, true), m); c2.position.y = -0.03; g.add(c2);
  for (const y of [0.065, -0.065]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.01, 20), holo('#ffd28a', 1.2)); p.position.y = y; g.add(p); }
  const sand = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.025, 16), holo('#ffd23f', 2)); sand.position.y = -0.05; g.add(sand);
  return g;
}
// what segment word onsets (measured from voice pauses): ciência, natureza, espaço, corpo humano, história
const ICONS = [
  { make: iconAtom, t: 8.35 }, { make: iconLeaf, t: 9.22 }, { make: iconPlanet, t: 10.1 }, { make: iconHeart, t: 10.72 }, { make: iconHourglass, t: 11.45 },
].map((d, i) => {
  const g = d.make(); scene.add(g);
  const halo = new THREE.Mesh(new THREE.RingGeometry(0.085, 0.09, 48), new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide, toneMapped: false }));
  scene.add(halo);
  const ang = Math.PI * (0.88 - i * 0.19);
  return { g, halo, t: d.t, home: new THREE.Vector3(Math.cos(ang) * 0.34, 1.86 + Math.sin(ang) * 0.3, 0.3), i };
});
// curiosity lightbulb
const bulb = new THREE.Group(); scene.add(bulb);
const bulbGlass = new THREE.Mesh(S(0.075, 28, 20), new THREE.MeshStandardMaterial({ color: 0xfff6d8, emissive: 0xffd36a, emissiveIntensity: 0, transparent: true, opacity: 0.85, roughness: 0.1 }));
bulbGlass.scale.set(1, 1.1, 1); bulb.add(bulbGlass);
const bulbBase = new THREE.Mesh(mergeGeometries([part(new THREE.CylinderGeometry(0.038, 0.032, 0.05, 20), '#b9b9b9', 0, -0.1, 0), part(new THREE.TorusGeometry(0.036, 0.006, 6, 20), '#8f8f8f', 0, -0.09, 0, Math.PI / 2, 0, 0), part(new THREE.TorusGeometry(0.034, 0.006, 6, 20), '#8f8f8f', 0, -0.108, 0, Math.PI / 2, 0, 0)]), M.shiny);
bulb.add(bulbBase);
const filament = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.003, 6, 20, Math.PI * 1.4), new THREE.MeshBasicMaterial({ color: 0xffd36a, toneMapped: false })); filament.position.y = -0.01; bulb.add(filament);
const bulbLight = new THREE.PointLight(0xffd88a, 0, 3, 1.5); bulb.add(bulbLight);
// sparkles (adventure burst)
const sparkles = [];
for (let i = 0; i < 40; i++) {
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.012 + 0.01 * hash(i), 0), new THREE.MeshBasicMaterial({ color: ['#ffe28a', '#9fe8ff', '#ff9ad5', '#b8ff9a'][i % 4], toneMapped: false, transparent: true }));
  m.userData = { a: hash(i * 1.3) * Math.PI * 2, e: hash(i * 2.7) * 1.2 - 0.3, sp: 0.5 + hash(i * 5.1) * 0.8 };
  scene.add(m); sparkles.push(m);
}

// ---------- post ----------
const composer = new EffectComposer(renderer);
composer.setPixelRatio(1); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.45, 0.5, 0.96));
composer.addPass(new OutputPass());
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, fade: { value: 1 }, time: { value: 0 }, res: { value: new THREE.Vector2(W, H) } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float fade; uniform float time; uniform vec2 res; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + time*7.13) * 43758.5453); }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      float l = dot(c.rgb, vec3(0.299,0.587,0.114));
      c.rgb = mix(c.rgb, c.rgb*vec3(1.05,1.0,0.93), smoothstep(0.4,1.0,l));
      c.rgb = mix(c.rgb, c.rgb*vec3(0.92,1.0,1.07), 1.0-smoothstep(0.0,0.5,l));
      vec2 q = vUv-0.5; q.x *= res.x/res.y;
      c.rgb *= 1.0 - 0.45*smoothstep(0.3, 0.95, length(q)*1.2);
      c.rgb += (h(vUv*res)-0.5)*0.016;
      gl_FragColor = vec4(c.rgb*fade, 1.0);
    }`,
});
composer.addPass(grade);

// ---------- animation ----------
const BLINKS = [1.9, 4.6, 7.4, 9.9, 13.1, 15.6, 18.9, 21.0, 24.1];
const mouthAt = (t) => { const i = t * FPS, a = Math.floor(i), k = i - a; return lerp(MOUTH[a] || 0, MOUTH[a + 1] || 0, k); };
const inSeg = (id, t) => t >= SEG[id].start && t <= SEG[id].end;
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();

window.FRAMES = FRAMES;
window.renderFrame = (f) => {
  const t = f / FPS;
  const m = mouthAt(t);
  // speech energy, smoothed, drives head nods and beats
  const energy = (mouthAt(t - 0.1) + m + mouthAt(t - 0.2)) / 3;

  // --- body ---
  const breathe = Math.sin(t * 1.6) * 0.008;
  F.torso.position.y = 0.95 + breathe;
  const lean = 0.04 * Math.sin(t * 0.55) + (inSeg('follow', t) ? 0.06 * smooth((t - SEG.follow.start) / 0.6) : 0) + 0.03 * energy;
  F.torso.rotation.set(lean, 0.06 * Math.sin(t * 0.37), 0.025 * Math.sin(t * 0.43));
  // head: nods with speech, glances at the icons when they appear, tilts on questions
  let yaw = 0.05 * Math.sin(t * 0.5), pitch = -0.04 + 0.06 * Math.sin(t * 9) * energy * 0.6 + 0.05 * energy, roll = 0.04 * Math.sin(t * 0.7);
  let eyeYaw = 0, eyePitch = 0;
  for (const ic of ICONS) {
    const k = smooth((t - ic.t + 0.15) / 0.25) * (1 - smooth((t - ic.t - 0.55) / 0.3));
    if (k > 0) { yaw += k * (ic.home.x * -0.0 + (ic.home.x < 0 ? -0.35 : 0.35) * Math.min(1, Math.abs(ic.home.x) / 0.3)); pitch -= k * 0.35; eyeYaw += k * (ic.home.x < 0 ? -1 : ic.home.x > 0.05 ? 1 : 0) * 0.35; eyePitch += k * 0.35; }
  }
  const bulbLook = smooth((t - 17.4) / 0.4) * (1 - smooth((t - 18.9) / 0.4));
  pitch -= bulbLook * 0.4; eyePitch += bulbLook * 0.4;
  if (inSeg('hello', t)) roll += 0.08 * smooth((t - 0.6) / 0.4);
  F.neck.rotation.set(pitch * 0.4, yaw * 0.4, roll * 0.4);
  F.head.rotation.set(pitch * 0.6, yaw * 0.6, roll * 0.6);
  F.eyes.forEach(e => {
    e.iris.rotation.set(-eyePitch * 0.6, eyeYaw * 0.7, 0);
    let blink = 0; for (const b of BLINKS) blink = Math.max(blink, 1 - Math.abs(t - b) / 0.08);
    blink = clamp(blink);
    // lid sits rotated up (open) and swings down over the eye to blink
    e.lid.rotation.set(-1.75 + blink * 1.85 - eyePitch * 0.3, 0, 0);
  });
  // brows: raised when excited (hello, curiosity), with speech accents
  const browUp = 0.012 * energy + (inSeg('hello', t) ? 0.012 : 0) + 0.014 * bulbLook + (inSeg('who', t) && t > 4.3 ? 0.01 : 0);
  F.brows.forEach((b, i) => { const s = i ? 1 : -1; b.position.y = 0.085 + browUp + 0.003 * Math.sin(t * 3 + i); b.rotation.z = s * (-0.12 - browUp * 6); });
  // mouth
  F.mouthIn.scale.set(1 - 0.15 * m, 0.25 + 1.35 * m, 1);
  F.mouthIn.position.y = -0.012 * m;
  F.teeth.position.y = 0.006 + 0.002 * m; F.teeth.visible = m > 0.15;
  F.tongue.position.set(0, -0.02 * m, 0.004); F.tongue.visible = m > 0.3;
  F.smile.scale.set(1 + 0.15 * (1 - m), 1 - 0.4 * m, 1);

  // --- arms ---
  const pr = poseAt(KR, t), pl = poseAt(KL, t);
  // talk beats add small forearm motion
  const beat = 0.12 * energy * Math.sin(t * 6.3);
  applyArm(F.arms[0], { ...pr, b: pr.b + beat }, t);
  applyArm(F.arms[1], { ...pl, b: pl.b - beat * 0.8 }, t);
  // waving: wrist and forearm oscillation while in the wave pose
  const waveK = (k, a, b) => smooth((t - a) / 0.3) * (1 - smooth((t - b) / 0.3));
  const w1 = waveK(0, 0.8, 2.3) + waveK(0, 23.5, 24.9);
  if (w1 > 0) { F.arms[0].el.rotation.z += w1 * 0.35 * Math.sin(t * 11); F.arms[0].wr.rotation.z += w1 * 0.25 * Math.sin(t * 11 - 0.6); }

  // --- icons ---
  const exitT = SEG.follow.start + 0.1;
  for (const ic of ICONS) {
    const k = backOut((t - ic.t) / 0.45);
    const out = smooth((t - exitT - ic.i * 0.06) / 0.5);
    const sc = (t < ic.t ? 0 : k) * (1 - out) * 1.25;
    // during "how" and "goal" the icons orbit around his head
    const orbitK = smooth((t - 12.5) / 1.4);
    const oa = (t - 12.5) * 0.6 + ic.i * (Math.PI * 2 / 5);
    const orbit = new THREE.Vector3(Math.cos(oa) * 0.42, 1.82 + Math.sin(oa * 1.0 + 1.0) * 0.06 + 0.06 * Math.sin(oa * 2), 0.0 + Math.sin(oa) * 0.42 - 0.02);
    const pos = ic.home.clone().lerp(orbit, orbitK);
    pos.y += 0.015 * Math.sin(t * 1.8 + ic.i) + out * 0.4;
    ic.g.position.copy(pos); ic.g.scale.setScalar(Math.max(1e-4, sc));
    ic.g.rotation.y = 0.6 * Math.sin(t * 0.9 + ic.i) + (ic.i === 2 ? t * 0.4 : 0);
    if (ic.g.userData.spin) ic.g.userData.spin(t);
    ic.halo.position.copy(pos); ic.halo.lookAt(camera.position);
    const hk = clamp((t - ic.t) / 0.6);
    ic.halo.scale.setScalar(Math.max(1e-4, (0.6 + hk * 1.4) * (1 - out)));
    ic.halo.material.opacity = (t < ic.t ? 0 : 0.55 * (1 - hk)) * (1 - orbitK * 0.8) * (1 - out);
  }
  // --- bulb ---
  const bIn = backOut((t - 17.35) / 0.5), bOut = smooth((t - exitT) / 0.5);
  bulb.position.set(0, 2.18 + 0.02 * Math.sin(t * 2) + bOut * 0.4, 0.05);
  bulb.scale.setScalar(Math.max(1e-4, (t < 17.35 ? 0 : bIn) * (1 - bOut) * 1.1));
  bulb.rotation.z = 0.12 * Math.sin(t * 1.3);
  const lit = smooth((t - 18.2) / 0.25);
  const flick = lit * (0.85 + 0.15 * (hash(Math.floor(t * 24)) > 0.2 ? 1 : 0.4));
  bulbGlass.material.emissiveIntensity = 2.0 * flick; filament.material.color.setRGB(1, 0.85, 0.45).multiplyScalar(0.5 + 3 * flick);
  bulbLight.intensity = 1.0 * flick * (1 - bOut);
  // --- sparkles: adventure burst at "aventura" ---
  const sT = 20.25;
  sparkles.forEach((s, i) => {
    const u = (t - sT) * s.userData.sp;
    const on = t > sT && u < 2.2;
    s.visible = on;
    if (!on) return;
    const r = 0.1 + u * 0.55;
    s.position.set(Math.cos(s.userData.a) * r, 2.15 + Math.sin(s.userData.e) * r * 0.8 - u * u * 0.03, 0.15 + Math.sin(s.userData.a) * r * 0.3);
    s.rotation.set(t * 3 + i, t * 2, 0); s.scale.setScalar(1 - u / 2.2);
    s.material.opacity = 1 - u / 2.2;
  });
  // --- set life ---
  bubbles.forEach(b => {
    const u = ((t * b.userData.sp + b.userData.ph * 3) % 1.4) / 1.4;
    b.position.set(b.userData.x + Math.sin(u * 10 + b.userData.ph * 6) * 0.01, DESK_Y + 0.25 * b.userData.s + u * 0.3, b.userData.z + Math.cos(u * 8 + b.userData.ph * 4) * 0.01);
    b.material.opacity = 0.9 * (1 - u);
  });
  window.__jars.forEach((j, i) => { j.material.emissiveIntensity = 1.3 + 0.4 * Math.sin(t * (1 + hash(i)) + i); });

  // --- camera: slow push-in, gentle float, closer for the final invitation ---
  const push = smooth(t / 12) * 0.25 + smooth((t - 15) / 6) * 0.1 + smooth((t - 21.8) / 2.5) * 0.25;
  camPos.set(0.05 * Math.sin(t * 0.21), 1.62 + 0.015 * Math.sin(t * 0.33), 2.85 - push);
  camLook.set(0, 1.62 - 0.03 * push, 0);
  camera.position.copy(camPos); camera.lookAt(camLook);
  camera.fov = 38; camera.updateProjectionMatrix();

  grade.uniforms.fade.value = smooth(t / 0.5) * (1 - smooth((t - (DURATION - 0.6)) / 0.6));
  grade.uniforms.time.value = f;
  composer.render();
  return true;
};
window.__scene = scene;
window.ready = true;
if (!params.has('render')) { let f = +(params.get('f') || 0); if (params.has('still')) window.renderFrame(f); else { const loop = () => { window.renderFrame(f); f = (f + 1) % FRAMES; requestAnimationFrame(loop); }; loop(); } }
