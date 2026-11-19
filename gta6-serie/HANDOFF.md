# Série GTA 6: passagem de sessão

Tudo que foi feito na conversa sobre GTA 6, para continuar numa nova sessão.
O usuário fala **português do Brasil**: responda sempre em português.

## Quem é o usuário

- Canal "Planeta do Conhecimento": YouTube **@C3dstudiofigure** (10 inscritos, Shorts de "por que é assim?" em 3D low-poly) e Instagram **@c3d_studio_figure** (8 seguidores).
- Os Shorts de engenharia funcionam melhor (700 a 1,3 mil views). Temas fora do nicho (pão, dinossauro) quase não tiveram views.
- Objetivo agora: viralizar com conteúdo de **GTA 6**, ganhar views, likes e seguidores.

## O que já foi entregue

| Vídeo | Pasta | Voz | Duração |
|---|---|---|---|
| Clipe único "13 anos de espera" | `clip-unico/` | pt-BR-AntonioNeural | 31 s |
| Parte 1: O que mudou do GTA 5 pro 6 | `p1/` (`p1.py`) | pt-BR-AntonioNeural | ~57 s |
| Parte 2: O mundo vivo (animais, furacão, regiões) | `p2/` | pt-BR-AntonioNeural | ~44 s |
| Parte 3: Recordes e curiosidades | `p3/` | pt-BR-AntonioNeural | ~46 s |
| Parte 4: Lançamento (horário, 212 GB, preço, adiamentos, online) | `p4/` | en-US-BrianMultilingualNeural | ~52 s |
| Parte 5: Quem são Jason e Lucia | `p5/` | pt-BR-FranciscaNeural | ~46 s |
| Parte 6: Personagens secundários | `p6/` | en-AU-WilliamMultilingualNeural | ~50 s |
| Parte 7: Tour pelas 6 regiões de Leonida | `p7/` | pt-BR-ThalitaMultilingualNeural | ~42 s |
| Parte 8: Bastidores (trailer no PS5, músicas, vazamentos) | `p8/` | en-US-AvaMultilingualNeural | ~46 s |

- Todas as partes terminam com a cena **"CURTE E SEGUE!"**: a voz diz "Curte esse vídeo, deixa o seu like e segue o perfil pra não perder nada!" e aparecem os botões CURTE / DEIXA SEU LIKE / + SEGUIR. Isso é automático em `common/engine.py` (`LIKE_LINE` e `like_scene()`).
- Os MP4 finais ficaram na sessão anterior e **não estão no git**. Para tê-los de novo, renderize (veja abaixo).
- A voz `fr-FR-RemyMultilingualNeural` falha no servidor de voz. Não use.

## Como gerar e renderizar

Requisitos: `pip install edge-tts numpy`, ffmpeg, Node e `npx hyperframes` (0.9.65).
O host `speech.platform.bing.com` precisa estar liberado na rede do ambiente, e o edge-tts usa o CA do proxy (já configurado em `common/engine.py`).

```bash
cd gta6-serie
python3 p4.py                 # gera narração, legendas, index.html e a mixagem de áudio em p4/
cd p4 && npx hyperframes snapshot --frames 9 --no-end -o work/snap   # conferir quadros
npx hyperframes render -o ../renders/gta6-parte-4.mp4 --quality delivery
```

- `common/engine.py`: narração (edge-tts com marcação de palavras), linha do tempo, legendas palavra por palavra, itens na tela, câmeras, sons e mixagem (música synthwave procedural mais efeitos).
- `common/scene.js`: cenário 3D neon em Three.js (pôr do sol listrado, mar com grade, estrada, palmeiras, prédios com janelas neon, flamingos, jacaré, tempestade com chuva e raios). Biblioteca de câmeras: rush, rushBack, side, city, crane, aerial, road, beach, gator, sea, top, storm, orbit.
- `common/style.css`: estilos dos textos (title, tag, chip, big, hero, cta, vs, mapcmp, phone, trophy, heart).
- Cada `pN.py` define as falas (LINES), a voz e o que aparece em cada cena.
- Para conferir a pronúncia, use faster-whisper (modelo "small", baixado do huggingface.co), passando o áudio como array numpy em 16 kHz.

## Regras que seguimos

- Não usar logo, imagens, personagens ou música da Rockstar. Só cenário próprio e texto.
- Só fatos confirmados pela Rockstar ou pela Game Informer (set/2026). Números da Rockstar aparecem com "segundo a Rockstar" na tela. Nada de boatos (preço do Brasil, sistema de procurado etc.).
- Gancho no primeiro quadro, legenda grande, texto dentro da área segura (entre 168 e 1330 px de altura), "PARTE N" no topo e chamada para a próxima parte no fim.
- **Pedido do usuário (19/11/2026): todo vídeo novo para publicar sai dividido em 2 ou 3 partes**, para a pessoa voltar ao perfil e seguir. Cada parte tem "PARTE N/M" no topo, termina num gancho ("o que acontece depois?") e pede para seguir para ver a próxima. A última parte fecha a história e pede curtir e seguir. Cada parte tem sua própria descrição, e a descrição avisa que é uma série.

## Outros vídeos já entregues (fora da série de 8)

- `compras.py`: contagem regressiva, supermercado e maratona no sofá (personagem 3D, `common/scene_compras.js`). Descrição em `DESCRICAO-CONTAGEM.md`.
- `crescer.py`: "GTA 6 é a chance de crescer na internet com o Claude". Descrição em `DESCRICAO-CRESCER.md`.
- `longo.py`: vídeo de 10 min para YouTube (16:9, `common/engine_wide.py`). Pausado a pedido do usuário; o render é lento (cerca de 1 quadro por segundo). Descrição e capitulos em `DESCRICAO-LONGO.md`.

## Fatos usados (com fonte)

- **Lançamento:** 19/11/2026, à meia-noite no horário local de cada país; PS5 e Xbox Series X|S; PC sem data.
- **Tamanho:** até 212 GB, segundo a Rockstar. O download antecipado começou em 10/11.
- **Preço lá fora:** US$ 79,99 (Padrão) e US$ 99,99 (Ultimate).
- **Adiamentos:** era para 2025, depois maio de 2026 (adiado em 2/5/2025), e agora 19/11/2026 (adiado em 6/11/2025).
- **Online:** não vem no lançamento e ainda não tem data.
- **Jason:** cresceu entre golpistas e bandidos, passou pelo Exército e trabalha para traficantes em Leonida Keys.
- **Lucia:** aprendeu a lutar com o pai, foi presa na penitenciária de Leonida lutando pela família, saiu por sorte e agora promete "só jogadas inteligentes". Dá para trocar entre os dois personagens.
- **Personagens secundários:** Cal Hampton (amigo conspiracionista), Brian Heder (veterano do tráfico, deixa o Jason morar num imóvel dele), Boobie Ike (lenda de Vice City: clube, imóveis, estúdio), Dre'Quan Priest (empresário da música), Real Dimez (dupla de rap), Raul Bautista (assaltante de bancos).
- **Regiões:** Vice City, Leonida Keys, Grassrivers (Everglades), Port Gellhorn, Ambrosia, Mount Kalaga.
- **Mundo:** mapa de cerca de 2x o GTA 5 (Aaron Garbut); mais de 170 espécies de animais; furacões; mais interiores que qualquer GTA (Game Informer, set/2026).
- **Recordes:** trailer 1 com 90 milhões de views no YouTube em 24 h (recorde Guinness); trailer 2 com 475 milhões em 24 h em todas as plataformas (Rockstar). GTA 5 com mais de 200 milhões de cópias em 3 gerações. 13 anos de espera.
- **Bastidores:** trailer 2 gravado inteiro no PS5 (metade gameplay); músicas "Love Is a Long Road" (Tom Petty, trailer 1) e "Hot Together" (Pointer Sisters, trailer 2); trailer 1 lançado mais cedo por vazamento; vazamento de 2022 de uma versão antiga; anúncio oficial em fevereiro de 2022.

## Plano de postagem

- Uma parte por dia, das 18h às 21h, na ordem 1 a 8.
- No YouTube, ligar cada Short à próxima parte em "Vídeo relacionado".
- Comentário fixado: "Qual parte você quer que eu faça a seguir? 👇"
- No Instagram, juntar tudo num destaque/coleção "GTA 6".
- Capa: o primeiro quadro de cada vídeo.

As descrições prontas de YouTube e Instagram das 8 partes estão em `DESCRICOES.md`.
