# Music (light, curious marimba + pad + soft bass) and SFX, mixed under the voice -> mix.wav
import json, wave, numpy as np
SR = 44100
T = json.load(open('timing.json'))['duration']
N = int(T * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(3)
def note(f, dur, kind='marimba'):
    n = int(dur * SR); x = np.arange(n) / SR
    if kind == 'marimba':
        y = np.sin(2*np.pi*f*x) * np.exp(-x*6) + 0.35*np.sin(2*np.pi*f*4*x) * np.exp(-x*18) + 0.15*np.sin(2*np.pi*f*10*x)*np.exp(-x*40)
    elif kind == 'bass':
        y = (np.sin(2*np.pi*f*x) + 0.3*np.sin(2*np.pi*2*f*x)) * np.exp(-x*3) * np.minimum(1, x*80)
    elif kind == 'pad':
        y = sum(np.sin(2*np.pi*f*d*x + p) for d, p in [(1, 0), (1.004, 1), (0.996, 2), (2.002, 3)]) / 4
        env = np.minimum(1, x/0.6) * np.minimum(1, (dur - x)/0.6); y *= env
    elif kind == 'bell':
        y = (np.sin(2*np.pi*f*x) + 0.5*np.sin(2*np.pi*f*2.76*x) + 0.25*np.sin(2*np.pi*f*5.4*x)) * np.exp(-x*3)
    return y
def add(buf, y, at, g):
    i = int(at * SR); j = min(len(buf), i + len(y))
    if i < len(buf): buf[i:j] += g * y[:j-i]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
music = np.zeros(N)
bpm = 104; beat = 60 / bpm
chords = [(60, [60, 64, 67]), (57, [57, 60, 64]), (53, [53, 57, 60]), (55, [55, 59, 62])]  # C Am F G
melody = [72, 76, 79, 76, 74, 72, 69, 72, 69, 72, 77, 76, 74, 71, 74, 79]
b = 0; tt = 0.0
while tt < T:
    root, ch = chords[(b // 4) % 4]
    if b % 4 == 0:
        add(music, note(hz(root - 12), beat * 2, 'bass'), tt, 0.35)
        add(music, note(hz(root - 12), beat * 2, 'bass'), tt + beat * 2, 0.25)
        for m in ch: add(music, note(hz(m), beat * 4 + 0.6, 'pad'), tt, 0.06)
    # pluck arpeggio on eighths, light melody on beats
    for h in range(2):
        m = ch[(b * 2 + h) % 3] + 12
        add(music, note(hz(m), 0.6), tt + h * beat / 2, 0.10 if h == 0 else 0.06)
    if b % 2 == 0: add(music, note(hz(melody[(b // 2) % len(melody)]), 0.9), tt, 0.13)
    # soft shaker
    sh = rng.normal(0, 1, int(0.05 * SR)) * np.exp(-np.arange(int(0.05*SR))/SR*80)
    add(music, sh, tt + beat / 2, 0.025)
    b += 1; tt += beat
music *= np.minimum(1, t / 1.0) * np.minimum(1, (T - t) / 1.2)
sfx = np.zeros(N)
def pop(at, f0=500):
    n = int(0.18 * SR); x = np.arange(n) / SR
    y = np.sin(2*np.pi*(f0*x + 900*x*x*3)) * np.exp(-x*30); add(sfx, y, at, 0.35)
    add(sfx, note(f0*2.5, 0.8, 'bell'), at + 0.02, 0.12)
for i, at in enumerate([8.35, 9.22, 10.1, 10.72, 11.45]): pop(at, 420 + i * 70)
pop(17.35, 380)
for k, m in enumerate([84, 88, 91]): add(sfx, note(hz(m), 1.5, 'bell'), 18.2 + k * 0.05, 0.2)  # bulb "ding"
for i in range(14): add(sfx, note(hz(84 + [0, 4, 7, 12, 16, 19, 24][i % 7]), 1.0, 'bell'), 20.25 + i * 0.045, 0.07)  # sparkle
n = int(0.7 * SR); x = np.arange(n) / SR
wh = np.convolve(rng.normal(0, 1, n), np.ones(40) / 40, 'same') * np.sin(np.pi * x / 0.7) ** 2; add(sfx, wh, 21.85, 0.5)  # icons whoosh away
with wave.open('voice.wav') as w:
    v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768; vsr = w.getframerate()
voice = np.interp(np.arange(N) / SR, np.arange(len(v)) / vsr, v)
# duck music under speech
env = np.convolve(np.abs(voice), np.ones(4410) / 4410, 'same'); duck = 1 - 0.45 * np.clip(env / 0.05, 0, 1)
mix = voice * 1.0 + music * duck * 0.55 + sfx * 0.6
mix = np.tanh(mix * 1.1) / np.tanh(1.1) * 0.89
with wave.open('mix.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('peak', np.abs(mix).max(), 'dur', N / SR)
