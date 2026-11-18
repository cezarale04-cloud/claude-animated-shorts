"""Parte 3: recordes e curiosidades."""
import sys; sys.path.insert(0, "common")
from engine import Video

LINES = [
    "O GTA 6 quebrou recordes antes mesmo de sair.",
    "O primeiro trailer teve noventa milhões de visualizações no YouTube em vinte e quatro horas. Recorde mundial.",
    "O segundo? Quatrocentos e setenta e cinco milhões em um dia, somando todas as plataformas.",
    "Foram treze anos de espera: a maior distância entre dois GTAs principais da história.",
    "Enquanto isso, o GTA 5 vendeu mais de duzentos milhões de cópias e saiu em três gerações de console.",
    "E uma curiosidade: o Vice City original, de 2002, se passava em 1986. O novo se passa nos dias de hoje.",
    "Agora me conta: qual dessas você não sabia? E segue pra mais curiosidades de games.",
]
GAPS = [0, 0.4, 0.35, 0.4, 0.35, 0.4, 0.45]
V = Video("p3", LINES, GAPS)
E = V.scene_end

V.title(0, "QUEBROU <em>RECORDES</em>")
V.item(0, E(0), 470, '<div class="cup"></div><div class="stem"></div><div class="base"></div>', cls="trophy", anim="fade", cue=None)
V.item(0, E(0), 820, "ANTES DE SAIR", cls="tag", anim="fade", cue=None)
V.cue("boom", 0)
V.shot("crane", 0, V.L(1) - 0.1)

V.title(1, "TRAILER <em>1</em>")
V.counter(V.at(1, "noventa") - 0.1, E(1), 480, 90, dur=1.2, suffix=" MI")
V.item(V.at(1, "noventa") + 0.4, E(1), 700, "views no YouTube em 24h", cls="chip")
V.item(V.at(1, "Recorde") - 0.05, E(1), 830, "RECORDE MUNDIAL", cls="tag", anim="stamp", style="background:#ffb300;color:#12002b;border-color:#12002b", cue="stamp")
V.shot("road", V.L(1) - 0.1, E(1))

V.title(2, "TRAILER <em>2</em>")
V.counter(V.at(2, "Quatrocentos") - 0.1, E(2), 480, 475, dur=1.6, suffix=" MI")
V.item(V.at(2, "Quatrocentos") + 0.4, E(2), 700, "em 24h, todas as plataformas", cls="chip")
V.item(V.at(2, "Quatrocentos") + 0.4, E(2), 810, "dado divulgado pela Rockstar", cls="note", anim="fade", cue=None)
V.cfg["flash"] = [V.L(2), E(2)]
V.shot("city", V.L(2) - 0.1, E(2))

V.title(3, "<em>13</em> ANOS")
t = V.at(3, "treze")
V.raw(f'<div id="bar3" class="clip it" style="top:520px" data-start="{t - 0.05:.2f}" data-duration="{E(3) - t + 0.05:.2f}" data-track-index="4"><div id="bar3i" class="bars"><div class="track"><div id="fill3" class="fill"></div></div><div class="ticks"><span>GTA 4<br>2008</span><span>GTA 5<br>2013</span><span>GTA 6<br>2026</span></div></div></div>',
      f'tl.fromTo("#bar3i",{{y:30,opacity:0}},{{y:0,opacity:1,duration:0.2}},{t - 0.05:.2f}); tl.fromTo("#fill3",{{scaleX:0}},{{scaleX:1,duration:2.0,ease:"power2.inOut"}},{t + 0.2:.2f});')
V.cue("ticks", t + 0.2, 2.0)
V.item(V.at(3, "maior") - 0.05, E(3), 760, "MAIOR ESPERA DA SÉRIE", cls="tag", anim="stamp", style="font-size:54px", cue="stamp")
V.shot("side", V.L(3) - 0.1, E(3))

V.title(4, "O GTA 5 <em>VENDEU</em>")
V.counter(V.at(4, "duzentos") - 0.1, E(4), 480, 200, dur=1.0, suffix=" MI<small>+</small>")
V.item(V.at(4, "duzentos") + 0.4, E(4), 700, "de cópias", cls="chip")
V.item(V.at(4, "três") - 0.05, E(4), 830, "PS3 · PS4 · PS5", cls="tag", anim="pop", style="background:#7b2ff7", cue="stamp")
V.cfg["rise"] = [V.L(4) - 0.1, E(4)]
V.shot("city", V.L(4) - 0.1, E(4))

V.title(5, "<em>CURIOSIDADE</em>")
V.item(V.at(5, "1986") - 0.05, V.at(5, "novo") - 0.1, 480, "1986", cls="big", anim="stamp", cue="stamp")
V.item(V.at(5, "novo") - 0.05, E(5), 480, "HOJE", cls="big", anim="stamp", cue="stamp")
V.item(V.at(5, "1986") + 0.3, E(5), 720, "Vice City (2002) → GTA 6", cls="chip")
V.shot("aerial", V.L(5) - 0.1, E(5))

V.title(6, "QUAL VOCÊ <em>NÃO SABIA?</em>")
V.item(V.at(6, "qual") - 0.05, E(6), 560, 'COMENTA <span class="arrow"></span>', cls="cta")
V.item(V.at(6, "segue") - 0.05, E(6), 740, "SEGUE PRA MAIS", cls="tag", anim="pop", style="background:#7b2ff7", cue="pop")
V.shot("rushBack", V.L(6) - 0.1, V.total)

V.write("GTA 6 · PARTE 3/3")
