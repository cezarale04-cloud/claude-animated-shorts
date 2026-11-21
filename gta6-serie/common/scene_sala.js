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

// ============================================================ NEWS MODE: TV modes, seated reactions, cameras from cfg
const TVM = CFG.tv || [[0, "game"]];      // [t0, mode]
const POSES = CFG.poses || [[0, "play"]];  // [t0, pose]
const CAMS = CFG.cams || [["front", 0, 999]];
const at0 = (list, t) => { let cur = list[0], i0 = 0; list.forEach((x, i) => { if (t >= x[0]) { cur = x; i0 = i; } }); return [cur, i0]; };

function drawSynth(g, w, h, tt, opt = {}) {
  const sky = g.createLinearGradient(0, 0, 0, h * 0.55); sky.addColorStop(0, "#14002e"); sky.addColorStop(1, "#ff4f9a"); g.fillStyle = sky; g.fillRect(0, 0, w, h * 0.55);
  g.fillStyle = "#ffd84d"; g.beginPath(); g.arc(w / 2, h * 0.5, 80, Math.PI, 0); g.fill();
  g.fillStyle = "#ff4f9a"; for (let i = 0; i < 6; i++) g.fillRect(w / 2 - 90, h * 0.5 - 8 - i * 12, 180, 3 + i * 0.6);
  const r4 = rng(11); g.fillStyle = "#1a0633";
  for (let i = 0; i < 22; i++) { const bx = ((i * 34 - tt * 8) % 760 + 760) % 760 - 60, bh2 = 30 + r4() * 70; g.fillRect(bx, h * 0.55 - bh2, 26, bh2); }
  g.fillStyle = "#1b0838"; g.fillRect(0, h * 0.55, w, h * 0.45);
  g.strokeStyle = "#3df5ff"; g.lineWidth = 2;
  for (let i = -10; i <= 10; i++) { g.beginPath(); g.moveTo(w / 2 + i * 12, h * 0.55); g.lineTo(w / 2 + i * 110, h); g.stroke(); }
  for (let i = 0; i < 10; i++) { const z = ((i + tt * 2.2) % 10) / 10; const y = h * 0.55 + Math.pow(z, 2.2) * h * 0.45; g.globalAlpha = z; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.globalAlpha = 1;
  const sway = Math.sin(tt * 1.7) * 30, cy = opt.floatCar ? -60 - Math.sin(tt * 2) * 25 : 0;
  g.save(); if (opt.floatCar) { g.translate(w / 2 + sway, h - 70 + cy); g.rotate(Math.sin(tt * 1.3) * 0.5); g.translate(-(w / 2 + sway), -(h - 70)); }
  g.fillStyle = "#e63946"; g.fillRect(w / 2 - 70 + sway, h - 95, 140, 50); g.fillStyle = "#12002b"; g.fillRect(w / 2 - 55 + sway, h - 125, 110, 32);
  g.fillStyle = "#ff2e88"; g.fillRect(w / 2 - 66 + sway, h - 82, 30, 10); g.fillRect(w / 2 + 36 + sway, h - 82, 30, 10);
  g.fillStyle = "#111"; g.fillRect(w / 2 - 74 + sway, h - 48, 30, 18); g.fillRect(w / 2 + 44 + sway, h - 48, 30, 18);
  g.restore();
}
function centerText(g, txt, x, y, size, fill, stroke) { g.font = `900 ${size}px Arial Black, Arial`; g.textAlign = "center"; g.textBaseline = "middle"; if (stroke) { g.lineWidth = size / 8; g.strokeStyle = stroke; g.strokeText(txt, x, y); } g.fillStyle = fill; g.fillText(txt, x, y); }
function drawTVNews(t) {
  const g = tvCtx, w = 640, h = 360;
  const [[t0, mode]] = at0(TVM, t); const tt = t - t0;
  if (mode.startsWith("txt|")) { // generic card: "txt|small label|BIG|sub"
    const [, a, b, c] = mode.split("|");
    const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, 380); gr.addColorStop(0, "#2b0b4f"); gr.addColorStop(1, "#06010f"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const s = 1 + Math.max(0, 0.2 - tt) * 1.5;
    if (a) centerText(g, a, w / 2, 70, 30, "#3df5ff");
    if (b) { // fit the big line inside the visible screen (edges are cropped by the TV frame)
      let size = 110; g.font = `900 ${size}px Arial Black, Arial`; const wd = g.measureText(b).width;
      size *= Math.min(1, (w - 140) / wd);
      centerText(g, b, w / 2, 175, size * s, "#ffffff", "#12002b");
    }
    if (c) centerText(g, c, w / 2, 285, 36, "#ffd84d", "#12002b");
    return "#9a7bff";
  }
  if (mode === "topdown") { // 1997-style top-down chase
    g.fillStyle = "#2f6b2f"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#555"; g.fillRect(250, 0, 140, h); g.fillRect(0, 130, w, 100);
    g.fillStyle = "#ddd"; for (let y = -40; y < h; y += 40) g.fillRect(318, ((y + tt * 160) % (h + 40)), 4, 20);
    g.fillStyle = "#8a6a4a"; [[40, 20], [460, 20], [40, 260], [460, 260]].forEach(([x, y]) => g.fillRect(x, y, 150, 90));
    const cy = h - 60 - ((tt * 120) % (h + 60)) + 60;
    g.fillStyle = "#ffd84d"; g.fillRect(290, cy, 26, 44);
    g.fillStyle = "#fff"; g.fillRect(332, cy + 70, 26, 44); g.fillStyle = Math.floor(tt * 8) % 2 ? "#e63946" : "#3d6bff"; g.fillRect(336, cy + 74, 18, 8);
    centerText(g, "1997", 560, 330, 30, "#ffffff", "#12002b");
    return "#5aa05a";
  }
  if (mode === "cops") { // aggressive police cars ramming the player
    g.fillStyle = "#1b1b2b"; g.fillRect(0, 0, w, h); g.fillStyle = "#2a2a3a"; g.fillRect(0, h * 0.45, w, h * 0.55);
    g.fillStyle = "#ffd84d"; for (let x = -60; x < w; x += 90) g.fillRect(((x - tt * 300) % (w + 90) + w + 90) % (w + 90) - 60, h * 0.72, 50, 6);
    const shake = Math.sin(tt * 40) * (Math.floor(tt * 1.5) % 2 ? 6 : 0);
    g.fillStyle = "#e63946"; g.fillRect(260 + shake, 210, 130, 50); g.fillStyle = "#12002b"; g.fillRect(280 + shake, 186, 90, 28);
    [[90, 200], [440, 222]].forEach(([x, y], i) => {
      const dx = Math.sin(tt * 3 + i) * 20; g.fillStyle = "#f4f4f4"; g.fillRect(x + dx, y, 120, 46); g.fillStyle = "#12002b"; g.fillRect(x + 18 + dx, y - 24, 84, 26);
      g.fillStyle = (Math.floor(tt * 8) + i) % 2 ? "#e63946" : "#3d6bff"; g.fillRect(x + 40 + dx, y - 34, 40, 10);
    });
    if (Math.floor(tt * 1.5) % 2) centerText(g, "BUM!", 250, 150, 44, "#ffd84d", "#12002b");
    centerText(g, "POLÍCIA", w / 2, 40, 30, "#ffffff", "#12002b");
    return "#5070ff";
  }
  if (mode === "mural") { // cave-painting mural: UFO, egg, jetpack man, boxes
    g.fillStyle = "#c9a878"; g.fillRect(0, 0, w, h);
    const r9 = rng(4); g.fillStyle = "rgba(90,60,30,.18)"; for (let i = 0; i < 90; i++) g.fillRect(r9() * w, r9() * h, 6 + r9() * 20, 3);
    g.strokeStyle = "#3a2410"; g.fillStyle = "#3a2410"; g.lineWidth = 6;
    g.beginPath(); g.ellipse(150, 120, 70, 18, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.ellipse(150, 104, 30, 18, 0, Math.PI, 0); g.stroke();
    g.beginPath(); g.ellipse(320, 120, 32, 44, 0, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(490, 80, 14, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(490, 94); g.lineTo(490, 150); g.moveTo(470, 110); g.lineTo(510, 110); g.moveTo(490, 150); g.lineTo(475, 180); g.moveTo(490, 150); g.lineTo(505, 180); g.stroke();
    g.fillRect(470, 100, 12, 34); g.fillStyle = "#e66a1a"; g.beginPath(); g.moveTo(470, 134); g.lineTo(482, 134); g.lineTo(476, 150 + Math.sin(tt * 20) * 6); g.fill();
    g.strokeStyle = "#3a2410"; g.lineWidth = 4;
    for (let i = 0; i < 6; i++) { const x = 90 + i * 80, y = 240 + (i % 2) * 30; g.strokeRect(x, y, 50, 40); if (i % 2 === 0) { g.beginPath(); g.moveTo(x + 8, y + 8); g.lineTo(x + 42, y + 32); g.moveTo(x + 42, y + 8); g.lineTo(x + 8, y + 32); g.stroke(); } if (i < 5) { g.beginPath(); g.moveTo(x + 50, y + 20); g.lineTo(x + 80, 240 + ((i + 1) % 2) * 30 + 20); g.stroke(); } }
    const glow = 0.15 + 0.15 * Math.sin(tt * 3); g.fillStyle = `rgba(255,216,77,${glow})`; g.fillRect(0, 0, w, h);
    return "#d9a860";
  }
  if (mode === "record") { // world record medal
    g.fillStyle = "#0b0720"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + tt * 0.6; g.fillStyle = "rgba(255,216,77,.08)"; g.beginPath(); g.moveTo(w / 2, 170); g.arc(w / 2, 170, 400, a, a + 0.12); g.fill(); }
    g.fillStyle = "#e63946"; g.beginPath(); g.moveTo(w / 2 - 50, 40); g.lineTo(w / 2 - 10, 120); g.lineTo(w / 2 - 50, 120); g.fill(); g.beginPath(); g.moveTo(w / 2 + 50, 40); g.lineTo(w / 2 + 10, 120); g.lineTo(w / 2 + 50, 120); g.fill();
    const s = 1 + Math.max(0, 0.3 - tt) * 2;
    g.fillStyle = "#ffd84d"; g.beginPath(); g.arc(w / 2, 175, 75 * s, 0, Math.PI * 2); g.fill(); g.fillStyle = "#d4a017"; g.beginPath(); g.arc(w / 2, 175, 58 * s, 0, Math.PI * 2); g.fill();
    centerText(g, "★", w / 2, 178, 70 * s, "#fff6c9");
    centerText(g, "RECORDE MUNDIAL", w / 2, 300, 36, "#ffffff", "#12002b");
    return "#ffd84d";
  }
  if (mode === "score") {
    const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, 380); gr.addColorStop(0, "#2b0b4f"); gr.addColorStop(1, "#06010f"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const n = Math.min(99, Math.round(99 * easeOutC(clamp(tt / 1.2))));
    const s = 1 + Math.max(0, 0.25 - (tt - 1.2)) * (tt > 1.2 ? 1 : 0);
    g.fillStyle = "#2ecc71"; const bw = 220 * s; g.fillRect(w / 2 - bw / 2, 70, bw, 190 * s); centerText(g, String(n), w / 2, 70 + 95 * s, 150 * s, "#ffffff");
    centerText(g, "NOTA DOS CRÍTICOS", w / 2, 40, 30, "#3df5ff");
    centerText(g, "★★★★★", w / 2, 315, 40, "#ffd84d");
    return "#9a7bff";
  }
  if (mode === "error") {
    g.fillStyle = "#0b0f2a"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#ffffff"; g.lineWidth = 8; g.beginPath(); g.arc(w / 2, 120, 46, 0, Math.PI * 2); g.stroke();
    centerText(g, "!", w / 2, 122, 64, "#ffffff");
    centerText(g, "ERRO DE CONEXÃO", w / 2, 220, 40, "#ffffff");
    centerText(g, "Serviços ocupados. Tente mais tarde.", w / 2, 275, 24, "#9aa7d9");
    if (Math.floor(tt * 2) % 2) { g.fillStyle = "rgba(255,46,136,.15)"; g.fillRect(0, 0, w, h); }
    return "#3a5bff";
  }
  if (mode === "loading") {
    g.fillStyle = "#05030c"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + tt * 5; g.globalAlpha = (i + 1) / 12; g.fillStyle = "#ffffff"; g.beginPath(); g.arc(w / 2 + Math.cos(a) * 50, h / 2 - 20 + Math.sin(a) * 50, 8, 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = 1; centerText(g, "CARREGANDO" + ".".repeat(1 + Math.floor(tt * 2) % 3), w / 2, h - 70, 32, "#3df5ff");
    return "#202040";
  }
  if (mode === "off") { g.fillStyle = "#000"; g.fillRect(0, 0, w, h); const k = clamp(1 - tt / 0.25); if (k > 0) { g.fillStyle = "#fff"; g.fillRect(0, h / 2 - 2 * k * 40, w, 4 * k * 40 + 1); } return "#000000"; }
  if (mode === "fps") {
    drawSynth(g, w, h, Math.floor(tt * 30) / 30);
    g.fillStyle = "rgba(0,0,0,.7)"; g.fillRect(16, 14, 150, 50); centerText(g, "30 FPS", 91, 40, 30, "#ffd84d");
    return "#ff6ab8";
  }
  if (mode === "walls") { // pedestrian walking into a wall, again and again
    g.fillStyle = "#3a2a5a"; g.fillRect(0, 0, w, h); g.fillStyle = "#c9a27a"; g.fillRect(0, h * 0.7, w, h * 0.3);
    g.fillStyle = "#e63946"; g.fillRect(430, 40, 160, h * 0.7 - 40); g.fillStyle = "#b82e3a"; for (let y = 60; y < h * 0.7; y += 30) g.fillRect(430, y, 160, 4);
    const ph = (tt * 1.4) % 1; const x = 300 + Math.min(ph * 3, 1) * 112 - (ph > 0.4 && ph < 0.5 ? (0.5 - ph) * 80 : 0);
    const bob = Math.abs(Math.sin(tt * 10)) * 6;
    g.fillStyle = "#1fb5a8"; g.fillRect(x - 14, h * 0.7 - 90 - bob, 28, 50); g.fillStyle = "#e0a07a"; g.beginPath(); g.arc(x, h * 0.7 - 105 - bob, 16, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#2c3e7a"; g.fillRect(x - 12, h * 0.7 - 40 - bob, 10, 40); g.fillRect(x + 2, h * 0.7 - 40 - bob, 10, 40);
    if (ph > 0.33 && ph < 0.6) { centerText(g, "TOC!", x + 30, h * 0.7 - 150, 30, "#ffd84d", "#12002b"); }
    centerText(g, "NPC vs PAREDE", 200, 40, 30, "#ffffff", "#12002b");
    return "#c06080";
  }
  if (mode === "float") {
    drawSynth(g, w, h, tt, { floatCar: true });
    centerText(g, "?!", w / 2 + 120, 120, 60, "#ffd84d", "#12002b");
    return "#ff6ab8";
  }
  if (mode === "popin") { // clothes popping in late
    g.fillStyle = "#2a1640"; g.fillRect(0, 0, w, h);
    const has = (tt % 2) > 0.8;
    g.fillStyle = "#e0a07a"; g.beginPath(); g.arc(w / 2, 110, 36, 0, Math.PI * 2); g.fill();
    g.fillStyle = has ? "#ff2e88" : "#e0a07a"; g.fillRect(w / 2 - 50, 150, 100, 110);
    g.fillStyle = has ? "#2c3e7a" : "#e0a07a"; g.fillRect(w / 2 - 45, 260, 40, 80); g.fillRect(w / 2 + 5, 260, 40, 80);
    if (!has) centerText(g, "CADÊ A ROUPA?", w / 2, 40, 34, "#ffd84d", "#12002b");
    else { g.globalAlpha = clamp(1 - ((tt % 2) - 0.8) * 3); centerText(g, "PLIM!", w / 2 + 150, 180, 40, "#3df5ff", "#12002b"); g.globalAlpha = 1; }
    return "#a050c0";
  }
  if (mode === "update") {
    g.fillStyle = "#05030c"; g.fillRect(0, 0, w, h);
    centerText(g, "ATUALIZAÇÃO DISPONÍVEL", w / 2, 90, 32, "#ffffff");
    g.fillStyle = "#222"; g.fillRect(120, 170, 400, 26); g.fillStyle = "#3df5ff"; g.fillRect(120, 170, 400 * clamp(tt / 2.5), 26);
    centerText(g, "Notas da atualização: ???", w / 2, 260, 26, "#9aa7d9");
    return "#203060";
  }
  if (mode === "money") { // day-one revenue counter
    const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, 380); gr.addColorStop(0, "#0d3b22"); gr.addColorStop(1, "#03100a"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r6 = rng(5); g.fillStyle = "#2ecc71";
    for (let i = 0; i < 26; i++) { const x = r6() * w, y = ((r6() * h + tt * (60 + r6() * 80)) % (h + 40)) - 20; g.globalAlpha = 0.35; g.fillRect(x, y, 34, 16); }
    g.globalAlpha = 1;
    const v = (3.79 * easeOutC(clamp(tt / 0.7))).toFixed(2).replace(".", ",");
    centerText(g, "VENDAS NO 1º DIA", w / 2, 60, 30, "#3df5ff");
    centerText(g, "US$ " + v, w / 2, 170, 104, "#ffffff", "#0b2a18");
    centerText(g, "BILHÕES", w / 2, 270, 52, "#ffd84d", "#0b2a18");
    return "#3dff8a";
  }
  if (mode === "compare") { // GTA 5 vs GTA 6 day one bars
    g.fillStyle = "#0b0720"; g.fillRect(0, 0, w, h);
    const k = easeOutC(clamp(tt / 1.4)), base = 300, full = 210;
    g.fillStyle = "#6c7bd9"; const h5 = full * 0.8 / 3.79 * k; g.fillRect(150, base - h5, 120, h5);
    g.fillStyle = "#2ecc71"; const h6 = full * k; g.fillRect(370, base - h6, 120, h6);
    centerText(g, "GTA 5", 210, 330, 28, "#ffffff"); centerText(g, "GTA 6", 430, 330, 28, "#ffffff");
    centerText(g, "US$ 0,8 BI", 210, base - h5 - 22, 26, "#c9d0ff"); centerText(g, "US$ 3,79 BI", 430, base - h6 - 22, 26, "#ffd84d");
    centerText(g, "1º DIA", w / 2, 36, 28, "#3df5ff");
    return "#5aa0ff";
  }
  if (mode === "copies") { // copies sold: still a secret
    g.fillStyle = "#120a24"; g.fillRect(0, 0, w, h);
    centerText(g, "CÓPIAS VENDIDAS", w / 2, 70, 34, "#3df5ff");
    const r7 = rng(Math.floor(tt * 10) + 9); let s = ""; for (let i = 0; i < 9; i++) s += Math.floor(r7() * 10);
    centerText(g, s.replace(/(\d{3})(?=\d)/g, "$1."), w / 2, 175, 84, "rgba(255,255,255,.25)");
    g.fillStyle = "#e63946"; g.save(); g.translate(w / 2, 180); g.rotate(-0.12); g.fillRect(-230, -42, 460, 84); g.restore();
    centerText(g, "SEGREDO", w / 2, 178, 64, "#ffffff");
    centerText(g, "a Take-Two não divulgou", w / 2, 300, 26, "#9aa7d9");
    return "#a050ff";
  }
  if (mode === "egg") { // radio tower with a nest of painted eggs
    const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, "#14002e"); sky.addColorStop(1, "#ff7a59"); g.fillStyle = sky; g.fillRect(0, 0, w, h);
    const climb = clamp(tt / 3.5);
    g.save(); g.translate(0, -60 + climb * 60);
    g.strokeStyle = "#e63946"; g.lineWidth = 5;
    g.beginPath(); g.moveTo(w / 2 - 70, h + 80); g.lineTo(w / 2 - 12, 90); g.moveTo(w / 2 + 70, h + 80); g.lineTo(w / 2 + 12, 90); g.stroke();
    g.lineWidth = 3; for (let y = 110; y < h + 80; y += 34) { const k2 = (y - 90) / (h - 10); g.beginPath(); g.moveTo(w / 2 - 12 - 58 * k2, y); g.lineTo(w / 2 + 12 + 58 * k2 + 6, y + 34); g.stroke(); }
    g.fillStyle = "#8a5a2b"; g.beginPath(); g.ellipse(w / 2, 88, 44, 14, 0, 0, Math.PI * 2); g.fill();
    const cols = ["#ff2e88", "#3df5ff", "#ffd84d", "#7bff6a", "#b98cff"];
    cols.forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.ellipse(w / 2 - 30 + i * 15, 76 - (i % 2) * 6, 9, 12, 0, 0, Math.PI * 2); g.fill(); });
    const py = h + 40 - climb * (h - 90); g.fillStyle = "#1fb5a8"; g.fillRect(w / 2 - 6, py - 26, 12, 22); g.fillStyle = "#e0a07a"; g.beginPath(); g.arc(w / 2, py - 32, 7, 0, Math.PI * 2); g.fill();
    g.restore();
    g.fillStyle = "rgba(0,0,0,.6)"; g.fillRect(16, 14, 170, 46);
    centerText(g, "⏱ " + Math.min(7, Math.floor(clamp(tt / 3.5) * 7)) + ":00", 101, 38, 28, "#ffd84d");
    return "#ff8a6a";
  }
  if (mode === "dog") { // dog on a jet ski with goggles and life jacket
    const sky = g.createLinearGradient(0, 0, 0, h * 0.5); sky.addColorStop(0, "#3d8bff"); sky.addColorStop(1, "#bfe6ff"); g.fillStyle = sky; g.fillRect(0, 0, w, h * 0.5);
    g.fillStyle = "#1565c0"; g.fillRect(0, h * 0.5, w, h * 0.5);
    g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 3; for (let i = 0; i < 8; i++) { const y = h * 0.55 + i * 22, o = (tt * 90 + i * 40) % 80; g.beginPath(); for (let x = -80 + o; x < w; x += 80) { g.moveTo(x, y); g.quadraticCurveTo(x + 20, y - 8, x + 40, y); } g.stroke(); }
    const x = 120 + ((tt * 70) % 520) * 0.6, bob = Math.sin(tt * 6) * 5, y = h * 0.62 + bob;
    g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(x - 90, y); g.lineTo(x + 80, y); g.lineTo(x + 110, y - 22); g.lineTo(x - 70, y - 26); g.fill();
    g.fillStyle = "#ffd84d"; g.fillRect(x - 70, y - 40, 120, 16);
    g.fillStyle = "#c98a4b"; g.fillRect(x - 30, y - 92, 46, 54); g.fillStyle = "#ff7a00"; g.fillRect(x - 34, y - 80, 54, 30);
    g.fillStyle = "#c98a4b"; g.beginPath(); g.arc(x + 20, y - 108, 26, 0, Math.PI * 2); g.fill(); g.fillRect(x + 28, y - 104, 30, 16);
    g.fillStyle = "#6b4423"; g.beginPath(); g.ellipse(x + 4, y - 122, 9, 18, -0.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#12002b"; g.fillRect(x + 6, y - 120, 40, 12); g.fillStyle = "#3df5ff"; g.fillRect(x + 10, y - 118, 14, 8); g.fillRect(x + 28, y - 118, 14, 8);
    g.fillStyle = "#111"; g.beginPath(); g.arc(x + 58, y - 98, 6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#fff"; g.lineWidth = 4; g.beginPath(); for (let i = 0; i < 4; i++) { g.moveTo(x - 92 - i * 18, y - 6 + Math.sin(tt * 9 + i) * 4); g.lineTo(x - 104 - i * 18, y - 14); } g.stroke();
    centerText(g, "RESGATE! 🐶", 150, 40, 30, "#ffffff", "#12002b");
    return "#5ab0ff";
  }
  if (mode === "skunk") { // swamp creature silhouette with smell lines
    g.fillStyle = "#06140c"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#0e2a18"; for (let i = 0; i < 9; i++) { g.fillRect(i * 74 + 10, 40, 14, h); g.beginPath(); g.arc(i * 74 + 17, 50, 40, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#0a3a2a"; g.fillRect(0, h * 0.78, w, h * 0.22);
    const x = 200 + clamp(tt / 4) * 240, step = Math.sin(tt * 5) * 6;
    g.fillStyle = "#1c1208"; g.beginPath(); g.ellipse(x, 190, 42, 62, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(x + 6, 116, 26, 0, Math.PI * 2); g.fill();
    g.fillRect(x - 30, 240, 22, 50 + step); g.fillRect(x + 8, 240, 22, 50 - step); g.fillRect(x - 58, 160, 20, 70); g.fillRect(x + 38, 160, 20, 70);
    g.fillStyle = "#ffd84d"; g.fillRect(x + 6, 110, 6, 4); g.fillRect(x + 18, 110, 6, 4);
    g.strokeStyle = "#9bff4a"; g.lineWidth = 3; for (let i = 0; i < 4; i++) { const ox = x - 80 + i * 50, oy = 90 - ((tt * 30 + i * 20) % 50); g.beginPath(); g.moveTo(ox, oy + 40); g.bezierCurveTo(ox - 14, oy + 26, ox + 14, oy + 14, ox, oy); g.stroke(); }
    centerText(g, "SKUNK APE?", w / 2, 36, 32, "#9bff4a", "#06140c");
    return "#4aff8a";
  }
  if (mode === "ufo") { // alien abduction beam
    g.fillStyle = "#04020c"; g.fillRect(0, 0, w, h);
    const r8 = rng(21); g.fillStyle = "#fff"; for (let i = 0; i < 60; i++) g.fillRect(r8() * w, r8() * h * 0.6, 2, 2);
    g.fillStyle = "#102030"; g.fillRect(0, h * 0.8, w, h * 0.2);
    const ux = w / 2 + Math.sin(tt * 1.3) * 30, uy = 70 + Math.sin(tt * 2.1) * 6;
    const beam = clamp((tt - 0.6) / 0.8);
    if (beam > 0) { g.fillStyle = `rgba(120,255,160,${0.35 * beam})`; g.beginPath(); g.moveTo(ux - 30, uy + 14); g.lineTo(ux + 30, uy + 14); g.lineTo(ux + 110, h * 0.82); g.lineTo(ux - 110, h * 0.82); g.fill(); }
    const py = h * 0.8 - 40 - clamp((tt - 1.4) / 3) * (h * 0.8 - 140);
    g.save(); g.translate(ux, py); g.rotate(Math.sin(tt * 3) * 0.4); g.fillStyle = "#1fb5a8"; g.fillRect(-8, -14, 16, 28); g.fillStyle = "#e0a07a"; g.beginPath(); g.arc(0, -22, 9, 0, Math.PI * 2); g.fill(); g.restore();
    g.fillStyle = "#9aa7c0"; g.beginPath(); g.ellipse(ux, uy, 90, 22, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#7bffb0"; g.beginPath(); g.ellipse(ux, uy - 14, 40, 22, 0, Math.PI, 0); g.fill();
    for (let i = 0; i < 6; i++) { g.fillStyle = (Math.floor(tt * 6) + i) % 2 ? "#ffd84d" : "#ff2e88"; g.beginPath(); g.arc(ux - 70 + i * 28, uy + 4, 5, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "rgba(0,0,0,.6)"; g.fillRect(w - 170, 14, 156, 44); centerText(g, "02:00", w - 92, 37, 30, "#7bffb0");
    return "#7bffb0";
  }
  if (mode === "statue") { // four horses statue with strange symbols
    const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, "#2a0b3a"); sky.addColorStop(1, "#d9774a"); g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.fillStyle = "#5a3020"; g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * 0.55); g.lineTo(140, h * 0.42); g.lineTo(260, h * 0.6); g.lineTo(420, h * 0.38); g.lineTo(w, h * 0.5); g.lineTo(w, h); g.fill();
    g.fillStyle = "#3a3a46"; g.fillRect(w / 2 - 120, 240, 240, 70);
    for (let i = 0; i < 4; i++) { const hx = w / 2 - 90 + i * 60; g.fillStyle = "#4a4a58"; g.fillRect(hx - 18, 190, 36, 26); g.fillRect(hx + 10, 168, 12, 28); g.fillRect(hx + 14, 160, 22, 12); g.fillRect(hx - 16, 214, 6, 26); g.fillRect(hx + 10, 214, 6, 26); }
    const sy = ["◬", "☍", "⟁", "⌖"]; const glow = 0.5 + 0.5 * Math.sin(tt * 3);
    sy.forEach((s, i) => centerText(g, s, w / 2 - 90 + i * 60, 276, 30, `rgba(123,255,176,${0.4 + 0.6 * glow})`));
    centerText(g, "???", w / 2, 60, 56, "#ffd84d", "#12002b");
    return "#e08a5a";
  }
  if (mode === "glitch") {
    drawSynth(g, w, h, tt);
    const r5 = rng(Math.floor(tt * 12) + 3);
    for (let i = 0; i < 6; i++) { const y = r5() * h, hh = 6 + r5() * 30, dx = (r5() - 0.5) * 80; g.drawImage(tvCanvas, 0, y, w, hh, dx, y, w, hh); }
    g.fillStyle = "rgba(61,245,255,.12)"; g.fillRect(0, 0, w, h);
    return "#ff6ab8";
  }
  drawSynth(g, w, h, tt);
  return "#ff6ab8";
}
function easeOutC(x) { return 1 - Math.pow(1 - x, 3); }
function setCam(p, l) { camera.position.copy(p); camera.lookAt(l); }

const SEATED = {
  play: (t) => POSE.sitPlay(t, 0),
  shock: (t) => ({ hipY: 0.6, lean: -0.05, headX: -0.1 + Math.sin(t * 6) * 0.02, arms: [[-2.75, 0.55, -1.95], [-2.75, 0.55, -1.95]], legs: [[-1.5, 1.45], [-1.5, 1.45]] }),
  cheer: (t) => ({ hipY: 0.6 + Math.abs(Math.sin(t * 8)) * 0.04, lean: -0.1, headX: -0.2, arms: [[-2.9, 0.35, -0.2], [-2.9, 0.35, -0.2]], legs: [[-1.5, 1.2 + Math.sin(t * 8) * 0.2], [-1.5, 1.2 - Math.sin(t * 8) * 0.2]] }),
  facepalm: (t) => ({ hipY: 0.6, lean: 0.15, headX: 0.35, headZ: 0.1, arms: [[-1.9, -0.2, -2.1], [-0.4, 0.15, -0.6]], legs: [[-1.5, 1.45], [-1.5, 1.45]] }),
  think: (t) => ({ hipY: 0.6, lean: 0.05, headX: 0.1, headZ: -0.15, headY: 0.2, arms: [[-1.2, -0.25, -2.0], [-0.4, 0.15, -0.6]], legs: [[-1.5, 1.45], [-1.5, 1.45]] }),
  point: (t) => ({ hipY: 0.6, lean: -0.05, headX: 0.0, arms: [[-1.55, 0.0, -0.1], [-0.5, -0.32, -1.05]], legs: [[-1.5, 1.45], [-1.5, 1.45]] }),
};
const OPEN_MOUTH = { shock: 1, cheer: 1 };
const CTRL_POSES = { play: 1 };

const ROOM_CAMS = {
  front: [[0.25, 1.22, -1.55], [0.2, 1.28, -1.15], [0, 1.15, 2.0]],
  close: [[0.12, 1.35, -0.55], [0.08, 1.33, -0.35], [0, 1.25, 1.6]],
  tv: [[0.75, 1.7, 1.9], [0.7, 1.68, 1.55], [0.05, 1.3, -2.95]],
  behind: [[0.4, 1.8, 3.35], [0.3, 1.72, 3.15], [-0.15, 1.05, -2.9]],
  wide: [[2.1, 1.7, -1.9], [1.8, 1.6, -1.6], [-0.1, 0.75, 1.1]],
  pull: [[0.8, 1.7, -1.5], [1.3, 2.1, -2.1], [0, 1.0, 1.6]],
};
function renderAt(t) {
  room.visible = true;
  const scrCol = drawTVNews(t); tvTex.needsUpdate = true;
  tvLight.color.set(scrCol); tvLight.intensity = 9 + Math.sin(t * 13) * 1.2;
  skyMat.uniforms.day.value = 0; skyMat.uniforms.h.value = 1.5;
  winLight.intensity = 0; roomHemi.intensity = 0.42; lampLight.intensity = 6;
  tableFood.forEach((f) => (f.visible = true)); trash.forEach((o) => (o.f.visible = false));
  const [[p0, pname], pi] = at0(POSES, t); const prev = pi > 0 ? POSES[pi - 1][1] : pname;
  const k = smooth(clamp((t - p0) / 0.3));
  const pose = blendPose((SEATED[prev] || SEATED.play)(t), (SEATED[pname] || SEATED.play)(t), k);
  gamer.root.position.set(0, 0, 1.62); gamer.root.rotation.y = Math.PI;
  applyPose(gamer, pose);
  gamer.ctrl.visible = !!CTRL_POSES[pname] && k > 0.5;
  gamer.ctrl.position.set(0, 0.17, 0.36);
  const open = !!OPEN_MOUTH[pname]; gamer.mouth.visible = !open; gamer.mouthO.visible = open;
  const blink = (t * 0.7) % 4 < 0.08 ? 1 : 0;
  gamer.lids.forEach((l) => (l.scale.y = Math.max(blink, open ? 0.15 : pname === "facepalm" ? 0.8 : 0.32)));
  let cam = CAMS[0]; for (const c of CAMS) if (t >= c[1]) cam = c;
  const C = ROOM_CAMS[cam[0]] || ROOM_CAMS.front; const kk = smooth(clamp((t - cam[1]) / Math.max(0.1, cam[2] - cam[1])));
  const pp = V3(...C[0]).lerp(V3(...C[1]), kk); const la = V3(...C[2]);
  setCam(V3(X0 + pp.x, pp.y, pp.z), V3(X0 + la.x, la.y, la.z));
  renderer.render(scene, camera);
}
window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
renderAt(0);
