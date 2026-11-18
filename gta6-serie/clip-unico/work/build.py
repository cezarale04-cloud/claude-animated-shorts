"""Generate index.html for the GTA 6 hype clip from work/timeline.json."""
import json, html

D = json.load(open("work/timeline.json"))
TOTAL = 31.0
W = {}
for l in D["lines"]:
    for w in l["words"]:
        W.setdefault((l["i"], w["w"]), w)
def at(i, word): return W[(i, word)]["s"]

# ---------- captions: chunks of up to 3 words, never across lines ----------
chunks = []
for line in D["lines"]:
    cur = []
    for w in line["words"]:
        cur.append(w)
        if len(cur) == 3:
            chunks.append(cur); cur = []
    if cur: chunks.append(cur)
cap_html, cap_js = [], []
for ci, ch in enumerate(chunks):
    s = ch[0]["s"] - 0.06
    nxt = chunks[ci + 1][0]["s"] - 0.06 if ci + 1 < len(chunks) else TOTAL
    e = min(nxt, ch[-1]["e"] + 0.5)
    spans = []
    for wi, w in enumerate(ch):
        spans.append(f'<span id="w{ci}_{wi}" class="cw">{html.escape(w["w"].rstrip(".,?!").upper())}</span>')
        cap_js.append(f'tl.set("#w{ci}_{wi}",{{color:"#3DF5FF",scale:1.08}},{w["s"]-0.02:.3f});')
        cap_js.append(f'tl.set("#w{ci}_{wi}",{{color:"#FFFFFF",scale:1}},{w["e"]+0.02:.3f});')
    cap_html.append(
        f'<div id="cap{ci}" class="clip cap" data-start="{s:.3f}" data-duration="{e - s:.3f}" data-track-index="3">'
        f'<div id="capi{ci}" class="capi">{" ".join(spans)}</div></div>')
    cap_js.append(f'tl.fromTo("#capi{ci}",{{scale:0.82,y:14}},{{scale:1,y:0,duration:0.16,ease:"back.out(2.5)"}},{s:.3f});')

# ---------- scenes ----------
S = [0, 1.55, 5.05, 8.25, 14.05, 18.75, 26.45, TOTAL]
TITLES = [
    ("t0", S[0], S[1], "VOCÊ ESPEROU"),
    ("t1", S[1], S[2], "GTA 5 <em>→</em> GTA 6"),
    ("t2", S[2], S[3], "O GTA 5 <em>VENDEU</em>"),
    ("t3", S[3], S[4], "TRAILER 2 <em>DO GTA 6</em>"),
    ("t4", S[4], S[5], "DE VOLTA A <em>VICE CITY</em>"),
    ("t5", S[5], S[6], "LANÇAMENTO"),
    ("t6", S[6], S[7], "VAI JOGAR <em>NO DIA 1?</em>"),
]
title_html, title_js = [], []
for tid, s, e, txt in TITLES:
    title_html.append(
        f'<div id="{tid}" class="clip title" data-start="{s}" data-duration="{e - s:.2f}" data-track-index="2">'
        f'<div id="{tid}i" class="titlei">{txt}</div></div>')
    if s > 0:
        title_js.append(f'tl.fromTo("#{tid}i",{{scale:0.6,opacity:0}},{{scale:1,opacity:1,duration:0.2,ease:"back.out(2)"}},{s});')

def pop(id_, s, e, cls, inner, extra=""):
    return (f'<div id="{id_}" class="clip {cls}" data-start="{s:.2f}" data-duration="{e - s:.2f}" data-track-index="4">'
            f'<div id="{id_}i" class="{cls.split()[0]}i" {extra}>{inner}</div></div>')

t_vice, t_leo, t_luc = at(4, "Vice"), at(4, "Leonida"), at(4, "Lucia")
t_19, t_ps, t_xb, t_pc, t_sem = at(5, "dezenove"), at(5, "PS5"), at(5, "Xbox"), at(5, "PC"), at(5, "Ainda")
t_200, t_475 = at(2, "duzentos"), at(3, "Quatrocentos")
t_com = at(6, "Comenta")

extra = [
    pop("big13", 0, S[1], "hero", '<span class="num">13</span><span class="unit">ANOS</span>'),
    pop("years", S[1] + 0.1, S[2], "years", '<span id="yr">2013</span>'),
    pop("bar", S[1] + 0.1, S[2], "bar", '<div class="track"><div id="fill" class="fill"></div></div><div class="ends"><span>2013</span><span>2026</span></div>'),
    pop("n200", t_200 - 0.1, S[3], "count", '<span id="c200">0</span> MI<small>+</small>'),
    pop("chip200", t_200 + 0.3, S[3], "chip", "de cópias vendidas"),
    pop("n475", t_475 - 0.1, S[4], "count", '<span id="c475">0</span> MI'),
    pop("chip475", t_475 + 0.3, S[4], "chip", "de views em 24 horas*"),
    pop("note475", t_475 + 0.3, S[4], "note", "*dado da Rockstar, somando todas as plataformas"),
    pop("vice", t_vice - 0.05, S[5], "tag", "VICE CITY", 'style="background:#ff2e88"'),
    pop("leo", t_leo - 0.05, S[5], "tag tagb", "ESTADO DE LEONIDA", 'style="background:#7b2ff7"'),
    pop("luc", t_luc - 0.05, S[5], "tag tagc", "LUCIA &amp; JASON", 'style="background:#00b8c4"'),
    pop("date", t_19 - 0.05, S[6], "date", '<span class="d">19</span><span class="m">NOV</span>'),
    pop("ps", t_ps - 0.05, S[6], "plat", "PS5"),
    pop("xb", t_xb - 0.05, S[6], "plat platb", "XBOX SERIES X|S"),
    pop("pc", t_pc - 0.05, S[6], "plat platc", "PC: <span id=\"pcq\">?</span>"),
    pop("com", t_com - 0.05, S[7], "cta", 'COMENTA AQUI <span class="arrow"></span>'),
]
extra_js = f"""
tl.fromTo("#big13i",{{scale:1.04}},{{scale:1.16,duration:{S[1]:.2f},ease:"none"}},0);
tl.fromTo("#yearsi",{{scale:0.6,opacity:0}},{{scale:1,opacity:1,duration:0.2,ease:"back.out(2)"}},{S[1] + 0.1});
tl.fromTo("#bari",{{y:30,opacity:0}},{{y:0,opacity:1,duration:0.2,ease:"power3.out"}},{S[1] + 0.1});
var yo={{v:2013}};
tl.fromTo(yo,{{v:2013}},{{v:2026,duration:2.4,ease:"power2.inOut",onUpdate:function(){{document.getElementById("yr").textContent=Math.round(yo.v);}}}},{S[1] + 0.4});
tl.fromTo("#fill",{{scaleX:0}},{{scaleX:1,duration:2.4,ease:"power2.inOut"}},{S[1] + 0.4});
tl.to("#yearsi",{{scale:1.2,color:"#3DF5FF",duration:0.12,yoyo:true,repeat:1}},{S[1] + 2.8});
tl.fromTo("#n200i",{{scale:0.5,opacity:0}},{{scale:1,opacity:1,duration:0.2,ease:"back.out(2)"}},{t_200 - 0.1:.2f});
var c2={{v:0}};
tl.fromTo(c2,{{v:0}},{{v:200,duration:1.0,ease:"power3.out",onUpdate:function(){{document.getElementById("c200").textContent=Math.round(c2.v);}}}},{t_200:.2f});
tl.fromTo("#chip200i",{{y:20,opacity:0}},{{y:0,opacity:1,duration:0.2}},{t_200 + 0.3:.2f});
tl.fromTo("#n475i",{{scale:0.5,opacity:0}},{{scale:1,opacity:1,duration:0.2,ease:"back.out(2)"}},{t_475 - 0.1:.2f});
var c4={{v:0}};
tl.fromTo(c4,{{v:0}},{{v:475,duration:1.6,ease:"power3.out",onUpdate:function(){{document.getElementById("c475").textContent=Math.round(c4.v);}}}},{t_475:.2f});
tl.to("#n475i",{{scale:1.15,duration:0.12,yoyo:true,repeat:1}},{t_475 + 1.6:.2f});
tl.fromTo("#chip475i",{{y:20,opacity:0}},{{y:0,opacity:1,duration:0.2}},{t_475 + 0.3:.2f});
tl.fromTo("#note475i",{{opacity:0}},{{opacity:1,duration:0.2}},{t_475 + 0.3:.2f});
tl.fromTo("#vicei",{{x:-700,rotation:-6}},{{x:0,rotation:-4,duration:0.25,ease:"back.out(1.6)"}},{t_vice - 0.05:.2f});
tl.fromTo("#leoi",{{x:700,rotation:4}},{{x:0,rotation:3,duration:0.25,ease:"back.out(1.6)"}},{t_leo - 0.05:.2f});
tl.fromTo("#luci",{{x:-700,rotation:-3}},{{x:0,rotation:-2,duration:0.25,ease:"back.out(1.6)"}},{t_luc - 0.05:.2f});
tl.fromTo("#datei",{{scale:2.2,opacity:0,rotation:-10}},{{scale:1,opacity:1,rotation:0,duration:0.25,ease:"back.out(2)"}},{t_19 - 0.05:.2f});
tl.fromTo("#psi",{{y:40,opacity:0}},{{y:0,opacity:1,duration:0.2,ease:"back.out(2)"}},{t_ps - 0.05:.2f});
tl.fromTo("#xbi",{{y:40,opacity:0}},{{y:0,opacity:1,duration:0.2,ease:"back.out(2)"}},{t_xb - 0.05:.2f});
tl.fromTo("#pci",{{y:40,opacity:0}},{{y:0,opacity:1,duration:0.2,ease:"back.out(2)"}},{t_pc - 0.05:.2f});
tl.set("#pcq",{{textContent:"SEM DATA"}},{t_sem - 0.02:.2f});
tl.to("#pci",{{scale:1.12,duration:0.1,yoyo:true,repeat:1}},{t_sem:.2f});
tl.fromTo("#comi",{{y:40,opacity:0}},{{y:0,opacity:1,duration:0.22,ease:"back.out(2)"}},{t_com - 0.05:.2f});
tl.to("#comi",{{y:10,duration:0.25,yoyo:true,repeat:3,ease:"sine.inOut"}},{t_com + 0.3:.2f});
"""

page = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="assets/lib/gsap.min.js"></script>
<style>
:root {{ --pink:#ff2e88; --cyan:#3DF5FF; --ink:#12002b; --font-display:"Archivo Black", sans-serif; }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
html, body {{ width:1080px; height:1920px; overflow:hidden; background:#1a0b3d; }}
#root {{ position:relative; width:1080px; height:1920px; font-family:var(--font-display); overflow:hidden; }}
#stage {{ position:absolute; inset:0; }}
#stage canvas {{ display:block; width:1080px; height:1920px; }}
.title {{ position:absolute; left:0; right:0; top:280px; display:flex; justify-content:center; z-index:10; }}
.titlei {{ text-align:center; color:#fff; font-size:76px; line-height:1.05; -webkit-text-stroke:14px var(--ink); paint-order:stroke fill; text-shadow:0 0 30px rgba(255,46,136,.8); }}
.titlei em {{ font-style:normal; color:var(--cyan); }}
.cap {{ position:absolute; left:130px; right:130px; top:1150px; display:flex; justify-content:center; z-index:12; }}
.capi {{ text-align:center; font-size:66px; line-height:1.1; color:#fff; -webkit-text-stroke:12px #000; paint-order:stroke fill; }}
.cw {{ display:inline-block; }}
.hero {{ position:absolute; left:0; right:0; top:430px; display:flex; justify-content:center; z-index:11; }}
.heroi {{ display:flex; flex-direction:column; align-items:center; }}
.hero .num {{ font-size:430px; line-height:0.9; color:#fff; -webkit-text-stroke:20px var(--ink); paint-order:stroke fill; text-shadow:0 0 60px var(--pink), 0 0 120px var(--pink); }}
.hero .unit {{ font-size:120px; color:var(--cyan); -webkit-text-stroke:14px var(--ink); paint-order:stroke fill; margin-top:-10px; }}
.years {{ position:absolute; left:0; right:0; top:520px; display:flex; justify-content:center; z-index:11; }}
.yearsi {{ font-size:230px; color:#fff; -webkit-text-stroke:18px var(--ink); paint-order:stroke fill; text-shadow:0 0 50px var(--pink); }}
.bar {{ position:absolute; left:170px; right:170px; top:820px; z-index:11; }}
.track {{ height:34px; border-radius:20px; background:rgba(18,0,43,.75); border:5px solid #fff; overflow:hidden; }}
.fill {{ height:100%; background:linear-gradient(90deg,var(--pink),var(--cyan)); transform-origin:left center; }}
.ends {{ display:flex; justify-content:space-between; color:#fff; font-size:40px; margin-top:10px; -webkit-text-stroke:8px var(--ink); paint-order:stroke fill; }}
.count {{ position:absolute; left:0; right:0; top:560px; display:flex; justify-content:center; z-index:11; }}
.counti {{ font-size:200px; color:#fff; -webkit-text-stroke:18px var(--ink); paint-order:stroke fill; text-shadow:0 0 50px var(--pink); }}
.counti small {{ font-size:140px; color:var(--cyan); }}
.chip {{ position:absolute; left:0; right:0; top:820px; display:flex; justify-content:center; z-index:11; }}
.chipi {{ background:var(--ink); color:#fff; font-size:48px; padding:14px 34px; border-radius:40px; border:4px solid var(--cyan); }}
.note {{ position:absolute; left:0; right:0; top:930px; display:flex; justify-content:center; z-index:11; }}
.notei {{ font-family:"Inter", sans-serif; font-weight:700; font-size:28px; color:#fff; background:rgba(18,0,43,.75); padding:6px 18px; border-radius:20px; }}
.tag {{ position:absolute; left:0; right:0; top:540px; display:flex; justify-content:center; z-index:11; }}
.tagb {{ top:690px; }} .tagc {{ top:840px; }}
.tagi {{ color:#fff; font-size:72px; padding:12px 36px; border-radius:18px; border:6px solid #fff; box-shadow:0 10px 0 rgba(0,0,0,.35); }}
.date {{ position:absolute; left:0; right:0; top:410px; display:flex; justify-content:center; z-index:11; }}
.datei {{ display:flex; flex-direction:column; align-items:center; background:#fff; border-radius:36px; padding:20px 70px 26px; border:10px solid var(--pink); box-shadow:0 0 60px var(--pink); }}
.date .d {{ font-size:230px; line-height:1; color:var(--ink); }}
.date .m {{ font-size:90px; color:var(--pink); margin-top:-8px; }}
.plat {{ position:absolute; left:0; right:0; top:800px; display:flex; justify-content:center; z-index:11; }}
.platb {{ top:895px; }} .platc {{ top:990px; }}
.plati {{ background:var(--ink); color:#fff; font-size:48px; padding:8px 30px; border-radius:18px; border:5px solid var(--cyan); }}
.platc .plati {{ border-color:#ff4d4d; color:#ff8080; }}
.cta {{ position:absolute; left:0; right:0; top:620px; display:flex; justify-content:center; z-index:11; }}
.ctai {{ display:flex; align-items:center; gap:22px; background:var(--pink); color:#fff; font-size:70px; padding:18px 44px; border-radius:24px; border:7px solid #fff; }}
.arrow {{ width:0; height:0; border-left:26px solid transparent; border-right:26px solid transparent; border-top:40px solid #fff; }}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">
  <div id="stage" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="0" data-track-kind="graphics"></div>
  {''.join(title_html)}
  {''.join(extra)}
  {''.join(cap_html)}
  <audio id="mix" src="assets/audio/mix.wav" data-start="0" data-duration="{TOTAL}" data-track-index="9"></audio>
</div>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(title_js)}
{extra_js}
{chr(10).join(cap_js)}
window.__timelines["main"] = tl;
tl.seek(0);
</script>
<script type="module" src="assets/scene.js"></script>
</body>
</html>
"""
open("index.html", "w").write(page)
json.dump(dict(S=S, t_200=t_200, t_475=t_475, t_19=t_19, t_vice=t_vice, t_leo=t_leo, t_luc=t_luc, t_ps=t_ps, t_xb=t_xb, t_pc=t_pc, t_com=t_com), open("work/cues.json", "w"))
print("ok", len(chunks), S)
