"""Série em 3 partes: GTA 6 lançou — notas, problemas do lançamento e bugs relatados.
Uso: python3 bugs_serie.py 1|2|3

Fontes (19/11/2026): Bloomberg, Technobezz e Dot Esports (Metacritic 99, IGN e GameSpot 10);
Hollywood Reporter e DownDetector (queda da PSN); Forbes e ComicBook (2 atualizações sem notas);
relatos de jogadores reunidos por sites de bugs (não confirmados pela Rockstar).
"""
import sys, os, shutil; sys.path.insert(0, "common")
from engine import Video, HERE

PART = int(sys.argv[1]) if len(sys.argv) > 1 else 1
PINK, CYAN, PURP, GRN, RED, BLUE, GOLD = "#ff2e88", "#00838f", "#7b2ff7", "#2a9d8f", "#e63946", "#2b6cb0", "#d4a017"

# each line: (text, title, cam, tv, pose, items)
#   tv / pose: list of (word or None, value) ; items: list of (word or None, html, cls, style, top, anim, cue)
def tag(word, txt, color, top=1160, size=64, anim="stamp", cue="stamp"):
    return (word, txt, "tag", f"background:{color};font-size:{size}px", top, anim, cue)


def chip(word, txt, top=1280, anim="up", cue="pop"):
    return (word, txt, "chip", "", top, anim, cue)


if PART == 1:
    S = [
        ("Mano, o GTA 6 saiu. E ele já entrou pra história.", "GTA 6 <em>LANÇOU!</em>", "front", [(None, "game")], [(None, "cheer")],
         [tag("história", "ENTROU PRA HISTÓRIA", PURP, size=60)]),
        ("No Metacritic, ele tirou noventa e nove. É a maior nota do site, empatado com Zelda Ocarina of Time, lá de 1998.", "NOTA <em>99</em>", "tv",
         [(None, "score")], [(None, "play"), ("noventa", "shock")],
         [tag("maior", "A MAIOR NOTA DO SITE", GOLD, size=58), chip("Zelda", "empatado com Zelda (1998)")]),
        ("IGN deu dez. GameSpot deu dez. E até agora? Nenhuma crítica negativa.", "NOTA <em>10</em>", "front", [(None, "score")], [(None, "cheer")],
         [tag("IGN", "IGN: 10 · GAMESPOT: 10", BLUE, size=56), chip("nenhuma", "0 críticas negativas")]),
        ("Só pra você ter ideia, o GTA 5 tirou noventa e sete.", "GTA 5 <em>VS</em> GTA 6", "close", [(None, "score")], [(None, "think")],
         [tag("GTA", "GTA 5: 97 · GTA 6: 99", PINK, size=60)]),
        ("Só que nem tudo foi perfeito no lançamento, viu?", "MAS...", "behind", [(None, "glitch")], [(None, "shock"), ("lançamento", "facepalm")],
         [tag("perfeito", "NEM TUDO FOI PERFEITO", RED, size=56)]),
        ("E o que deu errado, eu te mostro na parte dois.", "O QUE DEU <em>ERRADO?</em>", "front", [(None, "error")], [(None, "facepalm")],
         [tag("parte", "NA PARTE 2 👀", PURP, size=70)]),
    ]
elif PART == 2:
    S = [
        ("Parte dois. Bora ver o que deu errado no lançamento do GTA 6.", "O QUE DEU <em>ERRADO?</em>", "front", [(None, "error")], [(None, "facepalm")],
         [tag(None, "PARTE 2", PURP, size=80, anim="fade", cue=None)]),
        ("Horas antes de liberar aqui no ocidente, a rede do PlayStation simplesmente caiu. E pra muita gente apareceu: serviços ocupados.", "A REDE <em>CAIU</em>", "tv",
         [(None, "loading"), ("caiu", "error")], [(None, "think"), ("caiu", "shock")],
         [tag("caiu", "A REDE DO PLAYSTATION CAIU", RED, size=52), chip("serviços", "“serviços ocupados”")]),
        ("O DownDetector recebeu milhares de reclamações de gente que não conseguia entrar.", "<em>MILHARES</em> DE RECLAMAÇÕES", "front",
         [(None, "error")], [(None, "facepalm")], [tag("milhares", "MILHARES DE RECLAMAÇÕES", BLUE, size=54), chip("DownDetector", "segundo o DownDetector")]),
        ("Tem jogador falando até que o PS5 desligou sozinho depois de abrir o jogo.", "O PS5 <em>DESLIGOU?</em>", "behind",
         [(None, "loading"), ("desligou", "off")], [(None, "play"), ("desligou", "shock")], [tag("desligou", "DESLIGOU SOZINHO?!", RED, size=60)]),
        ("Mas calma: nem a Sony nem a Rockstar confirmaram isso.", "<em>ATENÇÃO</em>", "front", [(None, "off")], [(None, "think")],
         [tag("confirmaram", "⚠ NÃO CONFIRMADO", GOLD, size=64)]),
        ("Outra reclamação: o jogo roda a trinta quadros por segundo em todo console. Até no PS5 Pro.", "<em>30</em> FPS", "tv",
         [(None, "fps")], [(None, "point")], [tag("trinta", "30 FPS EM TODOS", PINK, size=62), chip("Pro", "até no PS5 Pro")]),
        ("E os bugs mais bizarros que a galera já achou? Isso fica pra parte três.", "OS BUGS <em>MAIS ESTRANHOS</em>", "close",
         [(None, "glitch")], [(None, "shock")], [tag("parte", "NA PARTE 3 👀", PURP, size=70)]),
    ]
else:
    S = [
        ("Parte três. Os bugs mais bizarros do GTA 6 até agora.", "BUGS <em>ESTRANHOS</em>", "front", [(None, "glitch")], [(None, "play")],
         [tag(None, "PARTE 3", PURP, size=80, anim="fade", cue=None)]),
        ("Tem gente mostrando pedestre andando direto contra a parede. E não para nunca.", "BUG <em>1</em>", "tv", [(None, "walls")],
         [(None, "play"), ("parede", "point"), ("nunca", "cheer")], [tag("pedestre", "NPC vs PAREDE", BLUE, size=64)]),
        ("Teve jogador vendo objeto flutuando no ar depois de trocar do Jason pra Lucia.", "BUG <em>2</em>", "behind", [(None, "float")],
         [(None, "play"), ("flutuando", "shock")], [tag("flutuando", "FLUTUANDO NO AR?!", PINK, size=60), chip("Jason", "depois de trocar de personagem")]),
        ("E roupa que só aparece um segundo depois do personagem surgir na tela.", "BUG <em>3</em>", "tv", [(None, "popin")],
         [(None, "facepalm"), ("surgir", "cheer")], [tag("roupa", "CADÊ A ROUPA? 😂", GOLD, size=62)]),
        ("Detalhe: a Rockstar não confirmou nenhum desses bugs. E o jogo recebeu duas atualizações antes de lançar, sem nenhuma nota dizendo o que mudou.",
         "<em>MISTÉRIO</em>", "front", [(None, "glitch"), ("duas", "update")], [(None, "think")],
         [tag("confirmou", "⚠ NÃO CONFIRMADOS", RED, size=60), chip("duas", "2 atualizações · nenhuma nota")]),
        ("E aí, já achou algum bug no GTA 6? Comenta aqui que eu quero ver.", "E <em>VOCÊ?</em>", "close", [(None, "game")], [(None, "point")],
         [("Comenta", "💬 COMENTA O SEU BUG!", "cta", "", 1160, "pop", "pop")]),
    ]

LINES = [s[0] for s in S]
# Natural delivery (the user asked that it must not sound AI-made): varied pauses and speeds per line,
# casual end line, and a mic-like voice chain (EQ, compression, small room) instead of the clean TTS signal.
GAPS = [0, 0.32, 0.45, 0.28, 0.5, 0.36, 0.42, 0.3][: len(S)]
RATES = ["+10%", "+6%", "+12%", "+4%", "+9%", "+7%", "+11%", "+5%"]
END_LINE = {1: "Segue aí pra não perder a parte dois.", 2: "Segue o perfil que a parte três já tá lá.",
            3: "Curte o vídeo, deixa o like e segue pra mais GTA 6!"}[PART]
FX = ("highpass=f=75,equalizer=f=180:t=q:w=1:g=2.5,equalizer=f=3200:t=q:w=1.4:g=2,"
      "acompressor=threshold=-20dB:ratio=3:attack=6:release=90:makeup=2,aecho=0.85:0.6:23|37:0.07|0.04")
V = Video(f"bugs{PART}", LINES, GAPS, voice_name="pt-BR-ThalitaMultilingualNeural", rate=RATES, hi="#FFD84D",
          next_part=(PART + 1 if PART < 3 else None), end_line=END_LINE, fx=FX)
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
# final scene (follow / like)
n = len(S)
cams.append(["pull", V.L(n) - 0.1, V.total])
poses.append([V.L(n) - 0.1, "cheer" if PART == 3 else "point"])
V.cfg.update(tv=tv, poses=poses, cams=cams, px=0.75)
V.raw('<style>.cap{top:1420px !important}.vig{position:absolute;inset:0;z-index:1;background:radial-gradient(ellipse at 50% 45%,transparent 58%,rgba(8,0,24,.55) 100%)}</style>')
V.raw(f'<div id="vig" class="clip vig" data-start="0" data-duration="{V.total}" data-track-index="1"></div>')
V.cue("boom", 0)
V.write(f"GTA 6 · PARTE {PART}/3")
