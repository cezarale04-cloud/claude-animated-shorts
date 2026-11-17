# Franklin, the curiosity scientist

A 25-second vertical presenter video (1080x1920, 9:16, 30 fps) that introduces a curiosities account. Franklin is a friendly 3D cartoon scientist: white lab coat, red bow tie, pens in his pocket, round glasses, safety goggles pushed up on his forehead, fluffy grey hair and a bushy mustache. He stands in a 3D lab with experiments running behind him: a distillation over a Bunsen burner, a Tesla coil throwing sparks, glowing bubble columns and drifting steam. He speaks Brazilian Portuguese, and his lips are synced to the voice. No text on screen.

Script:
> Olá! Eu sou o Franklin. Cientista, inventor, e caçador de curiosidades.
> Aqui nesta conta, eu trago fatos incríveis sobre ciência, natureza, o espaço, o corpo humano, e a história.
> Tudo explicado de um jeito rápido, fácil, e divertido.
> O nosso objetivo é simples: despertar a sua curiosidade, e mostrar que aprender pode ser uma grande aventura.
> Então, siga a conta, e venha descobrir o mundo comigo!

As he names each topic, a glowing hologram icon pops up (atom, leaf, planet, heart, hourglass). The icons then orbit his head, a lightbulb switches on at "curiosidade", sparkles burst at "aventura", and he points at the viewer for "siga a conta".

## Build

```bash
python3 -m venv .venv && .venv/bin/pip install piper-tts numpy
mkdir -p voices && cd voices && for f in pt_BR-faber-medium.onnx pt_BR-faber-medium.onnx.json; do
  curl -sSLO "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/$f"; done && cd ..
.venv/bin/python voice.py     # voice.wav, timing.json, mouth.json (lip sync)
.venv/bin/python audio.py     # mix.wav: voice + music + sound effects
npm install three@0.170.0     # or symlink node_modules
node render.mjs --out=out/franklin_video.mp4
ffmpeg -i out/franklin_video.mp4 -i mix.wav -c:v copy -c:a aac -b:a 192k -shortest out/franklin.mp4
```

To change what he says, edit `SEGS` in `voice.py`, then adjust the gesture keyframes (`KR`, `KL`) and the icon times (`ICONS`) in `scene.js`.
