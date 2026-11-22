"""Builds one Short of a series in the living-room scene (common/scene_sala.js).

S is a list of lines: (text, title, cam, tv, pose, items)
  tv / pose: list of (word or None, value); items: list of (word or None, html, cls, style, top, anim, cue)
Natural delivery (the user asked that videos must not sound AI-made): varied pauses and speeds per line,
a casual end line and a mic-like voice chain.
"""
import os, shutil
from engine import Video, HERE

PINK, PURP, GRN, RED, BLUE, GOLD = "#ff2e88", "#7b2ff7", "#2a9d8f", "#e63946", "#2b6cb0", "#d4a017"
END_MID = {2: "Segue aí pra não perder a parte dois.", 3: "Segue o perfil que a parte três já tá lá."}
END_LAST = "Curte o vídeo, deixa o like e segue pra mais GTA!"
GAPS = [0, 0.38, 0.5, 0.34, 0.55, 0.42, 0.48, 0.36]
RATES = ["+5%", "+1%", "+7%", "-1%", "+4%", "+2%", "+6%", "+1%"]
FX = ("highpass=f=75,equalizer=f=180:t=q:w=1:g=2.5,equalizer=f=3200:t=q:w=1.4:g=2,"
      "acompressor=threshold=-20dB:ratio=3:attack=6:release=90:makeup=2,aecho=0.85:0.6:23|37:0.07|0.04")


def tag(word, txt, color, top=1160, size=60, anim="stamp", cue="stamp"):
    return (word, txt, "tag", f"background:{color};font-size:{size}px", top, anim, cue)


def chip(word, txt, top=1280, anim="up", cue="pop"):
    return (word, txt, "chip", "", top, anim, cue)


def cta(word, txt):
    return (word, txt, "cta", "", 1160, "pop", "pop")


def part_tag():
    return lambda n: tag(None, f"PARTE {n}", PURP, size=80, anim="fade", cue=None)


def build(name, part, total, S, label="GTA", hi="#FFD84D", extra=None, cfg=None):
    end = END_LAST if part == total else END_MID[part + 1]
    V = Video(name, [s[0] for s in S], GAPS[: len(S)], voice_name="pt-BR-ThalitaMultilingualNeural", rate=RATES, hi=hi,
              next_part=(part + 1 if part < total else None), end_line=end, fx=FX)
    shutil.copy(os.path.join(HERE, "scene_sala.js"), os.path.join(V.dir, "assets", "scene.js"))
    E = V.scene_end

    def when(i, word):
        return (V.L(i) - 0.1 if i else 0) if word is None else V.at(i, word) - 0.05

    tv, poses, cams = [], [], []
    for i, (text, title, cam, tvl, pl, items) in enumerate(S):
        V.title(i, title)
        cams.append([cam, V.L(i) - 0.1 if i else 0, E(i)])
        tv += [[when(i, w), m] for w, m in tvl]
        poses += [[when(i, w), p] for w, p in pl]
        for (w, html, cls, style, top, anim, cue) in items:
            V.item(when(i, w) + (0.1 if w is None and i else 0), E(i), top, html, cls=cls, anim=anim, style=style, cue=cue)
        if i:
            V.cue("whoosh", V.L(i) - 0.2)
    n = len(S)
    cams.append(["pull", V.L(n) - 0.1, V.total])
    poses.append([V.L(n) - 0.1, "cheer" if part == total else "point"])
    V.cfg.update(tv=tv, poses=poses, cams=cams, px=0.75)
    if cfg:
        V.cfg.update(cfg(V))
    if extra:
        extra(V)
    V.raw('<style>.cap{top:1420px !important}.vig{position:absolute;inset:0;z-index:1;background:radial-gradient(ellipse at 50% 45%,transparent 58%,rgba(8,0,24,.55) 100%)}</style>')
    V.raw(f'<div id="vig" class="clip vig" data-start="0" data-duration="{V.total}" data-track-index="1"></div>')
    V.cue("boom", 0)
    V.write(f"{label} · PARTE {part}/{total}")
    return V


def build_city(name, part, total, S, label="GTA", hi="#FFD84D"):
    """Same series grammar in the neon city scene (common/scene.js): each line is
    (text, title, shot, items) with shot one of rush, rushBack, side, city, crane, aerial, road, beach, gator, sea, top, storm, orbit."""
    end = END_LAST if part == total else END_MID[part + 1]
    V = Video(name, [s[0] for s in S], GAPS[: len(S)], voice_name="pt-BR-ThalitaMultilingualNeural", rate=RATES, hi=hi,
              next_part=(part + 1 if part < total else None), end_line=end, fx=FX)
    E = V.scene_end

    def when(i, word):
        return (V.L(i) - 0.1 if i else 0) if word is None else V.at(i, word) - 0.05

    for i, (text, title, shot, items) in enumerate(S):
        V.title(i, title)
        V.shot(shot, V.L(i) - 0.1 if i else 0, E(i))
        for k, (w, html, cls, style, top, anim, cue) in enumerate(items):
            top = {1160: 480, 1280: 640}.get(top, top)  # city layout: tags sit in the sky, above the action
            V.item(when(i, w) + (0.1 if w is None and i else 0), E(i), top, html, cls=cls, anim=anim, style=style, cue=cue)
        if i:
            V.cue("whoosh", V.L(i) - 0.2)
    V.shot("rushBack", V.L(len(S)) - 0.1, V.total)
    V.cfg["animals"] = True
    V.cue("boom", 0)
    V.write(f"{label} · PARTE {part}/{total}")
    return V
