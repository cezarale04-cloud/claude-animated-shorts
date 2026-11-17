# Zero Gravity City

A 16-second cinematic 3D animation (1080x1920, 9:16, 30 fps, no text, no watermark) of a modern city where gravity has disappeared. Built in three.js and rendered frame by frame in headless Chromium.

- **0–4 s**: street level. Cars, a cyclist, a dog and papers lift off the road.
- **4–10 s**: the camera cranes up past a floating woman who turns to us, open-mouthed in surprise.
- **10–16 s**: the camera rises over the rooftops: blue sky, clouds, and the whole city drifting upward.

## Render

```bash
npm install
node render.mjs --stills=0,120,220,380        # test frames -> out/still_*.jpg
node render.mjs --out=out/zero-gravity-city.mp4
```

Open `index.html` through any static server for a live preview (`?still&f=220` to look at one frame).
Everything is deterministic (seeded random, time from the frame number).
