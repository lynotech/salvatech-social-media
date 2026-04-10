# Social Media Squad — Multi-Client

Você é o sistema de produção de conteúdo para redes sociais. Este projeto produz **carrosséis semanais** para múltiplos clientes, cada um com identidade visual, canais e estratégia próprios.

---

## Arquitetura Multi-Client

Cada cliente tem sua própria pasta em `clients/{slug}/` com config isolada. O pipeline lê tudo do `config.yaml` do cliente ativo.

```
Salva Tech - Social Media/        ← raiz do squad
├── CLAUDE.md
├── agents/                       ← agentes compartilhados (leem config do cliente ativo)
│   ├── estrategista.agent.md
│   ├── copywriter.agent.md
│   ├── ilustrador.agent.md
│   ├── designer.agent.md
│   └── orquestrador.agent.md
├── clients/                      ← cada cliente tem sua pasta isolada
│   ├── salvatech/                ← primeiro cliente (migrado)
│   │   ├── config.yaml           ← toda config do cliente
│   │   ├── posts/                ← posts desse cliente
│   │   │   └── {slug-do-tema}/
│   │   │       ├── brief.md
│   │   │       ├── copy.md
│   │   │       ├── legenda.md
│   │   │       ├── assets/
│   │   │       ├── slides/
│   │   │       └── export/
│   │   ├── templates/            ← templates HTML (override dos globais)
│   │   ├── assets/               ← logo, fotos, referências
│   │   │   ├── logo.png
│   │   │   └── photos/
│   │   └── _memory/
│   │       └── runs.md
│   └── {outro-cliente}/          ← novos clientes seguem a mesma estrutura
├── pipeline/
│   ├── client-config-schema.ts   ← schema e validação do config.yaml
│   ├── pipeline.yaml
│   ├── templates/                ← templates globais (fallback)
│   └── steps/
├── scripts/
│   └── migrate-salvatech.js      ← script de migração (já executado)
└── logo.png                      ← logo SalvaTech (cópia na raiz, original em clients/salvatech/assets/)
```

---

## Como funciona

### 1. Config do cliente

Cada cliente tem um `config.yaml` em `clients/{slug}/config.yaml` que define:
- Identidade visual (cores, fontes, logo)
- Estratégia de imagem (mascote-ia, imagem-ia, fotos, mix)
- Canais (instagram, linkedin, tiktok)
- Calendário de postagem
- Pilares de conteúdo
- Público-alvo e tópicos de pesquisa
- Perfis dos agentes (tom, regras, estilo por agente)

### 2. Pipeline por cliente

Todos os comandos do pipeline recebem o parâmetro `--client`:
```bash
node pipeline/build-slides.js --client salvatech --slug 2026-04-09-tema
```

Os agentes leem o `config.yaml` do cliente ativo pra todas as decisões.

### 3. Resolução de paths

- Posts: `clients/{slug}/posts/{post-slug}/`
- Templates: `clients/{slug}/templates/` → fallback `pipeline/templates/`
- Assets: `clients/{slug}/assets/`
- Logo: `clients/{slug}/assets/logo.png`
- Memória: `clients/{slug}/_memory/runs.md`

---

## Nomenclatura de posts

O slug da pasta é gerado automaticamente pelo Estrategista no formato:
```
{AAAA-MM-DD}-{tema-em-kebab-case}
```

Exemplos:
```
clients/salvatech/posts/2026-04-09-5-sinais-sistema-falhando/
clients/salvatech/posts/2026-04-11-como-ia-acelera-desenvolvimento/
```

---

## Como iniciar

### Fase 1 — Planejamento mensal (1x por mês, início do mês)
```
"Inicia o planejamento do mês para {cliente}"
→ Estrategista lê config do cliente, pesquisa tendências e define temas
→ Você aprova os temas
→ Copywriter gera os copys
→ Você aprova os copys
→ Tudo salvo em clients/{cliente}/posts/{slug}/
```

### Fase 2 — Artes semanais (toda segunda-feira)
```
"Gera as artes da semana para {cliente}"
→ Ilustrador gera imagens baseado na estratégia do cliente
→ Designer monta slides HTML (via templates do cliente)
→ Renderizador exporta PNGs
→ Pronto pra postar
```

### Comandos avulsos
```
"Refaz a capa de [slug] do [cliente]"
"Reescreve o copy de [slug] do [cliente]"
"Cria um carrossel sobre [X] para [cliente]"
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

Cada agente lê seu perfil de `clients/{cliente}/config.yaml` → `agent_profiles.{agente}` pra adaptar comportamento ao cliente.

---

## Fluxo de produção

```
INÍCIO DO MÊS (1x por cliente)
    │
    ▼
Estrategista → lê config.yaml → pesquisa → N briefs (conforme schedule.posts_per_month)
    ↓ checkpoint (você aprova os temas)
Copywriter → lê config.yaml → N copys (conforme agent_profiles.copywriter.slides)
    ↓ checkpoint (você aprova os copys)
    │
    ▼
TODA SEMANA (conforme schedule do cliente)
    │
    ▼
Ilustrador → lê config.yaml → imagens (conforme image_strategy)
    ↓
Designer → lê config.yaml → slides HTML (conforme visual + templates)
    ↓
Renderizador → PNGs em clients/{cliente}/posts/{slug}/export/
    ↓
Postar via Blotato
```

---

## Cliente ativo: SalvaTech

Config completo em: `clients/salvatech/config.yaml`

Identidade visual, canais, calendário, pilares e perfis dos agentes estão todos no config.yaml. Consulte-o pra qualquer decisão de produção.

---

## Posting

Exportar os PNGs de `clients/{cliente}/posts/{slug}/export/` e postar via **Blotato** (skill configurada).
