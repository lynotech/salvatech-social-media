# Design Técnico — Multi-Client Social Media

## Visão Geral

Transformar o sistema de single-client (SalvaTech) pra multi-client. Cada cliente tem config isolada, posts isolados, e o pipeline lê tudo do config do cliente ativo. O agentroom não muda visualmente.

---

## 1. Estrutura de Diretórios

```
clients/
├── salvatech/                    ← primeiro cliente (migrado)
│   ├── config.yaml               ← toda config do cliente
│   ├── posts/                    ← posts desse cliente
│   │   ├── planejamento-abril-2026.md
│   │   └── 2026-04-09-tema/
│   ├── templates/                ← templates HTML customizados (opcional)
│   ├── assets/                   ← logo, mascote ref, fotos
│   │   ├── logo.png
│   │   └── photos/               ← fotos reais (se estratégia = fotos)
│   └── _memory/
│       └── runs.md
├── cliente-b/
│   ├── config.yaml
│   ├── posts/
│   ├── templates/
│   ├── assets/
│   └── _memory/
```

---

## 2. Schema do config.yaml

```yaml
# clients/{slug}/config.yaml

name: "SalvaTech"
slug: "salvatech"

# Identidade Visual
visual:
  background: "#0a0414"
  primary: "#9755FF"
  secondary: "#c49aff"
  highlight: "#e94560"
  text: "#ffffff"
  muted: "#9980cc"
  headline_font: "Syne"
  body_font: "Outfit"
  logo: "assets/logo.png"

# Estratégia de Imagem
# Opções: mascote-ia | imagem-ia | fotos | mix
image_strategy: "mascote-ia"
mascot_prompt: |
  Chimpanzee astronaut in a plain white spacesuit (no logos, no patches).
  Photorealistic, Hasselblad medium format, 8K, cinematic color grade, deep blacks.
  No text in image. No real logos.
# Se fotos: photo_dir: "assets/photos/"
# Se mix: definir por tipo de slide

# Canais
channels:
  - instagram
  - linkedin
  - tiktok

# Calendário
schedule:
  posts_per_month: 8
  weeks:
    - { day: "quarta", channel: "instagram" }
    - { day: "sexta", channel: "instagram" }
    - { day: "segunda", channel: "linkedin" }
    - { day: "quarta", channel: "instagram" }

# Pilares de Conteúdo
pillars:
  - name: "Autoridade"
    description: "Tendências tech, análises, erros comuns"
    channels: ["linkedin", "instagram"]
  - name: "Valor Prático"
    description: "Dicas, ferramentas, checklists"
    channels: ["instagram", "tiktok"]
  - name: "Bastidores"
    description: "Como a empresa trabalha, processos"
    channels: ["instagram", "tiktok"]
  - name: "Provocação"
    description: "Perguntas, dados surpreendentes, mitos"
    channels: ["instagram", "linkedin"]

# Público-alvo
audience: "Empresários, gestores e fundadores de PMEs brasileiras"

# Tópicos de Pesquisa
research_topics:
  - "tendências IA PME Brasil"
  - "automação empresas brasileiras"
  - "software gestão empresarial"

# Perfis dos Agentes
agent_profiles:
  estrategista:
    fontes: ["google trends", "linkedin BR", "portais tech"]
    tipo_temas: "tecnologia, IA, automação para PMEs"
    prioridade: "dados recentes, tendências da semana"
    
  copywriter:
    tom: "dev sênior explicando pro CEO — técnico mas acessível"
    slides: 4
    estrutura: "gancho → problema → solução → CTA"
    regras:
      - "máximo 15 palavras por slide"
      - "não usar travessão"
      - "ZONA_SUB máx 8 palavras"
    
  ilustrador:
    estilo: "fotorrealista, cinematográfico, dark"
    composicoes: ["a", "b", "c"]
    regras:
      - "mascote na metade inferior pra capa A"
      - "edge-to-edge, sem bordas"
      - "fundo escuro nas bordas"
    
  designer:
    templates: ["capa-a", "capa-b", "capa-c", "slide-i1", "slide-i2", "slide-cta"]
    rodape: "logo centralizado, sem numeração"
    efeitos: ["noise texture", "backdrop blur", "gradient overlay"]
```

---

## 3. Mudanças no Pipeline

### build-slides.js

Aceita `--client` param. Resolve paths do cliente:

```javascript
// Antes: const POST = path.join(ROOT, 'posts', slug);
// Depois:
const CLIENT_DIR = path.join(ROOT, 'clients', client);
const POST = path.join(CLIENT_DIR, 'posts', slug);
const TMPL = fs.existsSync(path.join(CLIENT_DIR, 'templates'))
  ? path.join(CLIENT_DIR, 'templates')
  : path.join(ROOT, 'pipeline', 'templates');
```

### watcher.js

Inclui o cliente ativo no prompt do Claude Code:

```javascript
// Antes: const prompt = PROMPTS[cmd];
// Depois:
const prompt = PROMPTS[cmd].replace(/{CLIENT}/g, activeClient);
```

Os prompts referenciam `clients/{CLIENT}/config.yaml` pra que o Claude Code leia o config certo.

### notify.js

Aceita `--client` param opcional:

```bash
node dashboard/notify.js --client salvatech '{"step":1,...}'
```

---

## 4. Mudanças na API (Next.js)

### Novos endpoints

```
GET  /api/clients                    → lista todos os clientes
GET  /api/clients/[slug]/state       → estado do pipeline do cliente
POST /api/clients/[slug]/status      → atualizar status do cliente
POST /api/clients/[slug]/command     → enviar comando pro cliente
GET  /api/clients/[slug]/command     → watcher consome comando
POST /api/clients/[slug]/checkpoint  → checkpoint do cliente
GET  /api/clients/overview           → status resumido de todos os clientes
```

### server-state.ts

Estado passa a ser um Map por cliente:

```typescript
const clientStates: Map<string, AppState> = new Map();
let activeClient: string | null = null;

function getClientState(slug: string): AppState { ... }
function updateClientState(slug: string, data: any) { ... }
```

---

## 5. Mudanças no Agentroom (Next.js)

### O que NÃO muda
- AgentRoom.tsx (personagens, tags, bubbles, animações)
- TopBar.tsx (logo, pills de status)
- SidePanel.tsx (cards de steps)
- LogPanel.tsx (log de execução)
- CheckpointModal.tsx (modal de aprovação)

### O que muda

#### BottomBar.tsx
- Remove: select + botão ▶
- Adiciona: ícone de engrenagem (⚙) + ícone de gráfico (📊)
- Mantém: log mini à esquerda

#### Novo: GearModal.tsx
- Abre com fade-in do centro ao clicar na engrenagem
- Conteúdo:
  - Seletor de cliente (dropdown com todos os clientes)
  - Ações agrupadas por categoria (botões)
  - Botão "Criar novo cliente"
- Ao selecionar ação: fecha modal, envia comando pro `/api/clients/{slug}/command`

#### Novo: StatusModal.tsx
- Abre com fade-in do centro ao clicar no ícone de gráfico
- Conteúdo:
  - Lista de todos os clientes com:
    - Nome + logo
    - Barra: planejamento (X/8 temas)
    - Barra: copys (X/8 gerados)
    - Barra: artes (X/8 criadas)
    - Barra: exports (X/8 prontos)
  - Clicar num cliente = seleciona como ativo

---

## 6. Onboarding de Novo Cliente

Fluxo via checkpoint system:

1. Operador clica "Criar novo cliente" no GearModal
2. Watcher envia comando `onboarding` pro Claude Code
3. Claude Code (Craudin) faz perguntas via `notify.js --checkpoint`:
   - Nome da empresa?
   - Cores da marca? (pode mandar link do site que eu extraio)
   - Qual a estratégia de imagem? (mascote IA, imagem IA, fotos, mix)
   - Se mascote: descreva o personagem
   - Quais canais? (IG, LI, TT)
   - Quantos posts por mês?
   - Quais dias posta?
   - Quais pilares de conteúdo?
   - Qual o público-alvo?
   - Qual o tom de voz?
4. Craudin gera o `config.yaml` com todos os campos + `agent_profiles`
5. Craudin cria a estrutura de diretórios
6. Checkpoint final: "Confirma essa configuração?"

---

## 7. Migração SalvaTech

Script de migração (`scripts/migrate-salvatech.js`):

1. Cria `clients/salvatech/`
2. Move `posts/*` → `clients/salvatech/posts/`
3. Copia `pipeline/templates/*` → `clients/salvatech/templates/`
4. Copia `logo.png` → `clients/salvatech/assets/logo.png`
5. Move `_memory/runs.md` → `clients/salvatech/_memory/runs.md`
6. Gera `clients/salvatech/config.yaml` extraindo valores do CLAUDE.md e agents
7. Atualiza CLAUDE.md pra referenciar a nova estrutura

---

## 8. Diagrama de Fluxo

```
Operador clica ação no GearModal
    │
    ├── Seleciona cliente: "salvatech"
    ├── Seleciona ação: "planejamento"
    │
    ▼
POST /api/clients/salvatech/command
    │
    ▼
Watcher consome comando
    │
    ├── Lê clients/salvatech/config.yaml
    ├── Monta prompt com config do cliente
    │
    ▼
Claude Code executa
    │
    ├── Estrategista lê config.agent_profiles.estrategista
    ├── Copywriter lê config.agent_profiles.copywriter
    ├── Ilustrador lê config.agent_profiles.ilustrador
    ├── Designer lê config.agent_profiles.designer
    │
    ├── notify.js --client salvatech '{"step":1,...}'
    │       │
    │       ▼
    │   POST /api/clients/salvatech/status
    │       │
    │       ▼
    │   Dashboard atualiza (se cliente ativo = salvatech)
    │
    ▼
Arquivos salvos em clients/salvatech/posts/{slug}/
```
