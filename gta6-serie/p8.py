"""Parte 8: bastidores e curiosidades (voz Ava)."""
import sys; sys.path.insert(0, "common")
from engine import Video

LINES = [
    "Coisas do GTA 6 que quase ninguém sabe.",
    "O trailer dois foi gravado inteirinho dentro do jogo, num PS5. Metade gameplay, metade cenas da história.",
    "A música do primeiro trailer é Love Is a Long Road, do Tom Petty. A do segundo é Hot Together, das Pointer Sisters.",
    "O primeiro trailer saiu antes da hora marcada, porque tinha vazado na internet.",
    "Em 2022, um hacker vazou vídeos de uma versão bem antiga do jogo. Foi um dos maiores vazamentos da história dos games.",
    "E o anúncio oficial do GTA 6 só veio em fevereiro de 2022, mais de oito anos depois do GTA 5.",
    "Qual dessas você não sabia? Comenta. E segue pra não perder nada do GTA 6.",
]
GAPS = [0, 0.45, 0.4, 0.4, 0.4, 0.4, 0.45]
V = Video("p8", LINES, GAPS, voice_name="en-US-AvaMultilingualNeural", rate="+6%", hi="#FFB86B")
E = V.scene_end

V.title(0, "<em>BASTIDORES</em> DO GTA 6")
V.item(0, E(0), 480, "?!", cls="hero", anim="fade", style="font-size:300px", cue=None)
V.cue("boom", 0)
V.shot("crane", 0, V.L(1) - 0.1)

V.title(1, "TRAILER 2: <em>NO PS5</em>")
V.item(V.at(1, "PS5") - 0.05, E(1), 480, "100% DENTRO DO JOGO", cls="tag", anim="stamp", style="background:#2b6cb0;font-size:54px", cue="stamp")
V.item(V.at(1, "Metade") - 0.05, E(1), 640, "50% gameplay · 50% cenas", cls="chip")
V.shot("road", V.L(1) - 0.1, E(1))

V.title(2, "AS <em>MÚSICAS</em>")
V.item(V.at(2, "Love") - 0.05, E(2), 470, "TRAILER 1 · Love Is a Long Road<br><small>Tom Petty</small>", cls="chip", style="font-size:40px")
V.item(V.at(2, "Hot") - 0.05, E(2), 640, "TRAILER 2 · Hot Together<br><small>The Pointer Sisters</small>", cls="chip", style="font-size:40px;border-color:#ff2e88")
V.cfg["flash"] = [V.L(2), E(2)]
V.shot("city", V.L(2) - 0.1, E(2))

V.title(3, "SAIU <em>ANTES</em> DA HORA")
V.item(V.at(3, "vazado") - 0.05, E(3), 480, "VAZOU!", cls="big", anim="stamp", style="color:#ff4d4d", cue="stamp")
V.item(V.at(3, "antes") - 0.05, E(3), 700, "trailer 1 lançado mais cedo", cls="chip")
V.shot("side", V.L(3) - 0.1, E(3))

V.title(4, "O GRANDE <em>VAZAMENTO</em>")
V.item(V.at(4, "2022") - 0.05, E(4), 480, "2022", cls="big", anim="stamp", cue="stamp")
V.item(V.at(4, "antiga") - 0.05, E(4), 700, "vídeos de uma versão bem antiga", cls="chip", style="font-size:40px")
V.cfg["storm"] = [[V.L(4) - 0.1, E(4)]]
V.cfg["lightning"] = [V.at(4, "hacker"), V.at(4, "vazamentos")]
for lt in V.cfg["lightning"]:
    V.cue("thunder", lt)
V.cue("rain", V.L(4) - 0.1, E(4) - V.L(4) + 0.1)
V.shot("storm", V.L(4) - 0.1, E(4))

V.title(5, "O <em>ANÚNCIO</em>")
V.item(V.at(5, "fevereiro") - 0.05, E(5), 480, "FEV 2022", cls="big", anim="stamp", style="font-size:150px", cue="stamp")
V.item(V.at(5, "oito") - 0.05, E(5), 680, "+8 ANOS DEPOIS DO GTA 5", cls="tag", anim="pop", style="background:#7b2ff7;font-size:50px", cue="stamp")
V.shot("aerial", V.L(5) - 0.1, E(5))

V.title(6, "QUAL VOCÊ <em>NÃO SABIA?</em>")
V.item(V.at(6, "Comenta") - 0.05, E(6), 520, 'COMENTA <span class="arrow"></span>', cls="cta")
V.item(V.at(6, "segue") - 0.05, E(6), 700, "SEGUE PRA MAIS GTA 6", cls="tag", anim="pop", style="background:#7b2ff7;font-size:54px", cue="pop")
V.shot("rushBack", V.L(6) - 0.1, V.total)

V.write("GTA 6 · PARTE 8")
