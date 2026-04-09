---
agent: ilustrador
execution: inline
inputFile: posts/{slug}/brief.md
outputFile: posts/{slug}/assets/mascote.png
model_tier: standard
skills:
  - image-ai-generator
---

# Geração de Imagens — Carrossel Panorâmico

O carrossel da SalvaTech usa composição em camadas: mascote separado + cenário panorâmico largo. As duas imagens são compostas e fatiadas em slides pelo script `compose-panorama.py`.

## O que gerar

### 1. Mascote (`mascote.png`)

Construa o prompt seguindo o agent `agents/ilustrador.agent.md`:
- Fundo escuro sólido (near black), SEM cenário complexo
- Corpo visível (full body ou three-quarter)
- Traje branco liso, sem logos
- Iluminação dramática direcional

```bash
python skills/image-ai-generator/scripts/generate.py \
  --prompt "{PROMPT_MASCOTE}" \
  --output "posts/{slug}/assets/mascote.png" \
  --mode test
```

### 2. Cenário panorâmico (`panorama-bg.jpg`)

Imagem ultra-wide SEM personagem, conectada ao tema:

```bash
python skills/image-ai-generator/scripts/generate.py \
  --prompt "Ultra-wide panoramic scene, {DESCRICAO_AMBIENTE}. {ILUMINACAO}. No characters, no people, no animals — environment only. The scene extends horizontally with visual interest distributed across the entire width. Base color very dark near black, with violet and cold blue accent lighting. Photorealistic, cinematic, 8K. No text. Ultra-wide panoramic format." \
  --output "posts/{slug}/assets/panorama-bg.jpg" \
  --mode test
```

### 3. Composição + fatiamento

Após gerar as 2 imagens, componha e fatie:

```bash
python pipeline/compose-panorama.py \
  --background "posts/{slug}/assets/panorama-bg.jpg" \
  --character "posts/{slug}/assets/mascote.png" \
  --output-dir "posts/{slug}/assets/slices" \
  --slides 7 \
  --char-position 0 \
  --char-scale 0.85
```

Opções de `--char-position` (em qual slide o mascote aparece):
- `0` = slide 1 (capa) — padrão
- `3` = slide 4 (centro do carrossel)
- `6` = slide 7 (último slide)

## Output esperado

```
posts/{slug}/assets/
├── mascote.png          ← mascote com fundo escuro
├── panorama-bg.jpg      ← cenário panorâmico ultra-wide
├── panorama-full.jpg    ← composição completa (mascote + cenário)
└── slices/
    ├── slice-01.jpg     ← fatia do slide 1 (com mascote se char-position=0)
    ├── slice-02.jpg
    ├── slice-03.jpg
    ├── slice-04.jpg
    ├── slice-05.jpg
    ├── slice-06.jpg
    └── slice-07.jpg
```

## Veto Conditions

- Mascote tem cenário complexo atrás (não é fundo escuro sólido) → regerar
- Mascote tem logos no traje → regerar
- Cenário panorâmico tem personagem/pessoa/animal → regerar
- Cenário não é wide o suficiente (precisa ser pelo menos 5x mais largo que alto) → regerar
- Iluminação do mascote e cenário são inconsistentes → regerar um deles
- Slices não foram geradas → rodar compose-panorama.py
