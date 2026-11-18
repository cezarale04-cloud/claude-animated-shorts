import json, subprocess
L=json.load(open("work/lines.json"))
GAP=[0.0,0.5,0.3,0.3,0.35,0.35,0.4]
t=0.15; tl=[]; parts=[]
for i,l in enumerate(L):
    s0=max(0,l["words"][0]["s"]-0.05); e=l["words"][-1]["s"]+l["words"][-1]["d"]+0.12
    t+=GAP[i]
    subprocess.run(["ffmpeg","-y","-v","error","-i",f"work/l{i}.mp3","-ss",str(s0),"-to",str(e),"-ar","48000","-ac","1",f"work/t{i}.wav"],check=True)
    words=[dict(w=w["w"],s=round(t+w["s"]-s0,3),e=round(t+w["s"]-s0+w["d"],3)) for w in l["words"]]
    tl.append(dict(i=i,start=round(t,3),end=round(t+e-s0,3),text=l["text"],words=words))
    t+=e-s0
total=t+0.6
json.dump(dict(total=round(total,2),lines=tl),open("work/timeline.json","w"),ensure_ascii=False,indent=1)
# build voice track by placing with adelay
inputs=[];flt=[]
for i,x in enumerate(tl):
    inputs+=["-i",f"work/t{i}.wav"]; d=int(x["start"]*1000); flt.append(f"[{i}]adelay={d}|{d}[a{i}]")
flt.append("".join(f"[a{i}]" for i in range(len(tl)))+f"amix=inputs={len(tl)}:normalize=0,apad,atrim=0:{total}[o]")
subprocess.run(["ffmpeg","-y","-v","error",*inputs,"-filter_complex",";".join(flt),"-map","[o]","-ar","48000","work/voice.wav"],check=True)
for x in tl: print(x["i"],x["start"],x["end"],x["text"])
print("total",total)
