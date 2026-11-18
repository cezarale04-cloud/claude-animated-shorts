"""Parte 4: o lançamento (voz Brian)."""
import sys; sys.path.insert(0, "common")
from engine import Video

LINES = [
    "Tudo que você precisa saber antes de jogar GTA 6.",
    "Ele libera à meia-noite do dia dezenove, no horário de cada país. Por isso a Nova Zelândia joga primeiro.",
    "O jogo ocupa até duzentos e doze gigas, segundo a Rockstar. Por isso o download antecipado começou no dia dez.",
    "Lá fora, a edição padrão custa setenta e nove dólares. A Ultimate, noventa e nove.",
    "E ele foi adiado duas vezes: era pra 2025, depois pra maio de 2026, e só agora chegou a hora.",
    "E o modo online? Não vem no lançamento, e a Rockstar ainda não deu data.",
    "Já baixou o seu? Comenta. E segue pra parte cinco: quem são Jason e Lucia.",
]
GAPS = [0, 0.4, 0.4, 0.35, 0.4, 0.4, 0.45]
V = Video("p4", LINES, GAPS, voice_name="en-US-BrianMultilingualNeural", rate="+8%", hi="#FFD84D")
E = V.scene_end

V.title(0, "ANTES DE <em>JOGAR</em>")
V.item(0, E(0), 470, "GTA 6", cls="hero", anim="fade", cue=None)
V.item(0, E(0), 760, "GUIA DO LANÇAMENTO", cls="tag", anim="fade", cue=None)
V.cue("boom", 0)
V.shot("rush", 0, V.L(1) - 0.1)

V.title(1, "QUE <em>HORAS</em> LIBERA?")
V.item(V.at(1, "meia-noite") - 0.05, E(1), 470, "00:00", cls="big", anim="stamp", cue="stamp")
V.item(V.at(1, "dezenove") - 0.05, E(1), 700, "19 de novembro · horário local", cls="chip")
V.item(V.at(1, "Nova") - 0.05, E(1), 830, "NOVA ZELÂNDIA JOGA PRIMEIRO", cls="tag", anim="pop", style="font-size:48px", cue="stamp")
V.shot("road", V.L(1) - 0.1, E(1))

V.title(2, "<em>TAMANHO</em> DO JOGO")
V.counter(V.at(2, "duzentos") - 0.1, E(2), 470, 212, dur=1.2, suffix=" GB")
V.item(V.at(2, "duzentos") + 0.4, E(2), 690, "de espaço livre, segundo a Rockstar", cls="chip", style="font-size:40px")
V.item(V.at(2, "antecipado") - 0.05, E(2), 810, "DOWNLOAD ANTECIPADO: 10/11", cls="tag", anim="pop", style="font-size:50px;background:#7b2ff7", cue="stamp")
V.cfg["rise"] = [V.L(2) - 0.1, E(2)]
V.shot("city", V.L(2) - 0.1, E(2))

V.title(3, "<em>PREÇO</em> LÁ FORA")
V.item(V.at(3, "padrão") - 0.05, E(3), 480, "PADRÃO · US$ 79,99", cls="tag", anim="left", style="background:#00b8c4", cue="whoosh")
V.item(V.at(3, "Ultimate") - 0.05, E(3), 620, "ULTIMATE · US$ 99,99", cls="tag", anim="right", style="background:#ff2e88", cue="whoosh")
V.item(V.at(3, "padrão") + 0.3, E(3), 770, "preço no Brasil varia por loja", cls="note", anim="fade", cue=None)
V.shot("aerial", V.L(3) - 0.1, E(3))

V.title(4, "ADIADO <em>2 VEZES</em>")
t = V.at(4, "2025")
V.item(t - 0.05, E(4), 470, '<span class="strike">2025</span>', cls="big", anim="stamp", style="font-size:120px", cue="stamp")
V.item(V.at(4, "maio") - 0.05, E(4), 640, '<span class="strike">MAIO 2026</span>', cls="big", anim="stamp", style="font-size:110px", cue="stamp")
V.item(V.at(4, "hora") - 0.15, E(4), 810, "19 NOV 2026", cls="tag", anim="stamp", style="background:#2fb344;font-size:70px", cue="stamp")
V.shot("crane", V.L(4) - 0.1, E(4))

V.title(5, "E O <em>ONLINE?</em>")
V.item(V.at(5, "Não") - 0.05, E(5), 480, "NÃO VEM NO LANÇAMENTO", cls="chip red", anim="stamp", style="font-size:50px", cue="stamp")
V.item(V.at(5, "data") - 0.05, E(5), 620, "ainda sem data", cls="chip")
V.shot("sea", V.L(5) - 0.1, E(5))

V.title(6, "JÁ BAIXOU <em>O SEU?</em>")
V.item(V.at(6, "Comenta") - 0.05, E(6), 520, 'COMENTA <span class="arrow"></span>', cls="cta")
V.item(V.at(6, "segue") - 0.05, E(6), 700, "PARTE 5: JASON E LUCIA", cls="tag", anim="pop", style="background:#7b2ff7;font-size:54px", cue="pop")
V.shot("rushBack", V.L(6) - 0.1, V.total)

V.write("GTA 6 · PARTE 4")
