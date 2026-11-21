"""Duas séries novas de GTA 6 (21/11/2026), no cenário da sala (common/scene_sala.js).
Uso: python3 novidades_serie.py recorde 1|2   ou   python3 novidades_serie.py boato 1|2

recorde: US$ 3,79 bilhões no primeiro dia. Fontes: CNBC, CNN, Forbes, Variety e Good Morning America
  (20/11/2026). Valor é estimativa da Take-Two de vendas no varejo; ela não divulgou cópias; a Forbes diz
  que não está claro se as pré-vendas entram. GTA 5: cerca de US$ 800 milhões no 1º dia (2013).
boato: segredos que os jogadores dizem ter achado. Ovos pintados em ninhos nas antenas e o cachorro de
  óculos escuros no jet ski: Windows Central (clipe de jogador, 18/11). Cena secreta do ovo e abdução
  alienígena: sem confirmação em nenhuma fonte. Troféu "The Truth Is Out There": listado no Gamer Guides,
  sem requisito conhecido. A Rockstar não confirmou nenhum segredo.
"""
import sys, os, shutil; sys.path.insert(0, "common")
from engine import Video, HERE

SERIE = sys.argv[1] if len(sys.argv) > 1 else "recorde"
PART = int(sys.argv[2]) if len(sys.argv) > 2 else 1
PINK, PURP, GRN, RED, BLUE, GOLD = "#ff2e88", "#7b2ff7", "#2a9d8f", "#e63946", "#2b6cb0", "#d4a017"


def tag(word, txt, color, top=1160, size=60, anim="stamp", cue="stamp"):
    return (word, txt, "tag", f"background:{color};font-size:{size}px", top, anim, cue)


def chip(word, txt, top=1280, anim="up", cue="pop"):
    return (word, txt, "chip", "", top, anim, cue)


# each line: (text, title, cam, tv, pose, items)
if SERIE == "recorde" and PART == 1:
    M = 2
    S = [
        ("Três vírgula setenta e nove bilhões de dólares. Em um dia só.", "US$ <em>3,79 BI</em>", "tv", [(None, "money")], [(None, "shock")],
         [tag("dia", "EM 1 DIA!", GRN, size=72)]),
        ("Foi isso que o GTA 6 vendeu no primeiro dia, segundo a Take-Two, a dona da Rockstar.", "<em>1º DIA</em>", "front", [(None, "money")],
         [(None, "shock"), ("primeiro", "cheer")], [chip("Take-Two", "segundo a Take-Two")]),
        ("Só pra comparar: o GTA 5, em 2013, fez uns oitocentos milhões no primeiro dia.", "GTA 5 <em>VS</em> GTA 6", "tv", [(None, "compare")],
         [(None, "think")], [tag("oitocentos", "GTA 5: US$ 0,8 BI", BLUE, size=58)]),
        ("Ou seja, quase cinco vezes mais.", "QUASE <em>5X</em>", "close", [(None, "compare")], [(None, "shock")],
         [tag("cinco", "QUASE 5X MAIS 🤯", PINK, size=66)]),
        ("A Take-Two diz que é o maior lançamento da história do entretenimento. Mais que qualquer filme, série ou música.", "<em>RECORDE</em> MUNDIAL", "front",
         [(None, "money")], [(None, "cheer")], [tag("maior", "MAIOR LANÇAMENTO DA HISTÓRIA", GOLD, size=50), chip("filme", "mais que qualquer filme ou música")]),
        ("Só que tem um detalhe nesse número que quase ninguém percebeu.", "O <em>DETALHE...</em>", "close", [(None, "copies")], [(None, "think")],
         [tag("detalhe", "QUE DETALHE? 👀", PURP, size=66)]),
    ]
    END = "Segue aí que a parte dois já tá no perfil."
elif SERIE == "recorde":
    M = 2
    S = [
        ("Parte dois. O detalhe escondido nos três vírgula setenta e nove bilhões.", "O <em>DETALHE</em>", "front", [(None, "money")], [(None, "think")],
         [tag(None, "PARTE 2", PURP, size=80, anim="fade", cue=None)]),
        ("Esse valor é uma estimativa da própria Take-Two, das vendas no mundo todo.", "<em>ESTIMATIVA</em>", "tv", [(None, "money")], [(None, "point")],
         [tag("estimativa", "É UMA ESTIMATIVA", BLUE, size=60), chip("Take-Two", "feita pela própria Take-Two")]),
        ("E ela não disse quantas cópias vendeu.", "QUANTAS <em>CÓPIAS?</em>", "tv", [(None, "copies")], [(None, "shock")],
         [tag("cópias", "CÓPIAS: SEGREDO 🤫", RED, size=60)]),
        ("A revista Forbes lembrou que também não ficou claro se as pré-vendas entram nessa conta.", "E AS <em>PRÉ-VENDAS?</em>", "front", [(None, "copies")],
         [(None, "think")], [tag("pré-vendas", "PRÉ-VENDAS ENTRAM?", GOLD, size=56), chip("Forbes", "segundo a Forbes")]),
        ("Pra você ter ideia, o GTA 5 já passou de duzentos milhões de cópias. Esse é o número que o 6 precisa bater.", "A <em>META</em>", "tv",
         [(None, "compare")], [(None, "point")], [tag("duzentos", "GTA 5: +200 MILHÕES", PINK, size=58)]),
        ("E aí, quantas cópias você acha que o GTA 6 vendeu? Chuta aí nos comentários!", "SEU <em>CHUTE?</em>", "close", [(None, "copies")], [(None, "point")],
         [("Chuta", "💬 SEU CHUTE?", "cta", "", 1160, "pop", "pop")]),
    ]
    END = "Curte o vídeo, deixa o like e segue pra mais GTA 6!"
elif PART == 1:
    M = 2
    S = [
        ("A galera tá caçando segredos no GTA 6. Mas o que é verdade, e o que é boato?", "VERDADE OU <em>BOATO?</em>", "front", [(None, "glitch")],
         [(None, "think")], [tag("verdade", "VERDADE OU BOATO? 🤔", PURP, size=60)]),
        ("Primeiro: ovos de Páscoa pintados, escondidos em ninhos no alto das antenas de Vice City.", "OVOS <em>ESCONDIDOS</em>", "tv", [(None, "egg")],
         [(None, "play"), ("ninhos", "shock")], [tag("ninhos", "OVOS NAS ANTENAS 🥚", GOLD, size=58)]),
        ("Isso apareceu em vídeo de jogador e saiu no site Windows Central.", "<em>VERDADE</em>", "front", [(None, "egg")], [(None, "cheer")],
         [tag("vídeo", "✅ JOGADORES MOSTRARAM", GRN, size=56), chip("Windows", "segundo o Windows Central")]),
        ("Agora, dizem que jogar um ovo libera uma cena secreta. Isso, ninguém confirmou ainda.", "CENA <em>SECRETA?</em>", "tv", [(None, "egg")],
         [(None, "think"), ("ninguém", "facepalm")], [tag("ninguém", "⚠ NÃO CONFIRMADO", RED, size=60)]),
        ("E o cachorro de óculos escuros que te resgata de jet ski no meio do mar?", "CACHORRO NO <em>JET SKI?!</em>", "tv", [(None, "dog")],
         [(None, "shock")], [tag("cachorro", "CACHORRO NO JET SKI?! 🐶", BLUE, size=54)]),
        ("Verdade ou boato? Eu te conto na parte dois.", "VERDADE OU <em>BOATO?</em>", "close", [(None, "dog")], [(None, "point")],
         [tag("parte", "NA PARTE 2 👀", PURP, size=70)]),
    ]
    END = "Segue aí pra não perder a parte dois."
else:
    M = 2
    S = [
        ("Parte dois. O cachorro do jet ski.", "O <em>CACHORRO</em>", "tv", [(None, "dog")], [(None, "play")],
         [tag(None, "PARTE 2", PURP, size=80, anim="fade", cue=None)]),
        ("Um jogador mostrou em vídeo: ficou parado longe da praia, e apareceu um cachorro de óculos escuros, de jet ski, pra resgatar.", "<em>RESGATE!</em>", "tv",
         [(None, "dog")], [(None, "play"), ("cachorro", "cheer")], [tag("cachorro", "RESGATE CANINO 🐶", BLUE, size=60)]),
        ("Mas, por enquanto, é só esse vídeo. Ainda falta outro jogador mostrar a mesma coisa.", "<em>QUASE</em> VERDADE", "front", [(None, "dog")],
         [(None, "think")], [tag("vídeo", "⚠ SÓ 1 VÍDEO ATÉ AGORA", GOLD, size=54)]),
        ("E os alienígenas? Tem gente dizendo que dá pra ser abduzido de madrugada.", "<em>ALIENS?</em>", "tv", [(None, "ufo")],
         [(None, "shock")], [tag("abduzido", "ABDUÇÃO? 👽", PINK, size=64)]),
        ("Isso é boato. Ninguém provou até agora.", "<em>BOATO</em>", "close", [(None, "ufo")], [(None, "facepalm")],
         [tag("boato", "❌ BOATO, POR ENQUANTO", RED, size=58)]),
        ("Mas os sites de troféus listam um troféu chamado: a verdade está lá fora. E ninguém sabe ainda como ganhar.", "<em>MISTÉRIO</em>", "front",
         [(None, "statue")], [(None, "think")], [tag("troféu", "🏆 THE TRUTH IS OUT THERE", PURP, size=50), chip("ninguém", "requisito: desconhecido")]),
        ("Qual segredo você quer que eu investigue agora? Comenta aí!", "E <em>VOCÊ?</em>", "close", [(None, "game")], [(None, "point")],
         [("Comenta", "💬 QUAL SEGREDO?", "cta", "", 1160, "pop", "pop")]),
    ]
    END = "Curte o vídeo, deixa o like e segue pra mais GTA 6!"

LINES = [s[0] for s in S]
# natural delivery: varied pauses and speeds per line, casual end line, mic-like voice chain
GAPS = [0, 0.32, 0.45, 0.28, 0.5, 0.36, 0.42, 0.3][: len(S)]
RATES = ["+10%", "+6%", "+12%", "+4%", "+9%", "+7%", "+11%", "+5%"]
FX = ("highpass=f=75,equalizer=f=180:t=q:w=1:g=2.5,equalizer=f=3200:t=q:w=1.4:g=2,"
      "acompressor=threshold=-20dB:ratio=3:attack=6:release=90:makeup=2,aecho=0.85:0.6:23|37:0.07|0.04")
V = Video(f"{SERIE}{PART}", LINES, GAPS, voice_name="pt-BR-ThalitaMultilingualNeural", rate=RATES, hi="#FFD84D",
          next_part=(PART + 1 if PART < M else None), end_line=END, fx=FX)
shutil.copy(os.path.join(HERE, "scene_sala.js"), os.path.join(V.dir, "assets", "scene.js"))
E = V.scene_end


def when(i, word):
    return (V.L(i) - 0.1 if i else 0) if word is None else V.at(i, word) - 0.05


tv, poses, cams = [], [], []
for i, (text, title, cam, tvl, pl, items) in enumerate(S):
    V.title(i, title)
    cams.append([cam, V.L(i) - 0.1 if i else 0, E(i)])
    tv += [[when(i, w), m] for w, m in tvl]
    poses += [[when(i, w), p] for w, p in pl]
    for (w, html, cls, style, top, anim, cue) in items:
        V.item(when(i, w) + (0.1 if w is None and i else 0), E(i), top, html, cls=cls, anim=anim, style=style, cue=cue)
    V.cue("whoosh", V.L(i) - 0.2) if i else None
n = len(S)
cams.append(["pull", V.L(n) - 0.1, V.total])
poses.append([V.L(n) - 0.1, "cheer" if PART == M else "point"])
V.cfg.update(tv=tv, poses=poses, cams=cams, px=0.75)
V.raw('<style>.cap{top:1420px !important}.vig{position:absolute;inset:0;z-index:1;background:radial-gradient(ellipse at 50% 45%,transparent 58%,rgba(8,0,24,.55) 100%)}</style>')
V.raw(f'<div id="vig" class="clip vig" data-start="0" data-duration="{V.total}" data-track-index="1"></div>')
V.cue("boom", 0)
V.write(f"GTA 6 · PARTE {PART}/{M}")
