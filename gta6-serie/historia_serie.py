"""Quatro séries sobre a história do GTA (21/11/2026). Uso: python3 historia_serie.py origem|vice|chiliad|recordes N

origem (3): o GTA começou como "Race'n'Chase", da DMA Design (Escócia), em que o jogador era a polícia; os criadores
  acharam que tinham tirado a graça; uma falha no caminho da polícia deixou as viaturas agressivas, e o time inverteu
  os papéis (GamesRadar "The making of GTA", TechSpot, Destructoid, MobyGames; livro "Jacked", de David Kushner).
  "Grand theft auto" é o nome do crime de roubo de carro nos EUA. 1º GTA: 1997, visto de cima. DMA Design virou Rockstar North.
vice (2): Vice City saiu em outubro de 2002 no PS2; se passa em 1986 numa cidade baseada em Miami; Tommy Vercetti foi o
  1º protagonista da série que fala, com voz de Ray Liotta; influências de Scarface e Miami Vice; a dupla Tommy e Lance
  Vance foi inspirada em Crockett e Tubbs (Wikipedia, MobyGames).
chiliad (2): mural no topo do Monte Chiliad com disco voador, ovo e homem de jetpack; com 100% do jogo aparece um disco
  voador sobre a montanha; em 2025 o youtuber Gator Keys propôs uma explicação; a Rockstar nunca confirmou; o jetpack
  só veio no GTA Online, no Doomsday Heist (PC Gamer, GamesRadar, Gaming Bible, Red Bull).
recordes (3): Guinness: GTA 5 foi o produto de entretenimento mais rápido a faturar US$ 1 bilhão (3 dias, 2013), recorde
  que era do Call of Duty Black Ops II; 11,21 milhões de cópias e US$ 815,7 milhões em 24 h (a Take-Two não confirmou).
  GTA 6: US$ 3,79 bilhões no 1º dia, segundo a Take-Two (CNBC, CNN, Forbes). GTA 5: mais de 200 milhões de cópias.
"""
import sys; sys.path.insert(0, "common")
from serie_sala import build, tag, chip, cta, PINK, PURP, GRN, RED, BLUE, GOLD

SERIE = sys.argv[1]
PART = int(sys.argv[2])
P = lambda n: tag(None, f"PARTE {n}", PURP, size=80, anim="fade", cue=None)

if SERIE == "origem":
    M = 3
    S = {1: [
        ("Sabia que o GTA quase foi um jogo em que você era o policial?", "VOCÊ ERA O <em>POLICIAL?</em>", "tv", [(None, "cops")], [(None, "shock")],
         [tag("policial", "👮 VOCÊ ERA O POLICIAL", BLUE, size=58)]),
        ("Nos anos noventa, um estúdio da Escócia, a DMA Design, começou um jogo chamado Race and Chase.", "RACE'N'<em>CHASE</em>", "front",
         [(None, "topdown")], [(None, "think")], [tag("Escócia", "🏴 UM ESTÚDIO DA ESCÓCIA", PURP, size=56), chip("DMA", "DMA Design")]),
        ("A ideia era simples: você dirigia a viatura e caçava os bandidos.", "CAÇANDO <em>BANDIDOS</em>", "tv", [(None, "cops")], [(None, "play")],
         [tag("viatura", "🚓 VOCÊ NA VIATURA", BLUE, size=60)]),
        ("Só que os próprios criadores perceberam que tinham tirado a graça do jogo.", "SEM <em>GRAÇA</em>", "close", [(None, "cops")],
         [(None, "facepalm")], [tag("graça", "😴 FICOU CHATO", GOLD, size=64)]),
        ("Até que um erro no código mudou tudo.", "O <em>ERRO</em>", "behind", [(None, "glitch")], [(None, "shock")],
         [tag("erro", "UM BUG MUDOU TUDO", RED, size=62)]),
        ("Que erro foi esse? Eu te conto na parte dois.", "QUE <em>ERRO?</em>", "front", [(None, "glitch")], [(None, "point")],
         [tag("parte", "NA PARTE 2 👀", PURP, size=70)]),
    ], 2: [
        ("Parte dois. O bug que salvou o GTA.", "O <em>BUG</em>", "front", [(None, "glitch")], [(None, "think")], [P(2)]),
        ("Por causa de uma falha no caminho da polícia, as viaturas começaram a jogar o carro direto em cima do jogador.", "POLÍCIA <em>LOUCA</em>", "tv",
         [(None, "cops")], [(None, "play"), ("viaturas", "shock")], [tag("viaturas", "🚓💥 POLÍCIA LOUCA", RED, size=62)]),
        ("A polícia parecia furiosa. E o jogo ficou muito mais divertido.", "<em>DIVERTIDO</em>", "close", [(None, "cops")], [(None, "cheer")],
         [tag("divertido", "MUITO MAIS DIVERTIDO 😂", GRN, size=56)]),
        ("Aí o time inverteu tudo: em vez de policial, você virou o bandido fugindo da polícia.", "INVERTERAM <em>TUDO</em>", "tv", [(None, "topdown")],
         [(None, "point"), ("bandido", "cheer")], [tag("bandido", "😈 AGORA VOCÊ É O BANDIDO", PINK, size=54)]),
        ("Essa história é contada em várias matérias sobre a criação do jogo.", "<em>HISTÓRIA</em> REAL", "front", [(None, "topdown")], [(None, "think")],
         [chip("matérias", "segundo GamesRadar e TechSpot")]),
        ("E o nome Grand Theft Auto? Tem um significado que pouca gente sabe. Tá na parte três.", "E O <em>NOME?</em>", "close",
         [(None, "txt|GTA|GRAND THEFT AUTO|= ?")], [(None, "point")], [tag("parte", "NA PARTE 3 👀", PURP, size=70)]),
    ], 3: [
        ("Parte três. O que significa Grand Theft Auto?", "O <em>NOME</em>", "tv", [(None, "txt|GTA|GRAND THEFT AUTO|= ?")], [(None, "think")], [P(3)]),
        ("Nos Estados Unidos, grand theft auto é o nome do crime de roubo de carro.", "ROUBO DE <em>CARRO</em>", "tv",
         [(None, "txt|NOS EUA|GRAND THEFT AUTO|= ROUBO DE CARRO")], [(None, "shock")], [tag("roubo", "🚗 = ROUBO DE CARRO", RED, size=60)]),
        ("O primeiro GTA saiu em mil novecentos e noventa e sete, visto de cima e com gráfico simples.", "O <em>1º GTA</em>", "tv", [(None, "topdown")],
         [(None, "play")], [tag("cima", "1997 · VISTO DE CIMA", BLUE, size=60)]),
        ("E a DMA Design? Hoje ela se chama Rockstar North, um dos estúdios por trás do GTA 6.", "<em>ROCKSTAR</em> NORTH", "front",
         [(None, "txt|HOJE|ROCKSTAR NORTH|ex-DMA Design")], [(None, "cheer")], [tag("Rockstar", "DMA DESIGN → ROCKSTAR NORTH", PURP, size=50)]),
        ("Ou seja: de um bug na viatura, até um jogo de bilhões.", "DO BUG AOS <em>BILHÕES</em>", "tv", [(None, "money")], [(None, "cheer")],
         [tag("bilhões", "DO BUG AOS BILHÕES 💰", GRN, size=58)]),
        ("E você, qual foi o primeiro GTA que você jogou? Comenta aí!", "E <em>VOCÊ?</em>", "close", [(None, "game")], [(None, "point")],
         [cta("Comenta", "💬 QUAL FOI O SEU 1º?")]),
    ]}[PART]
elif SERIE == "vice":
    M = 2
    S = {1: [
        ("O GTA 6 volta pra Vice City vinte e quatro anos depois. Mas você lembra como era a primeira?", "<em>VICE CITY</em>", "tv",
         [(None, "txt|VICE CITY|2002 → 2026|24 ANOS DEPOIS")], [(None, "shock")], [tag("vinte", "24 ANOS DEPOIS", PINK, size=64)]),
        ("O GTA Vice City saiu em dois mil e dois, no PlayStation 2.", "<em>2002</em>", "tv", [(None, "game")], [(None, "play")],
         [tag("dois", "2002 · PS2", BLUE, size=66)]),
        ("A história se passa em mil novecentos e oitenta e seis, numa cidade baseada em Miami.", "<em>1986</em>", "behind", [(None, "game")],
         [(None, "play")], [tag("Miami", "🌴 BASEADA EM MIAMI", PINK, size=60), chip("oitenta", "o ano: 1986")]),
        ("E foi o primeiro GTA em que o protagonista falava.", "ELE <em>FALA!</em>", "front", [(None, "txt|PELA 1ª VEZ|🎙|O PROTAGONISTA FALA")],
         [(None, "shock")], [tag("falava", "🎙 O 1º QUE FALA", PURP, size=62)]),
        ("E quem fazia a voz dele era um ator famoso de Hollywood. Quem? Te conto na parte dois.", "<em>QUEM?</em>", "close",
         [(None, "txt|A VOZ DE TOMMY|?|HOLLYWOOD")], [(None, "point")], [tag("parte", "NA PARTE 2 👀", PURP, size=70)]),
    ], 2: [
        ("Parte dois. A voz do Tommy Vercetti era do ator Ray Liotta, de Os Bons Companheiros.", "RAY <em>LIOTTA</em>", "tv",
         [(None, "txt|A VOZ DE TOMMY|RAY LIOTTA|Os Bons Companheiros")], [(None, "shock")], [P(2), tag("Liotta", "🎬 RAY LIOTTA", GOLD, size=66)]),
        ("E o jogo foi muito inspirado no filme Scarface e na série Miami Vice.", "AS <em>INSPIRAÇÕES</em>", "front", [(None, "game")], [(None, "think")],
         [tag("Scarface", "🎬 SCARFACE + MIAMI VICE", PINK, size=56)]),
        ("A amizade do Tommy com o Lance Vance foi inspirada na dupla de detetives de Miami Vice.", "A <em>DUPLA</em>", "tv", [(None, "game")],
         [(None, "point")], [tag("dupla", "TOMMY + LANCE", BLUE, size=62), chip("detetives", "inspirados em Miami Vice")]),
        ("Agora, em dois mil e vinte e seis, a gente volta pra Vice City, com Jason e Lucia.", "<em>2026</em>", "behind",
         [(None, "txt|2026|VICE CITY|Jason e Lucia")], [(None, "cheer")], [tag("Jason", "JASON + LUCIA", PURP, size=64)]),
        ("Qual Vice City você prefere: a de dois mil e dois, ou a de agora? Comenta aí!", "QUAL <em>VOCÊ PREFERE?</em>", "close", [(None, "game")],
         [(None, "point")], [cta("Comenta", "💬 2002 OU 2026?")]),
    ]}[PART]
elif SERIE == "chiliad":
    M = 2
    S = {1: [
        ("Doze anos. Esse foi o tempo que um mistério do GTA 5 ficou sem resposta.", "<em>12 ANOS</em>", "tv", [(None, "mural")], [(None, "shock")],
         [tag("anos", "12 ANOS SEM RESPOSTA", RED, size=60)]),
        ("No topo do Monte Chiliad tem um mural com um disco voador, um ovo e um homem de jetpack.", "O <em>MURAL</em>", "tv", [(None, "mural")],
         [(None, "point")], [tag("disco", "🛸 🥚 🧑‍🚀", PURP, size=70), chip("Chiliad", "no topo do Monte Chiliad")]),
        ("Os jogadores descobriram que, com cem por cento do jogo completo, aparece um disco voador em cima da montanha.", "<em>100%</em>", "tv",
         [(None, "ufo")], [(None, "shock")], [tag("cem", "100% = DISCO VOADOR 🛸", GRN, size=56)]),
        ("Mas o mural tem mais desenhos. E ninguém sabia o que eles queriam dizer.", "E O <em>RESTO?</em>", "close", [(None, "mural")],
         [(None, "think")], [tag("ninguém", "NINGUÉM SABIA ❓", GOLD, size=62)]),
        ("Em dois mil e vinte e cinco, alguém disse que resolveu. Mas será que resolveu mesmo? Parte dois.", "<em>RESOLVIDO?</em>", "front",
         [(None, "mural")], [(None, "point")], [tag("parte", "NA PARTE 2 👀", PURP, size=70)]),
    ], 2: [
        ("Parte dois. Em dois mil e vinte e cinco, um youtuber apresentou uma explicação.", "A <em>EXPLICAÇÃO</em>", "front", [(None, "mural")],
         [(None, "think")], [P(2)]),
        ("Pra ele, o mural é um guia: subir bem alto, com ou sem jetpack, pra ver os discos voadores escondidos.", "UM <em>GUIA</em>", "tv",
         [(None, "mural"), ("discos", "ufo")], [(None, "point")], [tag("guia", "O MURAL É UM GUIA?", BLUE, size=60)]),
        ("E o jetpack? Ele nunca veio no modo história. Só apareceu no GTA Online, anos depois.", "E O <em>JETPACK?</em>", "tv",
         [(None, "txt|JETPACK|SÓ NO ONLINE|nunca no modo história")], [(None, "facepalm")], [tag("Online", "SÓ NO GTA ONLINE", PINK, size=60)]),
        ("Só que a Rockstar nunca confirmou essa resposta. Tem site que diz que foi resolvido, e tem site que discorda.", "<em>CONFIRMADO?</em>", "close",
         [(None, "mural")], [(None, "think")], [tag("nunca", "⚠ A ROCKSTAR NUNCA CONFIRMOU", RED, size=50)]),
        ("E aí, será que o GTA 6 tem um mistério desse tamanho escondido? Comenta o que você acha!", "E O <em>GTA 6?</em>", "close", [(None, "ufo")],
         [(None, "point")], [cta("Comenta", "💬 O QUE VOCÊ ACHA?")]),
    ]}[PART]
else:
    M = 3
    S = {1: [
        ("Um bilhão de dólares em três dias. O GTA 5 fez isso em dois mil e treze.", "US$ <em>1 BI</em>", "tv",
         [(None, "txt|GTA 5 · 2013|US$ 1 BI|EM 3 DIAS")], [(None, "shock")], [tag("três", "EM 3 DIAS!", GRN, size=72)]),
        ("Segundo o Guinness, foi o produto de entretenimento mais rápido da história a chegar a um bilhão.", "<em>RECORDE</em> MUNDIAL", "tv",
         [(None, "record")], [(None, "cheer")], [tag("rápido", "🏆 O MAIS RÁPIDO DA HISTÓRIA", GOLD, size=52), chip("Guinness", "segundo o Guinness")]),
        ("Mais rápido que qualquer filme, livro ou música.", "MAIS QUE <em>FILMES</em>", "front", [(None, "record")], [(None, "shock")],
         [tag("filme", "🎬 📚 🎵 FICARAM PRA TRÁS", PINK, size=52)]),
        ("E ele tirou esse recorde de outro jogo muito famoso.", "DE QUEM <em>ERA?</em>", "close", [(None, "record")], [(None, "think")],
         [tag("famoso", "DE QUEM ERA? 🤔", PURP, size=62)]),
        ("Que jogo era esse? Eu te conto na parte dois.", "QUE <em>JOGO?</em>", "front", [(None, "txt|O RECORDE ERA DE|???|")], [(None, "point")],
         [tag("parte", "NA PARTE 2 👀", PURP, size=70)]),
    ], 2: [
        ("Parte dois. O recorde antes era do Call of Duty Black Ops dois.", "<em>BLACK OPS II</em>", "tv",
         [(None, "txt|O RECORDE ERA DE|BLACK OPS II|Call of Duty")], [(None, "shock")], [P(2)]),
        ("E nas primeiras vinte e quatro horas, o GTA 5 vendeu mais de onze milhões de cópias, segundo o Guinness.", "<em>11 MILHÕES</em>", "tv",
         [(None, "txt|PRIMEIRAS 24 H|11 MILHÕES|de cópias")], [(None, "cheer")], [tag("onze", "11 MILHÕES EM 24 H", BLUE, size=60), chip("Guinness", "segundo o Guinness")]),
        ("Isso deu mais de oitocentos milhões de dólares num dia só.", "<em>US$ 815 MI</em>", "front", [(None, "txt|EM 24 HORAS|US$ 815 MI|")],
         [(None, "shock")], [tag("oitocentos", "US$ 815 MILHÕES EM 1 DIA", GRN, size=54)]),
        ("Mas olha esse detalhe: a Take-Two nem confirmou esses números na época.", "O <em>DETALHE</em>", "close", [(None, "copies")], [(None, "think")],
         [tag("confirmou", "⚠ A TAKE-TWO NÃO CONFIRMOU", GOLD, size=50)]),
        ("E será que o GTA 6 já derrubou algum recorde do GTA 5? Isso fica pra parte três.", "E O <em>GTA 6?</em>", "front", [(None, "compare")],
         [(None, "point")], [tag("parte", "NA PARTE 3 👀", PURP, size=70)]),
    ], 3: [
        ("Parte três. GTA 6 contra GTA 5.", "6 <em>VS</em> 5", "tv", [(None, "compare")], [(None, "play")], [P(3)]),
        ("No primeiro dia, o GTA 5 fez uns oitocentos milhões. O GTA 6, três vírgula setenta e nove bilhões, segundo a Take-Two.", "<em>1º DIA</em>", "tv",
         [(None, "compare")], [(None, "shock")], [tag("três", "GTA 6: US$ 3,79 BI", GRN, size=60), chip("Take-Two", "segundo a Take-Two")]),
        ("Ou seja: o recorde do primeiro dia já caiu.", "RECORDE <em>CAIU</em>", "close", [(None, "record")], [(None, "cheer")],
         [tag("caiu", "✅ RECORDE DERRUBADO", GRN, size=60)]),
        ("Mas o maior desafio continua: o GTA 5 já passou de duzentos milhões de cópias.", "O <em>DESAFIO</em>", "front",
         [(None, "txt|GTA 5|+200 MILHÕES|de cópias")], [(None, "think")], [tag("duzentos", "GTA 5: +200 MILHÕES", PINK, size=58)]),
        ("Você acha que o GTA 6 vai passar o GTA 5? Comenta: sim ou não!", "SIM OU <em>NÃO?</em>", "close", [(None, "compare")], [(None, "point")],
         [cta("Comenta", "💬 SIM OU NÃO?")]),
    ]}[PART]

build(f"{SERIE}{PART}", PART, M, S)
