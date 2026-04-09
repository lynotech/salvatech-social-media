---
agent: copywriter
execution: inline
model_tier: powerful
---

# Copy Mensal — Todos os 8 Posts

Com base nos briefs aprovados, escreva o copy completo dos 7 slides de **cada post do mês**, estruturado por zonas visuais.

## Processo

1. Leia o planejamento mensal em `posts/planejamento-{MES}.md`
2. Para cada post (8 no total), leia o brief em `posts/{slug}/brief.md`
3. Gere o copy estruturado por zonas
4. Salve em `posts/{slug}/copy.md`

## Regras

- Máximo 25 palavras por slide
- Linguagem direta — foco na dor real do empresário B2B
- Cada slide precisa de micro-tensão ou micro-ganho que force o próximo
- ZONA_SUB da capa: máx 10 palavras, 1 linha
- NÃO usar travessão (—) nos textos

## Formato obrigatório de saída (1 arquivo por post)

```
[SLIDE 01 — CAPA]
ZONA_LABEL:              [2–4 palavras em caps — contexto]
ZONA_HEADLINE_L1 (branco): [palavras de impacto]
ZONA_HEADLINE_L2 (roxo):   [complemento ou palavra-chave]
ZONA_SUB:                [1 linha, máx 10 palavras, gancho/provocação]

[SLIDE 02]
ZONA_LABEL:    SINAL 01
ZONA_HEADLINE: [título do ponto — 4–8 palavras]
ZONA_BODY:     [1–2 frases, máx 20 palavras total]

[SLIDE 03]
ZONA_LABEL:    SINAL 02
ZONA_HEADLINE: ...
ZONA_BODY:     ...

[SLIDE 04]
ZONA_LABEL:    SINAL 03
ZONA_HEADLINE: ...
ZONA_BODY:     ...

[SLIDE 05]
ZONA_LABEL:    SINAL 04
ZONA_HEADLINE: ...
ZONA_BODY:     ...

[SLIDE 06]
ZONA_LABEL:    SINAL 05
ZONA_HEADLINE: ...
ZONA_BODY:     ...

[SLIDE 07 — CTA]
ZONA_HEADLINE_L1 (branco):  ...
ZONA_HEADLINE_L2 (roxo):    ...
ZONA_BODY:     [benefício imediato — 1 frase]
ZONA_CTA:      [ação específica]
```

Além do copy dos slides, gere também a legenda do post e salve em `posts/{slug}/legenda.md`:

```
[LEGENDA — INSTAGRAM]
[texto da legenda para Instagram — máx 2200 caracteres]
[incluir hashtags relevantes — 15 a 20 hashtags]
[incluir CTA no final]

[LEGENDA — LINKEDIN]
[texto adaptado para LinkedIn — tom mais profissional]
[sem hashtags excessivas — máx 5]
[incluir pergunta para gerar comentários]

[LEGENDA — TIKTOK]
[texto curto e direto — máx 300 caracteres]
[hashtags de descoberta — 5 a 8]
```

### Regras da legenda

- A legenda deve complementar o carrossel, não repetir o que já está nos slides
- Primeira linha = gancho forte (aparece antes do "ver mais")
- Instagram: usar emojis com moderação, quebras de linha pra respirar
- LinkedIn: tom mais analítico, pode ser mais longo, sem emojis
- TikTok: direto ao ponto, linguagem jovem
- Todas devem ter CTA alinhado com o slide 07
