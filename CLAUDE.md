# SalvaTech — Social Media Squad

Você é o sistema de produção de conteúdo da SalvaTech. Este projeto produz **carrosséis semanais** para Instagram, LinkedIn e TikTok de forma automatizada e com identidade visual consistente.

---

## Estrutura do projeto

```
Salva Tech - Social Media/        ← raiz do squad (você está aqui)
├── CLAUDE.md
├── agents/
│   ├── estrategista.agent.md
│   ├── copywriter.agent.md
│   ├── ilustrador.agent.md
│   ├── designer.agent.md
│   └── orquestrador.agent.md
├── skills/
│   ├── apify/                    ← pesquisa web (Estrategista)
│   ├── image-ai-generator/       ← geração de imagens (Ilustrador)
│   ├── image-creator/            ← renderiza HTML → PNG (Renderizador)
│   ├── image-fetcher/            ← busca de referências visuais
│   ├── template-designer/        ← montagem de slides (Designer)
│   └── canva/                    ← exportação alternativa (Designer)
├── pipeline/
│   ├── pipeline.yaml             ← sequência dos 7 steps
│   └── steps/
│       ├── 01-estrategista.md
│       ├── 02-checkpoint-estrutura.md
│       ├── 03-copywriter.md
│       ├── 04-checkpoint-copy.md
│       ├── 05-ilustrador.md
│       ├── 06-designer.md
│       └── 07-renderizador.md
├── posts/
│   └── {slug-do-tema}/           ← criado automaticamente por carrossel
│       ├── brief.md              ← output do Estrategista
│       ├── copy.md               ← output do Copywriter
│       ├── legenda.md            ← legendas Instagram/LinkedIn/TikTok
│       ├── assets/
│       │   ├── capa.jpg          ← output do Ilustrador
│       │   └── background.jpg
│       ├── slides/               ← HTMLs gerados pelo Designer
│       │   ├── slide-01.html
│       │   └── ...
│       └── export/               ← PNGs finais prontos para postagem
│           ├── slide-01.png
│           └── ...
└── _memory/
    └── runs.md                   ← histórico de temas e composições
```

---

## Nomenclatura de posts

O slug da pasta é gerado automaticamente pelo Estrategista no formato:
```
{AAAA-MM-DD}-{tema-em-kebab-case}
```

Exemplos:
```
posts/2026-04-09-5-sinais-sistema-falhando/
posts/2026-04-11-como-ia-acelera-desenvolvimento/
posts/2026-04-16-checklist-mvp-antes-de-lancar/
```

---

## Como iniciar

### Fase 1 — Planejamento mensal (1x por mês, início do mês)
```
"Inicia o planejamento do mês"
→ Estrategista pesquisa tendências e define 8 temas
→ Você aprova os temas
→ Copywriter gera os 8 copys
→ Você aprova os copys
→ Tudo salvo em posts/{slug}/brief.md e posts/{slug}/copy.md
```

### Fase 2 — Artes semanais (toda segunda-feira)
```
"Gera as artes da semana"
→ Ilustrador gera capa.jpg + background.jpg dos 2 posts da semana
→ Designer monta slides HTML (via templates)
→ Renderizador exporta PNGs
→ Pronto pra postar
```

### Comandos avulsos
```
"Refaz a capa de [slug]"       → regenera só a imagem
"Reescreve o copy de [slug]"   → refaz o copy de 1 post
"Cria um carrossel sobre [X]"  → post avulso fora do planejamento
```

---

## O time

| Agente | Função | Skills |
|---|---|---|
| 🚀 Orquestrador | Coordena, revisa, garante qualidade | — |
| 🧠 Estrategista | Pesquisa tendências, define tema, entrega brief | apify |
| ✍️ Copywriter | Copy estruturado por zonas visuais | — |
| 🐒 Ilustrador | Gera capa.jpg + background.jpg | image-ai-generator, image-creator |
| 🎨 Designer | Monta slides HTML + exporta PNG | template-designer, frontend-design, web-design-guidelines, canva, image-creator |

---

## Fluxo de produção

```
INÍCIO DO MÊS (1x)
    │
    ▼
Estrategista → pesquisa → 8 briefs
    ↓ checkpoint (você aprova os temas)
Copywriter → 8 copys
    ↓ checkpoint (você aprova os copys)
    │
    ▼
TODA SEGUNDA-FEIRA (4x por mês)
    │
    ▼
Ilustrador → capa.jpg + background.jpg (2 posts da semana)
    ↓
Designer → slides HTML (via templates, automático)
    ↓
Renderizador → PNGs em posts/{slug}/export/
    ↓
Postar via Blotato
```

---

## Identidade visual

```
Formato:        1080x1350px (retrato 4:5)
Fundo:          #0a0414
Roxo principal: #9755FF
Roxo claro:     #c49aff
Destaque:       #e94560
Texto:          #ffffff
Muted:          #9980cc
Headline:       Black Han Sans / Impact / Arial Black — 900 — UPPERCASE
Corpo:          Inter / Helvetica Neue — 400
```

Mascote: chimpanzé astronauta, traje branco NASA-style, fotorrealista, Hasselblad 8K.
Composição varia a cada carrossel. Ver `agents/ilustrador.agent.md`.

---

## Canais e dias

| Semana | Dia | Canal | Pilar sugerido |
|---|---|---|---|
| 1 | Quarta | Instagram + TikTok | Valor prático / educativo |
| 1 | Sexta | Instagram + TikTok | Identidade / bastidores |
| 2 | Segunda | LinkedIn | Autoridade / técnico |
| 2 | Quarta | Instagram + TikTok | Valor prático / educativo |
| 3 | Quarta | Instagram + TikTok | Provocação / debate |
| 3 | Sexta | Instagram + TikTok | Identidade / bastidores |
| 4 | Segunda | LinkedIn | Autoridade / técnico |
| 4 | Quarta | Instagram + TikTok | Valor prático / educativo |

= 8 posts por mês, 2 por semana

---

## Posting

Exportar os PNGs de `posts/{slug}/export/` e postar via **Blotato** (skill configurada).
