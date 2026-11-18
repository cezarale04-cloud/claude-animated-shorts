import asyncio, edge_tts, json, subprocess, sys, ssl
import edge_tts.communicate as _c
_c._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
LINES = [
 "Treze anos.",
 "Esse foi o tempo de espera entre o GTA 5 e o GTA 6.",
 "O 5 já vendeu mais de duzentos milhões de cópias.",
 "E o segundo trailer do 6? Quatrocentos e setenta e cinco milhões de visualizações em um dia.",
 "Agora a gente volta pra Vice City, no estado de Leonida, com Lucia e Jason.",
 "Lançamento: dezenove de novembro, no PS5 e no Xbox Series. E no PC? Ainda sem data.",
 "E aí, vai jogar no primeiro dia? Comenta aqui.",
]
VOICE="pt-BR-AntonioNeural"
async def one(i, text):
    c = edge_tts.Communicate(text, VOICE, rate="+15%", boundary="WordBoundary")
    words=[]; audio=b""
    async for ch in c.stream():
        if ch["type"]=="audio": audio+=ch["data"]
        elif ch["type"]=="WordBoundary":
            words.append(dict(w=ch["text"], s=ch["offset"]/1e7, d=ch["duration"]/1e7))
    open(f"work/l{i}.mp3","wb").write(audio)
    dur=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f"work/l{i}.mp3"]))
    return dict(text=text, words=words, dur=dur)
async def main():
    out=[await one(i,t) for i,t in enumerate(LINES)]
    json.dump(out, open("work/lines.json","w"), ensure_ascii=False, indent=1)
    for i,o in enumerate(out): print(i, round(o["dur"],2), len(o["words"]), o["words"][-1] if o["words"] else None)
asyncio.run(main())
