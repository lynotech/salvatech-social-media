---
agent: copywriter
execution: inline
inputFile: posts/{slug}/brief.md
outputFile: posts/{slug}/copy.md
model_tier: powerful
---

# Copy Mensal — 4 Slides Panorâmicos

Gere o copy de cada post com 4 slides + legendas.

## Formato: 4 slides

```
Slide 01 (CAPA)  → Gancho — para o scroll
Slide 02         → Problema — apresenta a dor
Slide 03         → Solução — mostra o caminho
Slide 04 (CTA)   → Ação — o que fazer agora
```

## Regras

- Máximo 15 palavras por slide
- ZONA_SUB da capa: máx 8 palavras
- ZONA_BODY dos internos: 2–3 frases, máx 30 palavras. Desenvolva o ponto.
- NÃO usar travessão (—)

## Formato — copy.md

```
[SLIDE 01 — CAPA]
ZONA_LABEL:              [2–3 palavras caps]
ZONA_HEADLINE_L1 (branco): [3–5 palavras]
ZONA_HEADLINE_L2 (roxo):   [2–4 palavras]
ZONA_SUB:                [máx 8 palavras]

[SLIDE 02]
ZONA_LABEL:    01
ZONA_HEADLINE: [4–6 palavras]
ZONA_BODY:     [máx 12 palavras ou omitir]

[SLIDE 03]
ZONA_LABEL:    02
ZONA_HEADLINE: [4–6 palavras]
ZONA_BODY:     [máx 12 palavras ou omitir]

[SLIDE 04 — CTA]
ZONA_HEADLINE_L1 (branco):  ...
ZONA_HEADLINE_L2 (roxo):    ...
ZONA_BODY:     [benefício]
ZONA_CTA:      [ação curta]
```

## Formato — legenda.md

```
[LEGENDA — INSTAGRAM]
[gancho + texto + CTA + hashtags]

[LEGENDA — LINKEDIN]
[tom profissional + pergunta final]

[LEGENDA — TIKTOK]
[máx 300 chars + hashtags]
```
