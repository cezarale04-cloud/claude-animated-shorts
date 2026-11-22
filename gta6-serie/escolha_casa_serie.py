"""Continuação de "GTA 6 ou Zelda? Você escolhe" (o GTA 6 ganhou a 1ª votação).
Uso: python3 escolha_casa_serie.py 3        (parte 3: casa ou casa da vó? votação nos comentários)
     python3 escolha_casa_serie.py 4 casa   (parte 4 se ganhar "casa": ele joga GTA 6 na hora)
     python3 escolha_casa_serie.py 4 vo     (parte 4 se ganhar "vó": sem videogame, só joga no dia seguinte)
"""
import sys, os, shutil; sys.path.insert(0, "common")
from engine import Video, HERE
from serie_sala import build, tag, chip, cta, GAPS, RATES, FX, PURP, GRN, RED, BLUE, GOLD

PART = int(sys.argv[1]) if len(sys.argv) > 1 else 3
WIN = sys.argv[2] if len(sys.argv) > 2 else "casa"
CASA, VO = "#2b6cb0", "#c2338a"
LABEL = "VOCÊ ESCOLHE"


def vote_board(V, s, e, win_t=None, win=None, header="VOTAÇÃO ABERTA"):
    """Two racing bars: 🏠 CASA x 👵 VÓ. Before win_t they swing; at win_t the winner fills up."""
    V.raw('<style>.vote{position:absolute;left:70px;right:70px;top:360px;z-index:8;display:flex;flex-direction:column;gap:14px;font-family:Inter,sans-serif}'
          '.vh{align-self:center;background:#12002b;color:#ffd84d;font-weight:900;font-size:36px;letter-spacing:6px;padding:8px 22px;border-radius:12px}'
          '.vr{display:flex;align-items:center;gap:16px;background:rgba(18,0,43,.82);border:5px solid #12002b;border-radius:18px;padding:12px 16px}'
          '.vn{width:230px;font-weight:900;font-size:44px;color:#fff}.vb{flex:1;height:46px;background:rgba(255,255,255,.15);border-radius:12px;overflow:hidden}'
          '.vf{height:100%;width:50%;border-radius:12px}.vq{width:90px;text-align:right;font-weight:900;font-size:44px;color:#fff}</style>')
    V.raw(f'<div id="vote" class="clip vote" data-start="{s:.2f}" data-duration="{e - s:.2f}" data-track-index="6"><div class="vh">{header}</div>'
          f'<div class="vr"><div class="vn">🏠 CASA</div><div class="vb"><div id="vfa" class="vf" style="background:{CASA}"></div></div><div id="vqa" class="vq">?</div></div>'
          f'<div class="vr"><div class="vn">👵 VÓ</div><div class="vb"><div id="vfb" class="vf" style="background:{VO}"></div></div><div id="vqb" class="vq">?</div></div></div>')
    V.js.append(f'tl.fromTo("#vote",{{y:-60,opacity:0}},{{y:0,opacity:1,duration:0.3,ease:"back.out(2)"}},{s + 0.05:.2f});')
    end = win_t if win_t else e
    for k in range(int((end - s - 0.3) / 0.45)):
        g = 38 + (k * 29) % 26
        t = s + 0.3 + k * 0.45
        V.js.append(f'tl.to("#vfa",{{width:"{g}%",duration:0.4,ease:"sine.inOut"}},{t:.2f});tl.to("#vfb",{{width:"{100 - g}%",duration:0.4,ease:"sine.inOut"}},{t:.2f});')
    if win_t:
        wa = 100 if win == "casa" else 0
        V.js.append(f'tl.to("#vfa",{{width:"{wa}%",duration:0.4,ease:"power3.out"}},{win_t:.2f});tl.to("#vfb",{{width:"{100 - wa}%",duration:0.4,ease:"power3.out"}},{win_t:.2f});')
        a, b = ("a", "b") if win == "casa" else ("b", "a")
        V.js.append(f'tl.set("#vq{a}",{{textContent:"🏆"}},{win_t:.2f});tl.set("#vq{b}",{{textContent:""}},{win_t:.2f});')
        V.cue("riser", win_t - 1.0, 0.9)
    else:
        V.cue("ticks", s + 0.3, 1.2)


if PART == 3:
    LINES = [
        "Parte três. Vocês escolheram o GTA 6, e ele comprou!",
        "Mas agora tem outro problema.",
        "Ele vai pra casa dele, ou pra casa da vó?",
        "Se for pra casa, ele joga o GTA 6 hoje mesmo.",
        "Se for pra casa da vó, só vai poder jogar amanhã.",
        "Quem decide é você de novo. Comenta aí: casa, ou vó?",
        "O mais comentado acontece na parte quatro.",
    ]
    V = Video("escolha3", LINES, GAPS[: len(LINES)], voice_name="pt-BR-ThalitaMultilingualNeural", rate=RATES, hi="#FFD84D",
              next_part=4, end_line="Segue o perfil pra ver pra onde ele vai!", fx=FX)
    shutil.copy(os.path.join(HERE, "scene_escolha.js"), os.path.join(V.dir, "assets", "scene.js"))
    E, L_, at, n = V.scene_end, V.L, V.at, len(LINES)
    V.cfg.update(only="gta", walkEnd=0.01, px=0.75, acts=[[0, "raise_gta"], [L_(1) - 0.1, "think"], [L_(2) - 0.1, "look_gta"], [L_(3) - 0.1, "look_zel"],
                                                         [L_(4) - 0.1, "think"], [L_(5) - 0.1, "ask"], [L_(6) - 0.1, "hold2"], [L_(n) - 0.1, "ask"]])
    for i, ttl in enumerate(["ELE <em>COMPROU!</em>", "MAS <em>AGORA...</em>", "CASA OU <em>VÓ?</em>", "🏠 <em>CASA</em>", "👵 <em>VÓ</em>",
                             "VOCÊ <em>ESCOLHE!</em>", "NA <em>PARTE 4</em>"]):
        V.title(i, ttl)
    V.item(0.1, E(0), 1180, "🏆 VOCÊS ESCOLHERAM: GTA 6", cls="tag", anim="stamp", style="background:#ff2e88;font-size:50px", cue="stamp")
    V.item(L_(2) - 0.05, E(2), 1180, "🏠 CASA  ou  👵 VÓ?", cls="tag", anim="stamp", style=f"background:{PURP};font-size:60px", cue="stamp")
    V.item(at(3, "hoje") - 0.05, E(3), 1180, "🎮 JOGA HOJE!", cls="tag", anim="left", style=f"background:{CASA};font-size:70px", cue="whoosh")
    V.item(at(4, "amanhã") - 0.05, E(4), 1180, "⏰ SÓ AMANHÃ", cls="tag", anim="right", style=f"background:{VO};font-size:70px", cue="whoosh")
    V.item(at(6, "parte") - 0.05, E(6), 1300, "NA PARTE 4 👀", cls="tag", anim="stamp", style=f"background:{PURP};font-size:64px", cue="stamp")
    V.raw('<style>.cap{top:1440px !important}</style>')
    vote_board(V, L_(5) - 0.1, L_(n) - 0.15)
    V.cue("boom", 0)
    for i in range(1, n):
        V.cue("whoosh", L_(i) - 0.2)
    V.write(f"{LABEL} · PARTE 3/4")
elif WIN == "casa":
    S = [
        ("Parte quatro. Vocês escolheram: casa! Direto pro sofá.", "<em>CASA!</em>", "front", [(None, "off")], [(None, "cheer")],
         [tag("casa", "🏆 VOCÊS ESCOLHERAM: CASA", "#2b6cb0", size=50)]),
        ("Videogame ligado. GTA 6 carregando...", "<em>CARREGANDO</em>", "tv", [(None, "loading")], [(None, "play")],
         [tag("carregando", "⏳ CARREGANDO...", GOLD, size=60)]),
        ("E começou!", "<em>COMEÇOU!</em>", "behind", [(None, "game")], [(None, "cheer")], [tag("começou", "🎮 COMEÇOU!", GRN, size=72)]),
        ("Pizza do lado, controle na mão. Agora ele só sai daqui quando zerar.", "SÓ SAI QUANDO <em>ZERAR</em>", "front", [(None, "game")],
         [(None, "play")], [tag("zerar", "SÓ SAI QUANDO ZERAR 😂", PURP, size=52)]),
        ("E você, já está jogando o GTA 6? Comenta aí!", "E <em>VOCÊ?</em>", "close", [(None, "game")], [(None, "point")],
         [cta("Comenta", "💬 JÁ ESTÁ JOGANDO?")]),
    ]
    build("escolha4casa", 4, 4, S, label=LABEL, extra=lambda V: vote_board(V, 0, V.L(1) - 0.15, win_t=0.9, win="casa", header="RESULTADO"))
else:
    S = [
        ("Parte quatro. Vocês escolheram: casa da vó!", "CASA DA <em>VÓ!</em>", "vo", [(None, "txt|CASA DA VÓ|👵 ❤️|")], [(None, "cheer")],
         [tag("vó", "🏆 VOCÊS ESCOLHERAM: VÓ", VO, size=52)]),
        ("A vó recebeu ele com bolo, café e um abraço apertado.", "A <em>VÓ</em>", "vo", [(None, "txt|CASA DA VÓ|🎂 ☕|bolo e café")], [(None, "cheer")],
         [tag("bolo", "🎂 BOLO + ☕ CAFÉ", GOLD, size=58)]),
        ("Mas na casa da vó não tem videogame. Só novela.", "SEM <em>VIDEOGAME</em>", "tv", [(None, "txt|CASA DA VÓ|📺 SÓ NOVELA|sem videogame")],
         [(None, "facepalm")], [tag("videogame", "❌ SEM VIDEOGAME", RED, size=60)]),
        ("Então o GTA 6 vai ter que esperar até amanhã.", "<em>ESPERANDO...</em>", "close", [(None, "txt|GTA 6|⏰ AMANHÃ|")], [(None, "think")],
         [tag("amanhã", "⏰ SÓ AMANHÃ", BLUE, size=64)]),
        ("No dia seguinte, em casa... finalmente!", "DIA <em>SEGUINTE</em>", "tv", [(None, "loading"), ("finalmente", "game")],
         [(None, "play"), ("finalmente", "cheer")], [tag("finalmente", "🎮 FINALMENTE!", GRN, size=66)]),
        ("E aí, valeu a pena esperar um dia? Comenta aí!", "VALEU A <em>PENA?</em>", "close", [(None, "game")], [(None, "point")],
         [cta("Comenta", "💬 VALEU A PENA?")]),
    ]
    build("escolha4vo", 4, 4, S, label=LABEL,
          extra=lambda V: vote_board(V, 0, V.L(1) - 0.15, win_t=0.9, win="vo", header="RESULTADO"),
          cfg=lambda V: {"grandma": [0, V.L(2) - 0.1]})
