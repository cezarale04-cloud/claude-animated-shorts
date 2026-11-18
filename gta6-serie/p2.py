"""Parte 2: o mundo vivo do GTA 6."""
import sys; sys.path.insert(0, "common")
from engine import Video

LINES = [
    "O mapa do GTA 6 não é só maior. Ele está vivo.",
    "São mais de cento e setenta espécies de animais. Jacarés, flamingos, peixes-boi... e até macacos.",
    "E sim: vai ter furacão. Tempestades tropicais podem atingir Leonida, com chuva, vento e raios.",
    "O estado tem seis regiões: de Vice City até os pântanos de Grassrivers, inspirados nos Everglades.",
    "E a Rockstar diz que esse é o GTA com mais lugares pra entrar de toda a série.",
    "O primeiro trailer já mostrou vídeos virais dos moradores de Leonida, igual nas redes sociais de verdade.",
    "Na parte três: os recordes absurdos do GTA 6. Segue aí.",
]
GAPS = [0, 0.4, 0.4, 0.4, 0.35, 0.35, 0.45]
V = Video("p2", LINES, GAPS)
E = V.scene_end
V.cfg["animals"] = True

V.title(0, "O MAPA ESTÁ")
V.item(0, E(0), 470, "VIVO", cls="hero", anim="fade", cue=None)
V.cue("boom", 0)
V.shot("beach", 0, V.L(1) - 0.1)

V.title(1, "MAIS DE")
V.counter(V.L(1), V.at(1, "Jacarés") - 0.1, 470, 170, dur=1.2, suffix="<small>+</small>")
V.item(V.L(1) + 0.4, V.at(1, "Jacarés") - 0.1, 690, "espécies de animais", cls="chip")
y = 470
for w, label, col in [("Jacarés", "JACARÉ", "#3e8e3a"), ("flamingos", "FLAMINGO", "#ff2e88"), ("peixes-boi", "PEIXE-BOI", "#00b8c4"), ("macacos", "MACACO", "#c77d2b")]:
    try:
        t = V.at(1, w)
    except IndexError:
        t = V.at(1, w.split("-")[0])
    V.item(t - 0.05, E(1), y, label, cls="tag", anim="left" if y % 2 == 0 else "right", style=f"background:{col};font-size:58px", cue="whoosh")
    y += 125
V.shot("beach", V.L(1) - 0.1, V.at(1, "macacos") - 0.6)
V.shot("gator", V.at(1, "macacos") - 0.6, E(1))

V.title(2, "VAI TER <em>FURACÃO</em>")
V.item(V.at(2, "chuva") - 0.05, E(2), 520, "CHUVA · VENTO · RAIOS", cls="chip", style="font-size:50px")
V.cfg["storm"] = [[V.L(2) - 0.1, E(2)]]
V.cfg["lightning"] = [V.at(2, "furacão") + 0.1, V.at(2, "raios")]
for lt in V.cfg["lightning"]:
    V.cue("thunder", lt)
V.cue("rain", V.L(2) - 0.1, E(2) - V.L(2) + 0.1)
V.shot("storm", V.L(2) - 0.1, E(2))

V.title(3, "<em>6</em> REGIÕES")
regs = ["VICE CITY", "LEONIDA KEYS", "GRASSRIVERS", "PORT GELLHORN", "AMBROSIA", "MOUNT KALAGA"]
t0 = V.at(3, "seis")
cells = "".join(f'<div id="rg{k}" class="tagsm" style="text-align:center;background:{c}">{r}</div>' for k, (r, c) in enumerate(zip(regs, ["#ff2e88", "#00b8c4", "#3e8e3a", "#7b2ff7", "#c77d2b", "#2b6cb0"])))
iid = V.item(t0 - 0.05, E(3), 470, cells, cls="grid2", anim="fade", cue=None)
V.js.append("".join(f'tl.fromTo("#rg{k}",{{scale:0.3,opacity:0}},{{scale:1,opacity:1,duration:0.18,ease:"back.out(2.5)"}},{t0 + k * 0.22:.2f});' for k in range(6)))
for k in range(6):
    V.cue("pop", t0 + k * 0.22)
V.item(V.at(3, "Everglades") - 0.05, E(3), 900, "Grassrivers = Everglades", cls="chip")
V.shot("top", V.L(3) - 0.1, E(3))

V.title(4, "MAIS <em>INTERIORES</em>")
V.item(V.at(4, "mais") - 0.05, E(4), 520, "o GTA com mais lugares<br>pra entrar da série", cls="chip")
V.item(V.L(4) + 0.3, E(4), 760, "segundo a Rockstar", cls="note", anim="fade", cue=None)
V.cfg["rise"] = [V.L(4) - 0.1, E(4)]
V.shot("city", V.L(4) - 0.1, E(4))

V.title(5, "VÍDEOS <em>VIRAIS</em>")
V.item(V.L(5), E(5), 470, '<div class="scr"></div><div class="play"></div><div class="rail"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div><div class="user">@morador_de_leonida</div><div class="views"><span id="vv">0</span> mi views</div>', cls="phone", anim="pop", cue="pop")
V.js.append(f'var ovv={{v:0}}; tl.fromTo(ovv,{{v:0}},{{v:12.4,duration:{E(5) - V.L(5) - 0.4:.2f},ease:"power2.in",onUpdate:function(){{document.getElementById("vv").textContent=ovv.v.toFixed(1).replace(".",",");}}}},{V.L(5) + 0.2:.2f});')
V.shot("orbit", V.L(5) - 0.1, E(5))

V.title(6, "PARTE 3: <em>OS RECORDES</em>")
V.item(V.at(6, "Segue") - 0.05, E(6), 620, 'SEGUE AÍ <span class="arrowr"></span>', cls="cta")
V.shot("sea", V.L(6) - 0.1, V.total)

V.write("GTA 6 · PARTE 2/3")
