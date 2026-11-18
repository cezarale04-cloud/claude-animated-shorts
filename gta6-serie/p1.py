"""Parte 1: o que mudou do GTA 5 pro GTA 6."""
import sys; sys.path.insert(0, "common")
from engine import Video

LINES = [
    "Tudo que mudou do GTA 5 pro GTA 6, em menos de um minuto.",
    "Um: os protagonistas. O GTA 5 tinha três. O 6 tem dois: Lucia e Jason, um casal de criminosos.",
    "A Lucia é a primeira protagonista mulher da era moderna da série. E o primeiro trailer mostra ela... na prisão.",
    "Dois: o mapa. Sai Los Santos, inspirada na Califórnia. Entra Leonida, inspirada na Flórida.",
    "E segundo a Rockstar, o mapa tem mais ou menos o dobro do tamanho do GTA 5.",
    "Três: Vice City está de volta, mais de vinte anos depois do Vice City original, de 2002.",
    "Quatro: o GTA 5 saiu lá no PS3. O 6 sai só no PS5 e no Xbox Series. E no PC? Ainda sem data.",
    "Na parte dois: o mundo vivo do GTA 6. Segue pra não perder.",
]
GAPS = [0, 0.4, 0.3, 0.4, 0.3, 0.4, 0.4, 0.45]
V = Video("p1", LINES, GAPS)
E = V.scene_end

# 0 hook
V.title(0, "O QUE <em>MUDOU?</em>")
V.item(0, E(0), 520, '<div class="card">GTA 5</div><div class="x">VS</div><div class="card b">GTA 6</div>', cls="vs", anim="fade", cue=None)
V.cue("boom", 0)
V.shot("rush", 0, V.L(1) - 0.1)

# 1 protagonists
V.title(1, "1. <em>PROTAGONISTAS</em>")
V.item(V.at(1, "três") - 0.05, V.at(1, "dois") - 0.1, 500, "3", cls="big", anim="stamp", cue="stamp")
V.item(V.at(1, "dois") - 0.05, E(1), 500, "2", cls="big", anim="stamp", cue="stamp")
V.item(V.at(1, "Lucia") - 0.05, E(1), 760, "LUCIA", cls="tag", anim="left", style="background:#ff2e88", cue="whoosh")
V.item(V.at(1, "Jason") - 0.05, E(1), 900, "JASON", cls="tag", anim="right", style="background:#00b8c4", cue="whoosh")
V.shot("side", V.L(1) - 0.1, E(1))

# 2 Lucia first woman + prison
V.title(2, "A <em>LUCIA</em>")
V.item(V.L(2) + 0.2, E(2), 500, "1ª protagonista mulher<br>da era moderna da série", cls="chip")
V.item(V.at(2, "prisão") - 0.05, E(2), 700, "NA PRISÃO", cls="tag", anim="stamp", style="background:#e63946;background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.45) 0 14px,transparent 14px 54px)", cue="stamp")
V.shot("city", V.L(2) - 0.1, E(2))

# 3 map: LS -> Leonida
V.title(3, "2. <em>O MAPA</em>")
V.item(V.at(3, "Sai") - 0.05, E(3), 500, '<span class="strike">LOS SANTOS</span> · Califórnia', cls="chip")
V.item(V.at(3, "Entra") - 0.05, E(3), 620, "LEONIDA · Flórida", cls="tag", anim="pop", cue="stamp")
V.shot("aerial", V.L(3) - 0.1, E(3))

# 4 2x size
V.title(4, "QUASE O <em>DOBRO</em>")
V.item(V.L(4) + 0.3, E(4), 470, '<div class="m a">GTA 5</div><div class="m b">GTA 6</div>', cls="mapcmp", anim="pop")
V.item(V.at(4, "dobro") - 0.05, E(4), 850, "≈ 2x MAIOR", cls="tag", anim="stamp", style="background:#7b2ff7", cue="stamp")
V.item(V.L(4) + 0.3, E(4), 1000, "segundo a Rockstar", cls="note", anim="fade", cue=None)
V.shot("top", V.L(4) - 0.1, E(4))

# 5 Vice City back
V.title(5, "3. <em>VICE CITY</em> VOLTOU")
V.counter(V.at(5, "vinte") - 0.3, E(5), 520, 2026, dur=1.6, frm=2002, year=True)
V.item(V.at(5, "original") - 0.05, E(5), 760, "+20 ANOS DEPOIS", cls="tag", anim="pop", cue="pop")
V.shot("crane", V.L(5) - 0.1, E(5))
V.cfg["flash"] = [V.L(5), E(5)]

# 6 consoles
V.title(6, "4. <em>CONSOLES</em>")
V.item(V.at(6, "PS3") - 0.05, E(6), 480, "GTA 5: PS3 / XBOX 360", cls="chip")
V.item(V.at(6, "PS5") - 0.05, E(6), 600, "GTA 6: PS5 / XBOX SERIES", cls="tag", anim="pop", style="font-size:54px", cue="stamp")
V.item(V.at(6, "PC") - 0.05, E(6), 760, "PC: SEM DATA", cls="chip red", anim="stamp", cue="stamp")
V.shot("road", V.L(6) - 0.1, E(6))

# 7 CTA
V.title(7, "PARTE 2: <em>O MUNDO VIVO</em>")
V.item(V.at(7, "Segue") - 0.05, E(7), 620, 'SEGUE PRA NÃO PERDER <span class="arrowr"></span>', cls="cta", style="font-size:54px")
V.shot("rushBack", V.L(7) - 0.1, V.total)

V.write("GTA 6 · PARTE 1/3")
