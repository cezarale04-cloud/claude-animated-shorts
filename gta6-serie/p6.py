"""Parte 6: os personagens secundários (voz Remy)."""
import sys; sys.path.insert(0, "common")
from engine import Video

LINES = [
    "Jason e Lucia não estão sozinhos. Conheça a galera do GTA 6.",
    "Cal Hampton: amigo do Jason. Ama teoria da conspiração e passa o dia em casa, com cerveja e internet.",
    "Brian Heder: veterano do tráfico nas ilhas. É ele quem deixa o Jason morar numa das casas dele.",
    "Boobie Ike: uma lenda de Vice City, dono de clube, imóveis e de um estúdio de música.",
    "Dre'Quan Priest: um empresário que quer estourar no mundo da música.",
    "Real Dimez: a dupla de rap mais quente de Leonida.",
    "E Raul Bautista: um assaltante de bancos experiente, sempre atrás de novos talentos.",
    "Qual deles você quer conhecer primeiro? Comenta. Na parte sete: os lugares de Leonida.",
]
GAPS = [0, 0.45, 0.4, 0.4, 0.4, 0.4, 0.4, 0.45]
V = Video("p6", LINES, GAPS, voice_name="en-AU-WilliamMultilingualNeural", rate="+6%", hi="#7CFF6B")
E = V.scene_end

V.title(0, "A <em>GALERA</em> DO GTA 6")
V.item(0, E(0), 460, "6<br><em>PERSONAGENS</em>", cls="hero", anim="fade", style="font-size:120px", cue=None)
V.cue("boom", 0)
V.shot("rush", 0, V.L(1) - 0.1)

CARDS = [
    (1, "CAL HAMPTON", "amigo do Jason · teorias da conspiração", "#00b8c4", "side"),
    (2, "BRIAN HEDER", "veterano do tráfico · casa do Jason", "#3e6b2c", "sea"),
    (3, "BOOBIE IKE", "lenda de Vice City · clube, imóveis, estúdio", "#ff2e88", "city"),
    (4, "DRE'QUAN PRIEST", "empresário da música", "#7b2ff7", "orbit"),
    (5, "REAL DIMEZ", "dupla de rap de Leonida", "#c77d2b", "crane"),
    (6, "RAUL BAUTISTA", "assaltante de bancos experiente", "#e63946", "road"),
]
for i, name, desc, col, shot in CARDS:
    V.title(i, f"<em>{i}.</em> {name}")
    V.item(V.L(i) + 0.15, E(i), 480, name.split()[0][0] + name.split()[-1][0], cls="big", anim="stamp", style=f"color:{col};font-size:230px", cue="stamp")
    V.item(V.L(i) + 0.5, E(i), 760, desc, cls="chip", style="font-size:38px;max-width:900px")
    V.shot(shot, V.L(i) - 0.1, E(i))
V.cfg["flash"] = [V.L(5), E(5)]

V.title(7, "QUAL VOCÊ <em>QUER VER?</em>")
V.item(V.at(7, "Comenta") - 0.05, E(7), 520, 'COMENTA <span class="arrow"></span>', cls="cta")
V.item(V.at(7, "parte") - 0.05, E(7), 700, "PARTE 7: OS LUGARES", cls="tag", anim="pop", style="background:#7b2ff7;font-size:54px", cue="pop")
V.shot("rushBack", V.L(7) - 0.1, V.total)

V.write("GTA 6 · PARTE 6")
