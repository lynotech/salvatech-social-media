---
agent: copywriter
execution: inline
inputFile: clients/{CLIENT}/posts/{slug}/brief.md
outputFile: clients/{CLIENT}/posts/{slug}/copy.md
model_tier: powerful
---

# Copy — Slides do Carrossel

Leia o config do cliente ativo em `clients/{CLIENT}/config.yaml` antes de começar.
Use os campos `agent_profiles.copywriter` (tom, slides, estrutura, regras) e `channels` do config.

Gere o copy de cada post conforme a quantidade de slides definida em `agent_profiles.copywriter.slides`.

## Formato: slides

A estrutura narrativa vem de `agent_profiles.copywriter.estrutura` do config.yaml.

Exemplo (4 slides — SalvaTech):
```
Slide 01 (CAPA)  → Gancho — para o scroll
Slide 02         → Problema — apresenta a dor
Slide 03         → Solução — mostra o caminho
Slide 04 (CTA)   → Ação — o que fazer agora
```

## Regras

Leia as regras de `agent_profiles.copywriter.regras` do config.yaml. Exemplo (SalvaTech):
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

Gere legendas apenas pros canais definidos em `channels` do `clients/{CLIENT}/config.yaml`.

```
[LEGENDA — INSTAGRAM]
[gancho + texto + CTA + hashtags]

[LEGENDA — LINKEDIN]
[tom profissional + pergunta final]

[LEGENDA — TIKTOK]
[máx 300 chars + hashtags]
```
