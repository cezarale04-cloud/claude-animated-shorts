import * as THREE from "./lib/three.module.min.js";

const W = 1080, H = 1920;
const stage = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.fog = new THREE.Fog("#5a1a6e", 60, 190);
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 600);

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const R = rng(1337);

// ---------- sky ----------
const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: "varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
  fragmentShader: `varying vec3 vp; void main(){ float h = vp.y;
    vec3 top = vec3(0.07,0.02,0.20), mid = vec3(0.55,0.10,0.55), hor = vec3(1.0,0.45,0.35);
    vec3 c = mix(hor, mid, smoothstep(0.0,0.18,h)); c = mix(c, top, smoothstep(0.18,0.6,h));
    if (h < 0.0) c = vec3(0.15,0.03,0.25);
    gl_FragColor = vec4(c,1.0); }`,
}));
scene.add(sky);

// stars (fixed, seeded)
{
  const g = new THREE.BufferGeometry(); const p = [];
  for (let i = 0; i < 500; i++) { const a = R() * Math.PI * 2, y = 0.25 + R() * 0.7; const r = 350; p.push(Math.cos(a) * r * Math.sqrt(1 - y * y), y * r, Math.sin(a) * r * Math.sqrt(1 - y * y)); }
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: "#ffffff", size: 1.6, sizeAttenuation: false, fog: false })));
}

// ---------- striped synthwave sun ----------
const sunU = { t: { value: 0 } };
const sun = new THREE.Mesh(new THREE.CircleGeometry(48, 64), new THREE.ShaderMaterial({
  uniforms: sunU, transparent: true, fog: false, depthWrite: false,
  vertexShader: "varying vec2 uv0; void main(){ uv0 = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
  fragmentShader: `uniform float t; varying vec2 uv0; void main(){
    vec3 c = mix(vec3(1.0,0.18,0.55), vec3(1.0,0.86,0.25), uv0.y);
    float y = uv0.y; float band = 1.0;
    if (y < 0.55) { float k = (0.55 - y) * 26.0 + t * 1.2; float w = 0.18 + (0.55 - y) * 1.1; band = step(w, fract(k)); }
    gl_FragColor = vec4(c, band); }`,
}));
sun.position.set(0, 18, -260);
scene.add(sun);

// ---------- lights ----------
scene.add(new THREE.HemisphereLight("#ff9adf", "#2a0845", 1.2));
const key = new THREE.DirectionalLight("#ffb07a", 2.0); key.position.set(0, 20, -60); scene.add(key);
const rim = new THREE.DirectionalLight("#3df5ff", 1.0); rim.position.set(-30, 15, 40); scene.add(rim);

// ---------- ocean (left, x<-6) with sun-glint stripes ----------
const seaU = { t: { value: 0 } };
const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShaderMaterial({
  uniforms: seaU, fog: false,
  vertexShader: "varying vec3 wp; void main(){ vec4 w = modelMatrix*vec4(position,1.0); wp = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }",
  fragmentShader: `uniform float t; varying vec3 wp; void main(){
    vec3 base = mix(vec3(0.10,0.02,0.22), vec3(0.45,0.10,0.45), smoothstep(0.0, -250.0, wp.z));
    float glint = exp(-pow(wp.x/18.0,2.0)) * smoothstep(0.0,-200.0,wp.z);
    float lines = step(0.6, fract(wp.z*0.25 + sin(wp.x*0.3 + t*2.0)*0.3));
    vec3 c = base + vec3(1.0,0.5,0.4) * glint * lines * 0.9;
    float grid = max(step(0.97, fract(wp.x/6.0)), step(0.97, fract((wp.z + t*12.0)/6.0)));
    c += vec3(0.24,0.96,1.0) * grid * 0.35 * smoothstep(-160.0, -10.0, wp.z);
    gl_FragColor = vec4(c,1.0); }`,
}));
sea.rotation.x = -Math.PI / 2; sea.position.y = -0.05; scene.add(sea);

// ---------- road + beach (strip along -z) ----------
const flat = (c, e = {}) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.8, ...e });
const sand = new THREE.Mesh(new THREE.BoxGeometry(70, 0.4, 400), flat("#e6a57e"));
sand.position.set(41, 0.1, -150); scene.add(sand);
const road = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 400), flat("#2a1240"));
road.position.set(0, 0.15, -150); scene.add(road);
const neonP = new THREE.MeshBasicMaterial({ color: "#ff2e88" });
const neonC = new THREE.MeshBasicMaterial({ color: "#3df5ff" });
for (const [x, m] of [[-5, neonC], [5, neonP]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, 400), m); l.position.set(x, 0.45, -150); scene.add(l); }
const dashes = [];
for (let z = 20; z > -340; z -= 6) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 2.4), new THREE.MeshBasicMaterial({ color: "#ffd84d" })); d.position.set(0, 0.42, z); scene.add(d); dashes.push(d); }

// ---------- palms ----------
function palm(x, z, h, lean) {
  const g = new THREE.Group();
  const segs = 7;
  for (let i = 0; i < segs; i++) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.28 - i * 0.02, 0.34 - i * 0.02, h / segs, 6), flat("#5b2a3f"));
    s.position.set(lean * Math.pow(i / segs, 2) * 2, (i + 0.5) * h / segs, 0); g.add(s);
  }
  const topX = lean * 2;
  for (let k = 0; k < 7; k++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.5, 4.2, 4), flat("#1d6b4f", { emissive: "#0b3d2c" }));
    leaf.geometry.translate(0, 2.1, 0);
    leaf.position.set(topX, h, 0); leaf.rotation.set(0, (k / 7) * Math.PI * 2, 1.9); g.add(leaf);
    leaf.rotation.order = "YXZ"; leaf.rotation.set(1.15, (k / 7) * Math.PI * 2, 0);
  }
  g.position.set(x, 0.3, z); scene.add(g); return g;
}
for (let z = 10; z > -320; z -= 9) { palm(-7.5, z, 7 + R() * 2.5, -0.6 - R() * 0.4); palm(7.5, z - 4.5, 7 + R() * 2.5, 0.6 + R() * 0.4); }

// ---------- buildings (right side) with neon window textures ----------
function windowTex(seed, cols, rows) {
  const r = rng(seed); const c = document.createElement("canvas"); c.width = cols * 16; c.height = rows * 16;
  const g = c.getContext("2d"); g.fillStyle = "#1b0930"; g.fillRect(0, 0, c.width, c.height);
  const pal = ["#ff2e88", "#3df5ff", "#ffd84d", "#ffffff", "#b388ff"];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (r() > 0.45) { g.fillStyle = pal[Math.floor(r() * pal.length)]; g.fillRect(x * 16 + 4, y * 16 + 4, 8, 9); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t;
}
const buildings = [];
let bi = 0;
for (let z = -18; z > -170; z -= 11) {
  for (const xo of [16, 27, 40]) {
    const h = 10 + R() * 34 + (xo === 40 ? 12 : 0), w = 6 + R() * 3, d = 6 + R() * 3;
    const tex = windowTex(100 + bi, Math.round(w), Math.round(h / 1.5));
    const mat = new THREE.MeshStandardMaterial({ color: "#2b1048", emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: 0.9, roughness: 0.7 });
    const geo = new THREE.BoxGeometry(w, h, d); geo.translate(0, h / 2, 0);
    const m = new THREE.Mesh(geo, mat); m.position.set(xo + R() * 3, 0.3, z + R() * 4);
    m.userData = { delay: R() * 0.6, i: bi };
    scene.add(m); buildings.push(m);
    // neon roof edge
    const edge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.35, d + 0.3), bi % 2 ? neonC : neonP);
    edge.position.y = h; m.add(edge);
    bi++;
  }
}

// ---------- state + camera ----------
const C = window.__cues || {};
const SHOTS = [
  { t0: 0.0, t1: 1.55, p0: [0, 2.2, 14], p1: [0, 2.0, 4], q0: [0, 9, -200], q1: [0, 9, -200] },
  { t0: 1.55, t1: 5.05, p0: [-3, 3.0, -4], p1: [-3, 3.4, -22], q0: [9, 5, -40], q1: [9, 6, -58] },
  { t0: 5.05, t1: 8.25, p0: [-6, 5, -6], p1: [-4, 9, -12], q0: [24, 14, -55], q1: [24, 18, -60] },
  { t0: 8.25, t1: 14.05, p0: [0, 2.5, 0], p1: [-2, 26, 14], q0: [6, 10, -120], q1: [8, 8, -130], e: ease },
  { t0: 14.05, t1: 18.75, p0: [-40, 30, 20], p1: [-26, 24, -12], q0: [12, 0, -60], q1: [14, 0, -80] },
  { t0: 18.75, t1: 26.45, p0: [0, 1.6, -30], p1: [0, 1.6, -52], q0: [0, 10, -260], q1: [0, 10, -260] },
  { t0: 26.45, t1: 99, p0: [0, 2.0, 4], p1: [0, 2.2, 14], q0: [0, 9, -200], q1: [0, 9, -200], len: 4.55 },
];
function cameraAt(t) {
  let sh = SHOTS[0]; for (const s of SHOTS) if (t >= s.t0) sh = s;
  const k = (sh.e || ((x) => x))(clamp((t - sh.t0) / (sh.len || sh.t1 - sh.t0)));
  camera.position.copy(v3(sh.p0).lerp(v3(sh.p1), k));
  // small punch on the beat-heavy shots
  camera.lookAt(v3(sh.q0).lerp(v3(sh.q1), k));
}
function riseAt(t) {
  // buildings grow out of the ground during the sales beat; full height elsewhere
  if (t < 5.05 || t >= 8.25) return () => 1;
  return (b) => easeOut(ramp(t, 5.4 + b.userData.delay, 6.9 + b.userData.delay)) * 0.98 + 0.02;
}

function renderAt(t) {
  sunU.t.value = t; seaU.t.value = t;
  const rise = riseAt(t);
  const flash = t >= 10.4 && t < 14.05 ? 0.9 + 0.8 * Math.pow(0.5 + 0.5 * Math.sin(t * Math.PI * 4), 6) : 0.9;
  for (const b of buildings) { b.scale.y = rise(b); b.material.emissiveIntensity = flash; }
  cameraAt(t);
  renderer.render(scene, camera);
}
window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
renderAt(0);
