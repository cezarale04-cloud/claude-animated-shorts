import * as THREE from "./lib/three.module.min.js";

// ------------------------------------------------------------ setup
const CFG = window.__cfg || {};
const ACTS = CFG.acts || [[0, "walk"]];
const WALK_END = CFG.walkEnd || 4;
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

// ============================================================ THE TWO GAMES (own boxes: name only, no logos)
function gameBox(top, bottom, title, tc, sub) {
  const t = canvasTex(360, 480, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 480); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, 360, 480);
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 10; g.strokeRect(14, 14, 332, 452);
    g.fillStyle = tc; g.font = `900 ${title.length > 5 ? 84 : 104}px Arial Black, Arial`; g.textAlign = "center"; g.textBaseline = "middle";
    g.shadowColor = "rgba(0,0,0,.45)"; g.shadowBlur = 14; g.fillText(title, 180, 210); g.shadowBlur = 0;
    g.font = "700 30px Arial"; g.fillStyle = "rgba(255,255,255,.9)"; g.fillText(sub, 180, 410);
  });
  const side = M(bottom, { roughness: 0.4 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.05), [side, side, side, side, new THREE.MeshStandardMaterial({ map: t, roughness: 0.35 }), side]);
  m.castShadow = true; return m;
}
const boxGTA = gameBox("#ff2e88", "#3a0a6b", "GTA 6", "#ffffff", "JOGO NOVO");
const boxZEL = gameBox("#2fa84f", "#0d4a2a", "ZELDA", "#ffd84d", "AVENTURA");
const HELD = [boxGTA, boxZEL];
HELD.forEach((b) => shop.add(b)); // held in front of his chest: GTA on screen left, Zelda on screen right
const ONLY = CFG.only || null; // "gta": he already bought it and holds just that box, in the middle
const HOLD_POS = ONLY ? [V3(0, 1.24, -2.2 + 0.5), V3(9, -9, 9)] : [V3(-0.3, 1.24, -2.2 + 0.5), V3(0.3, 1.24, -2.2 + 0.5)];
const fly = [gameBox("#ff2e88", "#3a0a6b", "GTA 6", "#ffffff", "JOGO NOVO"), gameBox("#2fa84f", "#0d4a2a", "ZELDA", "#ffd84d", "AVENTURA")];
fly.forEach((b) => { b.visible = false; shop.add(b); });

// ------------------------------------------------------------ poses for the choice
const ARMS_HOLD = [[-0.75, 0.12, -1.05], [-0.75, 0.12, -1.05]];
const POSE2 = {
  hold2: (t) => ({ hipY: 0.95 + Math.sin(t * 2) * 0.004, arms: ARMS_HOLD, legs: [[0, 0], [0, 0]], headX: 0.05 }),
  look_gta: (t) => ({ hipY: 0.95, arms: ARMS_HOLD, legs: [[0, 0], [0, 0]], headX: 0.12, headY: -0.45 }),
  look_zel: (t) => ({ hipY: 0.95, arms: ARMS_HOLD, legs: [[0, 0], [0, 0]], headX: 0.12, headY: 0.45 }),
  raise_gta: (t) => ({ hipY: 0.97, arms: [[-2.55, 0.1, -0.25], ARMS_HOLD[1]], legs: [[0, 0], [0, 0]], headX: -0.15, headY: -0.3 }),
  raise_zel: (t) => ({ hipY: 0.97, arms: [ARMS_HOLD[0], [-2.55, 0.1, -0.25]], legs: [[0, 0], [0, 0]], headX: -0.15, headY: 0.3 }),
  think: (t) => ({ hipY: 0.95, lean: 0.04, arms: ARMS_HOLD, legs: [[0, 0], [0, 0]], headX: 0.08, headY: Math.sin(t * 2.6) * 0.5, headZ: 0.12 }),
  ask: (t) => ({ hipY: 0.95 + Math.abs(Math.sin(t * 5)) * 0.02, arms: ARMS_HOLD, legs: [[0, 0], [0, 0]], headX: -0.05 }),
  cheer: POSE.cheer,
};
const OPEN = { raise_gta: 1, raise_zel: 1, cheer: 1, ask: 1 };

// ------------------------------------------------------------ render
const Z = -2.2;
function setCam(p, l) { camera.position.copy(p); camera.lookAt(l); }
const at0 = (t) => { let cur = ACTS[0], i0 = 0; ACTS.forEach((a, i) => { if (t >= a[0]) { cur = a; i0 = i; } }); return [cur, i0]; };
const CAMS = {
  hold2: [[0, 1.35, Z + 3.9], [0, 1.35, Z + 3.4], [0, 1.15, Z]],
  look_gta: [[-0.3, 1.35, Z + 3.2], [-0.4, 1.35, Z + 3.0], [-0.12, 1.2, Z]],
  look_zel: [[0.3, 1.35, Z + 3.2], [0.4, 1.35, Z + 3.0], [0.12, 1.2, Z]],
  raise_gta: [[-0.45, 1.25, Z + 3.0], [-0.55, 1.2, Z + 2.8], [-0.15, 1.45, Z]],
  raise_zel: [[0.45, 1.25, Z + 3.0], [0.55, 1.2, Z + 2.8], [0.15, 1.45, Z]],
  think: [[0.1, 1.4, Z + 3.0], [0, 1.42, Z + 2.6], [0, 1.3, Z]],
  ask: [[0, 1.35, Z + 3.6], [0, 1.4, Z + 3.1], [0, 1.2, Z]],
  cart_gta: [[0.9, 1.7, Z + 3.6], [0.7, 1.75, Z + 3.4], [0.3, 0.95, Z]],
  cart_zel: [[0.9, 1.7, Z + 3.6], [0.7, 1.75, Z + 3.4], [0.3, 0.95, Z]],
  cheer: [[0.4, 1.3, Z + 3.4], [0.2, 1.4, Z + 3.7], [0.2, 1.2, Z]],
};
const hp = new THREE.Vector3();
function renderAt(t) {
  const [[a0, act], ai] = at0(t); const nxt = ACTS[ai + 1] ? ACTS[ai + 1][0] : a0 + 3;
  const walking = act === "walk";
  const z = walking ? mix(-9.5, Z, ease(ramp(t, 0, WALK_END))) : Z;
  shopper.root.position.set(0, 0, z); shopper.root.rotation.y = 0;
  shopSun.position.set(2.5, 5.5, z + 3); shopSun.target.position.set(0, 0, z); shopFill.position.set(0.8, 2.2, z + 3);
  HELD.forEach((b, i) => (b.visible = !walking && !(ONLY && i === 1))); fly.forEach((b) => (b.visible = false));
  if (walking) {
    cart.position.set(0, 0, z + 0.95); cart.rotation.y = 0;
    applyPose(shopper, POSE.walkPush(t, (z + 9.5) * 4.2));
    shopper.mouth.visible = true; shopper.mouthO.visible = false; shopper.lids.forEach((l) => (l.scale.y = 0.35));
    const k = ramp(t, 0, WALK_END);
    setCam(V3(mix(0.9, 0.4, k), mix(1.25, 1.5, k), z + mix(4.6, 3.4, k)), V3(0, 1.0, z + 0.4));
  } else {
    cart.position.set(0.95, 0, Z + 0.25); cart.rotation.y = -0.5;
    const prevName = ai > 0 ? ACTS[ai - 1][1] : act;
    const base = (n) => (POSE2[n] || POSE2.hold2);
    const k = smooth(clamp((t - a0) / 0.3));
    const pose = act.startsWith("cart") ? POSE2.hold2(t) : blendPose(base(prevName === "walk" ? "hold2" : prevName.startsWith("cart") ? "hold2" : prevName)(t), base(act)(t), k);
    applyPose(shopper, pose);
    // the two boxes pop into his hands when he stops
    const pop = ACTS[0][1] !== "walk" ? 1 : smooth(clamp((t - (ACTS.find((x) => x[1] !== "walk") || [0])[0]) / 0.25));
    const kr = smooth(clamp((t - a0) / 0.3)), kp = 1 - smooth(clamp((t - a0) / 0.3));
    HELD.forEach((bx, i) => {
      const up = (act === (i ? "raise_zel" : "raise_gta") ? kr : (prevName === (i ? "raise_zel" : "raise_gta") ? kp : 0));
      bx.position.copy(HOLD_POS[i]).add(V3(0, up * 0.55, up * 0.05));
      bx.rotation.set(0, (i ? -1 : 1) * 0.12 + Math.sin(t * 2 + i) * 0.04, (i ? 1 : -1) * up * 0.15);
      bx.scale.setScalar((0.001 + pop) * (1 + 0.18 * up));
    });
    // part 2: the chosen game flies into the cart, the other goes back to the shelf
    const chosen = ACTS.find((x) => x[1] === "cart_gta") ? 0 : ACTS.find((x) => x[1] === "cart_zel") ? 1 : -1;
    const tc = chosen >= 0 ? ACTS.find((x) => x[1].startsWith("cart"))[0] : 1e9;
    if (t >= tc) {
      applyPose(shopper, blendPose(POSE2.hold2(t), act === "cheer" ? POSE.cheer(t) : POSE2.hold2(t), act === "cheer" ? k : 0));
      [0, 1].forEach((i) => {
        HELD[i].visible = false; const f = fly[i]; f.visible = true;
        const kk = ease(clamp((t - tc - (i === chosen ? 0.35 : 0)) / 0.7));
        const start = HOLD_POS[i].clone();
        const end = i === chosen ? V3(cart.position.x, 0.62, cart.position.z) : V3(i === 0 ? -1.75 : 1.75, 1.25, Z - 0.3);
        f.position.copy(start.clone().lerp(end, kk)); f.position.y += Math.sin(kk * Math.PI) * (i === chosen ? 0.7 : 0.3);
        f.rotation.set(i === chosen ? -Math.PI / 2 * kk : 0, i === chosen ? kk * 6.28 : (i === 0 ? 1 : -1) * Math.PI / 2 * kk, 0);
      });
    }
    const open = !!OPEN[act]; shopper.mouth.visible = !open; shopper.mouthO.visible = open;
    const blink = (t * 0.7) % 4 < 0.08 ? 1 : 0; shopper.lids.forEach((l) => (l.scale.y = Math.max(blink, open ? 0.15 : 0.32)));
    const C = CAMS[act] || CAMS.hold2; const kc = smooth(clamp((t - a0) / Math.max(0.1, nxt - a0)));
    setCam(V3(...C[0]).lerp(V3(...C[1]), kc), V3(...C[2]));
  }
  renderer.render(scene, camera);
}
window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
renderAt(0);
