"""Série em 2 partes: contagem regressiva pro GTA 6 (parte 1) e a maratona no sofá (parte 2).
Uso: python3 compras_serie.py 1   |   python3 compras_serie.py 2
"""
import sys, os, shutil, json; sys.path.insert(0, "common")
from engine import Video, HERE

PART = int(sys.argv[1]) if len(sys.argv) > 1 else 1
if PART == 1:
    LINES = [
        "Faltam vinte e quatro horas pro GTA 6. E ele já tem um plano.",
        "Primeira missão: supermercado. Pizza, refrigerante, salgadinho, pipoca... e mais pizza!",
        "Carrinho lotado. Agora é só esperar o relógio zerar.",
        "Três.",
        "Dois.",
        "Um.",
        "Mas será que ele aguenta o que vem depois?",
    ]
    GAPS = [0, 0.35, 0.35, 0.45, 0.35, 0.35, 0.6]
    V = Video("compras1", LINES, GAPS, hi="#FFD84D", next_part=2)
else:
    LINES = [
        "Parte dois. Vinte e quatro horas de espera, e finalmente...",
        "LANÇOU!",
        "Play 5 ligado, sofá, comida do lado. Ele só levanta quando zerar o GTA 6 inteiro.",
        "Dia um.",
        "Dia dois.",
        "Alguém avisa a família dele?",
        "E você, já fez o seu estoque pro GTA 6? Comenta aí!",
    ]
    GAPS = [0, 0.4, 0.5, 0.4, 0.35, 0.35, 0.45]
    V = Video("compras2", LINES, GAPS, hi="#FFD84D")
shutil.copy(os.path.join(HERE, "scene_compras.js"), os.path.join(V.dir, "assets", "scene.js"))
E = V.scene_end
at = V.at
END = len(LINES)  # index of the final (follow / like) line

if PART == 1:
    t_launch = V.total + 60
    P = dict(L1=V.L(1), L2=V.L(2), L3=V.L(3), launch=t_launch, L4=t_launch + 1, L5=t_launch + 2, day1=t_launch + 2, day2=t_launch + 3,
             L6=t_launch + 4, like=V.L(END), total=V.total, tres=V.L(3), dois=V.L(4), um=V.L(5))
    drops = [(at(1, "Pizza"), "pizza"), (at(1, "refrigerante"), "soda"), (at(1, "salgadinho"), "chips"), (at(1, "pipoca"), "popcorn"), (at(1, "pizza"), "pizza")]
    extra = ["can6", "chips2", "soda2", "pizza", "chips", "can6", "soda", "popcorn", "chips2"]
    a, b = at(1, "pizza") + 0.45, V.L(3) - 1.2
    for k, kind in enumerate(extra):
        drops.append((a + (b - a) * k / (len(extra) - 1), kind))
    for t, _ in drops:
        V.cue("pop", t + 0.5)
    cd = [(0, 86400), (V.L(1), 80000), (V.L(2), 30000), (P["tres"] - 0.25, 4), (P["tres"], 3), (P["dois"], 2), (P["um"], 1), (t_launch, 0)]
    play = [(t_launch, 0), (t_launch + 1, 1)]
else:
    t_launch = V.L(1)
    P = dict(L1=-9, L2=-8, L3=-1, launch=t_launch, L4=V.L(2), L5=V.L(3), day1=V.L(3), day2=V.L(4),
             L6=V.L(6), like=V.L(END), total=V.total, tres=-3, dois=-2, um=-1)
    drops = []
    cd = [(0, 1), (t_launch - 0.01, 1), (t_launch, 0)]
    play = [(t_launch, 0), (V.L(3), 5 * 3600), (P["day1"], 24 * 3600), (P["day2"], 48 * 3600), (V.L(6), 52 * 3600), (V.total, 55 * 3600)]
V.cfg.update(P=P, drops=drops, px=0.75, play=play)

# ---- overlays ----
V.raw('<style>'
      '.cap{top:1420px !important}'
      '.cd{position:absolute;left:0;right:0;top:250px;display:flex;flex-direction:column;align-items:center;z-index:9;gap:6px}'
      '.cd .lab{font-family:Inter,sans-serif;font-weight:900;font-size:34px;letter-spacing:8px;color:#12002b;background:#ffd84d;padding:6px 22px;border-radius:10px}'
      '.cd .clock{font-size:118px;line-height:1;color:#fff;-webkit-text-stroke:14px #12002b;paint-order:stroke fill;text-shadow:0 0 40px rgba(255,46,136,.9);font-variant-numeric:tabular-nums;letter-spacing:2px}'
      '.cd .sub{font-size:40px;color:#3DF5FF;-webkit-text-stroke:9px #12002b;paint-order:stroke fill}'
      '.vig{position:absolute;inset:0;z-index:1;background:radial-gradient(ellipse at 50% 45%,transparent 58%,rgba(8,0,24,.55) 100%)}'
      '</style>')
V.raw(f'<div id="vig" class="clip vig" data-start="0" data-duration="{V.total}" data-track-index="1"></div>')
V.raw(f'<div id="cd" class="clip cd" data-start="0" data-duration="{P["like"] - 0.1:.2f}" data-track-index="6">'
      '<div id="cdl" class="lab">FALTAM</div><div id="cdc" class="clock">24:00:00</div><div id="cds" class="sub">PRO GTA 6 LANÇAR</div></div>')
V.js.append(f'''
(function(){{
  var CD={json.dumps(cd)}, PL={json.dumps(play)}, TL={t_launch:.3f};
  function lerp(K,t){{ if(t<=K[0][0]) return K[0][1]; for(var i=1;i<K.length;i++){{ if(t<=K[i][0]){{ var a=K[i-1],b=K[i]; var u=(t-a[0])/Math.max(1e-6,b[0]-a[0]); return a[1]+(b[1]-a[1])*u; }} }} return K[K.length-1][1]; }}
  function fmt(s){{ s=Math.max(0,Math.floor(s)); var h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return (h<10?"0":"")+h+":"+(m<10?"0":"")+m+":"+(x<10?"0":"")+x; }}
  var o={{t:0}};
  tl.fromTo(o,{{t:0}},{{t:{V.total},duration:{V.total},ease:"none",onUpdate:function(){{
    var t=o.t, c=document.getElementById("cdc"), l=document.getElementById("cdl"), s=document.getElementById("cds");
    if(t<TL){{ c.textContent=fmt(Math.ceil(lerp(CD,t))); l.textContent="FALTAM"; s.textContent="PRO GTA 6 LANÇAR"; c.style.color="#fff"; }}
    else {{ c.textContent=fmt(lerp(PL,t)); l.textContent="JOGANDO HÁ"; s.textContent="SEM PARAR 🎮"; c.style.color="#3DF5FF"; }}
  }}}},0);
}})();''')

if PART == 1:
    for key in ["tres", "dois", "um"]:
        V.js.append(f'tl.fromTo("#cdc",{{scale:1}},{{scale:1.18,duration:0.12,yoyo:true,repeat:1}},{P[key]:.2f});')

if PART == 1:
    V.item(V.at(6, "aguenta") - 0.05, E(6), 1150, "E AGORA? 😱", cls="tag", anim="stamp", style="background:#e63946;font-size:80px", cue="stamp")
    for k in [3, 4, 5]:
        V.cue("stamp", V.L(k))
    for t in [V.L(1), V.L(2), V.L(3)]:
        V.cue("whoosh", t - 0.2)
    V.cue("riser", V.L(6) - 0.2, 0.8)
else:
    V.item(t_launch - 0.05, V.L(2) - 0.1, 560, "LANÇOU!", cls="hero", anim="stamp", style="font-size:200px", cue="boom")
    V.item(P["day1"] - 0.05, P["day2"] - 0.1, 600, "DIA 1", cls="tag", anim="stamp", style="background:#2b6cb0;font-size:80px", cue="stamp")
    V.item(P["day2"] - 0.05, V.L(6) - 0.1, 600, "DIA 2", cls="tag", anim="stamp", style="background:#e63946;font-size:80px", cue="stamp")
    V.item(V.at(6, "estoque") - 0.05, E(6), 1180, "💬 COMENTA AÍ!", cls="cta", anim="pop", cue="pop")
    V.cue("riser", t_launch - 0.7, 0.7)
    for t in [V.L(2), V.L(3), V.L(6)]:
        V.cue("whoosh", t - 0.2)
V.cue("boom", 0)

V.write(f"GTA 6 · PARTE {PART}/2")
