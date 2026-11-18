import * as THREE from "./lib/three.module.min.js";

// ------------------------------------------------------------ setup
const CFG = window.__cfg || {};
const P = CFG.P || { L1: 4, L2: 9, L3: 12, launch: 15, L4: 16, L5: 22, day1: 23, day2: 25, L6: 27, like: 31, total: 35, tres: 12.2, dois: 13, um: 14 };
const DROPS = CFG.drops || [];
const PLAY = CFG.play || [[P.launch, 0], [P.total, 200000]];
const W = 1080, H = 1920;
const stage = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(CFG.px || 1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(46, W / H, 0.05, 200);

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const smooth = (x) => x * x * (3 - 2 * x);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a, b, k) => a + (b - a) * k;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const R = rng(2026);
function lerpK(K, t) { if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const a = K[i - 1], b = K[i]; return a[1] + (b[1] - a[1]) * ((t - a[0]) / Math.max(1e-6, b[0] - a[0])); } return K[K.length - 1][1]; }

const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, metalness: 0, ...o });
function rrect(w, h, r) {
  const s = new THREE.Shape(); r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4);
  s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}
// rounded box: w (x), h (y), d (z), radius r
function rboxGeo(w, h, d, r) {
  const b = Math.min(r, d / 2 - 1e-3, w / 2 - 1e-3, h / 2 - 1e-3);
  const g = new THREE.ExtrudeGeometry(rrect(w - 2 * b, h - 2 * b, Math.max(0.001, r - b * 0.5)), { depth: Math.max(1e-3, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 6 });
  g.translate(0, 0, -(d - 2 * b) / 2);
  g.computeVertexNormals();
  return g;
}
function rbox(w, h, d, r, mat) { const m = new THREE.Mesh(rboxGeo(w, h, d, r), mat); m.castShadow = true; m.receiveShadow = true; return m; }
function mesh(g, mat, cast = true) { const m = new THREE.Mesh(g, mat); m.castShadow = cast; m.receiveShadow = true; return m; }
function canvasTex(w, h, draw, rep) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
function label(txt, bg, fg, w = 256, h = 128, font = 54) {
  return canvasTex(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = `900 ${font}px Arial Black, Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 2); });
}

// ------------------------------------------------------------ character
function makeCharacter() {
  const skin = M("#e0a07a", { roughness: 0.55 }), hoodie = M("#1fb5a8", { roughness: 0.75 }), hood2 = M("#17998e", { roughness: 0.8 });
  const jeans = M("#2c3e7a", { roughness: 0.8 }), shoeM = M("#f4f4f4", { roughness: 0.5 }), sole = M("#e63946"), hair = M("#2a1a14", { roughness: 0.65 });
  const white = M("#ffffff", { roughness: 0.3 }), black = M("#111111", { roughness: 0.3 });
  const root = new THREE.Group();
  const hips = new THREE.Group(); hips.position.y = 0.95; root.add(hips);
  const torso = new THREE.Group(); hips.add(torso);
  const body = mesh(new THREE.CapsuleGeometry(0.21, 0.34, 6, 16), hoodie); body.position.y = 0.3; body.scale.set(1.08, 1, 0.82); torso.add(body);
  const pocket = rbox(0.26, 0.11, 0.06, 0.03, hood2); pocket.position.set(0, 0.2, 0.165); torso.add(pocket);
  const hood = mesh(new THREE.TorusGeometry(0.13, 0.055, 8, 18), hood2); hood.position.set(0, 0.58, -0.05); hood.rotation.x = Math.PI / 2 + 0.35; torso.add(hood);
  for (const sx of [-1, 1]) { const st = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 5), white, false); st.position.set(sx * 0.05, 0.46, 0.17); torso.add(st); }
  const belt = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16), jeans); belt.position.y = 0.0; belt.scale.set(1.05, 1, 0.82); torso.add(belt);
  // head
  const head = new THREE.Group(); head.position.y = 0.66; torso.add(head);
  const neck = mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 10), skin); neck.position.y = 0.02; head.add(neck);
  const skull = mesh(new THREE.SphereGeometry(0.2, 28, 22), skin); skull.position.y = 0.2; skull.scale.set(1, 1.06, 0.98); head.add(skull);
  const hairM = mesh(new THREE.SphereGeometry(0.212, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), hair); hairM.position.set(0, 0.215, -0.012); hairM.rotation.x = -0.28; head.add(hairM);
  const fringe = rbox(0.3, 0.07, 0.1, 0.035, hair); fringe.position.set(0.02, 0.36, 0.13); fringe.rotation.set(0.5, 0, -0.12); head.add(fringe);
  for (const sx of [-1, 1]) { const ear = mesh(new THREE.SphereGeometry(0.045, 12, 10), skin); ear.position.set(sx * 0.195, 0.2, 0); ear.scale.set(0.6, 1, 0.8); head.add(ear); }
  const eyes = [], lids = [];
  for (const sx of [-1, 1]) {
    const e = mesh(new THREE.SphereGeometry(0.048, 16, 12), white, false); e.position.set(sx * 0.075, 0.22, 0.165); e.scale.set(1, 1.15, 0.6); head.add(e);
    const p = mesh(new THREE.SphereGeometry(0.027, 12, 10), black, false); p.position.set(sx * 0.075, 0.215, 0.192); head.add(p); eyes.push(p);
    const sh = mesh(new THREE.SphereGeometry(0.009, 6, 6), white, false); sh.position.set(sx * 0.075 + 0.01, 0.228, 0.214); head.add(sh);
    const lid = mesh(new THREE.SphereGeometry(0.052, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), skin, false); lid.position.set(sx * 0.075, 0.222, 0.165); lid.scale.set(1.04, 1.2, 0.66); head.add(lid); lids.push(lid);
    const brow = rbox(0.075, 0.018, 0.02, 0.009, hair); brow.position.set(sx * 0.078, 0.29, 0.18); brow.rotation.z = sx * -0.12; head.add(brow);
    const cheek = mesh(new THREE.SphereGeometry(0.03, 10, 8), M("#ff8f8f", { roughness: 0.7, transparent: true, opacity: 0.55 }), false); cheek.position.set(sx * 0.12, 0.15, 0.16); cheek.scale.set(1, 0.6, 0.3); head.add(cheek);
  }
  const nose = mesh(new THREE.SphereGeometry(0.026, 12, 10), skin, false); nose.position.set(0, 0.175, 0.2); head.add(nose);
  const mouth = mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 16, Math.PI), M("#7a2030"), false); mouth.position.set(0, 0.12, 0.183); mouth.rotation.z = Math.PI; head.add(mouth);
  const mouthO = mesh(new THREE.SphereGeometry(0.04, 12, 10), M("#5a1020"), false); mouthO.position.set(0, 0.11, 0.18); mouthO.scale.set(1, 0.8, 0.4); mouthO.visible = false; head.add(mouthO);
  // arms
  const arms = [];
  for (const sx of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(sx * 0.27, 0.5, 0); torso.add(sh);
    const up = mesh(new THREE.CapsuleGeometry(0.068, 0.2, 4, 12), hoodie); up.position.y = -0.14; sh.add(up);
    const el = new THREE.Group(); el.position.y = -0.29; sh.add(el);
    const fo = mesh(new THREE.CapsuleGeometry(0.06, 0.17, 4, 12), hoodie); fo.position.y = -0.12; el.add(fo);
    const cuff = mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.04, 12), hood2); cuff.position.y = -0.22; el.add(cuff);
    const hand = mesh(new THREE.SphereGeometry(0.06, 14, 12), skin); hand.position.y = -0.28; hand.scale.set(0.9, 1.05, 0.8); el.add(hand);
    arms.push({ sh, el, sx });
  }
  // legs
  const legs = [];
  for (const sx of [-1, 1]) {
    const hp = new THREE.Group(); hp.position.set(sx * 0.11, -0.02, 0); hips.add(hp);
    const th = mesh(new THREE.CapsuleGeometry(0.09, 0.28, 4, 12), jeans); th.position.y = -0.21; hp.add(th);
    const kn = new THREE.Group(); kn.position.y = -0.43; hp.add(kn);
    const sn = mesh(new THREE.CapsuleGeometry(0.078, 0.28, 4, 12), jeans); sn.position.y = -0.2; kn.add(sn);
    const shoe = rbox(0.15, 0.1, 0.27, 0.045, shoeM); shoe.position.set(0, -0.44, 0.05); kn.add(shoe);
    const so = rbox(0.155, 0.03, 0.28, 0.012, sole); so.position.set(0, -0.495, 0.05); kn.add(so);
    legs.push({ hp, kn, sx });
  }
  const ctrl = makeController(); ctrl.position.set(0, 0.2, 0.36); ctrl.visible = false; torso.add(ctrl);
  root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { root, hips, torso, head, arms, legs, lids, eyes, mouth, mouthO, ctrl };
}
function makeController() {
  const g = new THREE.Group();
  const w = M("#f1f1f4", { roughness: 0.35 }), k = M("#1b1b22", { roughness: 0.4 });
  const body = rbox(0.24, 0.035, 0.1, 0.03, w); g.add(body);
  for (const sx of [-1, 1]) { const grip = mesh(new THREE.CapsuleGeometry(0.03, 0.07, 4, 10), w); grip.position.set(sx * 0.1, -0.005, -0.045); grip.rotation.x = 1.2; g.add(grip); }
  const pad = rbox(0.11, 0.012, 0.05, 0.01, k); pad.position.set(0, 0.022, 0.01); g.add(pad);
  for (const sx of [-1, 1]) { const st = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 10), k); st.position.set(sx * 0.04, 0.025, -0.03); g.add(st); }
  const bar = mesh(new THREE.BoxGeometry(0.1, 0.004, 0.004), new THREE.MeshBasicMaterial({ color: "#3d8bff" })); bar.position.set(0, 0.02, 0.05); g.add(bar);
  return g;
}

// pose: angles in radians. arms: [shX, shZ, elX] for left/right; legs: [hipX, kneeX]
function applyPose(C, p) {
  C.hips.position.y = p.hipY;
  C.torso.rotation.x = p.lean || 0;
  C.head.rotation.set(p.headX || 0, p.headY || 0, p.headZ || 0);
  C.arms.forEach((a, i) => { const q = p.arms[i]; a.sh.rotation.set(q[0], 0, q[1] * a.sx); a.el.rotation.set(q[2], 0, 0); });
  C.legs.forEach((l, i) => { const q = p.legs[i]; l.hp.rotation.set(q[0], 0, 0); l.kn.rotation.set(q[1], 0, 0); });
}
function blendPose(a, b, k) {
  const L = (x, y) => mix(x || 0, y || 0, k);
  return {
    hipY: L(a.hipY, b.hipY), lean: L(a.lean, b.lean), headX: L(a.headX, b.headX), headY: L(a.headY, b.headY), headZ: L(a.headZ, b.headZ),
    arms: [0, 1].map((i) => [0, 1, 2].map((j) => L(a.arms[i][j], b.arms[i][j]))),
    legs: [0, 1].map((i) => [0, 1].map((j) => L(a.legs[i][j], b.legs[i][j]))),
  };
}
const POSE = {
  stand: (t) => ({ hipY: 0.95 + Math.sin(t * 2) * 0.004, arms: [[0.05, 0.12, -0.15], [0.05, 0.12, -0.15]], legs: [[0, 0], [0, 0]], headX: Math.sin(t * 1.3) * 0.03 }),
  walkPush: (t, ph) => {
    const s = Math.sin(ph), c = Math.cos(ph);
    return { hipY: 0.95 + Math.abs(c) * 0.03 - 0.015, lean: 0.12, headX: -0.08, arms: [[-1.15, 0.05, -0.35], [-1.15, 0.05, -0.35]],
      legs: [[s * 0.5, Math.max(0, -c) * 0.7 + 0.08], [-s * 0.5, Math.max(0, c) * 0.7 + 0.08]] };
  },
  push: (t) => ({ hipY: 0.95, lean: 0.1, headX: -0.05, arms: [[-1.15, 0.05, -0.35], [-1.15, 0.05, -0.35]], legs: [[0, 0.05], [0, 0.05]] }),
  watch: (t) => ({ hipY: 0.95, lean: 0.02, headX: 0.35, headY: -0.25, arms: [[-1.35, -0.25, -1.75], [0.05, 0.12, -0.15]], legs: [[0, 0], [0, 0]] }),
  hype: (t) => ({ hipY: 0.95 + Math.abs(Math.sin(t * 9)) * 0.05, arms: [[-0.9, 0.2, -1.4], [-0.9, 0.2, -1.4]], legs: [[0, 0], [0, 0]], headX: Math.sin(t * 9) * 0.05 }),
  cheer: (t) => ({ hipY: 1.0 + Math.abs(Math.sin(t * 7)) * 0.08, arms: [[-2.9, 0.35, -0.2], [-2.9, 0.35, -0.2]], legs: [[0, 0.1], [0, 0.1]], headX: -0.25 }),
  sitPlay: (t, tired = 0) => ({ hipY: 0.6, lean: -0.12 + tired * 0.12, headX: 0.12 + tired * 0.15 + Math.sin(t * 5) * 0.015, headZ: Math.sin(t * 1.7) * 0.03 + tired * 0.12,
    arms: [[-0.55, -0.32, -1.05 + Math.sin(t * 13) * 0.04], [-0.55, -0.32, -1.05 + Math.cos(t * 11) * 0.04]], legs: [[-1.5, 1.45], [-1.5, 1.45]] }),
};

// ------------------------------------------------------------ food items
const FOOD = {};
function pizzaTopTex() {
  return canvasTex(256, 256, (g) => {
    g.fillStyle = "#fbf3e4"; g.fillRect(0, 0, 256, 256);
    g.fillStyle = "#e63946"; g.beginPath(); g.arc(128, 116, 78, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffd84d"; g.beginPath(); g.arc(128, 116, 64, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c0392b"; for (const [x, y] of [[100, 95], [150, 90], [128, 125], [95, 140], [160, 140], [128, 75]]) { g.beginPath(); g.arc(x, y, 11, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#12002b"; g.font = "900 40px Arial Black, Arial"; g.textAlign = "center"; g.fillText("PIZZA", 128, 232);
  });
}
const pizzaTex = pizzaTopTex();
const stripeTex = canvasTex(128, 64, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#ffffff" : "#e63946"; g.fillRect(i * 16, 0, 16, 64); } });
const chipsTex = [label("CHIPS", "#ffb703", "#9b2226"), label("CROC", "#8338ec", "#ffd84d"), label("NACHO", "#fb5607", "#ffffff")];
const sodaTex = [label("COLA", "#d62828", "#ffffff", 256, 96, 52), label("LIMÃO", "#2a9d8f", "#ffffff", 256, 96, 48), label("UVA", "#7b2ff7", "#ffffff", 256, 96, 52)];
function makeFood(kind, v = 0) {
  const g = new THREE.Group();
  if (kind === "pizza") {
    const cap = M("#ffffff", { map: pizzaTex, roughness: 0.7 }); pizzaTex.repeat.set(1 / 0.42, 1 / 0.42); pizzaTex.offset.set(0.5, 0.5);
    const box = mesh(rboxGeo(0.42, 0.42, 0.06, 0.012), [cap, M("#f3e7d3", { roughness: 0.8 })]); box.rotation.x = -Math.PI / 2; g.add(box);
  } else if (kind === "soda" || kind === "soda2") {
    const t = sodaTex[(v + (kind === "soda2" ? 1 : 0)) % 3];
    const glass = M(kind === "soda" ? "#5a1408" : "#0e3d2c", { roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.92 });
    const b = mesh(new THREE.CylinderGeometry(0.052, 0.055, 0.24, 18), glass); b.position.y = 0.12; g.add(b);
    const nk = mesh(new THREE.CylinderGeometry(0.022, 0.05, 0.08, 16), glass); nk.position.y = 0.28; g.add(nk);
    const cap = mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.025, 12), M("#e63946")); cap.position.y = 0.33; g.add(cap);
    const lb = mesh(new THREE.CylinderGeometry(0.057, 0.057, 0.09, 24, 1, true), M("#ffffff", { map: t })); lb.position.y = 0.12; g.add(lb);
  } else if (kind === "chips" || kind === "chips2") {
    const t = chipsTex[(v + (kind === "chips2" ? 1 : 0)) % 3];
    const bag = mesh(new THREE.SphereGeometry(0.16, 20, 14), M("#ffffff", { map: t, roughness: 0.25, metalness: 0.35 })); bag.scale.set(0.85, 1.05, 0.38); bag.position.y = 0.16; g.add(bag);
    for (const y of [0.0, 0.32]) { const cr = rbox(0.24, 0.035, 0.05, 0.012, M(t === chipsTex[0] ? "#ffb703" : t === chipsTex[1] ? "#8338ec" : "#fb5607", { roughness: 0.3, metalness: 0.3 })); cr.position.y = y; g.add(cr); }
  } else if (kind === "popcorn") {
    const b = mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.2, 20, 1, true), M("#ffffff", { map: stripeTex, side: THREE.DoubleSide })); b.position.y = 0.1; g.add(b);
    const bot = mesh(new THREE.CircleGeometry(0.08, 16), M("#e63946")); bot.rotation.x = -Math.PI / 2; bot.position.y = 0.001; g.add(bot);
    const pc = M("#fff3c4", { roughness: 0.9 }); const r2 = rng(77 + v);
    for (let i = 0; i < 22; i++) { const a = r2() * Math.PI * 2, rr = r2() * 0.09; const k = mesh(new THREE.IcosahedronGeometry(0.028 + r2() * 0.012, 0), pc); k.position.set(Math.cos(a) * rr, 0.2 + r2() * 0.05 + (0.09 - rr) * 0.4, Math.sin(a) * rr); g.add(k); }
  } else if (kind === "can6") {
    const cols = ["#3df5ff", "#00b4d8", "#3df5ff"]; const cm = M(cols[v % 3], { roughness: 0.25, metalness: 0.6 }), top = M("#cfd4da", { metalness: 0.8, roughness: 0.3 });
    for (let i = 0; i < 6; i++) { const x = (i % 3 - 1) * 0.075, z = (Math.floor(i / 3) - 0.5) * 0.075; const c = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 14), cm); c.position.set(x, 0.06, z); g.add(c); const tp = mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.012, 14), top); tp.position.set(x, 0.126, z); g.add(tp); }
    const ring = rbox(0.23, 0.03, 0.155, 0.01, M("#12002b", { transparent: true, opacity: 0.85 })); ring.position.y = 0.1; g.add(ring);
  } else if (kind === "can") {
    const c = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 14), M(["#3df5ff", "#e63946", "#7b2ff7"][v % 3], { roughness: 0.25, metalness: 0.6 })); c.position.y = 0.06; g.add(c);
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

// ============================================================ SUPERMARKET (around origin)
const shop = new THREE.Group(); scene.add(shop);
{
  const tile = canvasTex(256, 256, (g) => { g.fillStyle = "#e9e6ef"; g.fillRect(0, 0, 256, 256); g.fillStyle = "#d6d1df"; g.fillRect(0, 0, 128, 128); g.fillRect(128, 128, 128, 128); g.strokeStyle = "#bdb6c9"; g.lineWidth = 3; g.strokeRect(0, 0, 256, 256); g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 256); g.moveTo(0, 128); g.lineTo(256, 128); g.stroke(); }, [12, 22]);
  const floor = mesh(new THREE.PlaneGeometry(12, 44), M("#ffffff", { map: tile, roughness: 0.18, metalness: 0.05 }), false); floor.rotation.x = -Math.PI / 2; floor.position.z = -12; shop.add(floor);
  const ceil = mesh(new THREE.PlaneGeometry(12, 44), M("#f5f3f8", { roughness: 0.9 }), false); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.6, -12); shop.add(ceil);
  const lightM = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  for (let z = 6; z > -32; z -= 3.2) { const l = mesh(new THREE.BoxGeometry(0.5, 0.05, 2.2), lightM, false); l.position.set(0, 3.57, z); shop.add(l); }
  // back wall with sign
  const wall = mesh(new THREE.PlaneGeometry(12, 3.6), M("#ff2e88", { roughness: 0.8 }), false); wall.position.set(0, 1.8, -30); shop.add(wall);
  const signT = canvasTex(1024, 256, (g) => { g.fillStyle = "#12002b"; g.fillRect(0, 0, 1024, 256); g.fillStyle = "#ffd84d"; g.font = "900 120px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("SUPERMERCADO", 512, 132); });
  const sign = mesh(new THREE.PlaneGeometry(4.4, 1.1), new THREE.MeshBasicMaterial({ map: signT }), false); sign.position.set(0, 2.6, -29.9); shop.add(sign);
  // shelves
  const metal = M("#f0eef3", { roughness: 0.4, metalness: 0.3 }), backP = M("#d9d4e4", { roughness: 0.7 });
  const pal = ["#e63946", "#ffb703", "#2a9d8f", "#8338ec", "#fb5607", "#3a86ff", "#ff006e", "#06d6a0", "#ffffff", "#f4a261", "#118ab2", "#ef476f"];
  const boxGeo = new THREE.BoxGeometry(1, 1, 1), botGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 12);
  const boxes = [], bottles = [];
  for (const side of [-1, 1]) {
    const x0 = side * 2.05;
    const back = mesh(new THREE.BoxGeometry(0.06, 2.3, 34), backP); back.position.set(side * 2.45, 1.15, -12); shop.add(back);
    for (const y of [0.12, 0.62, 1.12, 1.62, 2.12]) {
      const board = mesh(new THREE.BoxGeometry(0.85, 0.05, 34), metal); board.position.set(x0, y, -12); shop.add(board);
      const lip = mesh(new THREE.BoxGeometry(0.02, 0.07, 34), new THREE.MeshStandardMaterial({ color: "#ffd84d", roughness: 0.5 })); lip.position.set(side * 1.62, y + 0.01, -12); shop.add(lip);
      if (y > 2) continue;
      let z = 4.8;
      const runType = () => (R() < 0.3 ? "b" : "x");
      let rt = runType(), runLeft = 3 + Math.floor(R() * 6), col = pal[Math.floor(R() * pal.length)], sz = [0.18 + R() * 0.12, 0.2 + R() * 0.2, 0.12 + R() * 0.14];
      while (z > -28.8) {
        if (runLeft-- <= 0) { rt = runType(); runLeft = 3 + Math.floor(R() * 7); col = pal[Math.floor(R() * pal.length)]; sz = [0.18 + R() * 0.12, 0.2 + R() * 0.22, 0.12 + R() * 0.14]; }
        for (let d = 0; d < 3; d++) {
          const xx = x0 - side * 0.28 + side * d * 0.26;
          if (rt === "b") bottles.push([xx, y + 0.025, z, 0.09, sz[1] + 0.06, col]);
          else boxes.push([xx, y + 0.025, z, sz[2], sz[1], sz[0], col]);
        }
        z -= (rt === "b" ? 0.11 : sz[0]) + 0.015;
      }
    }
    for (const z of [-29, 4.9]) { const up = mesh(new THREE.BoxGeometry(0.9, 2.3, 0.06), metal); up.position.set(x0, 1.15, z); shop.add(up); }
  }
  const im = new THREE.InstancedMesh(boxGeo, M("#ffffff", { roughness: 0.45 }), boxes.length);
  const ib = new THREE.InstancedMesh(botGeo, M("#ffffff", { roughness: 0.2, metalness: 0.1 }), bottles.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  boxes.forEach(([x, y, z, w, h, d, col], i) => { m4.compose(V3(x, y + h / 2, z), q, V3(w, h, d)); im.setMatrixAt(i, m4); im.setColorAt(i, c.set(col)); });
  bottles.forEach(([x, y, z, r, h, col], i) => { m4.compose(V3(x, y + h / 2, z), q, V3(r, h, r)); ib.setMatrixAt(i, m4); ib.setColorAt(i, c.set(col)); });
  im.castShadow = ib.castShadow = true; im.receiveShadow = ib.receiveShadow = true;
  shop.add(im, ib);
  // hanging signs
  const signs = [["OFERTAS", "#e63946"], ["BEBIDAS", "#3a86ff"], ["SALGADINHOS", "#fb5607"], ["PIZZAS", "#2a9d8f"]];
  signs.forEach(([t, col], i) => {
    const tx = label(t, col, "#ffffff", 512, 160, t.length > 8 ? 62 : 80);
    const s = rbox(1.5, 0.46, 0.05, 0.06, [new THREE.MeshStandardMaterial({ map: tx, roughness: 0.6 }), M(col)]);
    tx.repeat.set(1 / 1.5, 1 / 0.46); tx.offset.set(0.5, 0.5);
    s.position.set(0, 3.0, -2 - i * 6.5); shop.add(s);
    for (const sx of [-0.6, 0.6]) { const w = mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.4, 4), metal, false); w.position.set(sx, 3.4, -2 - i * 6.5); shop.add(w); }
  });
  // price tags
  const tagT = label("R$ 9,99", "#ffd84d", "#12002b", 256, 96, 44);
  const tagM = new THREE.MeshBasicMaterial({ map: tagT });
  for (const side of [-1, 1]) for (const y of [0.62, 1.12, 1.62]) for (let z = 3; z > -28; z -= 1.6 + R()) { const tg = mesh(new THREE.PlaneGeometry(0.18, 0.07), tagM, false); tg.position.set(side * 1.605, y - 0.02, z); tg.rotation.y = -side * Math.PI / 2; shop.add(tg); }
}
const shopHemi = new THREE.HemisphereLight("#ffffff", "#c9c0d6", 1.35); shop.add(shopHemi);
const shopSun = new THREE.DirectionalLight("#fff4e6", 2.2); shopSun.castShadow = true; shopSun.shadow.mapSize.set(1024, 1024);
Object.assign(shopSun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 14 }); shopSun.shadow.bias = -0.0006; shopSun.shadow.normalBias = 0.02;
shop.add(shopSun, shopSun.target);
const shopFill = new THREE.PointLight("#ffd2f0", 6, 9, 1.6); shop.add(shopFill);

// cart
const cart = new THREE.Group(); shop.add(cart);
{
  const chrome = M("#d7dce3", { roughness: 0.22, metalness: 0.85 }), redP = M("#e63946", { roughness: 0.4 });
  const gridT = canvasTex(256, 256, (g) => { g.clearRect(0, 0, 256, 256); g.strokeStyle = "#e3e7ee"; g.lineWidth = 7; for (let i = 0; i <= 256; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); } });
  const gm = new THREE.MeshStandardMaterial({ map: gridT, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, metalness: 0.8, roughness: 0.25 });
  const bw = 0.56, bl = 0.82, bh = 0.42, by = 0.48;
  const panel = (w, h, x, y, z, ry) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), gm); p.position.set(x, y, z); p.rotation.y = ry; p.castShadow = true; cart.add(p); };
  panel(bl, bh, -bw / 2, by + bh / 2, 0, Math.PI / 2); panel(bl, bh, bw / 2, by + bh / 2, 0, Math.PI / 2);
  panel(bw, bh, 0, by + bh / 2, -bl / 2, 0); panel(bw, bh, 0, by + bh / 2, bl / 2, 0);
  const bot = new THREE.Mesh(new THREE.PlaneGeometry(bw, bl), gm); bot.rotation.x = -Math.PI / 2; bot.position.y = by; cart.add(bot);
  const rim = (w, x, z, ry) => { const r = mesh(new THREE.CylinderGeometry(0.012, 0.012, w, 8), chrome); r.rotation.set(0, ry, Math.PI / 2); r.position.set(x, by + bh, z); cart.add(r); };
  rim(bw, 0, -bl / 2, 0); rim(bw, 0, bl / 2, 0); rim(bl, -bw / 2, 0, Math.PI / 2); rim(bl, bw / 2, 0, Math.PI / 2);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const leg = mesh(new THREE.CylinderGeometry(0.012, 0.012, by - 0.06, 8), chrome); leg.position.set(x * bw / 2, (by + 0.06) / 2, z * bl / 2 * 0.9); cart.add(leg);
    const wh = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.035, 14), M("#222")); wh.rotation.z = Math.PI / 2; wh.position.set(x * bw / 2, 0.045, z * bl / 2 * 0.9); cart.add(wh);
  }
  // handle on the back (towards -z, where the shopper stands)
  const hb = mesh(new THREE.CylinderGeometry(0.02, 0.02, bw + 0.06, 10), redP); hb.rotation.z = Math.PI / 2; hb.position.set(0, by + bh + 0.14, -bl / 2 - 0.1); cart.add(hb);
  for (const x of [-1, 1]) { const a = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 8), chrome); a.position.set(x * bw / 2, by + bh + 0.07, -bl / 2 - 0.05); a.rotation.x = -0.5; cart.add(a); }
  const base = mesh(new THREE.BoxGeometry(bw * 0.9, 0.02, bl * 0.9), chrome); base.position.y = 0.12; cart.add(base);
}
const CART_BY = 0.49;
const SLOTS = [];
{
  // layered slots inside the basket, then piling above
  const layer = [[-0.13, -0.2], [0.13, -0.2], [-0.13, 0.12], [0.13, 0.12], [0, -0.05], [0, 0.26]];
  for (let L = 0; L < 4; L++) layer.forEach(([x, z], i) => SLOTS.push([x + (L % 2 ? 0.03 : -0.02), CART_BY + 0.02 + L * 0.13, z + (L % 2 ? -0.03 : 0.02), (i * 1.7 + L) % 6.28]));
}
const shopper = makeCharacter(); shop.add(shopper.root);
const dropItems = DROPS.map(([t, kind], i) => { const m = makeFood(kind, i); m.visible = false; shop.add(m); return { t, m, kind, slot: SLOTS[i % SLOTS.length], side: i % 2 ? 1 : -1, y0: 0.7 + (i % 3) * 0.5 }; });

// ============================================================ LIVING ROOM (x = 60)
const X0 = 60;
const room = new THREE.Group(); room.position.x = X0; scene.add(room);
let tvTex, tvCanvas, tvCtx, skyMat, tvLight, lampLight, winLight, roomHemi, tableFood = [], trash = [];
{
  const wood = canvasTex(512, 512, (g) => { const r2 = rng(5); for (let i = 0; i < 16; i++) { const v = 120 + Math.floor(r2() * 40); g.fillStyle = `rgb(${v + 40},${v - 10},${v - 50})`; g.fillRect(0, i * 32, 512, 32); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, i * 32, 512, 2); const o = r2() * 512; g.fillRect(o, i * 32, 2, 32); } }, [3, 3]);
  const floor = mesh(new THREE.PlaneGeometry(7, 7.5), M("#ffffff", { map: wood, roughness: 0.42 }), false); floor.rotation.x = -Math.PI / 2; room.add(floor);
  const wallM = M("#3b2a5a", { roughness: 0.9 }), wallM2 = M("#4a2f6e", { roughness: 0.9 });
  const back = mesh(new THREE.PlaneGeometry(7, 3.2), wallM, false); back.position.set(0, 1.6, -3.1); room.add(back);
  const front = mesh(new THREE.PlaneGeometry(7, 3.2), wallM2, false); front.position.set(0, 1.6, 3.6); front.rotation.y = Math.PI; room.add(front);
  for (const sx of [-1, 1]) { const w = mesh(new THREE.PlaneGeometry(7.5, 3.2), wallM2, false); w.position.set(sx * 3.5, 1.6, 0.25); w.rotation.y = -sx * Math.PI / 2; room.add(w); }
  const ceil = mesh(new THREE.PlaneGeometry(7, 7.5), M("#2a1d40"), false); ceil.rotation.x = Math.PI / 2; ceil.position.y = 3.2; room.add(ceil);
  // neon strip on back wall
  const neon = mesh(new THREE.BoxGeometry(5.6, 0.03, 0.03), new THREE.MeshBasicMaterial({ color: "#ff2e88" }), false); neon.position.set(0, 2.85, -3.07); room.add(neon);
  // rug
  const rugT = canvasTex(512, 512, (g) => { g.fillStyle = "#1d3557"; g.fillRect(0, 0, 512, 512); g.strokeStyle = "#3df5ff"; g.lineWidth = 10; for (let r = 60; r < 260; r += 50) { g.beginPath(); g.arc(256, 256, r, 0, Math.PI * 2); g.stroke(); } });
  const rug = mesh(new THREE.CircleGeometry(1.6, 48), M("#ffffff", { map: rugT, roughness: 1 }), false); rug.rotation.x = -Math.PI / 2; rug.scale.set(1.3, 1, 1); rug.position.set(0, 0.006, 0.6); room.add(rug);
  // TV + cabinet
  const cab = rbox(2.6, 0.5, 0.48, 0.04, M("#6b4226", { roughness: 0.55 })); cab.position.set(0, 0.25, -2.8); room.add(cab);
  const tv = rbox(2.0, 1.16, 0.07, 0.03, M("#0b0b10", { roughness: 0.3, metalness: 0.4 })); tv.position.set(0, 1.42, -2.98); room.add(tv);
  tvCanvas = document.createElement("canvas"); tvCanvas.width = 640; tvCanvas.height = 360; tvCtx = tvCanvas.getContext("2d");
  tvTex = new THREE.CanvasTexture(tvCanvas); tvTex.colorSpace = THREE.SRGBColorSpace;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.07), new THREE.MeshBasicMaterial({ map: tvTex, toneMapped: false })); scr.position.set(0, 1.42, -2.94); room.add(scr);
  // console (generic white/black tower) on the cabinet
  const cw = M("#f4f5f8", { roughness: 0.3 }), ck = M("#15151c", { roughness: 0.35, metalness: 0.2 });
  const core = rbox(0.09, 0.4, 0.3, 0.02, ck); core.position.set(1.0, 0.71, -2.78); room.add(core);
  for (const sx of [-1, 1]) { const wing = rbox(0.025, 0.46, 0.33, 0.012, cw); wing.position.set(1.0 + sx * 0.06, 0.73, -2.78); wing.rotation.z = sx * 0.05; room.add(wing); }
  const led = mesh(new THREE.BoxGeometry(0.006, 0.3, 0.004), new THREE.MeshBasicMaterial({ color: "#3d8bff" }), false); led.position.set(1.0, 0.72, -2.62); room.add(led);
  // sofa
  const vel = M("#6a2c91", { roughness: 0.85 }), vel2 = M("#7d38a8", { roughness: 0.85 });
  const base = rbox(2.5, 0.42, 1.0, 0.08, vel); base.position.set(0, 0.25, 1.75); room.add(base);
  for (const sx of [-1, 1]) { const cu = rbox(1.08, 0.2, 0.86, 0.08, vel2); cu.position.set(sx * 0.56, 0.55, 1.7); room.add(cu); }
  const backr = rbox(2.5, 0.78, 0.28, 0.1, vel); backr.position.set(0, 0.82, 2.18); room.add(backr);
  for (const sx of [-1, 1]) { const ar = rbox(0.26, 0.62, 1.0, 0.1, vel); ar.position.set(sx * 1.24, 0.5, 1.75); room.add(ar); }
  const pil = rbox(0.42, 0.38, 0.14, 0.07, M("#ffd84d", { roughness: 0.9 })); pil.position.set(-0.85, 0.82, 1.98); pil.rotation.set(-0.25, 0.2, 0.15); room.add(pil);
  const blanket = rbox(0.6, 0.06, 0.5, 0.03, M("#3df5ff", { roughness: 0.95 })); blanket.position.set(0.9, 0.67, 1.8); blanket.rotation.y = 0.3; room.add(blanket);
  // coffee table
  const tw = M("#8a5a36", { roughness: 0.5 });
  const top = rbox(1.4, 0.06, 0.66, 0.03, tw); top.position.set(0, 0.42, 0.55); room.add(top);
  for (const [x, z] of [[-0.6, 0.27], [0.6, 0.27], [-0.6, 0.83], [0.6, 0.83]]) { const l = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), tw); l.position.set(x, 0.2, z); room.add(l); }
  const spots = [["pizza", -0.38, 0.55, 0.2], ["soda", 0.12, 0.4, 0], ["soda2", 0.25, 0.42, 0], ["popcorn", 0.48, 0.62, 0], ["chips", 0.05, 0.72, 0.5], ["can", 0.36, 0.8, 0], ["chips2", -0.1, 0.38, -0.3], ["can", 0.55, 0.36, 0]];
  spots.forEach(([k, x, z, ry], i) => { const f = makeFood(k, i); f.position.set(x, 0.45, z); f.rotation.y = ry; if (k.startsWith("chips")) { f.rotation.x = -1.45; f.position.y = 0.5; } room.add(f); tableFood.push(f); });
  const floorStack = []; for (let i = 0; i < 3; i++) { const f = makeFood("pizza", i); f.position.set(-1.65, 0.035 + i * 0.065, 1.1); f.rotation.y = i * 0.3; room.add(f); floorStack.push(f); }
  // trash that piles up while playing
  const r3 = rng(99);
  for (let i = 0; i < 26; i++) {
    const k = ["can", "chips", "pizza", "can", "chips2", "soda"][i % 6];
    const f = makeFood(k, i); const a = r3() * Math.PI * 2, rr = 0.5 + r3() * 1.1;
    f.position.set(Math.cos(a) * rr * 1.2, 0.02, 0.9 + Math.sin(a) * rr * 0.55);
    if (k === "can" || k === "soda") { f.rotation.z = Math.PI / 2; f.position.y = 0.04; }
    if (k.startsWith("chips")) { f.rotation.x = -Math.PI / 2; f.scale.y = 0.6; }
    if (k === "pizza") f.position.set(-1.65, 0.035 + (3 + Math.floor(i / 6)) * 0.065, 1.1);
    f.rotation.y = r3() * 6; f.visible = false; room.add(f); trash.push({ f, th: 0.08 + (i / 26) * 0.9 });
  }
  // window on the back wall (behind the sofa)
  skyMat = new THREE.ShaderMaterial({
    uniforms: { day: { value: 0 }, h: { value: 0 } },
    vertexShader: "varying vec2 vu; void main(){ vu=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
    fragmentShader: `uniform float day; uniform float h; varying vec2 vu;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1)))*43758.5); }
      void main(){
        vec3 nightTop=vec3(0.03,0.02,0.12), nightBot=vec3(0.18,0.06,0.32), dayTop=vec3(0.25,0.55,0.95), dayBot=vec3(0.75,0.88,1.0);
        vec3 c = mix(mix(nightBot,nightTop,vu.y), mix(dayBot,dayTop,vu.y), day);
        float st = step(0.985, hash(floor(vu*vec2(60.0,40.0)))) * (1.0-day); c += vec3(st);
        float ang = (h/24.0)*6.2831; vec2 sp = vec2(0.5 + 0.38*sin(ang), 0.2 - 0.55*cos(ang));
        vec2 mp = vec2(0.5 - 0.38*sin(ang), 0.2 + 0.55*cos(ang));
        float sun = smoothstep(0.09, 0.07, distance(vu*vec2(1.6,1.0), sp*vec2(1.6,1.0)));
        float moon = smoothstep(0.06, 0.05, distance(vu*vec2(1.6,1.0), mp*vec2(1.6,1.0)));
        c = mix(c, vec3(1.0,0.92,0.6), sun); c = mix(c, vec3(0.95,0.95,1.0), moon*(1.0-day*0.8));
        // skyline silhouette
        float x = vu.x*14.0; float b = 0.12 + 0.18*hash(vec2(floor(x),3.0));
        if (vu.y < b) { c = mix(vec3(0.05,0.02,0.1), vec3(0.25,0.3,0.4), day); float win = step(0.6, hash(floor(vu*vec2(90.0,60.0)))) * (1.0-day); c += vec3(1.0,0.8,0.3)*win*0.8; }
        gl_FragColor = vec4(c,1.0); }`,
  });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.15), skyMat); win.position.set(0, 1.85, 3.58); win.rotation.y = Math.PI; room.add(win);
  const frameM = M("#f2efe9", { roughness: 0.5 });
  for (const [w, h, x, y] of [[1.92, 0.07, 0, 2.43], [1.92, 0.07, 0, 1.27], [0.07, 1.22, -0.93, 1.85], [0.07, 1.22, 0.93, 1.85], [0.04, 1.15, 0, 1.85], [1.8, 0.04, 0, 1.85]]) { const f = rbox(w, h, 0.06, 0.015, frameM); f.position.set(x, y, 3.56); room.add(f); }
  for (const sx of [-1, 1]) { const cu = rbox(0.42, 1.65, 0.06, 0.03, M("#ff2e88", { roughness: 0.95 })); cu.position.set(sx * 1.15, 1.75, 3.5); room.add(cu); }
  // lamp
  const pole = mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8), M("#222")); pole.position.set(1.75, 0.75, 2.2); room.add(pole);
  const lbase = mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.04, 16), M("#222")); lbase.position.set(1.75, 0.02, 2.2); room.add(lbase);
  const shade = mesh(new THREE.CylinderGeometry(0.16, 0.26, 0.3, 20, 1, true), new THREE.MeshStandardMaterial({ color: "#ffe2b0", emissive: "#ffb347", emissiveIntensity: 1.2, side: THREE.DoubleSide }), false); shade.position.set(1.75, 1.55, 2.2); room.add(shade);
  // plant
  const pot = mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.3, 14), M("#e76f51")); pot.position.set(-1.8, 0.15, 2.4); room.add(pot);
  for (let i = 0; i < 9; i++) { const lf = mesh(new THREE.ConeGeometry(0.07, 0.6, 5), M("#2d6a4f", { roughness: 0.7 })); lf.geometry.translate(0, 0.3, 0); lf.position.set(-1.8, 0.28, 2.4); lf.rotation.set(0.45 * Math.cos(i), i * 0.7, 0.45 * Math.sin(i * 1.3)); room.add(lf); }
  // posters (own art)
  const posterT = canvasTex(256, 360, (g) => { const gr = g.createLinearGradient(0, 0, 0, 360); gr.addColorStop(0, "#12002b"); gr.addColorStop(0.6, "#ff2e88"); gr.addColorStop(1, "#ffd84d"); g.fillStyle = gr; g.fillRect(0, 0, 256, 360); g.fillStyle = "#ffd84d"; g.beginPath(); g.arc(128, 210, 70, 0, Math.PI * 2); g.fill(); g.fillStyle = "#12002b"; for (let i = 0; i < 6; i++) g.fillRect(40, 215 + i * 12, 176, 4 + i); g.fillRect(0, 280, 256, 80); });
  for (const sx of [-1, 1]) { const po = mesh(new THREE.PlaneGeometry(0.62, 0.88), new THREE.MeshStandardMaterial({ map: posterT, roughness: 0.6 }), false); po.position.set(sx * 2.15, 1.75, -3.08); room.add(po); }
  // lights
  roomHemi = new THREE.HemisphereLight("#9d8cff", "#2a1640", 0.35); room.add(roomHemi);
  tvLight = new THREE.PointLight("#7fd8ff", 9, 7, 1.4); tvLight.position.set(0, 1.4, -2.3); room.add(tvLight);
  lampLight = new THREE.PointLight("#ffb347", 6, 6, 1.6); lampLight.position.set(1.75, 1.45, 2.2); lampLight.castShadow = true; lampLight.shadow.mapSize.set(512, 512); lampLight.shadow.bias = -0.002; room.add(lampLight);
  winLight = new THREE.DirectionalLight("#fff1d6", 0); winLight.position.set(0.8, 3.0, 6); winLight.target.position.set(0, 0.5, 0); winLight.castShadow = true; winLight.shadow.mapSize.set(1024, 1024);
  Object.assign(winLight.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -3.5, near: 1, far: 12 }); winLight.shadow.bias = -0.0008; room.add(winLight, winLight.target);
}
const gamer = makeCharacter(); room.add(gamer.root);

// ------------------------------------------------------------ TV screen drawing
function drawTV(t) {
  const g = tvCtx, w = 640, h = 360;
  if (t < P.L3) { g.fillStyle = "#05030c"; g.fillRect(0, 0, w, h); return "#101020"; }
  if (t < P.launch) {
    const n = t < P.dois ? 3 : t < P.um ? 2 : 1; const k = t < P.dois ? (t - P.tres) : t < P.um ? (t - P.dois) : (t - P.um);
    const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, 360); gr.addColorStop(0, "#3a0f5e"); gr.addColorStop(1, "#06010f"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.save(); g.translate(w / 2, h / 2 + 10); const s = 1.4 - 0.4 * clamp(k * 3); g.scale(s, s);
    g.font = "900 230px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 16; g.strokeStyle = "#ff2e88"; g.strokeText(String(n), 0, 0); g.fillStyle = "#ffffff"; g.fillText(String(n), 0, 0); g.restore();
    g.font = "900 30px Arial Black, Arial"; g.fillStyle = "#3df5ff"; g.textAlign = "center"; g.fillText("COMEÇANDO EM...", w / 2, 40);
    return "#a040ff";
  }
  const tt = t - P.launch;
  // synthwave drive
  const sky = g.createLinearGradient(0, 0, 0, h * 0.55); sky.addColorStop(0, "#14002e"); sky.addColorStop(1, "#ff4f9a"); g.fillStyle = sky; g.fillRect(0, 0, w, h * 0.55);
  g.fillStyle = "#ffd84d"; g.beginPath(); g.arc(w / 2, h * 0.5, 80, Math.PI, 0); g.fill();
  g.fillStyle = "#ff4f9a"; for (let i = 0; i < 6; i++) g.fillRect(w / 2 - 90, h * 0.5 - 8 - i * 12, 180, 3 + i * 0.6);
  // skyline
  const r4 = rng(11); g.fillStyle = "#1a0633";
  for (let i = 0; i < 22; i++) { const bx = ((i * 34 - tt * 8) % 760 + 760) % 760 - 60, bh2 = 30 + r4() * 70; g.fillRect(bx, h * 0.55 - bh2, 26, bh2); }
  g.fillStyle = "#1b0838"; g.fillRect(0, h * 0.55, w, h * 0.45);
  g.strokeStyle = "#3df5ff"; g.lineWidth = 2;
  for (let i = -10; i <= 10; i++) { g.beginPath(); g.moveTo(w / 2 + i * 12, h * 0.55); g.lineTo(w / 2 + i * 110, h); g.stroke(); }
  for (let i = 0; i < 10; i++) { const z = ((i + tt * 2.2) % 10) / 10; const y = h * 0.55 + Math.pow(z, 2.2) * h * 0.45; g.globalAlpha = z; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.globalAlpha = 1;
  // palms passing
  for (let i = 0; i < 4; i++) {
    const z = ((i / 4 + tt * 0.45) % 1); const s = 0.2 + z * z * 2.4; const yb = h * 0.55 + z * z * h * 0.45;
    for (const sd of [-1, 1]) { const x = w / 2 + sd * (40 + z * z * 420); g.fillStyle = "#0d0420"; g.fillRect(x - 3 * s, yb - 90 * s, 6 * s, 90 * s); for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(x + Math.cos(k) * 22 * s, yb - 92 * s + Math.sin(k * 2) * 6 * s, 26 * s, 7 * s, Math.cos(k) * 0.6, 0, Math.PI * 2); g.fill(); } }
  }
  // car (rear view)
  const sway = Math.sin(tt * 1.7) * 30;
  g.fillStyle = "#e63946"; g.fillRect(w / 2 - 70 + sway, h - 95, 140, 50); g.fillStyle = "#12002b"; g.fillRect(w / 2 - 55 + sway, h - 125, 110, 32);
  g.fillStyle = "#ff2e88"; g.fillRect(w / 2 - 66 + sway, h - 82, 30, 10); g.fillRect(w / 2 + 36 + sway, h - 82, 30, 10);
  g.fillStyle = "#111"; g.fillRect(w / 2 - 74 + sway, h - 48, 30, 18); g.fillRect(w / 2 + 44 + sway, h - 48, 30, 18);
  // flash at launch + PRESS START
  if (tt < 1.6) { g.font = "900 44px Arial Black, Arial"; g.textAlign = "center"; g.fillStyle = Math.floor(tt * 4) % 2 ? "#ffffff" : "#ffd84d"; g.fillText("PRESS START", w / 2, 70); }
  if (tt < 0.35) { g.fillStyle = `rgba(255,255,255,${1 - tt / 0.35})`; g.fillRect(0, 0, w, h); }
  return tt < 0.35 ? "#ffffff" : "#ff6ab8";
}

// ------------------------------------------------------------ cameras
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
function setCam(p, l) { camera.position.copy(p); camera.lookAt(l); }
function lerpV(a, b, k) { return a.clone().lerp(b, k); }

// ------------------------------------------------------------ render
function shopperZ(t) { // walks from -9 to -1.8 then stops
  const a = 0.0, b = P.L2 + 0.6; const k = ramp(t, a, b);
  return mix(-9.5, -2.2, k);
}
function renderAt(t) {
  const inShop = t < P.L3 - 0.1;
  shop.visible = inShop; room.visible = !inShop;
  if (inShop) {
    const z = shopperZ(t); const walking = t < P.L2 + 0.6;
    shopper.root.position.set(0, 0, z); shopper.root.rotation.y = 0;
    cart.position.set(0, 0, z + 0.95);
    const ph = (z + 9.5) * 4.2;
    let pose = walking ? POSE.walkPush(t, ph) : POSE.push(t);
    if (t > P.L2 + 0.9) pose = blendPose(POSE.push(t), POSE.watch(t), smooth(ramp(t, P.L2 + 0.9, P.L2 + 1.4)));
    applyPose(shopper, pose);
    shopper.mouth.visible = true; shopper.mouthO.visible = false; shopper.lids.forEach((l) => (l.scale.y = 0.35));
    // look at items as they arrive
    let look = 0; for (const d of dropItems) if (t > d.t - 0.2 && t < d.t + 0.7) look = d.side * 0.35;
    if (t < P.L2 + 0.9) shopper.head.rotation.y = look;
    // flying food
    for (const d of dropItems) {
      if (t < d.t) { d.m.visible = false; continue; }
      d.m.visible = true;
      const k = clamp((t - d.t) / 0.55);
      const cz = z + 0.95; // cart z at time t
      const zStart = shopperZ(d.t) + 1.2;
      const start = V3(d.side * 1.75, d.y0 + 0.4, zStart);
      const end = V3(d.slot[0], d.slot[1], cz + d.slot[2]);
      const p = start.clone().lerp(end, ease(k)); p.y += Math.sin(k * Math.PI) * 0.6;
      d.m.position.copy(p);
      d.m.rotation.set((1 - k) * 4 + (d.kind.startsWith("chips") ? -1.4 : 0), d.slot[3] + (1 - k) * 3, 0);
      const sq = k >= 1 ? 1 + Math.max(0, 0.18 - (t - d.t - 0.55)) * 1.2 * Math.sin((t - d.t - 0.55) * 30) : 1;
      d.m.scale.set(1, sq, 1);
    }
    shopSun.position.set(2.5, 5.5, z + 3); shopSun.target.position.set(0, 0, z); shopFill.position.set(0.8, 2.2, z + 3);
    // camera
    if (t < P.L1 - 0.1) {
      const k = ramp(t, 0, P.L1);
      setCam(V3(mix(0.9, 0.5, k), mix(1.25, 1.45, k), z + mix(4.6, 3.6, k)), V3(0, 1.0, z + 0.4));
    } else if (t < P.L2 - 0.1) {
      const k = ramp(t, P.L1, P.L2);
      setCam(V3(mix(1.45, 1.2, k), mix(2.05, 1.95, k), z + mix(3.4, 3.1, k)), V3(0, 1.15, z + 0.45));
    } else {
      const k = smooth(ramp(t, P.L2, P.L3));
      setCam(V3(mix(-1.3, -0.7, k), mix(1.35, 1.55, k), z + mix(3.4, 2.4, k)), V3(0, mix(1.05, 1.35, k), z + 0.3));
    }
  } else {
    const hrs = lerpK(PLAY, t) / 3600; const hod = (hrs % 24);
    const day = t < P.launch ? 0 : clamp(Math.sin(((hod - 6) / 24) * Math.PI * 2) * 1.6 + 0.2);
    skyMat.uniforms.day.value = day; skyMat.uniforms.h.value = hod;
    const scrCol = drawTV(t); tvTex.needsUpdate = true;
    tvLight.color.set(scrCol); tvLight.intensity = t < P.L3 + 0.05 ? 1 : 9 + Math.sin(t * 13) * 1.2;
    winLight.intensity = day * 2.6; roomHemi.intensity = 0.35 + day * 1.1; lampLight.intensity = 6 * (1 - day * 0.8);
    renderer.toneMappingExposure = 1.05 + day * 0.1;
    // food disappearing / trash growing
    const prog = clamp(hrs / 55);
    tableFood.forEach((f, i) => { f.visible = prog < 0.25 + (i / tableFood.length) * 0.7; });
    trash.forEach((o) => (o.f.visible = prog > o.th));
    // character
    const tired = clamp((hrs - 20) / 30);
    let pose, pos, rotY = Math.PI;
    if (t < P.launch) { pose = POSE.hype(t); pos = V3(-0.3, 0, 0.25); gamer.ctrl.visible = true; }
    else if (t < P.L4 - 0.1) { pose = POSE.cheer(t); pos = V3(0.15, 0, 0.25); gamer.ctrl.visible = false; }
    else {
      const k = clamp((t - (P.L4 - 0.1)) / 0.85);
      gamer.ctrl.visible = k > 0.7;
      if (k < 1) { pose = blendPose(POSE.cheer(t), POSE.sitPlay(t, 0), smooth(k)); pos = V3(mix(0.15, 0.0, k), Math.sin(k * Math.PI) * 0.55, mix(0.25, 1.62, smooth(k))); }
      else { pose = POSE.sitPlay(t, tired); pos = V3(0, 0, 1.62); }
    }
    gamer.root.position.copy(pos); gamer.root.rotation.y = rotY;
    applyPose(gamer, pose);
    const blink = (Math.floor(t * 0.7) % 4 === 0 && (t * 0.7) % 1 < 0.08) ? 1 : 0;
    gamer.lids.forEach((l) => (l.scale.y = Math.max(blink, 0.3 + tired * 0.6)));
    gamer.mouth.visible = !(t > P.launch - 0.1 && t < P.L4 + 0.8); gamer.mouthO.visible = !gamer.mouth.visible;
    if (gamer.ctrl.visible) gamer.ctrl.position.set(0, 0.17, 0.36);
    // cameras
    const W0 = (x, y, z) => V3(X0 + x, y, z);
    if (t < P.launch) { // over the shoulder to the TV countdown
      const k = ramp(t, P.L3, P.launch);
      setCam(W0(0.75, 1.7, mix(1.9, 1.5, k)), W0(0.05, 1.3, -2.95));
    } else if (t < P.L4 - 0.1) { // reaction from the TV
      const k = ramp(t, P.launch, P.L4);
      setCam(W0(0.1, 1.4, mix(-2.75, -2.55, k)), W0(0.15, 1.3, 0.3));
    } else if (t < P.L4 + (P.L5 - P.L4) * 0.5) { // wide: jump onto the sofa, food
      const k = smooth(ramp(t, P.L4, P.L5));
      setCam(W0(mix(2.1, 1.8, k), mix(1.7, 1.6, k), mix(-1.9, -1.6, k)), W0(-0.1, 0.75, 1.1));
    } else if (t < P.L5 - 0.1) { // behind the sofa: the game on the TV
      const k = smooth(ramp(t, P.L4 + (P.L5 - P.L4) * 0.5, P.L5));
      setCam(W0(mix(0.4, 0.3, k), mix(1.8, 1.72, k), mix(3.35, 3.15, k)), W0(-0.15, 1.05, -2.9));
    } else if (t < P.L6 - 0.1) { // time-lapse: front view with window behind
      const k = ramp(t, P.L5, P.L6);
      setCam(W0(0.25, mix(1.2, 1.3, k), mix(-1.55, -1.0, k)), W0(0, 1.15, 2.0));
    } else { // pull back
      const k = smooth(ramp(t, P.L6, P.total));
      setCam(W0(mix(0.8, 1.3, k), mix(1.7, 2.1, k), mix(-1.5, -2.1, k)), W0(0, 1.0, 1.6));
    }
  }
  renderer.render(scene, camera);
}
window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
renderAt(0);
