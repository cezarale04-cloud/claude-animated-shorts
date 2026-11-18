"""Parte 7: tour por Leonida (voz Thalita)."""
import sys; sys.path.insert(0, "common")
from engine import Video

LINES = [
    "Bora fazer um tour por Leonida, o estado do GTA 6?",
    "Vice City: a metrópole de sol, praia e vida noturna.",
    "Leonida Keys: um paraíso de ilhas, inspirado nas Florida Keys.",
    "Grassrivers: os pântanos selvagens, cheios de jacarés.",
    "Port Gellhorn: uma cidade do litoral que já viveu dias melhores.",
    "Ambrosia: uma região do interior, com uma enorme refinaria de açúcar.",
    "E Mount Kalaga: um parque nacional de natureza selvagem, trilhas e aventura.",
    "Pra qual desses você vai primeiro? Comenta. Na parte oito: os bastidores do GTA 6.",
]
GAPS = [0, 0.45, 0.4, 0.4, 0.4, 0.4, 0.4, 0.45]
V = Video("p7", LINES, GAPS, voice_name="pt-BR-ThalitaMultilingualNeural", rate="+8%", hi="#3DF5FF")
E = V.scene_end
V.cfg["animals"] = True

V.title(0, "TOUR POR <em>LEONIDA</em>")
V.item(0, E(0), 480, "6 LUGARES", cls="hero", anim="fade", style="font-size:170px", cue=None)
V.cue("boom", 0)
V.shot("top", 0, V.L(1) - 0.1)

STOPS = [
    (1, "VICE CITY", "sol · praia · vida noturna", "#ff2e88", "crane"),
    (2, "LEONIDA KEYS", "ilhas inspiradas nas Florida Keys", "#00b8c4", "sea"),
    (3, "GRASSRIVERS", "pântanos cheios de jacarés", "#3e8e3a", "gator"),
    (4, "PORT GELLHORN", "litoral que já viveu dias melhores", "#c77d2b", "beach"),
    (5, "AMBROSIA", "interior · refinaria de açúcar", "#7b2ff7", "aerial"),
    (6, "MOUNT KALAGA", "parque nacional · trilhas · aventura", "#2b6cb0", "orbit"),
]
for i, name, desc, col, shot in STOPS:
    V.title(i, f"PARADA <em>{i}</em>")
    V.item(V.L(i) - 0.05, E(i), 480, name, cls="tag", anim="left" if i % 2 else "right", style=f"background:{col};font-size:72px", cue="whoosh")
    V.item(V.L(i) + 0.5, E(i), 640, desc, cls="chip", style="font-size:40px")
    V.shot(shot, V.L(i) - 0.1, E(i))
V.cfg["flash"] = [V.L(1), E(1)]

V.title(7, "PRA ONDE VOCÊ <em>VAI?</em>")
V.item(V.at(7, "Comenta") - 0.05, E(7), 520, 'COMENTA <span class="arrow"></span>', cls="cta")
V.item(V.at(7, "parte") - 0.05, E(7), 700, "PARTE 8: BASTIDORES", cls="tag", anim="pop", style="background:#7b2ff7;font-size:54px", cue="pop")
V.shot("rushBack", V.L(7) - 0.1, V.total)

V.write("GTA 6 · PARTE 7")
