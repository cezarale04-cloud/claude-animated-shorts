// Usage: node render.mjs [--stills=0,90,200] [--from=0 --to=480] [--w=1080 --h=1920] [--out=out/video.mp4]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PW_PATH || 'playwright');
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const root = path.dirname(new URL(import.meta.url).pathname);
const W = +(args.w || 1080), H = +(args.h || 1920);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); });
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('console', m => console.log('[page]', m.text()));
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto(`http://localhost:${port}/index.html?render=1&w=${W}&h=${H}`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 300000 });
const total = await page.evaluate(() => window.FRAMES);
const grab = async (f) => {
  await page.evaluate((f) => window.renderFrame(f), f);
  const b64 = await page.evaluate(() => document.querySelector('canvas').toDataURL('image/jpeg', 0.95).split(',')[1]);
  return Buffer.from(b64, 'base64');
};
fs.mkdirSync(path.join(root, 'out'), { recursive: true });
if (args.stills) {
  for (const f of String(args.stills).split(',').map(Number)) {
    const t0 = Date.now(); const buf = await grab(f);
    fs.writeFileSync(path.join(root, 'out', `still_${String(f).padStart(4, '0')}.jpg`), buf);
    console.log('still', f, Date.now() - t0, 'ms');
  }
} else {
  const from = +(args.from || 0), to = +(args.to || total);
  const out = path.join(root, args.out || 'out/video.mp4');
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'inherit'] });
  const t0 = Date.now();
  for (let f = from; f < to; f++) {
    const buf = await grab(f);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 30 === 0) console.log(`frame ${f}/${to} ${((Date.now() - t0) / (f - from + 1)).toFixed(0)} ms/frame`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('wrote', out);
}
await browser.close(); server.close();
