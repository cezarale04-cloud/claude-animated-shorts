"""Vídeo longo (YouTube, 16:9, ~10 min): GTA 5 x GTA 6, tudo que muda."""
import sys; sys.path.insert(0, "common")
from engine_wide import Wide

NCHAP = 11


def I(word, inner, cls="chip", top=None, style="", anim="pop", cue="pop", keep=False, nth=0):
    return dict(word=word, inner=inner, cls=cls, top=top, style=style, anim=anim, cue=cue, keep=keep, nth=nth)


def T(color, txt, size=62):
    return dict(cls="tag", style=f"background:{color};font-size:{size}px", inner=txt)


def tag(word, txt, color="#ff2e88", top=None, size=62, anim="pop", cue="stamp", keep=False, nth=0):
    return I(word, txt, cls="tag", top=top, style=f"background:{color};font-size:{size}px", anim=anim, cue=cue, keep=keep, nth=nth)


PINK, CYAN, PURP, GRN, ORG, BLUE, RED, GOLD = "#ff2e88", "#00838f", "#7b2ff7", "#3e8e3a", "#c77d2b", "#2b6cb0", "#e63946", "#d4a017"
VS = '<div class="card">GTA 5</div><div class="x">VS</div><div class="card b">GTA 6</div>'

S = []  # segments


def L(text, title=None, shot=None, items=(), gap=0.45, fx=None):
    S.append(dict(text=text, title=title, shot=shot, items=list(items), gap=gap, fx=fx, card=None))


def CH(num, name, text):
    S.append(dict(text=text, title=None, shot="crane", items=[], gap=0.9, fx=None, card=(num, name)))


# ------------------------------------------------------------------ roteiro
L("Treze anos. Foi esse o tempo entre o GTA 5 e o GTA 6.", title="GTA 5 <em>VS</em> GTA 6", shot="rush", gap=0,
  items=[I(None, VS, cls="vs", top=300, anim="fade", cue=None), I("anos", "13 ANOS DE ESPERA", cls="tag", top=560, style=f"background:{PINK};font-size:70px", anim="stamp", cue="stamp")])
L("E nesse vídeo eu vou te mostrar tudo, mas tudo mesmo, que muda de um jogo pro outro.", title="TUDO QUE <em>MUDOU</em>", shot="side",
  items=[tag("tudo", "TUDO!", PURP, top=380, size=130, anim="stamp", nth=1)])
L("Os protagonistas, o mapa, o mundo vivo, os gráficos, os recordes, o preço, o tamanho do jogo e muito mais.", shot="city",
  items=[I("protagonistas", '<div class="row">' + "".join(f'<div id="pv{k}" class="tagsm" style="background:{c}">{t}</div>' for k, (t, c) in enumerate([("PROTAGONISTAS", PINK), ("MAPA", CYAN), ("MUNDO VIVO", GRN), ("GRÁFICOS", PURP), ("RECORDES", GOLD), ("PREÇO", ORG), ("TAMANHO", BLUE)])) + '</div>', cls="row", top=330, anim="fade", cue=None)],
  fx=lambda V, i: [V.js.append(f'tl.fromTo("#pv{k}",{{scale:0.2,opacity:0}},{{scale:1,opacity:1,duration:0.2,ease:"back.out(2.4)"}},{V.at(i, w) - 0.05:.2f});') or V.cue("pop", V.at(i, w) - 0.05) for k, w in enumerate(["protagonistas", "mapa", "mundo", "gráficos", "recordes", "preço", "tamanho"])])
L("Tudo com informação confirmada pela Rockstar. Nada de boato.", title="SÓ <em>FATOS</em>", shot="road",
  items=[tag("confirmada", "✔ CONFIRMADO", GRN, top=330, size=72), tag("boato", "✖ BOATO", RED, top=520, size=60, anim="stamp")])
L("Então pega o seu lanche, se ajeita aí, e bora começar.", title="BORA <em>COMEÇAR!</em>", shot="rushBack",
  items=[I("bora", 'BORA <span class="arrowr"></span>', cls="cta", top=380, cue="whoosh")])

CH(1, "A LONGA <em>ESPERA</em>", "Capítulo um: a longa espera.")
L("O GTA 5 saiu no dia dezessete de setembro de 2013, lá no PlayStation 3 e no Xbox 360.", title="GTA 5: <em>2013</em>", shot="side",
  items=[tag("dezessete", "17/09/2013", CYAN, top=320, size=96), I("PlayStation", "PS3 · XBOX 360", top=520)])
L("E ele foi um fenômeno: arrecadou um bilhão de dólares em apenas três dias. Na época, um recorde mundial.", title="UM <em>FENÔMENO</em>", shot="city",
  items=[I("recorde", "RECORDE MUNDIAL", cls="tag", top=600, style=f"background:{GOLD};font-size:56px", anim="stamp", cue="stamp")],
  fx=lambda V, i: V.counter(V.at(i, "bilhão") - 0.4, V.scene_end(i), 300, 1, dur=0.8, prefix="US$ ", suffix=" BILHÃO", cls="big") and V.item(V.at(i, "três") - 0.05, V.scene_end(i), 500, "EM 3 DIAS", cls="chip"))
L("Depois, ele foi relançado no PS4, no Xbox One, no PC, e mais tarde no PS5 e no Xbox Series. Três gerações de console com o mesmo jogo.", title="<em>3</em> GERAÇÕES", shot="road",
  items=[tag("PS4", "PS4 · XBOX ONE", BLUE, top=280, size=52, anim="left", cue="whoosh"), tag("PC", "PC", PURP, top=410, size=52, anim="right", cue="whoosh"),
         tag("PS5", "PS5 · XBOX SERIES", PINK, top=540, size=52, anim="left", cue="whoosh"), I("Três", "3 GERAÇÕES, O MESMO JOGO", top=690)])
L("Resultado: mais de duzentos milhões de cópias vendidas. Um dos jogos mais vendidos de todos os tempos.", title="<em>+200</em> MILHÕES", shot="crane",
  fx=lambda V, i: V.counter(V.at(i, "duzentos") - 0.3, V.scene_end(i), 290, 200, dur=1.2, prefix="+", suffix="<small> MI</small>") and V.item(V.at(i, "cópias") - 0.05, V.scene_end(i), 520, "cópias vendidas", cls="chip"))
L("Enquanto isso, os fãs esperavam. E esperavam. O anúncio oficial do GTA 6 só veio em fevereiro de 2022.", title="O <em>ANÚNCIO</em>", shot="aerial",
  items=[I("esperavam", "⏳ ESPERANDO...", cls="chip", top=320), tag("fevereiro", "FEV / 2022", PINK, top=480, size=90)])
L("Em setembro daquele mesmo ano, um hacker vazou vídeos de uma versão bem antiga do jogo. Foi um dos maiores vazamentos da história dos games.", title="O <em>VAZAMENTO</em>", shot="storm",
  items=[tag("vazou", "VAZOU!", RED, top=320, size=110, anim="stamp"), I("antiga", "versão antiga do jogo · set/2022", top=530), I("maiores", "UM DOS MAIORES DA HISTÓRIA", cls="chip red", top=650, anim="stamp", cue="stamp")])
L("O primeiro trailer chegou em dezembro de 2023, e até ele saiu antes da hora, porque tinha vazado na internet.", title="TRAILER <em>1</em>", shot="orbit",
  items=[tag("dezembro", "DEZ / 2023", CYAN, top=320, size=90), I("antes", "SAIU ANTES DA HORA", cls="chip red", top=520, anim="stamp", cue="stamp")])
L("O segundo trailer veio em maio de 2025.", title="TRAILER <em>2</em>", shot="beach",
  items=[tag("maio", "MAIO / 2025", PINK, top=360, size=90)])
L("E o lançamento? Era pra 2025. Foi adiado pra maio de 2026. E depois, adiado de novo, para dezenove de novembro de 2026.", title="<em>2</em> ADIAMENTOS", shot="road",
  items=[I("Era", '<div class="timeline"><div class="y"><b class="strike">2025</b><i></i><span>plano original</span></div><div class="y"><b class="strike">05/2026</b><i></i><span>adiado em 2/5/2025</span></div><div class="y last" style="width:440px"><b>19/11/2026</b><i></i><span>adiado em 6/11/2025</span></div></div>', cls="timeline", top=330, anim="fade", cue="pop"),
         tag("novo", "ADIADO DE NOVO", RED, top=640, size=50, anim="stamp")])
L("Treze anos depois do GTA 5. A maior distância entre dois GTAs principais da história.", title="<em>13</em> ANOS", shot="crane",
  fx=lambda V, i: V.counter(V.L(i), V.scene_end(i), 290, 2026, dur=1.6, frm=2013, year=True) and V.item(V.at(i, "maior") - 0.05, V.scene_end(i), 520, "A MAIOR ESPERA DA SÉRIE", cls="tag", style=f"background:{PURP};font-size:56px", anim="stamp", cue="stamp"))

CH(2, "OS <em>PROTAGONISTAS</em>", "Capítulo dois: os protagonistas.")
L("No GTA 5, você jogava com três personagens: Michael, Franklin e Trevor. E podia trocar entre eles a qualquer momento.", title="GTA 5: <em>3</em> PERSONAGENS", shot="side",
  items=[I("três", "3", cls="big", top=260, anim="stamp", cue="stamp"), tag("Michael", "MICHAEL", BLUE, top=480, size=50, anim="left", cue="whoosh"),
         tag("Franklin", "FRANKLIN", GRN, top=580, size=50, anim="right", cue="whoosh"), tag("Trevor", "TREVOR", ORG, top=680, size=50, anim="left", cue="whoosh")])
L("No GTA 6, são dois: Jason Duval e Lucia Caminos. Um casal de criminosos.", title="GTA 6: <em>2</em> PERSONAGENS", shot="city",
  items=[I("dois", "2", cls="big", top=260, anim="stamp", cue="stamp"), tag("Jason", "JASON DUVAL", CYAN, top=480, anim="right", cue="whoosh"), tag("Lucia", "LUCIA CAMINOS", PINK, top=610, anim="left", cue="whoosh")])
L("E a Lucia é histórica: ela é a primeira protagonista mulher da era moderna da série.", title="A <em>LUCIA</em>", shot="crane",
  items=[tag("primeira", "1ª PROTAGONISTA MULHER", PINK, top=340, size=70, anim="stamp"), I("moderna", "da era moderna da série", top=520)])
L("Vamos começar pelo Jason. Ele cresceu cercado de golpistas e bandidos.", title="<em>JASON</em>", shot="road",
  items=[tag("Jason", "JASON", CYAN, top=300, size=90, anim="right", cue="whoosh"), I("golpistas", "cresceu entre golpistas e bandidos", top=500)])
L("Tentou mudar de vida entrando no Exército. Mas não deu muito certo.", shot="side",
  items=[tag("Exército", "EXÉRCITO", GRN, top=320, size=80), I("certo", "não deu muito certo...", cls="chip red", top=500)])
L("Hoje ele vive nas ilhas de Leonida Keys, fazendo o que sabe de melhor: trabalhando pra traficantes da região.", shot="sea",
  items=[tag("Leonida", "LEONIDA KEYS", CYAN, top=320, size=72), I("traficantes", "trabalha para traficantes locais", top=500)])
L("Agora, a Lucia. Ela aprendeu a lutar com o pai, assim que começou a andar.", title="<em>LUCIA</em>", shot="beach",
  items=[tag("Lucia", "LUCIA", PINK, top=300, size=90, anim="left", cue="whoosh"), I("lutar", "🥊 aprendeu a lutar com o pai", top=500)])
L("Foi lutando pela família que ela foi parar na penitenciária de Leonida. E só saiu de lá por pura sorte.", shot="storm",
  items=[I("penitenciária", "PENITENCIÁRIA DE LEONIDA", cls="tag", top=320, style=f"background:{RED};font-size:62px;background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.45) 0 14px,transparent 14px 54px)", anim="stamp", cue="stamp"),
         I("sorte", "saiu por pura sorte 🍀", top=520)])
L("Inclusive, o primeiro trailer do jogo começa com ela... na prisão.", shot="city",
  items=[I("trailer", "TRAILER 1", top=330), tag("prisão", "NA PRISÃO", RED, top=470, size=96, anim="stamp")])
L("Agora, livre, ela prometeu pra si mesma: daqui pra frente, só jogadas inteligentes.", shot="crane",
  items=[I("prometeu", "“só jogadas inteligentes”", cls="tag", top=360, style=f"background:{PURP};font-size:64px", anim="pop", cue="pop")])
L("E igual no GTA 5, dá pra trocar entre os dois personagens. Mas algumas missões exigem um ou o outro.", title="TROCA DE <em>PERSONAGEM</em>", shot="orbit",
  items=[I("trocar", '<div class="row" style="gap:40px"><div class="tag" style="background:#00838f">JASON</div><div class="tag" style="background:#ffd84d;color:#12002b">⇄</div><div class="tag" style="background:#ff2e88">LUCIA</div></div>', cls="row", top=330, anim="pop"),
         I("missões", "algumas missões exigem um ou outro", top=530)])
L("E o primeiro trailer termina com o casal assaltando uma loja de conveniência juntos. Já deu pra sentir o clima.", shot="road",
  items=[tag("assaltando", "ASSALTO!", RED, top=330, size=110, anim="stamp"), I("loja", "loja de conveniência · fim do trailer 1", top=540)])

CH(3, "A GALERA DE <em>LEONIDA</em>", "Capítulo três: os outros personagens.")
L("Jason e Lucia não estão sozinhos. A Rockstar já apresentou vários personagens importantes.", title="O <em>ELENCO</em>", shot="city",
  items=[I("sozinhos", "não estão sozinhos", top=380)])
for name, line, color, desc in [
    ("Cal Hampton", "Cal Hampton: amigo do Jason. Ama uma teoria da conspiração e passa o dia em casa, com cerveja e internet.", BLUE, "amigo do Jason · conspiração · cerveja · internet"),
    ("Brian Heder", "Brian Heder: um veterano do tráfico nas ilhas. É ele quem deixa o Jason morar numa das casas dele.", ORG, "veterano do tráfico · deixa o Jason morar num imóvel dele"),
    ("Boobie Ike", "Boobie Ike: uma lenda de Vice City. Dono de clube, de imóveis e de um estúdio de música.", PINK, "lenda de Vice City · clube · imóveis · estúdio"),
    ("Dre'Quan Priest", "Dre'Quan Priest: um empresário que quer estourar no mundo da música.", PURP, "empresário da música"),
    ("Real Dimez", "Real Dimez: a dupla de rap mais quente de Leonida.", GOLD, "a dupla de rap mais quente de Leonida"),
    ("Raul Bautista", "E Raul Bautista: um assaltante de bancos experiente, sempre atrás de novos talentos.", RED, "assaltante de bancos experiente"),
]:
    L(line, title=name.upper().replace(" ", " <em>", 1) + "</em>", shot=None,
      items=[tag(None, name.upper(), color, top=330, size=96, anim="left", cue="whoosh"), I(None, desc, top=530, anim="up", cue=None)])
L("Se depender desse elenco, a história vai ter crime, música e muita confusão.", title="VEM <em>CONFUSÃO</em>", shot="orbit",
  items=[I("crime", '<div class="row"><div id="cm0" class="tag" style="background:#e63946">CRIME</div><div id="cm1" class="tag" style="background:#7b2ff7">MÚSICA</div><div id="cm2" class="tag" style="background:#ff2e88">CONFUSÃO</div></div>', cls="row", top=360, anim="fade", cue=None)],
  fx=lambda V, i: [V.js.append(f'tl.fromTo("#cm{k}",{{scale:0.2,opacity:0}},{{scale:1,opacity:1,duration:0.22,ease:"back.out(2.2)"}},{V.at(i, w) - 0.05:.2f});') or V.cue("stamp", V.at(i, w) - 0.05) for k, w in enumerate(["crime", "música", "confusão"])])

CH(4, "O <em>MAPA</em>", "Capítulo quatro: o mapa.")
L("O GTA 5 se passava em Los Santos, uma cidade inspirada em Los Angeles, no estado de San Andreas, inspirado na Califórnia.", title="GTA 5: <em>LOS SANTOS</em>", shot="aerial",
  items=[tag("Santos", "LOS SANTOS", CYAN, top=300, size=80), I("Angeles", "inspirada em Los Angeles", top=480), I("Califórnia", "San Andreas = Califórnia", top=590)])
L("O GTA 6 muda de costa. Agora a gente vai pra Leonida, um estado inspirado na Flórida.", title="GTA 6: <em>LEONIDA</em>", shot="sea",
  items=[I("costa", '<span class="strike">CALIFÓRNIA</span>', cls="chip", top=300), tag("Leonida", "LEONIDA", PINK, top=430, size=110), I("Flórida", "inspirado na Flórida 🌴", top=620)])
L("E o tamanho? Segundo Aaron Garbut, da Rockstar North, o mapa tem mais ou menos o dobro do tamanho do GTA 5.", title="QUASE O <em>DOBRO</em>", shot="top",
  items=[I("tamanho", '<div class="m a">GTA 5</div><div class="m b">GTA 6</div>', cls="mapcmp", top=260, anim="pop"),
         tag("dobro", "≈ 2x MAIOR", PURP, top=620, size=66, anim="stamp"), I("Garbut", "segundo Aaron Garbut, Rockstar North", cls="note", top=760, anim="fade", cue=None)])
L("E a principal cidade é ela: Vice City, inspirada em Miami.", title="<em>VICE CITY</em>", shot="crane",
  items=[I("Vice", "VICE<br><em>CITY</em>", cls="hero", top=260, anim="stamp", cue="stamp"), I("Miami", "inspirada em Miami", top=700)],
  fx=lambda V, i: V.cfg.__setitem__("flash", [V.L(i), V.scene_end(i)]))
L("Vice City já tinha aparecido em 2002, no GTA Vice City. Só que aquele jogo se passava em 1986.", title="O VICE CITY <em>ORIGINAL</em>", shot="road",
  items=[tag("2002", "LANÇADO EM 2002", BLUE, top=320, size=70), tag("1986", "HISTÓRIA EM 1986", ORG, top=480, size=70)])
L("O GTA 6 traz Vice City pros dias de hoje, mais de vinte anos depois.", title="VICE CITY <em>HOJE</em>", shot="city",
  fx=lambda V, i: V.counter(V.L(i), V.scene_end(i), 290, 2026, dur=1.6, frm=2002, year=True) and V.item(V.at(i, "vinte") - 0.05, V.scene_end(i), 520, "+20 ANOS DEPOIS", cls="tag", style=f"background:{PINK}", anim="pop", cue="pop"))
L("Sol, praia, prédios neon, carros de luxo e muita vida noturna.", shot="rush",
  items=[I("Sol", '<div class="row">' + "".join(f'<div id="vc{k}" class="tagsm" style="background:{c}">{t}</div>' for k, (t, c) in enumerate([("☀ SOL", GOLD), ("PRAIA", CYAN), ("NEON", PINK), ("CARROS", PURP), ("VIDA NOTURNA", BLUE)])) + '</div>', cls="row", top=380, anim="fade", cue=None)],
  fx=lambda V, i: [V.js.append(f'tl.fromTo("#vc{k}",{{scale:0.2,opacity:0}},{{scale:1,opacity:1,duration:0.2,ease:"back.out(2.4)"}},{V.at(i, w) - 0.05:.2f});') or V.cue("pop", V.at(i, w) - 0.05) for k, w in enumerate(["Sol", "praia", "neon", "carros", "noturna"])])

REGS = [("VICE CITY", PINK), ("LEONIDA KEYS", CYAN), ("GRASSRIVERS", GRN), ("PORT GELLHORN", PURP), ("AMBROSIA", ORG), ("MOUNT KALAGA", BLUE)]
CH(5, "TOUR POR <em>LEONIDA</em>", "Capítulo cinco: um tour por Leonida.")
L("O estado tem seis regiões principais. Bora conhecer cada uma.", title="<em>6</em> REGIÕES", shot="top",
  items=[I("seis", "".join(f'<div id="rg{k}" class="tagsm" style="background:{c}">{r}</div>' for k, (r, c) in enumerate(REGS)), cls="grid3", top=330, anim="fade", cue=None)],
  fx=lambda V, i: [V.js.append(f'tl.fromTo("#rg{k}",{{scale:0.3,opacity:0}},{{scale:1,opacity:1,duration:0.18,ease:"back.out(2.5)"}},{V.at(i, "seis") + k * 0.22:.2f});') or V.cue("pop", V.at(i, "seis") + k * 0.22) for k in range(6)])
for k, (line, desc, shot) in enumerate([
    ("Primeiro, Vice City: a metrópole de sol, praia e festa, o coração do jogo.", "metrópole · sol · praia · festa", "city"),
    ("Segundo, Leonida Keys: um paraíso de ilhas, inspirado nas Florida Keys. É lá que o Jason mora.", "ilhas · inspirado nas Florida Keys", "sea"),
    ("Terceiro, Grassrivers: pântanos selvagens, inspirados nos Everglades, cheios de jacarés.", "pântanos · Everglades · jacarés 🐊", "gator"),
    ("Quarto, Port Gellhorn: uma cidade do litoral que já viveu dias melhores.", "cidade do litoral que já viveu dias melhores", "side"),
    ("Quinto, Ambrosia: uma região do interior, com uma enorme refinaria de açúcar.", "interior · refinaria de açúcar", "road"),
    ("E sexto, Mount Kalaga: um parque nacional de natureza selvagem, trilhas e aventura.", "parque nacional · trilhas · aventura ⛰", "aerial"),
]):
    r, c = REGS[k]
    L(line, title=f"{k + 1}. <em>{r}</em>", shot=shot,
      items=[tag(None, r, c, top=320, size=100, anim="left" if k % 2 == 0 else "right", cue="whoosh"), I(None, desc, top=530, anim="up", cue=None)])
L("Cidade grande, praia, ilhas, pântano, interior e montanha. Muito mais variedade do que em Los Santos.", title="MUITO MAIS <em>VARIEDADE</em>", shot="orbit",
  items=[I("Cidade", '<div class="row">' + "".join(f'<div id="vr{k}" class="tagsm" style="background:{c}">{t}</div>' for k, (t, c) in enumerate([("CIDADE", PINK), ("PRAIA", GOLD), ("ILHAS", CYAN), ("PÂNTANO", GRN), ("INTERIOR", ORG), ("MONTANHA", BLUE)])) + '</div>', cls="row", top=360, anim="fade", cue=None)],
  fx=lambda V, i: [V.js.append(f'tl.fromTo("#vr{k}",{{scale:0.2,opacity:0}},{{scale:1,opacity:1,duration:0.2,ease:"back.out(2.4)"}},{V.at(i, w) - 0.05:.2f});') or V.cue("pop", V.at(i, w) - 0.05) for k, w in enumerate(["Cidade", "praia", "ilhas", "pântano", "interior", "montanha"])])

CH(6, "O MUNDO <em>VIVO</em>", "Capítulo seis: o mundo vivo.")
L("O mapa do GTA 6 não é só maior. Ele é muito mais vivo.", title="O MAPA ESTÁ <em>VIVO</em>", shot="beach",
  items=[I("vivo", "VIVO", cls="hero", top=330, anim="stamp", cue="stamp")])
L("São mais de cento e setenta espécies de animais. Jacarés, flamingos, peixes-boi, e até macacos.", title="MAIS DE <em>170</em> ESPÉCIES", shot="beach",
  items=[tag("Jacarés", "JACARÉ", GRN, top=520, size=54, anim="left", cue="whoosh"), tag("flamingos", "FLAMINGO", PINK, top=620, size=54, anim="right", cue="whoosh"),
         tag("peixes-boi", "PEIXE-BOI", CYAN, top=720, size=54, anim="left", cue="whoosh"), tag("macacos", "MACACO", ORG, top=520, size=54, anim="right", cue="whoosh")],
  fx=lambda V, i: V.counter(V.L(i), V.at(i, "Jacarés") - 0.1, 300, 170, dur=1.2, suffix="<small>+</small>"))
L("No GTA 5 também tinha animais, como cachorros, veados e tubarões. Mas nada perto dessa variedade.", shot="gator",
  items=[I("GTA", "GTA 5: cachorros · veados · tubarões", top=330), tag("nada", "GTA 6: MUITO MAIS", PINK, top=500, size=70)])
L("E sim: vai ter furacão. Tempestades tropicais e furacões podem atingir Leonida, com chuva forte, vento e raios.", title="VAI TER <em>FURACÃO</em>", shot="storm",
  items=[I("chuva", "CHUVA · VENTO · RAIOS", top=360, style="font-size:52px")],
  fx="storm")
L("Outra novidade: a Rockstar diz que esse é o GTA com mais lugares pra entrar de toda a série. Muito mais interiores.", title="MAIS <em>INTERIORES</em>", shot="city",
  items=[I("mais", "o GTA com mais lugares pra entrar", top=360), I("Rockstar", "segundo a Rockstar", cls="note", top=520, anim="fade", cue=None)],
  fx=lambda V, i: V.cfg.__setitem__("rise", [V.L(i) - 0.1, V.scene_end(i)]))
L("E o primeiro trailer mostrou vídeos virais dos moradores de Leonida, igualzinho às redes sociais de verdade.", title="VÍDEOS <em>VIRAIS</em>", shot="orbit", fx="phone")
L("No GTA 5, a sátira era com a internet de 2013. No 6, ela é sobre o mundo de hoje, com vídeos virais e celular pra todo lado.", title="A SÁTIRA DE <em>HOJE</em>", shot="road",
  items=[I("2013", "GTA 5: internet de 2013", top=330), tag("hoje", "GTA 6: O MUNDO DE HOJE", PINK, top=480, size=64)])

CH(7, "GRÁFICOS E <em>TECNOLOGIA</em>", "Capítulo sete: gráficos e tecnologia.")
L("O GTA 5 nasceu no PS3, um console de 2006, com só meio giga de memória.", title="GTA 5: <em>PS3</em>", shot="side",
  items=[tag("PS3", "PS3 · 2006", BLUE, top=320, size=80), I("memória", "0,5 GB de memória", top=500)])
L("Já o GTA 6 sai só no PS5 e no Xbox Series. E o PS5 tem dezesseis gigas de memória. Trinta e duas vezes mais que o PS3.", title="GTA 6: <em>PS5</em>", shot="crane",
  items=[tag("PS5", "PS5 · XBOX SERIES", PINK, top=300, size=70), I("dezesseis", "PS5: 16 GB de memória", top=470)],
  fx=lambda V, i: V.counter(V.at(i, "Trinta") - 0.2, V.scene_end(i), 560, 32, dur=1.0, suffix="<small>x</small>"))
L("E isso aparece na tela: o segundo trailer foi gravado inteirinho dentro do jogo, rodando num PS5.", title="GRAVADO NO <em>PS5</em>", shot="orbit",
  items=[I("trailer", "TRAILER 2", top=320), tag("PS5", "100% NO PS5", CYAN, top=460, size=90, anim="stamp")])
L("Metade do trailer era gameplay, e a outra metade, cenas da história. Tudo feito com o próprio motor do jogo.", shot="road",
  items=[I("Metade", '<div class="row" style="gap:30px"><div class="tag" style="background:#7b2ff7">50% GAMEPLAY</div><div class="tag" style="background:#ff2e88">50% HISTÓRIA</div></div>', cls="row", top=360, anim="pop"),
         I("motor", "tudo no motor do jogo", top=560)])
L("Por isso o GTA 6 não sai no PS4 nem no Xbox One. É um jogo feito só pra nova geração.", shot="city",
  items=[I("PS4", '<span class="strike">PS4 · XBOX ONE</span>', cls="chip red", top=330, anim="stamp", cue="stamp"), tag("nova", "SÓ NOVA GERAÇÃO", GRN, top=490, size=66)])
L("E no PC? Por enquanto, a Rockstar ainda não deu data. Igual aconteceu com o GTA 5, que só chegou ao PC quase dois anos depois.", title="E NO <em>PC?</em>", shot="sea",
  items=[I("data", "PC: SEM DATA", cls="chip red", top=320, anim="stamp", cue="stamp"), I("GTA", "GTA 5 no PC: só em 2015", top=480)])

CH(8, "OS <em>RECORDES</em>", "Capítulo oito: os recordes.")
L("O GTA 6 quebrou recordes antes mesmo de sair.", title="RECORDES <em>ABSURDOS</em>", shot="crane",
  items=[I(None, '<div class="cup"></div><div class="stem"></div><div class="base"></div>', cls="trophy", top=330, anim="stamp", cue="stamp")])
L("O primeiro trailer teve noventa milhões de visualizações no YouTube em vinte e quatro horas. Recorde mundial do Guinness.", title="TRAILER <em>1</em>", shot="city",
  items=[I("vinte", "no YouTube em 24 horas", top=500), tag("Guinness", "RECORDE GUINNESS", GOLD, top=620, size=60, anim="stamp")],
  fx=lambda V, i: V.counter(V.at(i, "noventa") - 0.3, V.scene_end(i), 290, 90, dur=1.1, suffix="<small> MI</small>"))
L("O segundo trailer foi ainda mais longe: quatrocentos e setenta e cinco milhões de visualizações em um dia, somando todas as plataformas.", title="TRAILER <em>2</em>", shot="aerial",
  items=[I("dia", "em 24 h · todas as plataformas", top=500), I("plataformas", "segundo a Rockstar", cls="note", top=620, anim="fade", cue=None)],
  fx=lambda V, i: V.counter(V.at(i, "quatrocentos") - 0.3, V.scene_end(i), 290, 475, dur=1.4, suffix="<small> MI</small>"))
L("E lembra do GTA 5? Um bilhão de dólares em três dias. Agora o mundo inteiro quer saber se o GTA 6 vai superar isso.", title="VAI <em>SUPERAR?</em>", shot="rush",
  items=[I("bilhão", "GTA 5: US$ 1 BILHÃO EM 3 DIAS", top=330), tag("superar", "GTA 6 VAI SUPERAR?", PINK, top=490, size=70, anim="stamp")])

CH(9, "OS <em>BASTIDORES</em>", "Capítulo nove: os bastidores.")
L("A música do primeiro trailer é Love Is a Long Road, do Tom Petty.", title="AS <em>MÚSICAS</em>", shot="beach",
  items=[I("primeiro", "TRAILER 1", top=300), tag("Love", "♪ LOVE IS A LONG ROAD", BLUE, top=440, size=62), I("Petty", "Tom Petty", top=600)])
L("E a do segundo é Hot Together, das Pointer Sisters.", shot="sea",
  items=[I("segundo", "TRAILER 2", top=300), tag("Hot", "♪ HOT TOGETHER", PINK, top=440, size=70), I("Pointer", "The Pointer Sisters", top=600)])
L("As duas são músicas dos anos oitenta, combinando direitinho com o clima de Vice City.", shot="rush",
  items=[tag("oitenta", "ANOS 80", PURP, top=360, size=120, anim="stamp")])
L("E depois do segundo trailer, a Rockstar abriu o site oficial com fotos e a descrição de cada personagem e de cada região.", title="O SITE <em>OFICIAL</em>", shot="orbit",
  items=[I("site", "site oficial da Rockstar", top=330), I("fotos", '<div class="row"><div class="tagsm" style="background:#ff2e88">FOTOS</div><div class="tagsm" style="background:#00838f">PERSONAGENS</div><div class="tagsm" style="background:#3e8e3a">REGIÕES</div></div>', cls="row", top=480)])

CH(10, "O <em>LANÇAMENTO</em>", "Capítulo dez: tudo sobre o lançamento.")
L("O GTA 6 sai no dia dezenove de novembro de 2026, para PS5 e Xbox Series X e S.", title="<em>19/11</em>/2026", shot="crane",
  items=[tag("dezenove", "19 DE NOVEMBRO", PINK, top=320, size=96), I("PS5", "PS5 · XBOX SERIES X|S", top=520)])
L("Ele libera à meia-noite no horário local de cada país. Por isso, a Nova Zelândia é um dos primeiros lugares a jogar.", title="À <em>MEIA-NOITE</em>", shot="sea",
  items=[tag("meia-noite", "00:00", BLUE, top=300, size=130, anim="stamp"), I("local", "no horário de cada país", top=540), I("Nova", "🇳🇿 Nova Zelândia joga primeiro", top=650)])
L("O jogo ocupa até duzentos e doze gigas, segundo a Rockstar. Por isso, o download antecipado começou no dia dez de novembro.", title="O <em>TAMANHO</em>", shot="top",
  items=[I("Rockstar", "segundo a Rockstar", cls="note", top=500, anim="fade", cue=None), I("download", "download antecipado: 10/11", top=600)],
  fx=lambda V, i: V.counter(V.at(i, "duzentos") - 0.3, V.scene_end(i), 290, 212, dur=1.2, suffix="<small> GB</small>"))
L("Pra comparar: quando o GTA 5 chegou ao PC, em 2015, ele pedia sessenta e cinco gigas de espaço.", shot="side",
  items=[I("comparar", '<div class="row" style="gap:40px"><div class="tag" style="background:#00838f">GTA 5 (PC): 65 GB</div><div class="tag" style="background:#ff2e88">GTA 6: ATÉ 212 GB</div></div>', cls="row", top=360, anim="pop")])
L("E o preço? Lá fora, a edição padrão custa setenta e nove dólares e noventa e nove. A Ultimate, noventa e nove e noventa e nove.", title="O <em>PREÇO</em>", shot="city",
  items=[tag("padrão", "PADRÃO: US$ 79,99", CYAN, top=320, size=70), tag("Ultimate", "ULTIMATE: US$ 99,99", PURP, top=480, size=70)])
L("O GTA 5 foi lançado por cinquenta e nove e noventa e nove. Ou seja, vinte dólares a mais na edição padrão.", shot="road",
  items=[I("GTA", "GTA 5 em 2013: US$ 59,99", top=330), tag("vinte", "+ US$ 20", RED, top=490, size=110, anim="stamp")])
L("E o modo online? Ele não vem no lançamento, e a Rockstar ainda não deu data.", title="E O <em>ONLINE?</em>", shot="aerial",
  items=[I("online", "MODO ONLINE", top=320), I("data", "SEM DATA AINDA", cls="chip red", top=470, anim="stamp", cue="stamp")])
L("Bem diferente do GTA Online, que chegou só duas semanas depois do GTA 5, em outubro de 2013.", shot="side",
  items=[I("GTA", "GTA ONLINE: OUT / 2013", top=340), I("duas", "2 semanas depois do GTA 5", top=490)])

ROWS = [("ANO", "2013", "2026", "Ano"), ("PROTAGONISTAS", "3", "2 (com Lucia)", "Protagonistas"), ("MAPA", "Los Santos · Califórnia", "Leonida · Flórida · ≈2x", "Mapa"),
        ("CIDADE", "Los Santos", "Vice City", "Cidade"), ("MUNDO", "menos animais", "170+ espécies · furacões", "Mundo"),
        ("CONSOLES", "começou no PS3", "só PS5 / Series", "Consoles"), ("PREÇO", "US$ 59,99", "US$ 79,99", "Preço"), ("ONLINE", "logo de cara", "sem data", "online")]
CH(11, "O <em>RESUMO</em>", "Capítulo onze: o resumo. GTA 5 contra GTA 6, lado a lado.")
for k, (lab, a, b, w) in enumerate(ROWS):
    text = {
        0: "Ano: 2013 contra 2026.",
        1: "Protagonistas: três contra dois, com a primeira protagonista mulher da era moderna.",
        2: "Mapa: Los Santos, na Califórnia, contra Leonida, na Flórida, com cerca do dobro do tamanho.",
        3: "Cidade principal: Los Santos contra Vice City.",
        4: "Mundo: o GTA 6 tem mais de cento e setenta espécies de animais, furacões e mais interiores.",
        5: "Consoles: o 5 começou no PS3. O 6 é só PS5 e Xbox Series.",
        6: "Preço lá fora: cinquenta e nove dólares contra setenta e nove.",
        7: "E o online: o GTA 5 teve logo de cara. O GTA 6, ainda sem data.",
    }[k]
    L(text, title="GTA 5 <em>VS</em> GTA 6" if k == 0 else None, shot=["top", "orbit", "aerial", "city", "beach", "side", "road", "crane"][k], gap=0.35, fx=("row", k, lab, a, b, w))

L("E aí, depois de tudo isso: qual novidade do GTA 6 te deixou mais animado? Comenta aqui embaixo.", title="E AÍ, <em>COMENTA!</em>", shot="rushBack", gap=0.8,
  items=[I("Comenta", '💬 COMENTA AQUI EMBAIXO', cls="cta", top=380, cue="whoosh")])

# ------------------------------------------------------------------ build
LINES = [s["text"] for s in S]
GAPS = [s["gap"] for s in S]
V = Wide("longo", LINES, GAPS)
E = V.scene_end
CYCLE = ["side", "city", "road", "crane", "aerial", "sea", "orbit", "beach", "top", "rush"]

# chapter spans for badges / title spans
chap_lines = [i for i, s in enumerate(S) if s["card"]]
title_starts = []
cur_title = None
for i, s in enumerate(S):
    if s["card"]:
        title_starts.append((i, None))
    elif s["title"]:
        title_starts.append((i, s["title"]))
title_starts.append((len(S), None))  # like scene begins
for (i, t), (j, _) in zip(title_starts, title_starts[1:]):
    if t:
        st = 0 if i == 0 else V.L(i) - 0.1
        en = V.L(j) - 0.35 if (j < len(S) and S[j]["card"]) else V.L(j) - 0.1
        V.title_span(st, en, t, i)

for n, ci in enumerate(chap_lines):
    num, name = S[ci]["card"]
    V.card(ci, num, name, NCHAP)
    end_line = chap_lines[n + 1] if n + 1 < len(chap_lines) else len(S)
    plain = name.replace("<em>", "").replace("</em>", "")
    V.badge(V.Lend(ci) + 0.1, V.L(end_line) - 0.35 if end_line < len(S) else V.L(end_line) - 0.1, f"CAP. {num}/{NCHAP} · {plain}")

# the summary table header, persisting through chapter 11
sum_first = chap_lines[-1] + 1
sum_last = sum_first + len(ROWS) - 1
V.item(V.L(sum_first) - 0.1, E(sum_last), 205, '<div class="h a">GTA 5</div><div></div><div class="h b">GTA 6</div>', cls="cmp", anim="fade", cue=None)

k_cycle = 0
for i, s in enumerate(S):
    shot = s["shot"]
    if not shot:
        shot = CYCLE[k_cycle % len(CYCLE)]; k_cycle += 1
    V.shot(shot, (0 if i == 0 else V.L(i) - 0.1), E(i))
    # find scene end (next title or card) for keep items
    tops = iter([290, 460, 620, 760])
    for it in s["items"]:
        st = (V.at(i, it["word"], it["nth"]) - 0.05) if it["word"] else (0 if i == 0 else V.L(i) + 0.05)
        top = it["top"] if it["top"] is not None else next(tops)
        V.item(st, E(i), top, it["inner"], cls=it["cls"], anim=it["anim"], style=it["style"], cue=it["cue"])
    fx = s["fx"]
    if callable(fx):
        fx(V, i)
    elif fx == "storm":
        V.cfg["storm"].append([V.L(i) - 0.1, E(i)])
        lts = [V.at(i, "furacão") + 0.1, V.at(i, "raios")]
        V.cfg["lightning"] += lts
        for lt in lts:
            V.cue("thunder", lt)
        V.cue("rain", V.L(i) - 0.1, E(i) - V.L(i) + 0.1)
    elif fx == "phone":
        V.item(V.L(i), E(i), 250, '<div class="scr"></div><div class="play"></div><div class="rail"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div><div class="user">@morador_de_leonida</div><div class="views"><span id="vv">0</span> mi views</div>', cls="phone", anim="pop", cue="pop")
        V.js.append(f'var ovv={{v:0}}; tl.fromTo(ovv,{{v:0}},{{v:12.4,duration:{E(i) - V.L(i) - 0.4:.2f},ease:"power2.in",onUpdate:function(){{document.getElementById("vv").textContent=ovv.v.toFixed(1).replace(".",",");}}}},{V.L(i) + 0.2:.2f});')
    elif isinstance(fx, tuple) and fx[0] == "row":
        _, k, lab, a, b, w = fx
        top = 295 + k * 70
        st = V.L(i) + 0.05
        V.item(st, E(sum_last), top, f'<div class="a">{a}</div><div class="l">{lab}</div><div class="b">{b}</div>', cls="cmprow", anim="up", cue="pop")

V.write()
