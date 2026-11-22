"""Série "GTA 6 ou Zelda? Os seguidores escolhem" no supermercado (common/scene_escolha.js).
Uso: python3 escolha_serie.py 1        (parte 1: votação nos comentários)
     python3 escolha_serie.py 2 gta    (parte 2 se o GTA 6 ganhar)
     python3 escolha_serie.py 2 zelda  (parte 2 se o Zelda ganhar)
As caixas dos jogos são desenhadas aqui, só com o nome escrito: sem logo, arte ou personagem da Rockstar ou da Nintendo.
"""
import sys, os, shutil, json; sys.path.insert(0, "common")
from engine import Video, HERE
from serie_sala import GAPS, RATES, FX, tag, PURP, GRN, RED, GOLD

PART = int(sys.argv[1]) if len(sys.argv) > 1 else 1
WIN = sys.argv[2] if len(sys.argv) > 2 else "gta"
PINK, ZGREEN = "#ff2e88", "#2fa84f"

if PART == 1:
    LINES = [
        "Ele só tem dinheiro pra um jogo. GTA 6, ou Zelda?",
        "Ele veio no mercado comprar um jogo novo, e achou os dois.",
        "Só que o dinheiro dá pra levar um só.",
        "De um lado, o GTA 6.",
        "Do outro, o Zelda.",
        "E ele não consegue decidir.",
        "Então quem escolhe é você. Comenta aí: GTA ou Zelda?",
        "O mais comentado, ele leva pra casa na parte dois.",
    ]
    name, end = "escolha1", "Segue o perfil pra ver qual ele vai levar!"
else:
    W, L = ("GTA 6", "Zelda") if WIN == "gta" else ("Zelda", "GTA 6")
    LINES = [
        "Parte dois. Vocês votaram, e o jogo mais comentado foi...",
        f"{W}!",
        f"Então o {L} volta pra prateleira, e o {W} vai pro carrinho!",
        "Valeu por escolher com a gente!",
        "E agora, qual jogo ele compra na próxima? Comenta aí!",
    ]
    name, end = f"escolha2{WIN}", "Curte o vídeo, deixa o like e segue pra mais!"

V = Video(name, LINES, GAPS[: len(LINES)], voice_name="pt-BR-ThalitaMultilingualNeural", rate=RATES, hi="#FFD84D",
          next_part=2 if PART == 1 else None, end_line=end, fx=FX)
shutil.copy(os.path.join(HERE, "scene_escolha.js"), os.path.join(V.dir, "assets", "scene.js"))
E, L_, at = V.scene_end, V.L, V.at
n = len(LINES)

if PART == 1:
    hold_t = at(1, "dois") - 0.05
    acts = [[0, "walk"], [hold_t, "hold2"], [L_(3) - 0.1, "raise_gta"], [L_(4) - 0.1, "raise_zel"], [L_(5) - 0.1, "think"],
            [L_(6) - 0.1, "ask"], [L_(7) - 0.1, "hold2"], [L_(n) - 0.1, "ask"]]
    V.cfg.update(acts=acts, walkEnd=hold_t, px=0.75)
    V.title(0, "GTA 6 <em>OU</em> ZELDA?")
    V.title(1, "FOI ÀS <em>COMPRAS</em>")
    V.title(2, "SÓ DÁ PRA <em>UM</em>")
    V.title(3, "<em>GTA 6</em>")
    V.title(4, "<em>ZELDA</em>")
    V.title(5, "E <em>AGORA?</em>")
    V.title(6, "VOCÊ <em>ESCOLHE!</em>")
    V.title(7, "O MAIS <em>COMENTADO</em>")
    V.item(at(2, "dinheiro") - 0.05, E(2), 1180, "💸 SÓ DÁ PRA LEVAR UM", cls="tag", anim="stamp", style=f"background:{RED};font-size:58px", cue="stamp")
    V.item(L_(3) - 0.05, E(3), 1180, "GTA 6", cls="tag", anim="left", style=f"background:{PINK};font-size:84px", cue="whoosh")
    V.item(L_(4) - 0.05, E(4), 1180, "ZELDA", cls="tag", anim="right", style=f"background:{ZGREEN};font-size:84px", cue="whoosh")
    V.item(at(5, "decidir") - 0.05, E(5), 1180, "🤔 🤔 🤔", cls="tag", anim="pop", style=f"background:{GOLD};font-size:70px", cue="pop")
    V.item(at(7, "parte") - 0.05, E(7), 1300, "NA PARTE 2 👀", cls="tag", anim="stamp", style=f"background:{PURP};font-size:64px", cue="stamp")
    vote_s, vote_e = L_(6) - 0.1, L_(n) - 0.15
    win_t = None
else:
    win = "GTA 6" if WIN == "gta" else "ZELDA"
    acts = [[0, "think"], [L_(1) - 0.1, "raise_gta" if WIN == "gta" else "raise_zel"], [L_(2) - 0.1, f"cart_{'gta' if WIN == 'gta' else 'zel'}"],
            [L_(3) - 0.1, "cheer"], [L_(n) - 0.1, "cheer"]]
    V.cfg.update(acts=acts, walkEnd=0.01, px=0.75)
    V.title(0, "O MAIS <em>COMENTADO</em> FOI...")
    V.title(1, f"<em>{win}!</em>")
    V.title(2, "PRO <em>CARRINHO!</em>")
    V.title(3, "<em>VALEU!</em>")
    V.title(4, "QUAL É O <em>PRÓXIMO?</em>")
    V.item(0.1, E(0), 1180, "PARTE 2", cls="tag", anim="fade", style=f"background:{PURP};font-size:80px", cue=None)
    V.item(L_(1) - 0.05, E(1), 1180, f"🏆 VOCÊS ESCOLHERAM: {win}", cls="tag", anim="stamp",
           style=f"background:{PINK if WIN == 'gta' else ZGREEN};font-size:52px", cue="boom")
    V.item(at(2, "carrinho") - 0.05, E(2), 1180, "🛒 VAI PRO CARRINHO!", cls="tag", anim="stamp", style=f"background:{GOLD};font-size:60px", cue="stamp")
    V.item(at(4, "Comenta") - 0.05, E(4), 1160, "💬 QUAL É O PRÓXIMO?", cls="cta", anim="pop", cue="pop")
    V.cue("riser", L_(1) - 1.2, 1.1)
    vote_s, vote_e = 0, E(1)
    win_t = L_(1) - 0.05

# ---- vote board: GTA 6 x ZELDA (part 1: open vote; part 2: the winner's bar fills)
V.raw('<style>.cap{top:1440px !important}'
      '.vote{position:absolute;left:70px;right:70px;top:360px;z-index:8;display:flex;flex-direction:column;gap:14px;font-family:Inter,sans-serif}'
      '.vh{align-self:center;background:#12002b;color:#ffd84d;font-weight:900;font-size:36px;letter-spacing:6px;padding:8px 22px;border-radius:12px}'
      '.vr{display:flex;align-items:center;gap:16px;background:rgba(18,0,43,.82);border:5px solid #12002b;border-radius:18px;padding:12px 16px}'
      '.vn{width:190px;font-weight:900;font-size:46px;color:#fff}'
      '.vb{flex:1;height:46px;background:rgba(255,255,255,.15);border-radius:12px;overflow:hidden}'
      '.vf{height:100%;width:50%;border-radius:12px}'
      '.vq{width:110px;text-align:right;font-weight:900;font-size:44px;color:#fff}'
      '</style>')
V.raw(f'<div id="vote" class="clip vote" data-start="{vote_s:.2f}" data-duration="{vote_e - vote_s:.2f}" data-track-index="6">'
      f'<div class="vh">{"VOTAÇÃO ABERTA" if PART == 1 else "RESULTADO"}</div>'
      f'<div class="vr"><div class="vn">GTA 6</div><div class="vb"><div id="vfg" class="vf" style="background:{PINK}"></div></div><div id="vqg" class="vq">?</div></div>'
      f'<div class="vr"><div class="vn">ZELDA</div><div class="vb"><div id="vfz" class="vf" style="background:{ZGREEN}"></div></div><div id="vqz" class="vq">?</div></div>'
      '</div>')
V.js.append(f'tl.fromTo("#vote",{{y:-60,opacity:0}},{{y:0,opacity:1,duration:0.3,ease:"back.out(2)"}},{vote_s + 0.05:.2f});')
if PART == 1:
    for k in range(int((vote_e - vote_s) / 0.6)):  # both bars keep racing: the vote is open
        t = vote_s + 0.3 + k * 0.6
        g = 40 + (k * 37) % 25
        V.js.append(f'tl.to("#vfg",{{width:"{g}%",duration:0.5,ease:"sine.inOut"}},{t:.2f});tl.to("#vfz",{{width:"{100 - g}%",duration:0.5,ease:"sine.inOut"}},{t:.2f});')
    V.cue("ticks", vote_s + 0.3, 1.2)
else:
    for k in range(int((win_t - 0.3) / 0.35)):  # drumroll: bars swing back and forth
        g = 35 + (k % 2) * 30
        V.js.append(f'tl.to("#vfg",{{width:"{g}%",duration:0.3}},{0.3 + k * 0.35:.2f});tl.to("#vfz",{{width:"{100 - g}%",duration:0.3}},{0.3 + k * 0.35:.2f});')
    wg = 100 if WIN == "gta" else 0
    V.js.append(f'tl.to("#vfg",{{width:"{wg}%",duration:0.4,ease:"power3.out"}},{win_t:.2f});tl.to("#vfz",{{width:"{100 - wg}%",duration:0.4,ease:"power3.out"}},{win_t:.2f});')
    V.js.append(f'tl.set("#vq{"g" if WIN == "gta" else "z"}",{{textContent:"🏆"}},{win_t:.2f});tl.set("#vq{"z" if WIN == "gta" else "g"}",{{textContent:""}},{win_t:.2f});')
V.cue("boom", 0)
for i in range(1, n):
    V.cue("whoosh", L_(i) - 0.2)
V.write(f"GTA 6 OU ZELDA? · PARTE {PART}/2")
