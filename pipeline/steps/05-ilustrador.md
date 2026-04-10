---
agent: ilustrador
execution: inline
inputFile: clients/{CLIENT}/posts/{slug}/brief.md
outputFile: clients/{CLIENT}/posts/{slug}/assets/capa.jpg
model_tier: standard
skills:
  - image-ai-generator
---

# Geração de Imagens

Leia o config do cliente ativo em `clients/{CLIENT}/config.yaml` antes de começar.
Use os campos `image_strategy`, `mascot_prompt`, `visual`, e `agent_profiles.ilustrador` do config.

Gere imagens conforme a estratégia de imagem do cliente (`image_strategy`):
- `mascote-ia`: Use o `mascot_prompt` do config como base
- `imagem-ia`: Gere imagens conceituais seguindo o estilo do config
- `fotos`: Selecione de `clients/{CLIENT}/assets/photos/`
- `mix`: Siga regras por tipo de slide do config

## 1. Capa (capa.jpg) — imagem principal

```bash
python skills/image-ai-generator/scripts/generate.py \
  --prompt "{PROMPT_COMPLETO}" \
  --output "clients/{CLIENT}/posts/{slug}/assets/capa.jpg" \
  --mode production
```

Regras: leia `agent_profiles.ilustrador.regras` do config. Integre bordas com a cor `visual.background` do config.

## 2. Background (background.jpg) — cenário sem personagem

```bash
python skills/image-ai-generator/scripts/generate.py \
  --prompt "Dark cinematic environment, {CENARIO}. Deep black near {BACKGROUND_COLOR}. {PRIMARY_COLOR} and cold blue accents. Very dark, for white text overlay. No characters, no text. Photorealistic, 8K. Vertical 1080x1350px." \
  --output "clients/{CLIENT}/posts/{slug}/assets/background.jpg" \
  --mode production
```

> Substitua `{BACKGROUND_COLOR}` e `{PRIMARY_COLOR}` pelos valores de `visual.background` e `visual.primary` do config.yaml.

## Output

```
clients/{CLIENT}/posts/{slug}/assets/
├── capa.jpg        ← imagem principal (slide 1)
└── background.jpg  ← cenário escuro (slides internos)
```
