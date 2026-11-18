"""Procedural music bed + sound effects, mixed under the voice -> assets/audio/mix.wav"""
import json, numpy as np, wave, subprocess

SR = 48000
TOTAL = 31.0
N = int(SR * TOTAL)
rng = np.random.default_rng(7)
D = json.load(open("work/timeline.json"))
W = {(l["i"], w["w"]): w for l in D["lines"] for w in l["words"]}

def read_wav(p):
    with wave.open(p) as f:
        a = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        if f.getnchannels() == 2: a = a.reshape(-1, 2).mean(1)
    return a

def place(buf, sig, t, gain=1.0):
    i = int(t * SR)
    if i >= len(buf): return
    sig = sig[: len(buf) - i]
    buf[i:i + len(sig)] += sig * gain

def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)

def tone(f, dur, a=0.005, r=0.2, kind="sin"):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * f * t
    w = np.sin(ph) if kind == "sin" else (2 * ((f * t) % 1) - 1)
    return w * env(n, a, r)

def add(*xs):
    n=max(len(x) for x in xs); o=np.zeros(n)
    for x in xs: o[:len(x)]+=x
    return o

def noise(dur): return rng.standard_normal(int(dur * SR))

def lowpass(x, k):
    # simple one-pole
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc += k * (x[i] - acc); y[i] = acc
    return y

def bandish(x, k1, k2): return lowpass(x, k1) - lowpass(x, k2)


C = json.load(open("work/cues.json")); S = C["S"]
music = np.zeros(N, np.float32)
BPM = 118; beat = 60 / BPM
kick = add(tone(52, 0.4, 0.001, 0.12), tone(140, 0.05, 0.001, 0.015) * 0.6)
snare = add(bandish(noise(0.25), 0.7, 0.12) * env(int(0.25*SR), 0.001, 0.07), tone(190, 0.15, 0.001, 0.05) * 0.5)
hat = bandish(noise(0.05), 0.95, 0.5) * env(int(0.05 * SR), 0.001, 0.012)
prog = [45, 41, 36, 43]  # Am F C G
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
nb = int(TOTAL / beat) + 1
for b in range(nb):
    t = b * beat; bar = b // 4; r = prog[bar % 4]
    intro = t < S[1]
    place(music, kick, t, 0.75)
    if b % 2 == 1 and not intro: place(music, snare, t, 0.45)
    for k in range(2):
        place(music, hat, t + k * beat / 2 + beat / 4, 0.18)
        place(music, tone(mtof(r - 12), beat / 2 * 0.9, 0.003, 0.12, "saw"), t + k * beat / 2, 0.16)
    if not intro:
        for k, iv in enumerate([0, 7, 12, 15]):
            place(music, tone(mtof(r + 12 + iv), beat / 4, 0.002, 0.06, "saw"), t + k * beat / 4, 0.045)
    if b % 4 == 0:
        for iv in [0, 3, 7]:
            place(music, tone(mtof(r + 24 + iv), beat * 4, 0.3, 1.5), t, 0.05)
music = lowpass(music, 0.5)
voice = read_wav("work/voice.wav")[:N]; voice = np.pad(voice, (0, N - len(voice)))
venv = np.convolve(np.abs(voice), np.ones(2400) / 2400, mode="same")
music *= 1 - 0.5 * np.clip(venv / 0.05, 0, 1)

sfx = np.zeros(N, np.float32)
def whoosh(dur=0.35):
    n = int(dur * SR); x = bandish(noise(dur), 0.25, 0.04)
    return x * np.sin(np.linspace(0, np.pi, n)) ** 2
def boom():
    n = int(1.6 * SR); t = np.arange(n) / SR
    f = 30 + 90 * np.exp(-t * 6)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) + bandish(noise(1.6), 0.4, 0.05) * np.exp(-t * 8) * 0.6
def riser(dur, f0=200, f1=1600):
    n = int(dur * SR); f = np.geomspace(f0, f1, n)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + bandish(noise(dur), 0.6, 0.1) * 0.5) * np.linspace(0, 1, n) ** 2
def tick():
    n = int(0.03 * SR); return tone(1800, 0.03, 0.0005, 0.006)
def stamp():
    return add(boom()[: int(0.6 * SR)] * 0.8, bandish(noise(0.15), 0.8, 0.2) * env(int(0.15 * SR), 0.001, 0.03))
place(sfx, boom(), 0.0, 0.9)
for c in S[1:-1]:
    place(sfx, whoosh(), c - 0.18, 0.55)
# year ticks while the counter runs 2013 -> 2026
for k in range(14):
    place(sfx, tick(), S[1] + 0.4 + 2.4 * (0.5 - 0.5 * np.cos(np.pi * k / 13)), 0.35)
place(sfx, riser(C["t_200"] - S[2]), S[2], 0.3); place(sfx, stamp(), C["t_200"] + 1.0, 0.6)
place(sfx, riser(C["t_475"] - S[3] - 0.2, 150, 2200), S[3] + 0.2, 0.35); place(sfx, boom(), C["t_475"], 0.7); place(sfx, stamp(), C["t_475"] + 1.6, 0.6)
for k in ["t_vice", "t_leo", "t_luc"]: place(sfx, whoosh(0.25), C[k] - 0.1, 0.6)
place(sfx, boom(), C["t_19"], 0.8)
for k in ["t_ps", "t_xb", "t_pc"]: place(sfx, stamp()[: int(0.3 * SR)], C[k], 0.35)
place(sfx, whoosh(0.3), C["t_com"] - 0.1, 0.5)

mix = voice * 1.0 + music * 0.6 + sfx * 0.5
f = int(0.02 * SR); mix[:f] *= np.linspace(0, 1, f); mix[-f:] *= np.linspace(1, 0, f)
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix = mix / np.max(np.abs(mix)) * 0.89
out = (np.stack([mix, mix], 1) * 32767).astype(np.int16)
with wave.open("assets/audio/mix.wav", "wb") as fw:
    fw.setnchannels(2); fw.setsampwidth(2); fw.setframerate(SR); fw.writeframes(out.tobytes())
print("audio ok")
