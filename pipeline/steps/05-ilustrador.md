---
agent: ilustrador
execution: inline
inputFile: posts/{slug}/brief.md
outputFile: posts/{slug}/assets/capa.jpg
model_tier: standard
skills:
  - image-ai-generator
---

# Geração de Imagens

Gere 2 imagens por post usando Gemini production:

## 1. Capa (capa.jpg) — mascote + cenário integrados

```bash
python skills/image-ai-generator/scripts/generate.py \
  --prompt "{PROMPT_COMPLETO}" \
  --output "posts/{slug}/assets/capa.jpg" \
  --mode production
```

Regras: mascote na metade inferior, terço superior livre, edge-to-edge, sem logos, sem texto.

## 2. Background (background.jpg) — cenário sem personagem

```bash
python skills/image-ai-generator/scripts/generate.py \
  --prompt "Dark cinematic environment, {CENARIO}. Deep black near #0a0414. Violet and cold blue accents. Very dark, for white text overlay. No characters, no text. Photorealistic, 8K. Vertical 1080x1350px." \
  --output "posts/{slug}/assets/background.jpg" \
  --mode production
```

## Output

```
posts/{slug}/assets/
├── capa.jpg        ← mascote + cenário (slide 1)
└── background.jpg  ← cenário escuro (slides 2-4)
```
