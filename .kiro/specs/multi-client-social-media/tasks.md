# Tasks — Multi-Client Social Media

## Fase 1: Infraestrutura Base

- [x] 1. Criar schema e validação do config.yaml
  - [x] 1.1 Criar `pipeline/client-config-schema.ts` com interface TypeScript do config.yaml (visual, image_strategy, channels, schedule, pillars, audience, research_topics, agent_profiles)
  - [x] 1.2 Criar função `loadClientConfig(slug)` que lê e valida `clients/{slug}/config.yaml`, retornando erro se campos obrigatórios faltam
  - [x] 1.3 Criar função `listClients()` que escaneia `clients/` e retorna lista de slugs com configs válidos
  - [x] 1.4 Criar função `createClientDirectory(slug)` que gera a estrutura completa: posts/, templates/, assets/, assets/photos/, _memory/

- [x] 2. Migrar SalvaTech como primeiro cliente
  - [x] 2.1 Criar script `scripts/migrate-salvatech.js` que executa a migração
  - [x] 2.2 Criar `clients/salvatech/config.yaml` extraindo valores hardcoded do CLAUDE.md, agents e templates atuais
  - [x] 2.3 Mover `posts/*` → `clients/salvatech/posts/`
  - [x] 2.4 Copiar `pipeline/templates/*` → `clients/salvatech/templates/`
  - [x] 2.5 Copiar `logo.png` → `clients/salvatech/assets/logo.png`
  - [x] 2.6 Mover `_memory/runs.md` → `clients/salvatech/_memory/runs.md`
  - [x] 2.7 Atualizar CLAUDE.md pra referenciar a nova estrutura multi-client
  - [x] 2.8 Testar que a estrutura migrada está completa e o config.yaml é válido

## Fase 2: Pipeline Multi-Client

- [x] 3. Atualizar build-slides.js pra multi-client
  - [x] 3.1 Adicionar param `--client` obrigatório
  - [x] 3.2 Resolver paths de posts a partir de `clients/{client}/posts/{slug}/`
  - [x] 3.3 Resolver templates: primeiro `clients/{client}/templates/`, fallback pra `pipeline/templates/`
  - [x] 3.4 Resolver logo: `clients/{client}/assets/logo.png`
  - [x] 3.5 Ler config.yaml do cliente pra determinar número de slides (do agent_profiles.copywriter.slides)
  - [x] 3.6 Testar com SalvaTech migrada — output deve ser idêntico ao anterior

- [x] 4. Atualizar watcher.js pra multi-client
  - [x] 4.1 Adicionar variável `activeClient` que é setada via API
  - [x] 4.2 Atualizar todos os prompts pra incluir `{CLIENT}` placeholder
  - [x] 4.3 Substituir `{CLIENT}` pelo slug do cliente ativo antes de enviar pro Claude Code
  - [x] 4.4 Instruir o Claude Code nos prompts a ler `clients/{CLIENT}/config.yaml` pra todas as decisões
  - [x] 4.5 Adicionar prompt `onboarding` pro fluxo de criar novo cliente
  - [x] 4.6 Atualizar polling pra usar `/api/clients/{slug}/command` em vez de `/api/command`

- [x] 5. Atualizar notify.js pra multi-client
  - [x] 5.1 Adicionar param `--client` opcional
  - [x] 5.2 Quando `--client` presente, enviar pra `/api/clients/{slug}/status` em vez de `/api/status`
  - [x] 5.3 Quando `--client` presente no checkpoint, enviar pra `/api/clients/{slug}/checkpoint`
  - [x] 5.4 Manter compatibilidade: sem `--client` usa os endpoints antigos (fallback)

- [x] 6. Atualizar agents pra ler config do cliente
  - [x] 6.1 Atualizar `agents/estrategista.agent.md` — instruir a ler pilares, tópicos de pesquisa e público do config.yaml
  - [x] 6.2 Atualizar `agents/copywriter.agent.md` — instruir a ler tom de voz, qtd de slides, estrutura narrativa do config.yaml
  - [x] 6.3 Atualizar `agents/ilustrador.agent.md` — instruir a ler estratégia de imagem, estilo visual, prompts base do config.yaml
  - [x] 6.4 Atualizar `agents/designer.agent.md` — instruir a ler identidade visual, templates, composições do config.yaml
  - [x] 6.5 Atualizar `agents/orquestrador.agent.md` — instruir a ler config do cliente ativo e coordenar com base nele
  - [x] 6.6 Atualizar steps do pipeline (01 a 07) pra referenciar `clients/{CLIENT}/` em vez de paths hardcoded

## Fase 3: API Multi-Client (Next.js)

- [x] 7. Atualizar server-state.ts pra multi-client
  - [x] 7.1 Trocar estado singleton por `Map<string, AppState>` (clientStates)
  - [x] 7.2 Adicionar variável `activeClient: string | null`
  - [x] 7.3 Criar funções: `getClientState(slug)`, `updateClientState(slug, data)`, `resetClientState(slug)`, `setActiveClient(slug)`
  - [x] 7.4 Criar função `getClientsOverview()` que retorna status resumido de todos os clientes (lendo posts/ de cada um pra contar briefs, copys, artes, exports)

- [x] 8. Criar API routes por cliente
  - [x] 8.1 Criar `GET /api/clients` — lista todos os clientes (slug, nome, logo)
  - [x] 8.2 Criar `GET /api/clients/[slug]/state` — retorna estado do pipeline do cliente
  - [x] 8.3 Criar `POST /api/clients/[slug]/status` — atualiza status do cliente
  - [x] 8.4 Criar `POST /api/clients/[slug]/command` — recebe comando do GearModal
  - [x] 8.5 Criar `GET /api/clients/[slug]/command` — watcher consome comando
  - [x] 8.6 Criar `POST /api/clients/[slug]/checkpoint` — checkpoint do cliente (long-poll)
  - [x] 8.7 Criar `POST /api/clients/[slug]/checkpoint/respond` — resposta do operador
  - [x] 8.8 Criar `GET /api/clients/overview` — status resumido de todos os clientes pra StatusModal
  - [x] 8.9 Criar `POST /api/clients/active` — setar cliente ativo
  - [x] 8.10 Manter endpoints antigos (/api/state, /api/status, etc) como fallback pro cliente ativo

## Fase 4: UI do Agentroom

- [x] 9. Atualizar BottomBar.tsx
  - [x] 9.1 Remover select + botão ▶
  - [x] 9.2 Adicionar ícone de engrenagem (⚙) com onClick que abre GearModal
  - [x] 9.3 Adicionar ícone de gráfico (📊) com onClick que abre StatusModal
  - [x] 9.4 Manter log mini à esquerda
  - [x] 9.5 Estilizar ícones no padrão do agentroom (pill com backdrop blur)

- [x] 10. Criar GearModal.tsx
  - [x] 10.1 Criar componente modal com fade-in do centro (opacity 0→1, scale 0.95→1, transition 200ms)
  - [x] 10.2 Adicionar seletor de cliente ativo (dropdown com nome + logo de cada cliente)
  - [x] 10.3 Adicionar seção "Mensal" com botões: Planejamento completo, Gerar copys
  - [x] 10.4 Adicionar seção "Semanal" com botões: Artes (2 posts), Arte post 1, Arte post 2
  - [x] 10.5 Adicionar seção "Teste" com botão: 1 post completo
  - [x] 10.6 Adicionar seção "Cliente" com botão: Criar novo cliente
  - [x] 10.7 Ao clicar numa ação: enviar POST pra `/api/clients/{slug}/command` e fechar modal
  - [x] 10.8 Mostrar nome do cliente ativo no topo do modal
  - [x] 10.9 Estilizar: fundo rgba(0,0,0,0.85), borda roxa, backdrop blur, fonte DM Mono

- [x] 11. Criar StatusModal.tsx
  - [x] 11.1 Criar componente modal com mesmo fade-in do GearModal
  - [x] 11.2 Buscar dados de `GET /api/clients/overview` ao abrir
  - [x] 11.3 Pra cada cliente, renderizar card com: nome, logo (miniatura), mês atual
  - [x] 11.4 Pra cada cliente, renderizar 4 barras de progresso: planejamento (X/N temas), copys (X/N), artes (X/N), exports (X/N)
  - [x] 11.5 Ao clicar num cliente: setar como ativo via `POST /api/clients/active` e fechar modal
  - [x] 11.6 Estilizar barras: roxo pra em progresso, verde pra completo, cinza pra pendente
  - [x] 11.7 Estilizar: mesmo padrão visual do GearModal

- [x] 12. Atualizar page.tsx pra multi-client
  - [x] 12.1 Adicionar state `activeClient` e `showGearModal` e `showStatusModal`
  - [x] 12.2 Alterar polling pra usar `/api/clients/{activeClient}/state` quando activeClient definido
  - [x] 12.3 Persistir activeClient no localStorage
  - [x] 12.4 Passar activeClient pro BottomBar, GearModal e StatusModal
  - [x] 12.5 Renderizar GearModal e StatusModal condicionalmente
  - [x] 12.6 Manter AgentRoom, SidePanel, TopBar, LogPanel, CheckpointModal inalterados

## Fase 5: Onboarding de Novo Cliente

- [x] 13. Criar fluxo de onboarding no watcher
  - [x] 13.1 Adicionar prompt `onboarding` no watcher.js com instruções pro Craudin
  - [x] 13.2 O prompt deve instruir o Claude Code a: fazer perguntas via checkpoint, coletar todas as infos, gerar config.yaml, criar diretórios, copiar templates base
  - [x] 13.3 O prompt deve instruir a gerar os agent_profiles com base nas respostas
  - [x] 13.4 O prompt deve instruir a apresentar resumo final via checkpoint pra confirmação
  - [x] 13.5 Após confirmação, o Claude Code deve criar tudo em `clients/{novo-slug}/`

- [ ] 14. Atualizar CheckpointModal pra suportar onboarding
  - [x] 14.1 Suportar checkpoints com campo de texto livre (pra respostas do onboarding como cores, descrições)
  - [x] 14.2 Suportar checkpoints com opções de múltipla escolha (pra canais, estratégia de imagem)
  - [x] 14.3 Manter compatibilidade com checkpoints de aprovação (aprovar/ajustar)

## Fase 6: Testes e Validação

- [x] 15. Testar fluxo completo
  - [x] 15.1 Rodar migração da SalvaTech e verificar que config.yaml está completo
  - [x] 15.2 Rodar "1 post completo" pra SalvaTech via GearModal e verificar que funciona igual antes
  - [x] 15.3 Criar um segundo cliente via onboarding e verificar que config.yaml é gerado
  - [x] 15.4 Rodar "1 post completo" pro segundo cliente e verificar que usa o config dele
  - [x] 15.5 Verificar StatusModal mostra ambos os clientes com progresso correto
  - [x] 15.6 Verificar que trocar de cliente no GearModal atualiza o estado no agentroom
  - [x] 15.7 Commitar e pushar pro git
