---
agent: estrategista
execution: inline
outputFile: clients/{CLIENT}/posts/planejamento-{MES}.md
model_tier: powerful
---

# Planejamento Mensal — Pesquisa e Definição de Temas

Leia o config do cliente ativo em `clients/{CLIENT}/config.yaml` antes de começar.
Use os campos `name`, `audience`, `pillars`, `research_topics`, `channels`, `schedule` e `agent_profiles.estrategista` do config.

## Calendário de posts

Leia o campo `schedule` do `clients/{CLIENT}/config.yaml` pra definir o calendário.
O número de posts por mês vem de `schedule.posts_per_month`.

Exemplo (SalvaTech — referência):
```
Semana 1:  Quarta (Instagram+TikTok) + Sexta (Instagram+TikTok)
Semana 2:  Segunda (LinkedIn) + Quarta (Instagram+TikTok)
Semana 3:  Quarta (Instagram+TikTok) + Sexta (Instagram+TikTok)
Semana 4:  Segunda (LinkedIn) + Quarta (Instagram+TikTok)
= 8 posts por mês
```

## Sua missão

1. Consulte `clients/{CLIENT}/_memory/runs.md` para NÃO repetir temas dos últimos 30 dias
2. Use a skill `apify` para pesquisar tendências reais do mercado, usando os `research_topics` do config:
   - Use as queries definidas em `research_topics` do config.yaml
   - Use as fontes definidas em `agent_profiles.estrategista.fontes`
   - Priorize conforme `agent_profiles.estrategista.prioridade`
3. Selecione o número de temas conforme `schedule.posts_per_month` do config
4. Distribua entre os pilares definidos em `pillars` do config (sem repetir pilar em posts consecutivos)
5. Defina a composição visual de cada capa (A/B/C/D — sem repetir consecutivamente)
6. Para cada tema, crie a pasta e o brief:

```bash
mkdir -p clients/{CLIENT}/posts/{slug}/assets clients/{CLIENT}/posts/{slug}/slides clients/{CLIENT}/posts/{slug}/export
```

7. Salve cada brief em `clients/{CLIENT}/posts/{slug}/brief.md`
8. Salve o planejamento consolidado em `clients/{CLIENT}/posts/planejamento-{MES}.md`

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
PILAR:         [pilar do config.yaml do cliente]
CANAL FOCO:    [canal do config.yaml do cliente]
DIA DE POST:   [dia conforme schedule do config]
SEMANA:        [1 / 2 / 3 / 4]

POR QUÊ AGORA:
[2-3 linhas com dado ou tendência real encontrada na pesquisa]

PÚBLICO DO POST:
[Quem vai parar o scroll — baseado no audience do config]

ÂNGULO:
[Como o cliente aborda esse tema — perspectiva única]

GANCHO SUGERIDO:
[1 ideia de headline para o Copywriter partir]

REFERÊNCIA VISUAL:
[Atmosfera/emoção da cena para o Ilustrador]

COMPOSIÇÃO DE CAPA:
[A / B / C / D]

OBJETIVO:
[ ] Engajamento  [ ] Salvamento  [ ] Alcance  [ ] Conversão

ESTRUTURA DOS SLIDES:
  Slide 1 (capa):   [tema central + gancho]
  Slide 2:          [ponto 1]
  Slide 3:          [ponto 2]
  ...
  Slide N (CTA):    [ação + benefício]
```

> O número de slides vem de `agent_profiles.copywriter.slides` do config.yaml.
