# Synthesizes Franklin's lines with Piper (pt_BR faber), joins them with pauses and writes
# voice.wav, timing.json (segment times) and mouth.json (mouth opening per 30 fps frame).
import json, wave, numpy as np, subprocess, sys, io
SEGS = [
  ("hello",   "Olá! Eu sou o Franklin.", 0.35),
  ("who",     "Cientista, inventor, e caçador de curiosidades.", 0.45),
  ("what",    "Aqui nesta conta, eu trago fatos incríveis sobre ciência, natureza, o espaço, o corpo humano, e a história.", 0.4),
  ("how",     "Tudo explicado de um jeito rápido, fácil, e divertido.", 0.5),
  ("goal",    "O nosso objetivo é simples: despertar a sua curiosidade, e mostrar que aprender pode ser uma grande aventura.", 0.5),
  ("follow",  "Então, siga a conta, e venha descobrir o mundo comigo!", 0.9),
]
LEAD = 0.6
SR = 22050
chunks, timing, t = [np.zeros(int(LEAD*SR), np.int16)], [], LEAD
for sid, text, pause in SEGS:
    out = subprocess.run([".venv/bin/piper", "-m", "voices/pt_BR-faber-medium.onnx", "--length-scale", "1.02", "-f", "-"], input=text.encode(), capture_output=True, check=True).stdout
    with wave.open(io.BytesIO(out)) as w:
        assert w.getframerate() == SR
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16)
    # trim silence
    nz = np.where(np.abs(a) > 300)[0]; a = a[max(0, nz[0]-200): nz[-1]+800]
    d = len(a)/SR
    timing.append({"id": sid, "text": text, "start": round(t, 3), "end": round(t+d, 3)})
    chunks += [a, np.zeros(int(pause*SR), np.int16)]
    t += d + pause
audio = np.concatenate(chunks)
with wave.open("voice.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(audio.tobytes())
fps = 30; n = int(np.ceil(len(audio)/SR*fps)); f = audio.astype(np.float32)/32768
spf = SR/fps
rms = np.array([np.sqrt(np.mean(f[int(i*spf):int((i+1)*spf)]**2) + 1e-9) for i in range(n)])
m = np.clip((rms - 0.01) / 0.09, 0, 1) ** 0.7
m = np.convolve(m, [0.25, 0.5, 0.25], "same")
json.dump({"duration": round(len(audio)/SR, 3), "segments": timing}, open("timing.json", "w"), ensure_ascii=False, indent=1)
json.dump([round(float(x), 3) for x in m], open("mouth.json", "w"))
print(json.dumps(timing, ensure_ascii=False, indent=1), len(audio)/SR)
