"""Seis séries sobre os GTAs clássicos (22/11/2026), 16 Shorts.
Uso: python3 classicos_serie.py sa|gta3|gta4|gta5|cidades|polemica N

sa (3, cidade): San Andreas (2004), CJ volta pra Grove Street após a morte da mãe; Los Santos = Los Angeles, San Fierro =
  São Francisco, Las Venturas = Las Vegas; o jogo mais vendido do PS2; Monte Chiliad já existia; voz do CJ: Young Maylay,
  primo de Shawn Fonteno, voz do Franklin no GTA 5 (Wikipedia, Sportskeeda, Escapist).
gta3 (3, sala): GTA III (23/10/2001), 1º GTA todo em 3D; Liberty City = Nova York; após o 11 de setembro, semanas antes do
  lançamento, as viaturas azuis e brancas (parecidas com as da polícia de NY) viraram pretas e brancas, uma missão com
  terroristas saiu e a rota de um avião mudou; a Rockstar disse que cerca de 1% mudou (Game Informer, Escapist, MCV);
  o protagonista Claude não fala.
gta4 (2, cidade): GTA IV (2008), Niko Bellic chega da Europa; 3,6 milhões de cópias e ~US$ 310 milhões no 1º dia, recorde
  Guinness de jogo que mais faturou em 24 h; ~US$ 500 milhões na 1ª semana (Take-Two, GameSpot, GamesRadar).
gta5 (2, sala): 1º GTA com 3 protagonistas, troca de personagem; Ned Luke (Michael), Shawn Fonteno (Franklin), Steven Ogg
  (Trevor, canadense como o personagem); os três fizeram captura de movimento (Sportskeeda, Escapist).
cidades (3, cidade): Liberty City = Nova York, Vice City = Miami, Los Santos = Los Angeles (placa Vinewood), San Fierro e
  Las Venturas; Leonida = Flórida, Leonida Keys = Florida Keys, Grassrivers = Everglades (Rockstar).
polemica (3, sala): 2005, mod "Hot Coffee" liberava uma cena adulta escondida nos arquivos do San Andreas de PC, achada por
  um holandês; a ESRB mudou para AO (só adultos), 1º jogo de console AO (Guinness); Walmart, Target e Best Buy tiraram das
  lojas; versão nova sem a cena, de volta em outubro de 2005. 2014: Target e Kmart da Austrália tiraram o GTA 5 após petição
  com mais de 40 mil assinaturas; o Target dos EUA continuou vendendo (ESRB, GameSpot, PC Gamer, Kotaku).
"""
import sys; sys.path.insert(0, "common")
from serie_sala import build, build_city, tag, chip, cta, PINK, PURP, GRN, RED, BLUE, GOLD

SERIE, PART = sys.argv[1], int(sys.argv[2])
P = lambda n: tag(None, f"PARTE {n}", PURP, size=80, anim="fade", cue=None)
ORANGE, TEAL = "#e8710a", "#00838f"

if SERIE == "sa":
    M, CITY, HI = 3, True, "#7CFF6B"
    S = {1: [
        ("Três cidades num jogo só. Em dois mil e quatro, o GTA San Andreas fez isso.", "<em>3 CIDADES</em>", "top",
         [tag("Três", "3 CIDADES EM 1 JOGO", GRN, size=60)]),
        ("Você era o CJ, que volta pra Grove Street depois que a mãe dele morre.", "<em>CJ</em>", "road",
         [tag("Grove", "🟢 GROVE STREET", GRN, size=66)]),
        ("Los Santos era inspirada em Los Angeles.", "LOS <em>SANTOS</em>", "crane", [tag("Angeles", "= LOS ANGELES", PINK, size=66)]),
        ("San Fierro, em São Francisco. E Las Venturas, em Las Vegas.", "E MAIS <em>DUAS</em>", "aerial",
         [tag("Francisco", "SAN FIERRO = SÃO FRANCISCO", BLUE, size=46), chip("Vegas", "Las Venturas = Las Vegas")]),
        ("E esse jogo bateu um recorde no PlayStation 2. Qual? Te conto na parte dois.", "QUE <em>RECORDE?</em>", "orbit",
         [tag("parte", "NA PARTE 2 👀", PURP, size=70)]),
    ], 2: [
        ("Parte dois. O San Andreas virou o jogo mais vendido de todo o PlayStation 2.", "O MAIS <em>VENDIDO</em>", "orbit",
         [P(2), tag("vendido", "🏆 O MAIS VENDIDO DO PS2", GOLD, size=54)]),
        ("E o mapa tinha campo, deserto e até montanha entre as cidades.", "MAPA <em>GIGANTE</em>", "aerial",
         [tag("deserto", "🌵 DESERTO + ⛰ MONTANHA", ORANGE, size=54)]),
        ("Inclusive o Monte Chiliad, que depois voltou no GTA 5.", "MONTE <em>CHILIAD</em>", "crane",
         [tag("Chiliad", "⛰ MONTE CHILIAD", TEAL, size=62), chip("voltou", "voltou no GTA 5")]),
        ("A voz do CJ era do rapper Young Maylay.", "A <em>VOZ</em>", "side", [tag("Maylay", "🎤 YOUNG MAYLAY", PURP, size=64)]),
        ("E tem um detalhe sobre ele que liga o San Andreas ao GTA 5. Parte três.", "O <em>DETALHE</em>", "rush",
         [tag("parte", "NA PARTE 3 👀", PURP, size=70)]),
    ], 3: [
        ("Parte três. O Young Maylay, voz do CJ, é primo do ator Shawn Fonteno.", "<em>PRIMOS</em>", "side",
         [P(3), tag("primo", "YOUNG MAYLAY + SHAWN FONTENO", BLUE, size=44)]),
        ("E o Shawn Fonteno é a voz do Franklin, no GTA 5.", "<em>FRANKLIN</em>", "city", [tag("Franklin", "🎙 VOZ DO FRANKLIN", GRN, size=60)]),
        ("Ou seja: o CJ e o Franklin são primos na vida real.", "CJ + <em>FRANKLIN</em>", "orbit",
         [tag("primos", "CJ + FRANKLIN = PRIMOS 🤯", PINK, size=54)]),
        ("Dois protagonistas de Los Santos, da mesma família.", "<em>FAMÍLIA</em>", "crane", [chip("família", "dois protagonistas, uma família")]),
        ("E você, preferia jogar com o CJ ou com o Franklin? Comenta aí!", "CJ OU <em>FRANKLIN?</em>", "road",
         [cta("Comenta", "💬 CJ OU FRANKLIN?")]),
    ]}[PART]
elif SERIE == "gta3":
    M, CITY, HI = 3, False, "#FFB020"
    S = {1: [
        ("O GTA 3 mudou por causa de um dos dias mais tristes da história.", "GTA <em>3</em>", "tv", [(None, "txt|2001|GTA III|")], [(None, "think")],
         [tag("mudou", "POR QUE ELE MUDOU?", RED, size=60)]),
        ("Em dois mil e um, ele foi o primeiro GTA todo em 3D.", "O 1º EM <em>3D</em>", "tv", [(None, "txt|2001|3D|o 1º GTA em 3D")], [(None, "cheer")],
         [tag("3D", "🧊 O 1º GTA EM 3D", BLUE, size=60)]),
        ("A cidade, Liberty City, era inspirada em Nova York.", "LIBERTY <em>CITY</em>", "front", [(None, "txt|LIBERTY CITY|= NOVA YORK|")],
         [(None, "point")], [tag("Nova", "🗽 = NOVA YORK", TEAL, size=64)]),
        ("O jogo estava quase pronto quando aconteceu o onze de setembro, semanas antes do lançamento.", "<em>11/09</em>", "close",
         [(None, "txt|2001|11 DE SETEMBRO|")], [(None, "shock")], [tag("onze", "11 DE SETEMBRO", RED, size=62), chip("semanas", "semanas antes do lançamento")]),
        ("E a Rockstar mudou várias coisas no jogo. O quê? Parte dois.", "O QUE <em>MUDOU?</em>", "front", [(None, "police_blue")], [(None, "point")],
         [tag("parte", "NA PARTE 2 👀", PURP, size=70)]),
    ], 2: [
        ("Parte dois. As viaturas eram azuis e brancas, parecidas com as da polícia de Nova York.", "<em>AZUL</em> E BRANCO", "tv", [(None, "police_blue")],
         [(None, "play")], [P(2)]),
        ("Depois do onze de setembro, elas viraram pretas e brancas.", "<em>PRETO</em> E BRANCO", "tv", [(None, "police_blue"), ("pretas", "police_black")],
         [(None, "shock")], [tag("pretas", "🚓 VIROU PRETO E BRANCO", GOLD, size=56)]),
        ("Uma missão que falava de terroristas saiu do jogo.", "MISSÃO <em>REMOVIDA</em>", "close", [(None, "txt|CORTADO|1 MISSÃO|")],
         [(None, "facepalm")], [tag("missão", "❌ 1 MISSÃO REMOVIDA", RED, size=58)]),
        ("E até a rota de um avião foi mudada, pra não parecer que ele passava pelos prédios.", "ROTA <em>MUDADA</em>", "tv",
         [(None, "txt|MUDOU|✈ ROTA DO AVIÃO|")], [(None, "think")], [tag("avião", "✈️ ROTA MUDADA", BLUE, size=62)]),
        ("Segundo a Rockstar, mais ou menos um por cento do jogo mudou.", "SÓ <em>1%</em>", "front", [(None, "txt|SEGUNDO A ROCKSTAR|1%|do jogo mudou")],
         [(None, "point")], [chip("Rockstar", "segundo a Rockstar")]),
        ("E o protagonista do GTA 3 tem um detalhe muito curioso. Parte três.", "O <em>PROTAGONISTA</em>", "close", [(None, "txt|O PROTAGONISTA|?|")],
         [(None, "point")], [tag("parte", "NA PARTE 3 👀", PURP, size=70)]),
    ], 3: [
        ("Parte três. O protagonista do GTA 3 se chamava Claude.", "<em>CLAUDE</em>", "tv", [(None, "txt|O PROTAGONISTA|CLAUDE|GTA III")],
         [(None, "shock")], [P(3)]),
        ("E ele não falava nada. O jogo inteiro, sem uma frase.", "<em>MUDO</em>", "close", [(None, "txt|FALAS DO CLAUDE|0|")], [(None, "facepalm")],
         [tag("nada", "🤐 ZERO FALAS", RED, size=66)]),
        ("Só no Vice City, um ano depois, o protagonista ganhou voz.", "A <em>VOZ</em> CHEGOU", "front", [(None, "txt|2002|🎙 VICE CITY|o protagonista fala")],
         [(None, "cheer")], [tag("voz", "🎙 VOZ SÓ NO VICE CITY", PINK, size=56)]),
        ("E agora, no GTA 6, são dois protagonistas com voz: Jason e Lucia.", "<em>2026</em>", "tv", [(None, "txt|GTA 6|JASON + LUCIA|")],
         [(None, "cheer")], [tag("Jason", "JASON + LUCIA", PURP, size=64)]),
        ("Você jogou o GTA 3? Comenta o que você lembra!", "E <em>VOCÊ?</em>", "close", [(None, "game")], [(None, "point")],
         [cta("Comenta", "💬 VOCÊ JOGOU?")]),
    ]}[PART]
elif SERIE == "gta4":
    M, CITY, HI = 2, True, "#9ED0FF"
    S = {1: [
        ("Três vírgula seis milhões de cópias num dia só. Foi assim a estreia do GTA 4.", "<em>3,6 MILHÕES</em>", "rush",
         [tag("dia", "3,6 MILHÕES EM 1 DIA", BLUE, size=58)]),
        ("Em dois mil e oito, você era o Niko Bellic, que chega da Europa pra tentar uma vida nova na América.", "NIKO <em>BELLIC</em>", "sea",
         [tag("Niko", "NIKO BELLIC", PURP, size=66), chip("Europa", "chegando da Europa")]),
        ("A cidade era Liberty City de novo, inspirada em Nova York, só que muito mais realista.", "LIBERTY <em>CITY</em>", "city",
         [tag("Nova", "🗽 NOVA YORK", TEAL, size=64)]),
        ("E as vendas desse primeiro dia valeram uns trezentos e dez milhões de dólares.", "US$ <em>310 MI</em>", "crane",
         [tag("trezentos", "US$ 310 MILHÕES", GRN, size=62), chip("vendas", "segundo a Take-Two")]),
        ("E isso valeu um recorde mundial. Qual? Parte dois.", "QUE <em>RECORDE?</em>", "orbit", [tag("parte", "NA PARTE 2 👀", PURP, size=70)]),
    ], 2: [
        ("Parte dois. O Guinness deu ao GTA 4 o recorde de jogo que mais faturou em vinte e quatro horas.", "<em>GUINNESS</em>", "orbit",
         [P(2), tag("recorde", "🏆 RECORDE EM 24 HORAS", GOLD, size=54)]),
        ("Na primeira semana, foram uns quinhentos milhões de dólares.", "<em>1ª SEMANA</em>", "aerial",
         [tag("quinhentos", "US$ 500 MILHÕES", GRN, size=62), chip("semana", "na primeira semana")]),
        ("Cinco anos depois, o GTA 5 passou esse recorde, com oitocentos e quinze milhões num dia.", "O <em>GTA 5</em> PASSOU", "road",
         [tag("oitocentos", "GTA 5: US$ 815 MI", PINK, size=60)]),
        ("E agora o GTA 6 fez três vírgula setenta e nove bilhões, segundo a Take-Two.", "O <em>GTA 6</em>", "crane",
         [tag("três", "GTA 6: US$ 3,79 BI", GRN, size=60)]),
        ("Pra você, qual GTA tem a melhor história? Comenta aí!", "QUAL É O <em>MELHOR?</em>", "rushBack", [cta("Comenta", "💬 QUAL É O MELHOR?")]),
    ]}[PART]
elif SERIE == "gta5":
    M, CITY, HI = 2, False, "#7CFF6B"
    S = {1: [
        ("O GTA 5 foi o primeiro GTA com três protagonistas.", "<em>3</em> PROTAGONISTAS", "tv", [(None, "txt|GTA 5|3 PROTAGONISTAS|o primeiro da série")],
         [(None, "shock")], [tag("três", "3 PROTAGONISTAS", PURP, size=64)]),
        ("Michael, o ladrão aposentado. Franklin, o jovem de Los Santos. E Trevor, o mais imprevisível.", "OS <em>TRÊS</em>", "front",
         [(None, "txt|GTA 5|MICHAEL · FRANKLIN · TREVOR|")], [(None, "point")],
         [tag("Michael", "MICHAEL", BLUE, size=60, top=1080), tag("Franklin", "FRANKLIN", GRN, size=60, top=1180), tag("Trevor", "TREVOR", ORANGE, size=60, top=1280)]),
        ("E você podia trocar de personagem quase a qualquer hora.", "<em>TROCA</em> NA HORA", "tv", [(None, "txt|GTA 5|🔄|troca de personagem")],
         [(None, "play")], [tag("trocar", "🔄 TROCA NA HORA", PINK, size=62)]),
        ("Mas quem são as pessoas de verdade por trás desses três? Parte dois.", "QUEM <em>SÃO?</em>", "close", [(None, "mocap")], [(None, "point")],
         [tag("parte", "NA PARTE 2 👀", PURP, size=70)]),
    ], 2: [
        ("Parte dois. Michael é o ator Ned Luke. Franklin, o Shawn Fonteno. E Trevor, o canadense Steven Ogg.", "OS <em>ATORES</em>", "tv",
         [(None, "mocap")], [(None, "shock")], [P(2), tag("Luke", "NED LUKE = MICHAEL", BLUE, size=50, top=1080),
                                                tag("Fonteno", "SHAWN FONTENO = FRANKLIN", GRN, size=46, top=1180), tag("Ogg", "STEVEN OGG = TREVOR", ORANGE, size=50, top=1280)]),
        ("Eles não fizeram só a voz: também gravaram os movimentos, com roupa de captura de movimento.", "<em>CAPTURA</em>", "tv", [(None, "mocap")],
         [(None, "play")], [tag("movimentos", "🎥 CAPTURA DE MOVIMENTO", RED, size=52)]),
        ("E o Trevor é canadense no jogo, igualzinho ao ator.", "<em>CANADENSE</em>", "close", [(None, "txt|TREVOR|🇨🇦 CANADÁ|igual ao ator")],
         [(None, "cheer")], [tag("canadense", "🇨🇦 CANADENSE", RED, size=62)]),
        ("No GTA 6, a troca de personagem volta, agora entre Jason e Lucia.", "E O <em>GTA 6?</em>", "front", [(None, "txt|GTA 6|JASON ⇄ LUCIA|")],
         [(None, "point")], [tag("Jason", "JASON ⇄ LUCIA", PURP, size=64)]),
        ("Qual dos três é o seu favorito? Comenta aí!", "SEU <em>FAVORITO?</em>", "close", [(None, "game")], [(None, "point")],
         [cta("Comenta", "💬 QUAL É O SEU?")]),
    ]}[PART]
elif SERIE == "cidades":
    M, CITY, HI = 3, True, "#FF6BD6"
    S = {1: [
        ("Toda cidade do GTA é inspirada numa cidade de verdade. Você sabe quais?", "CIDADES <em>REAIS</em>", "top",
         [tag("verdade", "🌎 CIDADES DE VERDADE", PURP, size=60)]),
        ("Liberty City, do GTA 3 e do GTA 4, é Nova York.", "LIBERTY <em>CITY</em>", "city", [tag("Nova", "🗽 = NOVA YORK", TEAL, size=64)]),
        ("E ela já aparecia até no primeiro GTA, de mil novecentos e noventa e sete.", "DESDE <em>1997</em>", "rush", [tag("primeiro", "📼 DESDE O 1º GTA", GOLD, size=60)]),
        ("Vice City é Miami: praia, neon e anos oitenta.", "VICE <em>CITY</em>", "beach", [tag("Miami", "🌴 = MIAMI", PINK, size=66)]),
        ("E qual cidade virou Los Santos? Parte dois.", "E LOS <em>SANTOS?</em>", "orbit", [tag("parte", "NA PARTE 2 👀", PURP, size=70)]),
    ], 2: [
        ("Parte dois. Los Santos, do San Andreas e do GTA 5, é Los Angeles.", "LOS <em>SANTOS</em>", "crane",
         [P(2), tag("Angeles", "🎬 = LOS ANGELES", GOLD, size=62)]),
        ("Tem até uma placa gigante parecida com a de Hollywood, só que escrito Vinewood.", "<em>VINEWOOD</em>", "aerial",
         [tag("Vinewood", "VINEWOOD = HOLLYWOOD", PINK, size=56)]),
        ("No San Andreas ainda tinha San Fierro, que é São Francisco, e Las Venturas, que é Las Vegas.", "E MAIS <em>DUAS</em>", "side",
         [tag("Francisco", "SAN FIERRO = SÃO FRANCISCO", BLUE, size=46), chip("Vegas", "Las Venturas = Las Vegas")]),
        ("E o GTA 6? Ele foi pra um estado inteiro. Parte três.", "E O <em>GTA 6?</em>", "rush", [tag("parte", "NA PARTE 3 👀", PURP, size=70)]),
    ], 3: [
        ("Parte três. O GTA 6 se passa em Leonida, inspirado na Flórida.", "<em>LEONIDA</em>", "top",
         [P(3), tag("Flórida", "= FLÓRIDA 🌴", ORANGE, size=66)]),
        ("Vice City volta como Miami, e Leonida Keys lembra as Florida Keys.", "AS <em>ILHAS</em>", "sea",
         [tag("Keys", "LEONIDA KEYS = FLORIDA KEYS", TEAL, size=46)]),
        ("E Grassrivers é inspirado nos pântanos dos Everglades.", "OS <em>PÂNTANOS</em>", "gator", [tag("Everglades", "🐊 = EVERGLADES", GRN, size=62)]),
        ("Com jacarés, furacões e praias, igualzinho à Flórida.", "TIPO <em>FLÓRIDA</em>", "storm", [tag("furacões", "JACARÉ · FURACÃO · PRAIA", PINK, size=52)]),
        ("Qual cidade do GTA você queria visitar de verdade? Comenta aí!", "QUAL <em>VOCÊ VISITAVA?</em>", "beach",
         [cta("Comenta", "💬 QUAL CIDADE?")]),
    ]}[PART]
else:
    M, CITY, HI = 3, False, "#FF5A5A"
    S = {1: [
        ("O GTA já foi tirado das lojas. E mais de uma vez.", "<em>PROIBIDÃO</em>", "tv", [(None, "shelf")], [(None, "shock")],
         [tag("lojas", "🚫 TIRADO DAS LOJAS", RED, size=62)]),
        ("Em dois mil e cinco, um jogador da Holanda achou uma cena adulta escondida nos arquivos do San Andreas de PC.", "ARQUIVO <em>SECRETO</em>", "tv",
         [(None, "txt|2005|ARQUIVO SECRETO|San Andreas · PC")], [(None, "think"), ("escondida", "shock")], [tag("escondida", "🔍 CENA ESCONDIDA", PURP, size=60)]),
        ("Ela não aparecia no jogo normal. Mas, com uma modificação, dava pra liberar.", "UM <em>MOD</em>", "front",
         [(None, "glitch")], [(None, "facepalm")], [chip("modificação", "o mod Hot Coffee")]),
        ("E a confusão foi tão grande que a classificação do jogo mudou. Pra qual? Parte dois.", "A <em>CONFUSÃO</em>", "close", [(None, "rating")],
         [(None, "point")], [tag("parte", "NA PARTE 2 👀", PURP, size=70)]),
    ], 2: [
        ("Parte dois. Nos Estados Unidos, o San Andreas passou a ser só para adultos, a classificação mais alta.", "<em>18+</em>", "tv", [(None, "rating")],
         [(None, "shock")], [P(2), tag("adultos", "🔞 SÓ PARA ADULTOS", RED, size=60)]),
        ("Segundo o Guinness, foi o primeiro jogo de console a receber essa classificação.", "O <em>PRIMEIRO</em>", "front", [(None, "record")],
         [(None, "think")], [tag("primeiro", "1º JOGO DE CONSOLE ASSIM", GOLD, size=52), chip("Guinness", "segundo o Guinness")]),
        ("Grandes lojas, como Walmart e Best Buy, tiraram o jogo das prateleiras.", "FORA DAS <em>LOJAS</em>", "tv", [(None, "shelf")],
         [(None, "facepalm")], [tag("prateleiras", "🛒 FORA DAS PRATELEIRAS", RED, size=54)]),
        ("A Rockstar lançou uma versão nova, sem a cena. E o jogo voltou pras lojas em outubro.", "DE <em>VOLTA</em>", "front", [(None, "game")],
         [(None, "cheer")], [tag("voltou", "✅ VOLTOU EM OUTUBRO", GRN, size=58)]),
        ("Mas essa não foi a última vez. Parte três.", "NÃO FOI A <em>ÚLTIMA</em>", "close", [(None, "shelf")], [(None, "point")],
         [tag("parte", "NA PARTE 3 👀", PURP, size=70)]),
    ], 3: [
        ("Parte três. Em dois mil e catorze, na Austrália, duas redes de lojas tiraram o GTA 5 das prateleiras.", "<em>AUSTRÁLIA</em>", "tv", [(None, "shelf")],
         [(None, "shock")], [P(3), tag("Austrália", "🇦🇺 AUSTRÁLIA · 2014", BLUE, size=56)]),
        ("Foi depois de uma petição com mais de quarenta mil assinaturas, contra a violência contra mulheres no jogo.", "A <em>PETIÇÃO</em>", "front",
         [(None, "txt|PETIÇÃO|+40 MIL|assinaturas")], [(None, "think")], [tag("quarenta", "✍️ +40 MIL ASSINATURAS", PURP, size=54)]),
        ("Mas muitos jogadores criticaram. E nas lojas Target dos Estados Unidos, o jogo continuou à venda.", "<em>POLÊMICA</em>", "close", [(None, "game")],
         [(None, "facepalm")], [tag("continuou", "🇺🇸 NOS EUA: CONTINUOU", GOLD, size=52)]),
        ("E você, acha certo uma loja tirar um jogo da prateleira? Comenta aí!", "E <em>VOCÊ?</em>", "close", [(None, "shelf")], [(None, "point")],
         [cta("Comenta", "💬 CERTO OU ERRADO?")]),
    ]}[PART]

(build_city if CITY else build)(f"{SERIE}{PART}", PART, M, S, hi=HI)
