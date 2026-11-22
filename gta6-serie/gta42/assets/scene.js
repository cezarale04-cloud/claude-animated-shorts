import * as THREE from "./lib/three.module.min.js";

const W = (window.__cfg && window.__cfg.W) || 1080, H = (window.__cfg && window.__cfg.H) || 1920;
const stage = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({ antialias: !(window.__cfg && window.__cfg.px < 1), preserveDrawingBuffer: true });
renderer.setPixelRatio((window.__cfg && window.__cfg.px) || 1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.fog = new THREE.Fog("#5a1a6e", 60, 190);
const camera = new THREE.PerspectiveCamera((window.__cfg && window.__cfg.fov) || 50, W / H, 0.1, 600);

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const R = rng(1337);

// ---------- sky ----------
const skyU = { storm: { value: 0 }, flash: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
  vertexShader: "varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
  fragmentShader: `uniform float storm; uniform float flash; varying vec3 vp; void main(){ float h = vp.y;
    vec3 top = vec3(0.07,0.02,0.20), mid = vec3(0.55,0.10,0.55), hor = vec3(1.0,0.45,0.35);
    vec3 c = mix(hor, mid, smoothstep(0.0,0.18,h)); c = mix(c, top, smoothstep(0.18,0.6,h));
    if (h < 0.0) c = vec3(0.15,0.03,0.25);
    c = mix(c, vec3(0.13,0.12,0.2) + vec3(0.05)*h, storm*0.85) + vec3(0.8,0.85,1.0)*flash;
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
const seaU = { t: { value: 0 }, storm: { value: 0 } };
const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShaderMaterial({
  uniforms: seaU, fog: false,
  vertexShader: "varying vec3 wp; void main(){ vec4 w = modelMatrix*vec4(position,1.0); wp = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }",
  fragmentShader: `uniform float t; uniform float storm; varying vec3 wp; void main(){
    vec3 base = mix(vec3(0.10,0.02,0.22), vec3(0.45,0.10,0.45), smoothstep(0.0, -250.0, wp.z));
    float glint = exp(-pow(wp.x/18.0,2.0)) * smoothstep(0.0,-200.0,wp.z);
    float lines = step(0.6, fract(wp.z*0.25 + sin(wp.x*0.3 + t*2.0)*0.3));
    vec3 c = base + vec3(1.0,0.5,0.4) * glint * lines * 0.9;
    float grid = max(step(0.97, fract(wp.x/6.0)), step(0.97, fract((wp.z + t*12.0)/6.0)));
    c += vec3(0.24,0.96,1.0) * grid * 0.35 * smoothstep(-160.0, -10.0, wp.z);
    c = mix(c, vec3(0.06,0.08,0.12) + vec3(0.1)*step(0.7, fract(wp.z*0.4 + sin(wp.x*0.5 + t*5.0))), storm*0.8);
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
const palms = [];
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
  g.position.set(x, 0.3, z); scene.add(g); palms.push(g); return g;
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

// ---------- animals ----------
const CFG = window.__cfg || { shots: [], storm: [], lightning: [], animals: false };
const animals = new THREE.Group(); scene.add(animals);
const flamingos = [];
function flamingo(x, z, ry) {
  const g = new THREE.Group(); const pink = flat("#ff7eb6"), dark = flat("#2b1048");
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), pink); body.scale.set(1.4, 0.9, 0.9); body.position.y = 2.0; g.add(body);
  for (const lz of [-0.15, 0.15]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 4), pink); leg.position.set(0, 0.9, lz); g.add(leg); }
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.4, 5), pink); neck.position.set(0.6, 2.7, 0); neck.rotation.z = -0.35; g.add(neck);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), pink); head.position.set(0.82, 3.4, 0); g.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 4), dark); beak.position.set(1.05, 3.3, 0); beak.rotation.z = -1.9; g.add(beak);
  g.position.set(x, 0, z); g.rotation.y = ry; animals.add(g); flamingos.push(g); return g;
}
[[-13, -30, 0.3], [-15.5, -33, -0.4], [-11.5, -35, 1.2], [-17, -29, 2.5], [-14, -38, 0.9], [-18.5, -36, -1.0]].forEach((a) => flamingo(...a));
const gator = new THREE.Group();
{
  const g1 = flat("#3e6b2c"), g2 = flat("#2c4f1f");
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 0.9), g1); body.position.y = 0.35; gator.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.6), g2); head.position.set(1.9, 0.35, 0); gator.add(head);
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 0.55), flat("#d9c7a0")); jaw.position.set(1.9, 0.14, 0); gator.add(jaw); gator.userData.jaw = jaw;
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.42, 2.8, 4), g1); tail.rotation.z = Math.PI / 2; tail.position.set(-2.6, 0.32, 0); gator.add(tail); gator.userData.tail = tail;
  for (const [lx, lz] of [[0.9, 0.5], [0.9, -0.5], [-0.8, 0.5], [-0.8, -0.5]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 0.3), g2); l.position.set(lx, 0.12, lz); gator.add(l); }
  for (const ex of [-0.18, 0.18]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), flat("#ffd84d")); e.position.set(1.5, 0.6, ex); gator.add(e); }
  gator.position.set(-6.6, 0.3, -48); gator.rotation.y = 0.5; animals.add(gator);
}
animals.visible = !!CFG.animals;

// ---------- rain ----------
const RAIN_N = 1600;
const rainGeo = new THREE.BufferGeometry();
const rainPos = new Float32Array(RAIN_N * 6); const rainSeed = [];
for (let i = 0; i < RAIN_N; i++) rainSeed.push([R() * 60 - 30, R() * 40, R() * 60 - 30]);
rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: "#bcd4ff", transparent: true, opacity: 0.55, fog: false }));
rain.frustumCulled = false; scene.add(rain);
const hemi = scene.children.find((o) => o.isHemisphereLight);

// ---------- shot library + camera ----------
const LIB = {
  rush: { p0: [0, 2.2, 14], p1: [0, 2.0, 4], q0: [0, 9, -200], q1: [0, 9, -200] },
  rushBack: { p0: [0, 2.0, 4], p1: [0, 2.2, 14], q0: [0, 9, -200], q1: [0, 9, -200] },
  side: { p0: [-3, 3.0, -4], p1: [-3, 3.4, -22], q0: [9, 5, -40], q1: [9, 6, -58] },
  city: { p0: [-6, 5, -6], p1: [-4, 9, -12], q0: [24, 14, -55], q1: [24, 18, -60] },
  crane: { p0: [0, 2.5, 0], p1: [-2, 26, 14], q0: [6, 10, -120], q1: [8, 8, -130], ease: 1 },
  aerial: { p0: [-40, 30, 20], p1: [-26, 24, -12], q0: [12, 0, -60], q1: [14, 0, -80] },
  road: { p0: [0, 1.6, -30], p1: [0, 1.6, -52], q0: [0, 10, -260], q1: [0, 10, -260] },
  beach: { p0: [-10.5, 3.2, -13], p1: [-11.5, 2.8, -18], q0: [-15, 1.6, -34], q1: [-15, 1.6, -35] },
  gator: { p0: [-0.5, 3.2, -39], p1: [-1.2, 2.6, -41.5], q0: [-6.8, 0.5, -48.5], q1: [-6.8, 0.5, -48.5] },
  sea: { p0: [-26, 5, -10], p1: [-26, 5, -34], q0: [-8, 9, -200], q1: [-8, 9, -200] },
  top: { p0: [6, 80, -30], p1: [-6, 70, -60], q0: [6, 0, -80], q1: [0, 0, -90] },
  storm: { p0: [-3, 3, -8], p1: [-3, 3.4, -20], q0: [6, 9, -70], q1: [6, 9, -80] },
  orbit: { p0: [-30, 14, -20], p1: [-16, 18, -60], q0: [16, 8, -60], q1: [18, 10, -70] },
};
const SHOTS = (CFG.shots || []).map(([n, t0, t1]) => ({ ...LIB[n], t0, t1 }));
if (!SHOTS.length) SHOTS.push({ ...LIB.rush, t0: 0, t1: 99 });
const inRange = (t, list) => list.some(([a, b]) => t >= a && t < b);
function stormAt(t) {
  let v = 0;
  for (const [a, b] of CFG.storm || []) v = Math.max(v, ramp(t, a, a + 0.6) * (1 - ramp(t, b - 0.4, b)));
  return v;
}
function flashAt(t) {
  let f = 0;
  for (const lt of CFG.lightning || []) { const d = t - lt; if (d >= 0 && d < 0.35) f = Math.max(f, (d < 0.06 ? 1 : 0.6 * Math.exp(-(d - 0.06) * 12)) * (Math.sin(d * 70) > -0.3 ? 1 : 0.3)); }
  return f;
}
function cameraAt(t, shake) {
  let sh = SHOTS[0]; for (const s of SHOTS) if (t >= s.t0) sh = s;
  let k = clamp((t - sh.t0) / (sh.t1 - sh.t0));
  if (sh.ease) k = ease(k);
  const p = v3(sh.p0).lerp(v3(sh.p1), k);
  if (shake) { p.x += Math.sin(t * 53) * 0.12 * shake; p.y += Math.sin(t * 41) * 0.1 * shake; }
  camera.position.copy(p);
  camera.lookAt(v3(sh.q0).lerp(v3(sh.q1), k));
}
function riseAt(t) {
  const r = CFG.rise; if (!r || t < r[0] || t >= r[1]) return () => 1;
  return (b) => easeOut(ramp(t, r[0] + 0.3 + b.userData.delay, r[0] + 1.8 + b.userData.delay)) * 0.98 + 0.02;
}
function renderAt(t) {
  sunU.t.value = t; seaU.t.value = t;
  const st = stormAt(t), fl = flashAt(t) * st;
  skyU.storm.value = st; skyU.flash.value = fl; seaU.storm.value = st;
  sun.visible = st < 0.95; sun.material.opacity = 1 - st;
  scene.fog.color.set("#5a1a6e").lerp(new THREE.Color("#25233a"), st);
  if (hemi) hemi.intensity = 1.2 * (1 - 0.5 * st) + 3 * fl;
  const rise = riseAt(t);
  const fr = CFG.flash;
  const flash = fr && t >= fr[0] && t < fr[1] ? 0.9 + 0.8 * Math.pow(0.5 + 0.5 * Math.sin(t * Math.PI * 4), 6) : 0.9;
  for (const b of buildings) { b.scale.y = rise(b); b.material.emissiveIntensity = flash * (1 - 0.3 * st); }
  palms.forEach((p, i) => { p.rotation.z = Math.sin(t * 2.6 + i * 0.7) * 0.09 * st + 0.04 * st; });
  rain.visible = st > 0.01; rain.material.opacity = 0.6 * st;
  cameraAt(t, st * 0.6);
  if (rain.visible) {
    const c = camera.position;
    for (let i = 0; i < RAIN_N; i++) {
      const [x, y0, z] = rainSeed[i];
      const y = ((((y0 - t * 38) % 40) + 40) % 40) - 12;
      const o = i * 6;
      rainPos[o] = c.x + x + y * 0.25; rainPos[o + 1] = c.y + y; rainPos[o + 2] = c.z + z - 20;
      rainPos[o + 3] = rainPos[o] + 0.35; rainPos[o + 4] = rainPos[o + 1] - 1.4; rainPos[o + 5] = rainPos[o + 2];
    }
    rainGeo.attributes.position.needsUpdate = true;
  }
  if (animals.visible) {
    flamingos.forEach((f, i) => { f.position.y = Math.sin(t * 1.5 + i) * 0.04; f.rotation.y += 0; });
    gator.userData.tail.rotation.y = Math.sin(t * 3) * 0.25;
    gator.userData.jaw.rotation.z = -Math.max(0, Math.sin(t * 2.2)) * 0.35;
    gator.userData.jaw.position.x = 1.9;
  }
  renderer.render(scene, camera);
}
window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
renderAt(0);
