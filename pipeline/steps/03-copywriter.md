---
agent: copywriter
execution: inline
inputFile: posts/{slug}/brief.md
outputFile: posts/{slug}/copy.md
model_tier: powerful
---

# Copy Mensal — Carrossel Panorâmico

Com base nos briefs aprovados, escreva o copy dos 7 slides de cada post + legendas.

## Contexto do formato

O carrossel da SalvaTech é panorâmico contínuo — a imagem de fundo flui entre os slides. O copy precisa ser mais enxuto que um carrossel tradicional porque a imagem carrega peso visual. Menos texto = mais impacto.

## Processo

1. Leia o planejamento mensal em `posts/planejamento-{MES}.md`
2. Para cada post (8 no total), leia o brief em `posts/{slug}/brief.md`
3. Gere o copy seguindo o arco narrativo: gancho → tensão → virada → ação
4. Salve em `posts/{slug}/copy.md`
5. Gere as legendas (Instagram, LinkedIn, TikTok)
6. Salve em `posts/{slug}/legenda.md`

## Regras

- Máximo 20 palavras por slide (panorâmico pede menos texto)
- ZONA_SUB da capa: máx 8 palavras
- ZONA_BODY dos internos: máx 15 palavras, ou OMITIR se headline basta
- NÃO usar travessão (—)
- Linguagem direta, tom de dev sênior explicando pro CEO

## Formato de saída — copy.md

```
[SLIDE 01 — CAPA]
ZONA_LABEL:              [2–3 palavras em caps]
ZONA_HEADLINE_L1 (branco): [impacto]
ZONA_HEADLINE_L2 (roxo):   [complemento]
ZONA_SUB:                [máx 8 palavras, provocação]

[SLIDE 02]
ZONA_LABEL:    01
ZONA_HEADLINE: [4–7 palavras]
ZONA_BODY:     [1 frase, máx 15 palavras — ou omitir]

[SLIDE 03]
ZONA_LABEL:    02
ZONA_HEADLINE: ...
ZONA_BODY:     ...

[SLIDE 04]
ZONA_LABEL:    03
ZONA_HEADLINE: ...
ZONA_BODY:     ...

[SLIDE 05]
ZONA_LABEL:    04
ZONA_HEADLINE: ...
ZONA_BODY:     ...

[SLIDE 06]
ZONA_LABEL:    05
ZONA_HEADLINE: ...
ZONA_BODY:     ...

[SLIDE 07 — CTA]
ZONA_HEADLINE_L1 (branco):  ...
ZONA_HEADLINE_L2 (roxo):    ...
ZONA_BODY:     [benefício imediato]
ZONA_CTA:      [ação curta]
```

## Formato de saída — legenda.md

```
[LEGENDA — INSTAGRAM]
[gancho na primeira linha]
[texto complementar]
[CTA]
[hashtags]

[LEGENDA — LINKEDIN]
[tom profissional]
[contexto]
[pergunta final]

[LEGENDA — TIKTOK]
[máx 300 chars]
[hashtags]
```
