"""Horizontal (1920x1080) long-form version of the GTA 6 engine, for YouTube videos.

Reuses the timing/overlay helpers of engine.Video, but:
- per-line voice cache (editing one line only regenerates that line),
- voice and music mixed in numpy (fast enough for 10+ minutes),
- chapter cards, chapter badge and a YouTube-style ending (like + subscribe).
"""
import asyncio, hashlib, html, json, os, shutil, subprocess, wave
import numpy as np
import engine
from engine import Video, SR, sh, _tts_one, add, env, tone, noise, bandish, place, read_wav

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
W, H = 1920, 1080
LIKE_LINE_YT = "Então curte esse vídeo, deixa o seu like e se inscreve no canal pra não perder nada do GTA 6!"


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768


def voice_wide(lines, gaps, work, voice_name, rate):
    cdir = os.path.join(work, "lines")
    os.makedirs(cdir, exist_ok=True)
    out, t, clips = [], 0.4, []
    for i, text in enumerate(lines):
        h = hashlib.sha1(f"{voice_name}|{rate}|{text}".encode()).hexdigest()[:16]
        mp3, js = f"{cdir}/{h}.mp3", f"{cdir}/{h}.json"
        if not os.path.exists(js):
            for attempt in range(4):
                try:
                    words = asyncio.run(_tts_one(text, mp3, voice_name, rate))
                    if words:
                        break
                except Exception as e:  # network hiccup: retry
                    print("tts retry", i, e)
            json.dump(words, open(js, "w"), ensure_ascii=False)
        words = json.load(open(js))
        s0 = max(0, words[0]["s"] - 0.05)
        e = words[-1]["s"] + words[-1]["d"] + 0.12
        t += gaps[i] if i < len(gaps) else 0.4
        a = decode(mp3)[int(s0 * SR): int(e * SR)]
        clips.append((t, a))
        ws = [dict(w=w["w"], s=round(t + w["s"] - s0, 3), e=round(t + w["s"] - s0 + w["d"], 3)) for w in words]
        out.append(dict(i=i, start=round(t, 3), end=round(t + len(a) / SR, 3), text=text, words=ws))
        t += len(a) / SR
    total = round(t + 1.0, 2)
    buf = np.zeros(int(total * SR) + SR, np.float32)
    for st, a in clips:
        place(buf, a, st)
    buf = buf[: int(total * SR)]
    pcm = (np.clip(buf, -1, 1) * 32767).astype(np.int16)
    with wave.open(f"{work}/voice.wav", "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
    return out, total


class Wide(Video):
    def __init__(self, name, lines, gaps, voice_name="pt-BR-AntonioNeural", rate="+8%", hi="#3DF5FF"):
        self.hi = hi
        self.name = name
        self.dir = os.path.join(ROOT, name)
        self.work = os.path.join(self.dir, "work")
        os.makedirs(os.path.join(self.dir, "assets", "audio"), exist_ok=True)
        shutil.copytree(os.path.join(ROOT, "lib"), os.path.join(self.dir, "assets", "lib"), dirs_exist_ok=True)
        for f in ["hyperframes.json", "package.json", "CLAUDE.md", "AGENTS.md"]:
            shutil.copy(os.path.join(ROOT, f), self.dir)
        shutil.copy(os.path.join(HERE, "scene.js"), os.path.join(self.dir, "assets", "scene.js"))
        lines = list(lines) + [LIKE_LINE_YT]
        gaps = list(gaps) + [0.5] * (len(lines) - len(gaps))
        self.lines, self.total = voice_wide(lines, gaps, self.work, voice_name, rate)
        self.html, self.js, self.cues = [], [], []
        self.shots, self.cfg = [], {"storm": [], "lightning": [], "animals": True, "rise": None, "flash": None, "W": W, "H": H, "fov": 42, "px": 0.5}
        self.n = 0
        self.chapters = []  # (start_time, number, name)

    def at(self, i, word, nth=0):
        norm = lambda x: x.strip(".,?!:;“”\"'()").lower()
        ws = self.lines[i]["words"]
        hits = [w for w in ws if norm(word) in [norm(x) for x in w["w"].replace("-", " ").split()] or norm(w["w"]) == norm(word)]
        if not hits:
            hits = [w for w in ws if norm(w["w"]).startswith(norm(word)[:4])]
        if len(hits) > nth:
            return hits[nth]["s"]
        # fallback: estimate from position in the text
        txt = self.lines[i]["text"]
        pos = txt.lower().find(word.lower())
        frac = max(0, pos) / max(1, len(txt))
        print(f"  [aviso] palavra '{word}' nao achada na fala {i}; estimando")
        return self.L(i) + frac * (self.Lend(i) - self.L(i))

    # ---- long-form pieces ----
    def card(self, i, num, name, nchap):
        s, e = self.L(i) - 0.1, self.Lend(i) + 0.25
        dots = "".join(f'<i class="{"done" if k < num - 1 else ("on" if k == num - 1 else "")}"></i>' for k in range(nchap))
        cid = f"cc{i}"
        self.html.append(f'<div id="{cid}" class="clip chcard" data-start="{s:.2f}" data-duration="{e - s:.2f}" data-track-index="5">'
                         f'<div id="{cid}k" class="k">CAPÍTULO {num}</div><div id="{cid}n" class="n">{name}</div><div class="dots">{dots}</div></div>')
        self.js.append(f'tl.fromTo("#{cid}",{{opacity:0}},{{opacity:1,duration:0.25}},{s:.2f});')
        self.js.append(f'tl.fromTo("#{cid}k",{{y:-60,opacity:0}},{{y:0,opacity:1,duration:0.3,ease:"back.out(2)"}},{s + 0.1:.2f});')
        self.js.append(f'tl.fromTo("#{cid}n",{{scale:1.8,opacity:0}},{{scale:1,opacity:1,duration:0.35,ease:"back.out(1.8)"}},{s + 0.2:.2f});')
        self.js.append(f'tl.to("#{cid}",{{opacity:0,duration:0.25}},{e - 0.25:.2f});')
        self.cue("boom", s + 0.15)
        self.chapters.append((s + 0.1, num, name))

    def badge(self, s, e, text):
        self.n += 1
        bid = f"b{self.n}"
        self.html.append(f'<div id="{bid}" class="clip chb" data-start="{s:.2f}" data-duration="{e - s:.2f}" data-track-index="1"><div id="{bid}i" class="chbi">{text}</div></div>')
        self.js.append(f'tl.fromTo("#{bid}i",{{x:-300,opacity:0}},{{x:0,opacity:1,duration:0.3,ease:"back.out(1.8)"}},{s:.2f});')

    def title_span(self, s, e, text, key):
        tid = f"tt{key}"
        self.html.append(f'<div id="{tid}" class="clip title" data-start="{s:.2f}" data-duration="{e - s:.2f}" data-track-index="2"><div id="{tid}i" class="titlei">{text}</div></div>')
        if s > 0:
            self.js.append(f'tl.fromTo("#{tid}i",{{scale:0.6,opacity:0}},{{scale:1,opacity:1,duration:0.22,ease:"back.out(2)"}},{s:.2f});')
            self.cue("whoosh", s - 0.18)

    # ---- captions: 4 words per chunk for the wider frame ----
    def captions(self):
        out, js, chunks = [], [], []
        for line in self.lines:
            cur = []
            for w in line["words"]:
                cur.append(w)
                if len(cur) == 4:
                    chunks.append(cur); cur = []
            if cur:
                chunks.append(cur)
        for ci, ch in enumerate(chunks):
            s = ch[0]["s"] - 0.06
            nxt = chunks[ci + 1][0]["s"] - 0.06 if ci + 1 < len(chunks) else self.total
            e = min(nxt, ch[-1]["e"] + 0.5)
            spans = []
            for wi, w in enumerate(ch):
                spans.append(f'<span id="w{ci}_{wi}" class="cw">{html.escape(w["w"].rstrip(".,?!:").upper())}</span>')
                js.append(f'tl.set("#w{ci}_{wi}",{{color:"{self.hi}",scale:1.08}},{w["s"] - 0.02:.3f});')
                js.append(f'tl.set("#w{ci}_{wi}",{{color:"#FFFFFF",scale:1}},{w["e"] + 0.02:.3f});')
            out.append(f'<div id="cap{ci}" class="clip cap" data-start="{s:.3f}" data-duration="{e - s:.3f}" data-track-index="3"><div id="capi{ci}" class="capi">{" ".join(spans)}</div></div>')
            js.append(f'tl.fromTo("#capi{ci}",{{scale:0.85,y:12}},{{scale:1,y:0,duration:0.16,ease:"back.out(2.5)"}},{s:.3f});')
        return out, js

    def like_scene(self):
        i = len(self.lines) - 1
        s = self.L(i) - 0.1
        self.title_span(s, self.total, "CURTE E <em>SE INSCREVE!</em>", "like")
        row = ('<div class="row" style="gap:40px">'
               '<div id="lk1" class="tag" style="background:#ff2e88;font-size:70px;display:flex;align-items:center;gap:26px"><span class="heart"></span> CURTE</div>'
               '<div id="lk2" class="tag" style="background:#2b6cb0;font-size:64px">DEIXA SEU LIKE</div></div>')
        self.item(s + 0.05, self.total, 330, row, cls="row", anim="fade", cue="pop")
        self.js.append(f'tl.fromTo("#lk1",{{scale:0.3,opacity:0}},{{scale:1,opacity:1,duration:0.22,ease:"back.out(2.2)"}},{s + 0.1:.2f});')
        tl = self.at(i, "like") - 0.05
        self.js.append(f'tl.fromTo("#lk2",{{x:900,opacity:0}},{{x:0,opacity:1,duration:0.26,ease:"back.out(1.6)"}},{tl:.2f});')
        self.cue("whoosh", tl)
        ts = self.at(i, "inscreve") - 0.05
        iid = self.item(ts, self.total, 560, "INSCREVA-SE", cls="tag", anim="stamp", style="background:#e62117;font-size:104px;border-color:#fff", cue="stamp")
        self.js.append(f'tl.to("#{iid}i",{{scale:1.08,duration:0.2,yoyo:true,repeat:7,ease:"sine.inOut"}},{ts + 0.35:.2f});')

    def write(self, brand="PLANETA DO CONHECIMENTO"):
        self.like_scene()
        cap_html, cap_js = self.captions()
        css = open(os.path.join(HERE, "style_wide.css")).read()
        T = self.total
        page = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width={W}, height={H}" />
<script src="assets/lib/gsap.min.js"></script>
<style>
{css}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{T}" data-width="{W}" data-height="{H}">
  <div id="stage" class="clip" data-start="0" data-duration="{T}" data-track-index="0" data-track-kind="graphics"></div>
  <div id="vign" class="clip vign" data-start="0" data-duration="{T}" data-track-index="0"></div>
  <div id="brand" class="clip brand" data-start="0" data-duration="{T}" data-track-index="1">{brand}</div>
  {chr(10).join(self.html)}
  {chr(10).join(cap_html)}
  <audio id="mix" src="assets/audio/mix.wav" data-start="0" data-duration="{T}" data-track-index="9"></audio>
</div>
<script>window.__cfg = {json.dumps(dict(self.cfg, shots=self.shots, total=T))};</script>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(self.js)}
{chr(10).join(cap_js)}
window.__timelines["main"] = tl;
tl.seek(0);
</script>
<script type="module" src="assets/scene.js"></script>
</body>
</html>
"""
        open(os.path.join(self.dir, "index.html"), "w").write(page)
        mix_wide(self)
        json.dump(dict(total=T, chapters=self.chapters), open(os.path.join(self.dir, "work", "chapters.json"), "w"), ensure_ascii=False, indent=1)
        print(self.name, "total", T, "items", self.n)


def mix_wide(V):
    N = int(SR * V.total)
    music = np.zeros(N, np.float32)
    BPM = 112
    beat = 60 / BPM
    kick = add(tone(52, 0.4, 0.001, 0.12), tone(140, 0.05, 0.001, 0.015) * 0.6)
    snare = add(bandish(noise(0.25), 0.7, 0.12) * env(int(0.25 * SR), 0.001, 0.07), tone(190, 0.15, 0.001, 0.05) * 0.5)
    hat = bandish(noise(0.05), 0.95, 0.5) * env(int(0.05 * SR), 0.001, 0.012)
    progs = [[45, 41, 36, 43], [40, 36, 43, 38], [41, 43, 45, 40], [38, 41, 36, 43]]
    mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
    cards = [(c[0] - 0.1, c[0] + 2.0) for c in V.chapters]
    chap_starts = [c[0] for c in V.chapters]
    cache = {}

    def T(f, d, a, r, kind):
        k = (round(f, 2), d, a, r, kind)
        if k not in cache:
            cache[k] = tone(f, d, a, r, kind)
        return cache[k]

    for b in range(int(V.total / beat) + 1):
        t = b * beat
        ch = sum(1 for c in chap_starts if c <= t)
        prog = progs[ch % len(progs)]
        r = prog[(b // 4) % 4]
        calm = t < 4.0 or any(a <= t < z for a, z in cards) or t > V.total - 1.2
        if not calm or b % 4 == 0:
            place(music, kick, t, 0.7)
        if b % 2 == 1 and not calm:
            place(music, snare, t, 0.4)
        for k in range(2):
            place(music, hat, t + k * beat / 2 + beat / 4, 0.15)
            place(music, T(mtof(r - 12), beat / 2 * 0.9, 0.003, 0.12, "saw"), t + k * beat / 2, 0.15)
        if not calm:
            for k, iv in enumerate([0, 7, 12, 15]):
                place(music, T(mtof(r + 12 + iv), beat / 4, 0.002, 0.06, "saw"), t + k * beat / 4, 0.04)
        if b % 4 == 0:
            for iv in [0, 3, 7]:
                place(music, T(mtof(r + 24 + iv), beat * 4, 0.3, 1.5, "sin"), t, 0.05)
    music = np.convolve(music, np.ones(3) / 3, mode="same").astype(np.float32)
    voice = read_wav(f"{V.work}/voice.wav")[:N]
    voice = np.pad(voice, (0, N - len(voice)))
    # moving average envelope via cumulative sum (O(N))
    k = 2400
    c = np.cumsum(np.concatenate([np.zeros(k // 2), np.abs(voice), np.zeros(k)]), dtype=np.float64)
    venv = ((c[k:k + N] - c[:N]) / k).astype(np.float32)
    music *= 1 - 0.62 * np.clip(venv / 0.05, 0, 1)

    sfx = np.zeros(N, np.float32)

    def whoosh(d=0.35):
        n = int(d * SR)
        return bandish(noise(d), 0.25, 0.04) * np.sin(np.linspace(0, np.pi, n)) ** 2

    def boom():
        n = int(1.6 * SR); tt = np.arange(n) / SR
        f = 30 + 90 * np.exp(-tt * 6)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.2) + bandish(noise(1.6), 0.4, 0.05) * np.exp(-tt * 8) * 0.6

    def popc():
        n = int(0.12 * SR); tt = np.arange(n) / SR
        f = 900 * np.exp(-tt * 25) + 300
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.04)

    RISER = None
    BOOM, WH, POP = boom(), whoosh(), popc()
    STAMP = add(BOOM[: int(0.6 * SR)] * 0.8, bandish(noise(0.15), 0.8, 0.2) * env(int(0.15 * SR), 0.001, 0.03))
    TICK = tone(1800, 0.03, 0.0005, 0.006)
    THUNDER = add(bandish(noise(3.0), 0.08, 0.01) * 3 * np.exp(-np.arange(int(3 * SR)) / SR * 1.2), BOOM * 0.6)
    RAIN = bandish(noise(4.0), 0.7, 0.05) * 0.5
    for cue in V.cues:
        kd, t, d = cue["k"], cue["t"], cue["d"]
        if kd == "whoosh": place(sfx, WH, t, 0.45)
        elif kd == "boom": place(sfx, BOOM, t, 0.7)
        elif kd == "pop": place(sfx, POP, t, 0.3)
        elif kd == "stamp": place(sfx, STAMP, t, 0.45)
        elif kd == "riser":
            if RISER is None:
                n = int(0.6 * SR); f = np.geomspace(200, 1800, n)
                RISER = (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + bandish(noise(0.6), 0.6, 0.1) * 0.5) * np.linspace(0, 1, n) ** 2
            place(sfx, RISER, t, 0.25)
        elif kd == "thunder": place(sfx, THUNDER, t, 0.7)
        elif kd == "ticks":
            for j in range(12):
                place(sfx, TICK, t + d * (0.5 - 0.5 * np.cos(np.pi * j / 11)), 0.3)
        elif kd == "rain":
            n = int(d * SR)
            r = np.tile(RAIN, int(np.ceil(n / len(RAIN))))[:n]
            fade = np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (0.4 * SR))
            place(sfx, r * fade, t, 0.35)
    mixd = voice + music * 0.55 + sfx * 0.45
    f = int(0.05 * SR)
    mixd[:f] *= np.linspace(0, 1, f); mixd[-f:] *= np.linspace(1, 0, f)
    mixd = np.tanh(mixd * 1.2) / np.tanh(1.2)
    mixd = mixd / np.max(np.abs(mixd)) * 0.89
    out = (np.stack([mixd, mixd], 1) * 32767).astype(np.int16)
    with wave.open(os.path.join(V.dir, "assets", "audio", "mix.wav"), "wb") as fw:
        fw.setnchannels(2); fw.setsampwidth(2); fw.setframerate(SR); fw.writeframes(out.tobytes())
