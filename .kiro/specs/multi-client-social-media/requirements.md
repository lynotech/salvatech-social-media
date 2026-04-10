# Requirements Document

## Introduction

This feature transforms the SalvaTech Social Media Squad from a single-client system into a multi-client SaaS tool. Each client gets isolated configuration (visual identity, channels, schedule, templates, content pillars) while sharing the same agent pipeline (Estrategista → Copywriter → Ilustrador → Designer → Renderizador). The Craudin (Orquestrador) conducts an onboarding interview for new clients, and SalvaTech becomes the first client in the new structure. The dashboard gains a client selector, and all pipeline steps read from client-specific config.

## Glossary

- **System**: The Social Media Squad application as a whole
- **Client_Config**: A JSON/YAML file containing all configuration for a specific client (visual identity, channels, schedule, content pillars, image strategy, templates)
- **Craudin**: The Orquestrador agent responsible for coordinating the pipeline and conducting client onboarding interviews
- **Pipeline**: The sequential content production flow: research → copy → images → slides → render
- **Visual_Identity**: A client's brand configuration including colors, fonts, logo path, and image strategy (mascot or photos)
- **Image_Strategy**: Whether a client uses AI-generated images with a mascot (like SalvaTech) or real photos provided by the client
- **Channel_Config**: The set of social media platforms a client publishes to (Instagram, LinkedIn, TikTok, or any combination)
- **Posting_Schedule**: A client-specific calendar defining which days and channels each post targets
- **Content_Pillars**: The thematic categories a client's content is organized around (e.g., Authority, Practical Value, Behind the Scenes)
- **Client_Selector**: A UI component in the dashboard that allows switching between clients
- **Onboarding_Interview**: A structured conversation conducted by the Craudin to gather all configuration needed to create a new Client_Config
- **Client_Directory**: The filesystem directory structure for a specific client, containing posts, templates, and assets
- **Dashboard**: The Next.js dashboard application running at localhost for pipeline monitoring and control

## Requirements

### Requirement 1: Client Configuration Schema

**User Story:** As a system operator, I want each client to have a structured configuration file, so that the pipeline can read client-specific settings without hardcoded values.

#### Acceptance Criteria

1. THE System SHALL store each Client_Config as a structured file inside `clients/{client-slug}/config.yaml`
2. THE Client_Config SHALL contain the following sections: visual identity (colors, fonts, logo path), image strategy (mascot or photos), channel configuration, posting schedule, content pillars, research topics, and template references
3. WHEN a pipeline step reads configuration, THE System SHALL resolve all values from the active Client_Config instead of hardcoded values
4. THE Client_Config SHALL use the client slug as a unique identifier in kebab-case format
5. IF a required field is missing from a Client_Config, THEN THE System SHALL report a validation error specifying the missing field before pipeline execution begins

### Requirement 2: Client Directory Structure

**User Story:** As a system operator, I want each client to have isolated directories for posts, templates, and assets, so that client content never mixes.

#### Acceptance Criteria

1. THE System SHALL create the following directory structure for each client: `clients/{client-slug}/posts/`, `clients/{client-slug}/templates/`, `clients/{client-slug}/assets/`, and `clients/{client-slug}/config.yaml`
2. WHEN the Pipeline produces output for a client, THE System SHALL write all files (briefs, copy, images, slides, exports) inside that client's `posts/{slug}/` directory
3. THE System SHALL resolve template paths from the client's `templates/` directory, falling back to the global `pipeline/templates/` directory when a client-specific template does not exist
4. THE System SHALL resolve asset paths (logo, mascot reference images, photos) from the client's `assets/` directory
5. WHEN a new client is created, THE System SHALL generate the complete directory structure automatically

### Requirement 3: SalvaTech Migration

**User Story:** As a system operator, I want SalvaTech to become the first client in the multi-client structure, so that existing content and configuration are preserved.

#### Acceptance Criteria

1. THE System SHALL create a `clients/salvatech/` directory containing the migrated configuration from the current hardcoded values in CLAUDE.md and agent files
2. THE System SHALL move existing posts from `posts/` to `clients/salvatech/posts/` while preserving directory structure and file contents
3. THE System SHALL extract SalvaTech's visual identity (colors, fonts, mascot prompt, compositions) from the current agent definitions into `clients/salvatech/config.yaml`
4. THE System SHALL copy current HTML templates from `pipeline/templates/` to `clients/salvatech/templates/`
5. AFTER migration, THE Pipeline SHALL produce identical output for SalvaTech as before the multi-client refactor when using the same inputs

### Requirement 4: Onboarding de Novo Cliente

**User Story:** Como operador, quero que o Craudin conduza uma entrevista estruturada ao criar um novo cliente, pra que toda a configuração seja coletada de forma conversacional.

#### Acceptance Criteria

1. QUANDO o operador emitir o comando "criar novo cliente", o Craudin DEVE iniciar uma entrevista de onboarding
2. O Craudin DEVE coletar: nome do cliente, cores da marca (primária, secundária, destaque, fundo, texto), fontes (headline, body), caminho do logo, estratégia de imagem (mascote-ia, imagem-ia, fotos, ou mix), canais alvo (Instagram, LinkedIn, TikTok), calendário de postagem, pilares de conteúdo (mínimo 2), descrição do público-alvo, tom de voz, e tópicos de pesquisa
3. O Craudin DEVE gerar os perfis de cada agente (Estrategista, Copywriter, Ilustrador, Designer) com base nas respostas — definindo como cada um deve se comportar pra esse cliente
4. O Craudin DEVE apresentar um resumo da configuração completa (incluindo perfis dos agentes) pra confirmação do operador antes de salvar
5. SE o operador pedir mudanças, o Craudin DEVE atualizar a configuração e apresentar novo resumo
6. APÓS confirmação, o Craudin DEVE gerar o Client_Config, criar a estrutura de diretórios, e copiar templates base

### Requirement 5: Estratégia de Imagem Por Cliente

**User Story:** Como operador, quero que cada cliente defina sua estratégia de imagem, pra que o Ilustrador saiba como gerar ou selecionar as imagens certas.

#### Acceptance Criteria

1. O Client_Config DEVE especificar a estratégia de imagem como uma das opções: "mascote-ia" (personagem recorrente gerado por IA), "imagem-ia" (imagens conceituais geradas por IA sem personagem fixo), "fotos" (fotos reais fornecidas pelo cliente), ou "mix" (combinação definida por slide)
2. QUANDO a estratégia for "mascote-ia", o Client_Config DEVE conter o prompt base do mascote (descrição do personagem, estilo, técnica)
3. QUANDO a estratégia for "imagem-ia", o Client_Config DEVE conter diretrizes de estilo visual (mood, cores, tipo de cena)
4. QUANDO a estratégia for "fotos", o Ilustrador DEVE selecionar imagens da pasta `assets/photos/` do cliente
5. QUANDO a estratégia for "mix", o Client_Config DEVE definir qual estratégia usar pra cada tipo de slide (capa, internos, CTA)

### Requirement 6: Channel Configuration Per Client

**User Story:** As a system operator, I want each client to configure which social media channels they publish to, so that content is tailored to the right platforms.

#### Acceptance Criteria

1. THE Client_Config SHALL specify one or more channels from the set: Instagram, LinkedIn, TikTok
2. WHEN the Copywriter generates copy, THE Copywriter agent SHALL adapt tone and format based on the client's configured channels
3. WHEN the Estrategista selects composition types, THE Estrategista agent SHALL prefer compositions suited to the client's primary channel (e.g., Composition D for LinkedIn-first clients)
4. THE System SHALL generate platform-specific captions (legenda.md) only for the channels configured in the Client_Config
5. IF a client has zero channels configured, THEN THE System SHALL report a validation error before pipeline execution begins

### Requirement 7: Posting Schedule Per Client

**User Story:** As a system operator, I want each client to have their own posting schedule, so that content production follows client-specific timelines.

#### Acceptance Criteria

1. THE Client_Config SHALL define a posting schedule specifying: number of posts per month, posting days (day of week), and channel per posting day
2. WHEN the Estrategista plans monthly content, THE Estrategista agent SHALL generate the number of briefs matching the client's configured posts-per-month count
3. WHEN the Pipeline assigns post slugs, THE System SHALL use the posting dates from the client's schedule in the `{YYYY-MM-DD}-{topic}` format
4. THE System SHALL validate that the posting schedule has at least one posting day configured
5. WHEN two clients have overlapping posting days, THE System SHALL process each client's pipeline independently without conflict

### Requirement 8: Visual Identity Per Client

**User Story:** As a system operator, I want each client to have their own visual identity applied to all generated content, so that slides and images match the client's brand.

#### Acceptance Criteria

1. THE Client_Config SHALL define the complete visual identity: background color, primary accent color, secondary accent color, highlight color, text color, muted text color, headline font, body font, and logo path
2. WHEN the Designer generates HTML slides, THE Designer agent SHALL apply colors, fonts, and logo from the active Client_Config instead of hardcoded SalvaTech values
3. WHEN the Designer renders the footer, THE Designer agent SHALL use the logo image from the client's assets directory
4. THE System SHALL validate that all required visual identity fields are present in the Client_Config before pipeline execution
5. WHEN the Ilustrador generates AI images, THE Ilustrador agent SHALL incorporate the client's visual style preferences (color mood, atmosphere) from the Client_Config

### Requirement 9: Content Pillars and Research Topics Per Client

**User Story:** As a system operator, I want each client to define their own content pillars and research topics, so that the Estrategista researches relevant themes for each client.

#### Acceptance Criteria

1. THE Client_Config SHALL define at least 2 content pillars, each with a name, description, and suggested channels
2. THE Client_Config SHALL define research topics as a list of search queries and keywords relevant to the client's industry
3. WHEN the Estrategista researches trends, THE Estrategista agent SHALL use the research topics from the active Client_Config instead of hardcoded SalvaTech queries
4. WHEN the Estrategista selects a content pillar for a post, THE Estrategista agent SHALL choose from the client's configured pillars
5. THE Estrategista agent SHALL distribute posts across different pillars within the same month, avoiding consecutive posts on the same pillar

### Requirement 10: Client-Specific Templates

**User Story:** As a system operator, I want each client to optionally have custom HTML templates for slides, so that clients with unique layout needs are supported.

#### Acceptance Criteria

1. THE System SHALL check for templates in `clients/{client-slug}/templates/` before falling back to `pipeline/templates/`
2. WHEN a client has custom templates, THE Designer agent SHALL use the client-specific templates for slide generation
3. WHEN a client does not have custom templates, THE Designer agent SHALL use the global templates from `pipeline/templates/` with the client's visual identity applied
4. THE System SHALL support the same template types per client: capa-a, capa-b, capa-c, capa-d, slide-i1, slide-i2, slide-cta
5. WHEN a client template references assets, THE System SHALL resolve asset paths relative to the client's directory

### Requirement 11: Dashboard Client Selector

**User Story:** As a system operator, I want the dashboard to have a client selector, so that I can monitor and control the pipeline for each client independently.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Client_Selector component in the top bar allowing the operator to switch between configured clients
2. WHEN the operator selects a client, THE Dashboard SHALL update all displayed state (pipeline status, agent status, logs, checkpoints) to reflect the selected client's data
3. THE Dashboard SHALL persist the selected client across page reloads using local storage
4. THE Dashboard SHALL display the selected client's name and logo in the top bar
5. WHEN no clients are configured, THE Dashboard SHALL display a prompt to create the first client via the Craudin onboarding

### Requirement 12: Pipeline Client Context

**User Story:** As a system operator, I want the pipeline to accept a client parameter, so that all steps execute in the context of the specified client.

#### Acceptance Criteria

1. WHEN the operator starts a pipeline run, THE System SHALL require a client identifier parameter
2. THE Pipeline SHALL pass the client identifier to every step (Estrategista, Copywriter, Ilustrador, Designer, Renderizador)
3. WHEN a pipeline step executes, THE step SHALL load configuration from the specified client's Client_Config
4. THE Pipeline SHALL include the client identifier in all dashboard notifications so the Dashboard can route updates to the correct client view
5. IF the specified client identifier does not match any existing Client_Config, THEN THE System SHALL report an error and refuse to start the pipeline

### Requirement 13: Personalidade dos Agentes Por Cliente

**User Story:** Como operador, quero que cada agente tenha instruções específicas por cliente (uma "personalidade"), pra que o comportamento de pesquisa, escrita, geração de imagem e design se adapte ao projeto.

#### Acceptance Criteria

1. O Client_Config DEVE conter uma seção `agent_profiles` com instruções específicas pra cada agente
2. O perfil do Estrategista DEVE definir: fontes de pesquisa, tipo de temas a buscar, palavras-chave do nicho, e como priorizar tendências
3. O perfil do Copywriter DEVE definir: tom de voz (formal, casual, técnico, provocativo), quantidade de slides (4, 5, 6 ou 7), estrutura narrativa (gancho→problema→solução→CTA ou outra), e regras de linguagem específicas
4. O perfil do Ilustrador DEVE definir: estratégia de imagem, estilo visual (fotorrealista, ilustração, minimalista), prompts base, e regras de composição
5. O perfil do Designer DEVE definir: composições disponíveis, efeitos visuais, estilo de rodapé, e quais templates usar
6. QUANDO o pipeline executa, cada agente DEVE carregar seu perfil do Client_Config ativo em vez de usar instruções hardcoded
7. O Craudin DEVE gerar esses perfis durante o onboarding com base nas respostas do operador

### Requirement 14: Multi-Client State Management

**User Story:** As a system operator, I want the system to track pipeline state independently per client, so that running a pipeline for one client does not affect another client's state.

#### Acceptance Criteria

1. THE System SHALL maintain separate pipeline state (current step, agent statuses, logs, checkpoints) for each client
2. WHEN the Dashboard displays state, THE Dashboard SHALL show only the state for the currently selected client
3. THE System SHALL store run history per client in `clients/{client-slug}/_memory/runs.md`
4. WHEN a checkpoint requires operator input, THE System SHALL identify which client the checkpoint belongs to
5. THE System SHALL support sequential pipeline execution for different clients (one pipeline run at a time, but switching between clients between runs)

### Requirement 15: Agentroom — Botão de Engrenagem e Modal de Ações

**User Story:** Como operador, quero um botão de engrenagem no agentroom que abre um modal com todas as ações disponíveis, pra substituir o select atual e ter uma interface mais limpa.

#### Acceptance Criteria

1. O agentroom DEVE substituir o select+botão atual por um ícone de engrenagem na bottom bar
2. AO clicar na engrenagem, DEVE abrir um modal com efeito fade-in vindo do centro da tela
3. O modal DEVE conter: seletor de cliente ativo, e as ações agrupadas (Mensal: planejamento, copys / Semanal: artes, arte 1, arte 2 / Teste: 1 post completo / Cliente: criar novo cliente)
4. AO selecionar uma ação e confirmar, o modal DEVE fechar e o comando DEVE ser enviado pro watcher
5. O modal DEVE mostrar qual cliente está ativo no momento
6. O visual do modal DEVE seguir o estilo do agentroom (fundo escuro, bordas roxas, backdrop blur)

### Requirement 16: Painel de Acompanhamento dos Clientes

**User Story:** Como operador, quero um botão ao lado da engrenagem que abre um painel de acompanhamento mostrando o status de produção de todos os clientes, pra ter visão geral do progresso mensal.

#### Acceptance Criteria

1. O agentroom DEVE ter um ícone de gráfico/painel ao lado do botão de engrenagem na bottom bar
2. AO clicar, DEVE abrir um modal (fade-in do centro) com o status de produção de todos os clientes
3. Pra cada cliente, o painel DEVE mostrar: nome, logo, mês atual, quantos posts foram planejados, quantos copys foram gerados, quantas artes foram criadas, e quantas estão prontas pra postar
4. O painel DEVE usar barras de progresso visuais pra cada etapa (planejamento, copy, artes, export)
5. AO clicar num cliente no painel, DEVE selecionar esse cliente como ativo e fechar o modal
6. O agentroom (personagens, tags, bubbles, animações, efeitos) NÃO DEVE mudar em nada — continua exatamente igual
