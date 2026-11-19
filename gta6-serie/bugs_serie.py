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
        ("O GTA 6 lançou. E ele já entrou pra história dos games.", "GTA 6 <em>LANÇOU!</em>", "front", [(None, "game")], [(None, "cheer")],
         [tag("história", "ENTROU PRA HISTÓRIA", PURP, size=60)]),
        ("No Metacritic, ele tirou nota noventa e nove. A maior nota do site, empatado com Zelda: Ocarina of Time, de 1998.", "NOTA <em>99</em>", "tv",
         [(None, "score")], [(None, "play"), ("noventa", "shock")],
         [tag("maior", "A MAIOR NOTA DO SITE", GOLD, size=58), chip("Zelda", "empatado com Zelda (1998)")]),
        ("A IGN e a GameSpot deram nota dez. E, até agora, nenhuma crítica negativa.", "NOTA <em>10</em>", "front", [(None, "score")], [(None, "cheer")],
         [tag("IGN", "IGN: 10 · GAMESPOT: 10", BLUE, size=56), chip("nenhuma", "0 críticas negativas")]),
        ("Pra comparar: o GTA 5 tirou noventa e sete.", "GTA 5 <em>VS</em> GTA 6", "close", [(None, "score")], [(None, "think")],
         [tag("GTA", "GTA 5: 97 · GTA 6: 99", PINK, size=60)]),
        ("Mas nem tudo foi perfeito no lançamento...", "MAS...", "behind", [(None, "glitch")], [(None, "shock"), ("lançamento", "facepalm")],
         [tag("perfeito", "NEM TUDO FOI PERFEITO", RED, size=56)]),
        ("O que deu errado? Eu te conto na parte dois.", "O QUE DEU <em>ERRADO?</em>", "front", [(None, "error")], [(None, "facepalm")],
         [tag("parte", "NA PARTE 2 👀", PURP, size=70)]),
    ]
elif PART == 2:
    S = [
        ("Parte dois: o que deu errado no lançamento do GTA 6.", "O QUE DEU <em>ERRADO?</em>", "front", [(None, "error")], [(None, "facepalm")],
         [tag(None, "PARTE 2", PURP, size=80, anim="fade", cue=None)]),
        ("Horas antes de liberar no ocidente, a rede do PlayStation caiu. Muita gente viu a mensagem: serviços ocupados.", "A REDE <em>CAIU</em>", "tv",
         [(None, "loading"), ("caiu", "error")], [(None, "think"), ("caiu", "shock")],
         [tag("caiu", "A REDE DO PLAYSTATION CAIU", RED, size=52), chip("serviços", "“serviços ocupados”")]),
        ("O site DownDetector recebeu milhares de reclamações de quem não conseguia entrar.", "<em>MILHARES</em> DE RECLAMAÇÕES", "front",
         [(None, "error")], [(None, "facepalm")], [tag("milhares", "MILHARES DE RECLAMAÇÕES", BLUE, size=54), chip("DownDetector", "segundo o DownDetector")]),
        ("E tem jogador dizendo que o PS5 desligou sozinho depois de abrir o jogo.", "O PS5 <em>DESLIGOU?</em>", "behind",
         [(None, "loading"), ("desligou", "off")], [(None, "play"), ("desligou", "shock")], [tag("desligou", "DESLIGOU SOZINHO?!", RED, size=60)]),
        ("Mas atenção: nem a Sony nem a Rockstar confirmaram esse problema.", "<em>ATENÇÃO</em>", "front", [(None, "off")], [(None, "think")],
         [tag("confirmaram", "⚠ NÃO CONFIRMADO", GOLD, size=64)]),
        ("Outra crítica: o jogo roda a trinta quadros por segundo em todos os consoles. Até no PS5 Pro.", "<em>30</em> FPS", "tv",
         [(None, "fps")], [(None, "point")], [tag("trinta", "30 FPS EM TODOS", PINK, size=62), chip("Pro", "até no PS5 Pro")]),
        ("E os bugs mais estranhos que os jogadores já acharam? Estão na parte três.", "OS BUGS <em>MAIS ESTRANHOS</em>", "close",
         [(None, "glitch")], [(None, "shock")], [tag("parte", "NA PARTE 3 👀", PURP, size=70)]),
    ]
else:
    S = [
        ("Parte três: os bugs mais estranhos do GTA 6, até agora.", "BUGS <em>ESTRANHOS</em>", "front", [(None, "glitch")], [(None, "play")],
         [tag(None, "PARTE 3", PURP, size=80, anim="fade", cue=None)]),
        ("Jogadores relatam pedestres andando direto contra a parede. Sem parar.", "BUG <em>1</em>", "tv", [(None, "walls")],
         [(None, "play"), ("parede", "point"), ("Sem", "cheer")], [tag("pedestres", "NPC vs PAREDE", BLUE, size=64)]),
        ("Teve gente vendo um objeto flutuando no ar, depois de trocar entre o Jason e a Lucia.", "BUG <em>2</em>", "behind", [(None, "float")],
         [(None, "play"), ("flutuando", "shock")], [tag("flutuando", "FLUTUANDO NO AR?!", PINK, size=60), chip("Jason", "depois de trocar de personagem")]),
        ("E roupas que só aparecem um segundo depois do personagem surgir na tela.", "BUG <em>3</em>", "tv", [(None, "popin")],
         [(None, "facepalm"), ("surgir", "cheer")], [tag("roupas", "CADÊ A ROUPA? 😂", GOLD, size=62)]),
        ("Nenhum desses bugs foi confirmado pela Rockstar. E o jogo recebeu duas atualizações antes do lançamento, sem nenhuma nota explicando o que mudou.",
         "<em>MISTÉRIO</em>", "front", [(None, "glitch"), ("duas", "update")], [(None, "think")],
         [tag("confirmado", "⚠ NÃO CONFIRMADOS", RED, size=60), chip("duas", "2 atualizações · nenhuma nota")]),
        ("E você? Já achou algum bug no GTA 6? Comenta aqui!", "E <em>VOCÊ?</em>", "close", [(None, "game")], [(None, "point")],
         [("Comenta", "💬 COMENTA O SEU BUG!", "cta", "", 1160, "pop", "pop")]),
    ]

LINES = [s[0] for s in S]
GAPS = [0] + [0.4] * (len(S) - 1)
V = Video(f"bugs{PART}", LINES, GAPS, rate="+14%", hi="#FFD84D", next_part=(PART + 1 if PART < 3 else None))
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
