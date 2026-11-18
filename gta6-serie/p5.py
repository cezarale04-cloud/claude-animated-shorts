"""Parte 5: quem são Jason e Lucia (voz Francisca)."""
import sys; sys.path.insert(0, "common")
from engine import Video

LINES = [
    "Você sabe mesmo quem são Jason e Lucia? Isso aqui é o que a própria Rockstar contou.",
    "O Jason cresceu cercado de golpistas e bandidos. Tentou mudar de vida no Exército.",
    "Mas acabou nas ilhas de Leonida Keys, fazendo o que sabe de melhor: trabalhando pra traficantes da região.",
    "Já a Lucia aprendeu a lutar com o pai, assim que começou a andar.",
    "Foi lutando pela família que ela foi parar na penitenciária de Leonida. E só saiu por pura sorte.",
    "Agora ela prometeu pra si mesma: daqui pra frente, só jogadas inteligentes.",
    "E no jogo dá pra trocar entre os dois. Mas algumas missões exigem um ou outro.",
    "E aí, time Jason ou time Lucia? Comenta. Na parte seis: os outros personagens.",
]
GAPS = [0, 0.4, 0.3, 0.45, 0.3, 0.35, 0.4, 0.45]
V = Video("p5", LINES, GAPS, voice_name="pt-BR-FranciscaNeural", rate="+10%", hi="#FF7EB6")
E = V.scene_end

V.title(0, "QUEM SÃO <em>ELES?</em>")
V.item(0, E(0), 480, '<div class="card">JASON</div><div class="x">&amp;</div><div class="card b">LUCIA</div>', cls="vs", anim="fade", cue=None)
V.item(V.at(0, "Rockstar") - 0.05, E(0), 700, "segundo a Rockstar", cls="note", anim="fade", cue=None)
V.cue("boom", 0)
V.shot("rush", 0, V.L(1) - 0.1)

V.title(1, "<em>JASON</em> DUVAL")
V.item(V.at(1, "golpistas") - 0.05, E(1), 480, "CRESCEU ENTRE BANDIDOS", cls="tag", anim="left", style="background:#00b8c4;font-size:52px", cue="whoosh")
V.item(V.at(1, "Exército") - 0.05, E(1), 620, "EX-EXÉRCITO", cls="tag", anim="right", style="background:#3e6b2c", cue="whoosh")
V.shot("side", V.L(1) - 0.1, E(1))

V.title(2, "<em>JASON</em> HOJE")
V.item(V.at(2, "Keys") - 0.05, E(2), 480, "LEONIDA KEYS", cls="tag", anim="pop", style="background:#00b8c4", cue="stamp")
V.item(V.at(2, "traficantes") - 0.05, E(2), 630, "trabalha pra traficantes locais", cls="chip")
V.shot("sea", V.L(2) - 0.1, E(2))

V.title(3, "<em>LUCIA</em> CAMINOS")
V.item(V.at(3, "lutar") - 0.05, E(3), 480, "LUTADORA DESDE CRIANÇA", cls="tag", anim="stamp", style="background:#ff2e88;font-size:54px", cue="stamp")
V.shot("city", V.L(3) - 0.1, E(3))

V.title(4, "<em>LUCIA</em> NA PRISÃO")
V.item(V.at(4, "penitenciária") - 0.05, E(4), 480, "PENITENCIÁRIA DE LEONIDA", cls="tag", anim="stamp", style="background:#e63946;background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.45) 0 14px,transparent 14px 54px);font-size:50px", cue="stamp")
V.item(V.at(4, "sorte") - 0.05, E(4), 630, "saiu por pura sorte", cls="chip")
V.shot("road", V.L(4) - 0.1, E(4))

V.title(5, "A <em>PROMESSA</em>")
V.item(V.at(5, "inteligentes") - 0.4, E(5), 480, "“SÓ JOGADAS<br>INTELIGENTES”", cls="tag", anim="pop", style="background:#7b2ff7;text-align:center", cue="stamp")
V.shot("crane", V.L(5) - 0.1, E(5))

V.title(6, "DÁ PRA <em>TROCAR</em>")
V.item(V.at(6, "trocar") - 0.05, E(6), 480, '<div class="card">JASON</div><div class="x">⇄</div><div class="card b">LUCIA</div>', cls="vs", anim="pop", cue="whoosh")
V.item(V.at(6, "missões") - 0.05, E(6), 700, "algumas missões exigem um deles", cls="chip", style="font-size:40px")
V.shot("aerial", V.L(6) - 0.1, E(6))

V.title(7, "TIME <em>JASON</em> OU <em>LUCIA?</em>")
V.item(V.at(7, "Comenta") - 0.05, E(7), 520, 'COMENTA <span class="arrow"></span>', cls="cta")
V.item(V.at(7, "parte") - 0.05, E(7), 700, "PARTE 6: OS PERSONAGENS", cls="tag", anim="pop", style="background:#7b2ff7;font-size:52px", cue="pop")
V.shot("rushBack", V.L(7) - 0.1, V.total)

V.write("GTA 6 · PARTE 5")
