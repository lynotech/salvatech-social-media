---
agent: estrategista
execution: inline
outputFile: posts/planejamento-{MES}.md
model_tier: powerful
---

# Planejamento Mensal — Pesquisa e Definição de Temas

Empresa: SalvaTech — software house especializada em tecnologia, IA e automação para empresas B2B brasileiras.
Mascote: chimpanzé astronauta. Paleta: dark (#0a0414) + roxo (#9755FF).
Objetivo: construir autoridade no Instagram, LinkedIn e TikTok. Gerar salvamentos e engajamento.
Formato: 7 slides por post (capa + 5 pontos + CTA). Dimensão: 1080x1350px.

## Calendário de posts

```
Semana 1:  Quarta (Instagram+TikTok) + Sexta (Instagram+TikTok)
Semana 2:  Segunda (LinkedIn) + Quarta (Instagram+TikTok)
Semana 3:  Quarta (Instagram+TikTok) + Sexta (Instagram+TikTok)
Semana 4:  Segunda (LinkedIn) + Quarta (Instagram+TikTok)
= 8 posts por mês
```

## Sua missão

1. Consulte `_memory/runs.md` para NÃO repetir temas dos últimos 30 dias
2. Use a skill `apify` para pesquisar tendências reais do mercado:
   - Tendências de IA e automação para PMEs brasileiras (últimos 30 dias)
   - Dores de empresários B2B com tecnologia e sistemas
   - O que está gerando engajamento no LinkedIn BR no nicho de tech/gestão
   - Notícias e lançamentos tech relevantes para PMEs
3. Selecione **8 temas** para o mês — 1 por post
4. Distribua entre os pilares (sem repetir pilar em posts consecutivos)
5. Defina a composição visual de cada capa (A/B/C/D — sem repetir consecutivamente)
6. Para cada tema, crie a pasta e o brief:

```bash
mkdir -p posts/{slug}/assets posts/{slug}/slides posts/{slug}/export
```

7. Salve cada brief em `posts/{slug}/brief.md`
8. Salve o planejamento consolidado em `posts/planejamento-{MES}.md`

## Formato do planejamento mensal

```
# Planejamento — {MÊS} {ANO}

## Semana 1
| Post | Dia | Canal | Tema | Pilar | Composição | Slug |
|------|-----|-------|------|-------|------------|------|
| 1    | Qua | IG+TT | ...  | ...   | Tipo A     | ...  |
| 2    | Sex | IG+TT | ...  | ...   | Tipo C     | ...  |

## Semana 2
| Post | Dia | Canal | Tema | Pilar | Composição | Slug |
|------|-----|-------|------|-------|------------|------|
| 3    | Seg | LI    | ...  | ...   | Tipo D     | ...  |
| 4    | Qua | IG+TT | ...  | ...   | Tipo B     | ...  |

## Semana 3
...

## Semana 4
...
```

## Formato do brief (1 por post)

```
SLUG:          {AAAA-MM-DD}-{tema-em-kebab-case}
TEMA:          [título direto]
PILAR:         [AUTORIDADE / VALOR PRÁTICO / BASTIDORES / PROVOCAÇÃO]
CANAL FOCO:    [Instagram / LinkedIn / TikTok]
DIA DE POST:   [Segunda / Quarta / Sexta]
SEMANA:        [1 / 2 / 3 / 4]

POR QUÊ AGORA:
[2-3 linhas com dado ou tendência real encontrada na pesquisa]

PÚBLICO DO POST:
[Quem vai parar o scroll]

ÂNGULO:
[Como a SalvaTech aborda esse tema — perspectiva única]

GANCHO SUGERIDO:
[1 ideia de headline para o Copywriter partir]

REFERÊNCIA VISUAL:
[Atmosfera/emoção da cena para o Ilustrador]

COMPOSIÇÃO DE CAPA:
[A / B / C / D]

OBJETIVO:
[ ] Engajamento  [ ] Salvamento  [ ] Alcance  [ ] Conversão

ESTRUTURA DOS 7 SLIDES:
  Slide 1 (capa):   [tema central + gancho]
  Slide 2:          [ponto 1]
  Slide 3:          [ponto 2]
  Slide 4:          [ponto 3]
  Slide 5:          [ponto 4]
  Slide 6:          [ponto 5]
  Slide 7 (CTA):    [ação + benefício]
```
