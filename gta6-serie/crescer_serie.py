"""Série em 2 partes: o GTA 6 é a chance de crescer na internet, usando o Claude como assistente.
Uso: python3 crescer_serie.py 1   |   python3 crescer_serie.py 2
"""
import sys; sys.path.insert(0, "common")
from engine import Video

BASE = [
    "O GTA 6 chegou. E essa pode ser a maior chance da sua vida de crescer na internet.",
    "Milhões de pessoas vão procurar GTA 6 todo dia: gameplay, dicas, segredos, memes.",
    "Quem postar agora, aparece. Quem esperar, fica pra trás.",
    "E você não precisa fazer tudo sozinho. Usa o Claude como seu assistente.",
    "Fez uma live de três horas? O Claude lê a transcrição e acha os melhores momentos.",
    "Depois te ajuda com os cortes, as legendas e a edição. Uma live vira vários vídeos.",
    "E ainda escreve o título, a descrição e as hashtags de cada vídeo.",
    "Uma live, dez cortes. Dez chances de viralizar.",
    "Esse vídeo aqui? Foi feito com a ajuda do Claude.",
    "A hora de crescer é agora, com o GTA 6. Bora começar?",
]
HOOK = "Mas como o Claude transforma uma live em dez vídeos? Isso eu te mostro na parte dois."
INTRO = "Parte dois: como transformar uma live em dez vídeos, com a ajuda do Claude."
PART = int(sys.argv[1]) if len(sys.argv) > 1 else 1
if PART == 1:
    LINES = BASE[:4] + [HOOK]
    GAPS = [0, 0.4, 0.35, 0.4, 0.5]
    V = Video("crescer1", LINES, GAPS, rate="+18%", hi="#3DF5FF", next_part=2)
else:
    LINES = [INTRO] + BASE[4:]
    GAPS = [0, 0.4, 0.35, 0.35, 0.4, 0.4, 0.4]
    V = Video("crescer2", LINES, GAPS, rate="+18%", hi="#3DF5FF")
E = V.scene_end
at = V.at

V.raw('<style>'
      '.search{width:880px;background:#fff;border-radius:44px;border:6px solid #12002b;box-shadow:0 12px 0 rgba(0,0,0,.35);padding:18px 34px;font-family:Inter,sans-serif;font-weight:800;font-size:44px;color:#12002b;display:flex;align-items:center;gap:20px}'
      '.search .mg{width:34px;height:34px;border:7px solid #12002b;border-radius:50%;position:relative;flex:none}'
      '.search .mg::after{content:"";position:absolute;width:7px;height:20px;background:#12002b;right:-10px;bottom:-16px;transform:rotate(-45deg);border-radius:4px}'
      '.sug{width:820px;background:rgba(255,255,255,.96);border-radius:0 0 30px 30px;border:5px solid #12002b;border-top:none;font-family:Inter,sans-serif;font-weight:700;font-size:38px;color:#3a2a5a}'
      '.sug div{padding:14px 34px;border-top:2px solid #e3dcef}'
      '.chat{width:860px;background:#1a1033;border:6px solid #3DF5FF;border-radius:36px;padding:28px;box-shadow:0 0 50px rgba(61,245,255,.5);display:flex;flex-direction:column;gap:20px}'
      '.chat .hd{display:flex;align-items:center;gap:18px;font-size:50px;color:#fff}'
      '.chat .av{width:70px;height:70px;border-radius:22px;background:linear-gradient(135deg,#ff2e88,#7b2ff7);display:flex;align-items:center;justify-content:center;font-size:40px}'
      '.chat .b{font-family:Inter,sans-serif;font-weight:700;font-size:36px;line-height:1.3;padding:18px 24px;border-radius:24px;max-width:700px}'
      '.chat .u{align-self:flex-end;background:#ff2e88;color:#fff;border-bottom-right-radius:6px}'
      '.chat .a{align-self:flex-start;background:#fff;color:#12002b;border-bottom-left-radius:6px}'
      '.live{width:880px;height:500px;border-radius:30px;border:8px solid #fff;overflow:hidden;position:relative;background:linear-gradient(180deg,#14002e,#ff4f9a 70%,#ffd84d);box-shadow:0 0 60px rgba(255,46,136,.6)}'
      '.live .sun{position:absolute;left:50%;top:150px;width:260px;height:260px;margin-left:-130px;border-radius:50%;background:linear-gradient(#ffd84d,#ff2e88)}'
      '.live .grid{position:absolute;left:0;right:0;bottom:0;height:200px;background:#1b0838;background-image:linear-gradient(#3df5ff 2px,transparent 2px),linear-gradient(90deg,#3df5ff 2px,transparent 2px);background-size:60px 40px}'
      '.live .rec{position:absolute;left:26px;top:24px;background:#e62117;color:#fff;font-size:34px;padding:6px 18px;border-radius:12px;display:flex;align-items:center;gap:12px}'
      '.live .rec i{width:20px;height:20px;border-radius:50%;background:#fff}'
      '.live .tm{position:absolute;right:26px;top:24px;background:rgba(0,0,0,.7);color:#fff;font-size:36px;padding:6px 18px;border-radius:12px;font-variant-numeric:tabular-nums}'
      '.tr{width:880px;display:flex;flex-direction:column;gap:14px}'
      '.tr div{font-family:Inter,sans-serif;font-weight:700;font-size:34px;color:#cfc4e8;background:rgba(18,0,43,.85);padding:14px 22px;border-radius:16px;border:3px solid rgba(255,255,255,.15)}'
      '.tr div b{color:#ffd84d;margin-right:14px}'
      '.tr div.hot{color:#12002b;background:#3DF5FF;border-color:#fff}'
      '.tr div.hot b{color:#12002b}'
      '.ed{width:900px;position:relative;height:150px}'
      '.ed .bar{position:absolute;left:0;right:0;top:40px;height:80px;border-radius:14px;border:5px solid #fff;background:repeating-linear-gradient(90deg,#7b2ff7 0 40px,#6a24e0 40px 80px)}'
      '.ed .seg{position:absolute;top:40px;height:80px;border-radius:12px;border:5px solid #fff;background:#3DF5FF}'
      '.ed .head{position:absolute;top:10px;width:8px;height:140px;background:#ff2e88;border-radius:4px;box-shadow:0 0 20px #ff2e88}'
      '.phones{display:flex;gap:34px}'
      '.ph{width:240px;height:430px;border-radius:34px;border:8px solid #fff;overflow:hidden;position:relative;box-shadow:0 0 40px rgba(61,245,255,.6)}'
      '.ph .pcap{position:absolute;left:12px;right:12px;bottom:60px;text-align:center;font-size:30px;color:#fff;-webkit-text-stroke:7px #000;paint-order:stroke fill}'
      '.ph .v{position:absolute;left:14px;top:14px;font-family:Inter,sans-serif;font-weight:900;font-size:24px;color:#fff;background:rgba(0,0,0,.6);padding:4px 10px;border-radius:8px}'
      '.cards{display:flex;flex-direction:column;gap:26px;align-items:center}'
      '.cards .c{width:820px;display:flex;align-items:center;gap:24px;background:#fff;color:#12002b;border:6px solid #12002b;border-radius:24px;padding:18px 28px;box-shadow:0 10px 0 rgba(0,0,0,.35);font-size:48px}'
      '.cards .c small{font-family:Inter,sans-serif;font-weight:700;font-size:28px;color:#5a4a7a;display:block}'
      '.cards .ok{width:64px;height:64px;border-radius:50%;background:#2ecc71;color:#fff;display:flex;align-items:center;justify-content:center;font-size:44px;flex:none}'
      '.flow{display:flex;align-items:center;gap:26px}'
      '.flow .n{background:#12002b;color:#fff;border:6px solid #3DF5FF;border-radius:26px;padding:16px 30px;font-size:64px;text-align:center;line-height:1}'
      '.flow .n small{display:block;font-size:30px;color:#3DF5FF}'
      '.flow .ar{width:0;height:0;border-top:30px solid transparent;border-bottom:30px solid transparent;border-left:46px solid #ffd84d}'
      '</style>')



def scene0(i):
    # 0 hook
    V.title(i, "A MAIOR <em>CHANCE</em>")
    V.item(0, E(i), 480, "GTA 6", cls="hero", anim="fade", cue=None)
    V.item(at(i, "crescer") - 0.05, E(i), 780, "de crescer na internet 🚀", cls="tag", anim="pop", style="background:#ff2e88;font-size:60px", cue="stamp")
    V.cue("boom", 0)
    V.shot("rush", 0, V.L(i + 1) - 0.1)


def scene1(i):
    # 1 search demand
    V.title(i, "TODO MUNDO <em>PROCURANDO</em>")
    V.item(V.L(i) + 0.1, E(i), 480, '<div class="mg"></div><span id="sq"></span>', cls="search", anim="pop")
    q = "gta 6"
    V.js.append(f'var osq={{n:0}}; tl.fromTo(osq,{{n:0}},{{n:{len(q)},duration:0.6,ease:"none",onUpdate:function(){{document.getElementById("sq").textContent="{q}".slice(0,Math.round(osq.n))+"|";}}}},{V.L(i) + 0.3:.2f});')
    sug = [("gameplay", "gta 6 gameplay"), ("dicas", "gta 6 dicas"), ("segredos", "gta 6 segredos"), ("memes", "gta 6 memes")]
    for k, (w, txt) in enumerate(sug):
        V.item(at(i, w) - 0.05, E(i), 600 + k * 82, f'<div>🔍 {txt}</div>', cls="sug", anim="up", style="border-radius:0" if k < 3 else "", cue="pop")
    V.shot("city", V.L(i) - 0.1, E(i))


def scene2(i):
    # 2 now or never
    V.title(i, "AGORA OU <em>NUNCA</em>")
    V.item(at(i, "agora") - 0.05, E(i), 500, "✔ POSTOU AGORA: APARECE", cls="tag", anim="left", style="background:#2a9d8f;font-size:50px", cue="whoosh")
    V.item(at(i, "esperar") - 0.05, E(i), 700, "✖ ESPEROU: FICOU PRA TRÁS", cls="tag", anim="right", style="background:#e63946;font-size:44px", cue="whoosh")
    V.shot("road", V.L(i) - 0.1, E(i))


def scene3(i):
    # 3 assistant
    V.title(i, "SEU <em>ASSISTENTE</em>")
    V.item(V.L(i) + 0.3, E(i), 480,
           '<div class="hd"><div class="av">💬</div>Claude</div>'
           '<div id="cb1" class="b u">Me ajuda a crescer com GTA 6?</div>'
           '<div id="cb2" class="b a">Bora! Me manda a sua live que eu te ajudo com os cortes. 🎬</div>', cls="chat", anim="pop", cue="pop")
    V.js.append(f'tl.fromTo("#cb1",{{opacity:0,y:20}},{{opacity:1,y:0,duration:0.2}},{at(i, "Claude") - 0.05:.2f});')
    V.js.append(f'tl.fromTo("#cb2",{{opacity:0,y:20}},{{opacity:1,y:0,duration:0.2}},{at(i, "assistente") - 0.1:.2f});')
    V.cue("pop", at(i, "assistente") - 0.1)
    V.shot("side", V.L(i) - 0.1, E(i))


def scene4(i):
    # 4 live -> best moments
    V.title(i, "MELHORES <em>MOMENTOS</em>")
    V.item(V.L(i), at(i, "transcrição") - 0.1, 480, '<div class="sun"></div><div class="grid"></div><div class="rec"><i></i>AO VIVO</div><div class="tm" id="lt">0:00:00</div>', cls="live", anim="pop", cue="pop")
    V.js.append(f'var olt={{s:0}}; tl.fromTo(olt,{{s:0}},{{s:10800,duration:{at(i, "transcrição") - V.L(i) - 0.4:.2f},ease:"power2.in",onUpdate:function(){{var s=Math.floor(olt.s),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;document.getElementById("lt").textContent=h+":"+(m<10?"0":"")+m+":"+(x<10?"0":"")+x;}}}},{V.L(i) + 0.2:.2f});')
    rows = [("0:12:05", "entrando em Vice City pela primeira vez", False), ("0:48:31", "fuga da polícia ABSURDA", True), ("1:20:10", "explorando o mapa", False), ("2:05:44", "jacaré invade a missão 😂", True), ("2:41:02", "final da live", False)]
    t0 = at(i, "transcrição")
    html_rows = "".join(f'<div id="tr{k}"><b>{tm}</b>{tx}</div>' for k, (tm, tx, hot) in enumerate(rows))
    V.item(t0 - 0.05, E(i), 470, html_rows, cls="tr", anim="fade", cue=None)
    for k in range(len(rows)):
        V.js.append(f'tl.fromTo("#tr{k}",{{x:-60,opacity:0}},{{x:0,opacity:1,duration:0.18}},{t0 + k * 0.15:.2f});')
    t1 = at(i, "melhores")
    for k, (_, _, hot) in enumerate(rows):
        if hot:
            V.js.append(f'tl.set("#tr{k}",{{backgroundColor:"#3DF5FF",color:"#12002b",borderColor:"#ffffff"}},{t1 + (0 if k == 1 else 0.35):.2f}); tl.fromTo("#tr{k}",{{scale:1}},{{scale:1.06,duration:0.12,yoyo:true,repeat:1}},{t1 + (0 if k == 1 else 0.35):.2f});')
            V.cue("stamp", t1 + (0 if k == 1 else 0.35))
    V.item(t1 + 0.6, E(i), 1000, "★ MELHORES MOMENTOS ACHADOS", cls="chip", anim="pop", cue="pop")
    V.shot("orbit", V.L(i) - 0.1, E(i))


def scene5(i):
    # 5 cuts + captions + edit
    V.title(i, "CORTES E <em>EDIÇÃO</em>")
    s5 = V.L(i)
    V.item(s5, E(i), 470, '<div class="bar"></div><div class="seg" id="sg1" style="left:12%;width:13%"></div><div class="seg" id="sg2" style="left:44%;width:11%"></div><div class="seg" id="sg3" style="left:72%;width:12%"></div><div class="head" id="phd" style="left:0"></div>', cls="ed", anim="fade", cue=None)
    tc = at(i, "cortes")
    V.js.append(f'tl.fromTo("#phd",{{left:"0%"}},{{left:"100%",duration:{E(i) - s5 - 0.3:.2f},ease:"none"}},{s5 + 0.1:.2f});')
    for k in range(3):
        V.js.append(f'tl.fromTo("#sg{k + 1}",{{scaleY:0,opacity:0}},{{scaleY:1,opacity:1,duration:0.18,ease:"back.out(2)"}},{tc - 0.1 + k * 0.25:.2f});')
        V.cue("stamp", tc - 0.1 + k * 0.25)
    V.item(tc - 0.2, tc + 0.9, 455, "✂", cls="big", anim="pop", style="font-size:120px", cue="whoosh")
    phones = "".join(f'<div class="ph" id="ph{k}" style="background:linear-gradient(180deg,{a},{b})"><div class="v">CORTE {k + 1}</div><div class="pcap">{c}</div></div>'
                     for k, (a, b, c) in enumerate([("#ff2e88", "#7b2ff7", "FUGA ABSURDA!"), ("#2a9d8f", "#12002b", "O JACARÉ 😂"), ("#ffb703", "#e63946", "VICE CITY!")]))
    tl_ = at(i, "legendas")
    V.item(tl_ - 0.1, E(i), 650, phones, cls="phones", anim="fade", cue=None)
    for k in range(3):
        V.js.append(f'tl.fromTo("#ph{k}",{{y:300,opacity:0,rotation:{(k - 1) * 8}}},{{y:0,opacity:1,rotation:{(k - 1) * 4},duration:0.3,ease:"back.out(1.6)"}},{tl_ + k * 0.22:.2f});')
        V.cue("pop", tl_ + k * 0.22)
    V.shot("crane", V.L(i) - 0.1, E(i))


def scene6(i):
    # 6 title, description, hashtags
    V.title(i, "TUDO <em>PRONTO</em>")
    for k, (w, ttl, sub) in enumerate([("título", "TÍTULO", "“Fugi da polícia no GTA 6 😱”"), ("descrição", "DESCRIÇÃO", "pronta pra copiar e colar"), ("hashtags", "#HASHTAGS", "#GTA6 #Shorts #Gamer")]):
        V.item(at(i, w) - 0.05, E(i), 480 + k * 190, f'<div class="ok">✔</div><div>{ttl}<small>{sub}</small></div>', cls="cards", style="", anim="left", cue="stamp")
    V.raw("<style>.cards{width:820px;display:flex;align-items:center;gap:24px;background:#fff;color:#12002b;border:6px solid #12002b;border-radius:24px;padding:18px 28px;box-shadow:0 10px 0 rgba(0,0,0,.35);font-size:48px;flex-direction:row}.cards small{font-family:Inter,sans-serif;font-weight:700;font-size:28px;color:#5a4a7a;display:block}</style>")
    V.shot("beach", V.L(i) - 0.1, E(i))


def scene7(i):
    # 7 1 live -> 10 cuts -> 10 chances
    V.title(i, "A <em>CONTA</em> É SIMPLES")
    V.item(V.L(i) + 0.05, E(i), 500, '<div class="n">1<small>LIVE</small></div><div class="ar"></div><div class="n" id="n10" style="border-color:#ff2e88">10<small style="color:#ff2e88">CORTES</small></div>', cls="flow", anim="pop", cue="pop")
    V.item(at(i, "chances") - 0.05, E(i), 800, "10 CHANCES DE VIRALIZAR 🔥", cls="tag", anim="stamp", style="background:#7b2ff7;font-size:56px", cue="stamp")
    V.cfg["rise"] = [V.L(i) - 0.1, E(i)]
    V.shot("city", V.L(i) - 0.1, E(i))


def scene8(i):
    # 8 made with Claude
    V.title(i, "ESSE VÍDEO <em>AQUI</em>")
    V.item(at(i, "feito") - 0.05, E(i), 520, "FEITO COM A<br>AJUDA DO CLAUDE", cls="tag", anim="stamp", style="background:#ff2e88;font-size:66px;text-align:center;line-height:1.15", cue="stamp")
    V.cfg["flash"] = [V.L(i), E(i)]
    V.shot("aerial", V.L(i) - 0.1, E(i))


def scene9(i):
    # 9 CTA
    V.title(i, "A HORA É <em>AGORA</em>")
    V.item(V.L(i) + 0.2, E(i), 500, "GTA 6", cls="hero", anim="pop", style="font-size:200px", cue="pop")
    V.item(at(i, "Bora") - 0.05, E(i), 800, 'BORA COMEÇAR <span class="arrowr"></span>', cls="cta", cue="whoosh")
    V.shot("rushBack", V.L(i) - 0.1, V.total)




def scene_hook(i):
    V.title(i, "COMO <em>FAZER?</em>")
    V.item(V.L(i) + 0.1, E(i), 470, "?", cls="hero", anim="stamp", style="font-size:300px", cue="stamp")
    V.item(at(i, "parte") - 0.05, E(i), 860, "NA PARTE 2 👀", cls="tag", anim="pop", style="background:#7b2ff7;font-size:70px", cue="stamp")
    V.cue("riser", V.L(i) - 0.3, 0.6)
    V.shot("crane", V.L(i) - 0.1, E(i))


def scene_intro(i):
    V.title(i, "1 LIVE = <em>10 VÍDEOS</em>")
    V.item(0, E(i), 480, "PARTE 2", cls="hero", anim="fade", style="font-size:190px", cue=None)
    V.item(at(i, "Claude") - 0.05, E(i), 760, "com a ajuda do Claude 🤖", cls="tag", anim="pop", style="background:#ff2e88;font-size:58px", cue="stamp")
    V.cue("boom", 0)
    V.shot("rush", 0, V.L(i + 1) - 0.1)


if PART == 1:
    for i, f in enumerate([scene0, scene1, scene2, scene3, scene_hook]):
        f(i)
else:
    for i, f in enumerate([scene_intro, scene4, scene5, scene6, scene7, scene8, scene9]):
        f(i)
V.write(f"GTA 6 · PARTE {PART}/2")
