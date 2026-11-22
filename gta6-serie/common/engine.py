"""Shared pipeline for the GTA 6 series: voice -> timeline -> index.html -> audio mix.

A video module defines LINES, GAPS and a `design(V)` function that uses the
helpers on the Video object to place titles, overlays, shots and sound cues.
"""
import asyncio, json, os, shutil, ssl, subprocess, html, wave
import numpy as np
import edge_tts
import edge_tts.communicate as _c

_c._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
VOICE = "pt-BR-AntonioNeural"
LIKE_LINE = "Curte esse vídeo, deixa o seu like e segue o perfil pra não perder nada!"
SR = 48000


def sh(*a):
    subprocess.run(a, check=True)


async def _tts_one(text, path, voice_name=VOICE, rate="+14%", tries=3):
    # the voice server sometimes answers with no audio (seen with rate "+0%"); retry before failing
    for k in range(tries):
        try:
            return await _tts_try(text, path, voice_name, rate)
        except edge_tts.exceptions.NoAudioReceived:
            if k == tries - 1:
                raise


async def _tts_try(text, path, voice_name, rate):
    c = edge_tts.Communicate(text, voice_name, rate=rate, boundary="WordBoundary")
    words, audio = [], b""
    async for ch in c.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            words.append(dict(w=ch["text"], s=ch["offset"] / 1e7, d=ch["duration"] / 1e7))
    open(path, "wb").write(audio)
    return words


def voice(lines, gaps, work, voice_name=VOICE, rate="+14%", fx=None):
    # rate: one value, or one per line (varied rates sound less uniform / less synthetic)
    # fx: ffmpeg audio filter applied to the voice track (e.g. mic EQ, compression, small room)
    rates = list(rate) + [rate[-1]] * len(lines) if isinstance(rate, (list, tuple)) else [rate] * len(lines)
    os.makedirs(work, exist_ok=True)
    cache = os.path.join(work, "lines.json")
    data = json.load(open(cache)) if os.path.exists(cache) else None
    if not data or [d["text"] for d in data] != lines or any(d.get("voice") != voice_name or d.get("rate", "+14%") != rates[i] for i, d in enumerate(data)):
        data = []
        for i, t in enumerate(lines):
            data.append(dict(text=t, voice=voice_name, rate=rates[i], words=asyncio.run(_tts_one(t, f"{work}/l{i}.mp3", voice_name, rates[i]))))
        json.dump(data, open(cache, "w"), ensure_ascii=False, indent=1)
    t = 0.15
    out = []
    for i, l in enumerate(data):
        s0 = max(0, l["words"][0]["s"] - 0.05)
        e = l["words"][-1]["s"] + l["words"][-1]["d"] + 0.12
        t += gaps[i] if i < len(gaps) else 0.35
        sh("ffmpeg", "-y", "-v", "error", "-i", f"{work}/l{i}.mp3", "-ss", str(s0), "-to", str(e), "-ar", str(SR), "-ac", "1", f"{work}/t{i}.wav")
        words = [dict(w=w["w"], s=round(t + w["s"] - s0, 3), e=round(t + w["s"] - s0 + w["d"], 3)) for w in l["words"]]
        out.append(dict(i=i, start=round(t, 3), end=round(t + e - s0, 3), text=l["text"], words=words))
        t += e - s0
    total = round(t + 0.7, 2)
    ins, flt = [], []
    for i, x in enumerate(out):
        ins += ["-i", f"{work}/t{i}.wav"]
        d = int(x["start"] * 1000)
        flt.append(f"[{i}]adelay={d}|{d}[a{i}]")
    flt.append("".join(f"[a{i}]" for i in range(len(out))) + f"amix=inputs={len(out)}:normalize=0,apad,atrim=0:{total}[o]")
    sh("ffmpeg", "-y", "-v", "error", *ins, "-filter_complex", ";".join(flt), "-map", "[o]", "-ar", str(SR), f"{work}/voice.wav")
    if fx:
        sh("ffmpeg", "-y", "-v", "error", "-i", f"{work}/voice.wav", "-af", f"{fx},atrim=0:{total}", "-ar", str(SR), f"{work}/voice_fx.wav")
        os.replace(f"{work}/voice_fx.wav", f"{work}/voice.wav")
    return out, total


class Video:
    def __init__(self, name, lines, gaps, voice_name=VOICE, rate="+14%", hi="#3DF5FF", next_part=None, end_line=None, fx=None):
        # next_part=N: the video is part of a series; it ends asking to follow for part N instead of the like scene
        self.next_part = next_part
        self.hi = hi
        self.name = name
        self.dir = os.path.join(ROOT, name)
        self.work = os.path.join(self.dir, "work")
        os.makedirs(os.path.join(self.dir, "assets", "audio"), exist_ok=True)
        shutil.copytree(os.path.join(ROOT, "lib"), os.path.join(self.dir, "assets", "lib"), dirs_exist_ok=True)
        for f in ["hyperframes.json", "package.json", "CLAUDE.md", "AGENTS.md"]:
            shutil.copy(os.path.join(ROOT, f), self.dir)
        shutil.copy(os.path.join(HERE, "scene.js"), os.path.join(self.dir, "assets", "scene.js"))
        end = f"Segue o perfil pra ver a parte {['', 'um', 'dois', 'três', 'quatro'][next_part]}!" if next_part else LIKE_LINE
        end = end_line or end
        lines = list(lines) + [end]
        gaps = list(gaps) + [0.4] * (len(lines) - len(gaps))
        self.lines, self.total = voice(lines, gaps, self.work, voice_name, rate, fx)
        self.html, self.js, self.cues = [], [], []
        self.shots, self.cfg = [], {"storm": [], "lightning": [], "animals": False, "rise": None, "flash": None}
        self.n = 0

    # ---- timing helpers ----
    def L(self, i):
        return self.lines[i]["start"]

    def Lend(self, i):
        return self.lines[i]["end"]

    def at(self, i, word, nth=0):
        hits = [w for w in self.lines[i]["words"] if word.lower() in [x.strip(".,?!:").lower() for x in w["w"].split()]]
        return hits[nth]["s"]

    def scene_end(self, i):
        return self.L(i + 1) - 0.1 if i + 1 < len(self.lines) else self.total

    # ---- visuals ----
    def shot(self, name, t0, t1):
        self.shots.append([name, round(t0, 3), round(t1, 3)])

    def title(self, i, text, cue=True):
        s, e = (0 if i == 0 else self.L(i) - 0.1), self.scene_end(i)
        tid = f"t{i}"
        self.html.append(f'<div id="{tid}" class="clip title" data-start="{s:.2f}" data-duration="{e - s:.2f}" data-track-index="2"><div id="{tid}i" class="titlei">{text}</div></div>')
        if s > 0:
            self.js.append(f'tl.fromTo("#{tid}i",{{scale:0.6,opacity:0}},{{scale:1,opacity:1,duration:0.2,ease:"back.out(2)"}},{s:.2f});')
            if cue:
                self.cue("whoosh", s - 0.18)
        return s, e

    def item(self, s, e, top, inner, cls="chip", anim="up", style="", cue="pop"):
        self.n += 1
        iid = f"i{self.n}"
        self.html.append(f'<div id="{iid}" class="clip it" style="top:{top}px" data-start="{s:.2f}" data-duration="{e - s:.2f}" data-track-index="4"><div id="{iid}i" class="{cls}" style="{style}">{inner}</div></div>')
        A = {
            "up": "{y:40,opacity:0},{y:0,opacity:1,duration:0.2,ease:'back.out(2)'}",
            "pop": "{scale:0.4,opacity:0},{scale:1,opacity:1,duration:0.22,ease:'back.out(2.2)'}",
            "stamp": "{scale:2.2,opacity:0,rotation:-8},{scale:1,opacity:1,rotation:0,duration:0.24,ease:'back.out(2)'}",
            "left": "{x:-800,rotation:-5},{x:0,rotation:-3,duration:0.26,ease:'back.out(1.6)'}",
            "right": "{x:800,rotation:5},{x:0,rotation:3,duration:0.26,ease:'back.out(1.6)'}",
            "fade": "{opacity:0},{opacity:1,duration:0.25}",
        }[anim]
        if s > 0:
            self.js.append(f'tl.fromTo("#{iid}i",{A},{s:.2f});')
        if cue:
            self.cue(cue, s)
        return iid

    def counter(self, s, e, top, to, dur=1.2, prefix="", suffix="", frm=0, cls="big", dec=0, year=False):
        self.n += 1
        cid = f"n{self.n}"
        fmt = f'Math.round(o{cid}.v)' if dec == 0 else f'o{cid}.v.toFixed({dec}).replace(".",",")'
        iid = self.item(s, e, top, f'{prefix}<span id="{cid}">{frm}</span>{suffix}', cls=cls, anim="pop", cue=None)
        self.js.append(f'var o{cid}={{v:{frm}}}; tl.fromTo(o{cid},{{v:{frm}}},{{v:{to},duration:{dur},ease:"{"power2.inOut" if year else "power3.out"}",onUpdate:function(){{document.getElementById("{cid}").textContent={fmt};}}}},{s + 0.1:.2f});')
        self.js.append(f'tl.to("#{iid}i",{{scale:1.12,duration:0.1,yoyo:true,repeat:1}},{s + 0.1 + dur:.2f});')
        if year:
            self.cue("ticks", s + 0.1, dur)
        else:
            self.cue("riser", s - 0.5, 0.6)
        self.cue("stamp", s + 0.1 + dur)
        return iid

    def raw(self, html_, js=""):
        self.html.append(html_)
        if js:
            self.js.append(js)

    def cue(self, kind, t, dur=0.0):
        self.cues.append(dict(k=kind, t=round(t, 3), d=dur))

    # ---- output ----
    def captions(self):
        out, js = [], []
        chunks = []
        for line in self.lines:
            cur = []
            for w in line["words"]:
                cur.append(w)
                if len(cur) == 3:
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
            js.append(f'tl.fromTo("#capi{ci}",{{scale:0.82,y:14}},{{scale:1,y:0,duration:0.16,ease:"back.out(2.5)"}},{s:.3f});')
        return out, js

    def next_scene(self):
        i = len(self.lines) - 1
        s = self.L(i) - 0.1
        self.title(i, f"PARTE <em>{self.next_part}</em> NO PERFIL!")
        self.item(s + 0.05, self.total, 470, "CONTINUA...", cls="tag", anim="stamp", style="background:#7b2ff7;font-size:84px", cue="stamp")
        iid = self.item(self.at(i, "Segue") - 0.05, self.total, 700, "+ SEGUIR", cls="tag", anim="stamp", style="background:#3DF5FF;color:#12002b;font-size:110px;border-color:#12002b", cue="stamp")
        self.js.append(f'tl.to("#{iid}i",{{scale:1.1,duration:0.18,yoyo:true,repeat:5,ease:"sine.inOut"}},{self.at(i, "Segue") + 0.3:.2f});')

    def like_scene(self):
        if self.next_part:
            return self.next_scene()
        i = len(self.lines) - 1
        s = self.L(i) - 0.1
        self.title(i, "CURTE E <em>SEGUE!</em>")
        self.item(s + 0.05, self.total, 470, '<span class="heart"></span> CURTE', cls="tag", anim="pop", style="background:#ff2e88;font-size:76px;display:flex;align-items:center;gap:26px", cue="pop")
        self.item(self.at(i, "like") - 0.05, self.total, 640, "DEIXA SEU LIKE", cls="tag", anim="left", style="background:#2b6cb0;font-size:70px", cue="whoosh")
        iid = self.item(self.at(i, "segue") - 0.05, self.total, 810, "+ SEGUIR", cls="tag", anim="stamp", style="background:#3DF5FF;color:#12002b;font-size:96px;border-color:#12002b", cue="stamp")
        self.js.append(f'tl.to("#{iid}i",{{scale:1.1,duration:0.18,yoyo:true,repeat:5,ease:"sine.inOut"}},{self.at(i, "segue") + 0.3:.2f});')

    def write(self, part_label):
        self.like_scene()
        cap_html, cap_js = self.captions()
        css = open(os.path.join(HERE, "style.css")).read()
        T = self.total
        page = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="assets/lib/gsap.min.js"></script>
<style>
{css}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{T}" data-width="1080" data-height="1920">
  <div id="stage" class="clip" data-start="0" data-duration="{T}" data-track-index="0" data-track-kind="graphics"></div>
  <div id="part" class="clip partb" data-start="0" data-duration="{T}" data-track-index="1"><div class="parti">{part_label}</div></div>
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
        mix(self)
        print(self.name, "total", T, "items", self.n)


# ------------------------------------------------------------------ audio
rng = np.random.default_rng(7)


def add(*xs):
    n = max(len(x) for x in xs)
    o = np.zeros(n)
    for x in xs:
        o[: len(x)] += x
    return o


def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)


def tone(f, dur, a=0.005, r=0.2, kind="sin"):
    n = int(dur * SR)
    t = np.arange(n) / SR
    w = np.sin(2 * np.pi * f * t) if kind == "sin" else (2 * ((f * t) % 1) - 1)
    return w * env(n, a, r)


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def lowpass(x, k):
    # vectorised one-pole via scipy-free recursion using lfilter-like cumulative trick
    from numpy import empty
    y = empty(len(x))
    acc = 0.0
    for i in range(len(x)):
        acc += k * (x[i] - acc)
        y[i] = acc
    return y


def bandish(x, k1, k2):
    return lowpass(x, k1) - lowpass(x, k2)


def place(buf, sig, t, gain=1.0):
    i = int(t * SR)
    if i < 0:
        sig = sig[-i:]; i = 0
    if i >= len(buf):
        return
    sig = sig[: len(buf) - i]
    buf[i: i + len(sig)] += sig * gain


def read_wav(p):
    with wave.open(p) as f:
        a = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return a


def mix(V):
    N = int(SR * V.total)
    music = np.zeros(N, np.float32)
    BPM = 118
    beat = 60 / BPM
    kick = add(tone(52, 0.4, 0.001, 0.12), tone(140, 0.05, 0.001, 0.015) * 0.6)
    snare = add(bandish(noise(0.25), 0.7, 0.12) * env(int(0.25 * SR), 0.001, 0.07), tone(190, 0.15, 0.001, 0.05) * 0.5)
    hat = bandish(noise(0.05), 0.95, 0.5) * env(int(0.05 * SR), 0.001, 0.012)
    prog = [45, 41, 36, 43]
    mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
    intro_end = V.L(1) if len(V.lines) > 1 else 1.5
    bass_cache = {}
    for b in range(int(V.total / beat) + 1):
        t = b * beat
        r = prog[(b // 4) % 4]
        intro = t < intro_end
        place(music, kick, t, 0.75)
        if b % 2 == 1 and not intro:
            place(music, snare, t, 0.45)
        for k in range(2):
            place(music, hat, t + k * beat / 2 + beat / 4, 0.18)
            key = (r, "b")
            if key not in bass_cache:
                bass_cache[key] = tone(mtof(r - 12), beat / 2 * 0.9, 0.003, 0.12, "saw")
            place(music, bass_cache[key], t + k * beat / 2, 0.16)
        if not intro:
            for k, iv in enumerate([0, 7, 12, 15]):
                place(music, tone(mtof(r + 12 + iv), beat / 4, 0.002, 0.06, "saw"), t + k * beat / 4, 0.045)
        if b % 4 == 0:
            for iv in [0, 3, 7]:
                place(music, tone(mtof(r + 24 + iv), beat * 4, 0.3, 1.5), t, 0.05)
    # cheap lowpass via moving average
    music = np.convolve(music, np.ones(3) / 3, mode="same")
    voice = read_wav(f"{V.work}/voice.wav")[:N]
    voice = np.pad(voice, (0, N - len(voice)))
    venv = np.convolve(np.abs(voice), np.ones(2400) / 2400, mode="same")
    music *= 1 - 0.5 * np.clip(venv / 0.05, 0, 1)

    sfx = np.zeros(N, np.float32)

    def whoosh(d=0.35):
        n = int(d * SR)
        return bandish(noise(d), 0.25, 0.04) * np.sin(np.linspace(0, np.pi, n)) ** 2

    def boom():
        n = int(1.6 * SR); t = np.arange(n) / SR
        f = 30 + 90 * np.exp(-t * 6)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) + bandish(noise(1.6), 0.4, 0.05) * np.exp(-t * 8) * 0.6

    def riser(d):
        n = int(d * SR); f = np.geomspace(200, 1800, n)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + bandish(noise(d), 0.6, 0.1) * 0.5) * np.linspace(0, 1, n) ** 2

    def popc():
        n = int(0.12 * SR); t = np.arange(n) / SR
        f = 900 * np.exp(-t * 25) + 300
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.04)

    BOOM, WH, POP = boom(), whoosh(), popc()
    STAMP = add(BOOM[: int(0.6 * SR)] * 0.8, bandish(noise(0.15), 0.8, 0.2) * env(int(0.15 * SR), 0.001, 0.03))
    TICK = tone(1800, 0.03, 0.0005, 0.006)
    THUNDER = add(bandish(noise(3.0), 0.08, 0.01) * 3 * np.exp(-np.arange(int(3 * SR)) / SR * 1.2), BOOM * 0.6)
    for c in V.cues:
        k, t, d = c["k"], c["t"], c["d"]
        if k == "whoosh": place(sfx, WH, t, 0.55)
        elif k == "boom": place(sfx, BOOM, t, 0.85)
        elif k == "pop": place(sfx, POP, t, 0.35)
        elif k == "stamp": place(sfx, STAMP, t, 0.55)
        elif k == "riser": place(sfx, riser(max(0.3, d)), t, 0.3)
        elif k == "thunder": place(sfx, THUNDER, t, 0.8)
        elif k == "ticks":
            for j in range(12):
                place(sfx, TICK, t + d * (0.5 - 0.5 * np.cos(np.pi * j / 11)), 0.35)
        elif k == "rain":
            n = int(d * SR)
            r = bandish(noise(d), 0.7, 0.05) * 0.5
            fade = np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (0.4 * SR))
            place(sfx, r * fade, t, 0.4)
    mixd = voice + music * 0.6 + sfx * 0.5
    f = int(0.02 * SR)
    mixd[:f] *= np.linspace(0, 1, f); mixd[-f:] *= np.linspace(1, 0, f)
    mixd = np.tanh(mixd * 1.2) / np.tanh(1.2)
    mixd = mixd / np.max(np.abs(mixd)) * 0.89
    out = (np.stack([mixd, mixd], 1) * 32767).astype(np.int16)
    with wave.open(os.path.join(V.dir, "assets", "audio", "mix.wav"), "wb") as fw:
        fw.setnchannels(2); fw.setsampwidth(2); fw.setframerate(SR); fw.writeframes(out.tobytes())
