#!/usr/bin/env node
/**
 * SalvaTech — Watcher (Multi-Client)
 * Polls dashboard for commands, runs Claude Code in background, streams output to dashboard.
 * Supports multiple clients via activeClient variable.
 */
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const POLL_INTERVAL = 2000;
const API_PORT = 3000;
let busy = false;
let activeClient = 'salvatech';

const SILENT = `REGRAS: NAO explique o que vai fazer. Apenas FACA. Zero narração. Cada palavra custa dinheiro. Execute comandos em SILENCIO. So fale quando mostrar resultado ao usuario.
APROVACOES: Use SEMPRE o dashboard para aprovacoes. Execute: node dashboard/notify.js --client {CLIENT} --checkpoint '{"agent":"orquestrador","question":"PERGUNTA","items":["item1","item2"]}' e AGUARDE a resposta antes de continuar. NAO peca aprovacao no terminal. O usuario responde pelo dashboard.
NOTIFICACOES: Use node dashboard/notify.js --client {CLIENT} '{"JSON"}' para atualizar o dashboard a cada transicao de step.
CONTEXTO DO CLIENTE: Leia clients/{CLIENT}/config.yaml ANTES de qualquer decisao. Todas as configuracoes (visual, canais, pilares, tom de voz, estrategia de imagem, perfis dos agentes) estao nesse arquivo. NAO use valores hardcoded.
`;

const PROMPTS = {
  planejamento: SILENT + `Execute o planejamento mensal para o cliente {CLIENT}:
1. Leia clients/{CLIENT}/config.yaml para obter pilares, topicos de pesquisa, publico-alvo, schedule e agent_profiles.
2. node dashboard/notify.js --client {CLIENT} '{"pipeline":"running","step":1,"stepStatus":"active","agent":"estrategista","status":"working","message":"Pesquisando...","log":"Estrategista iniciou","logType":"agent"}'
3. Leia agents/estrategista.agent.md e pipeline/steps/01-estrategista.md. Use os research_topics e pilares do config.yaml do cliente. Pesquise tendencias, defina os temas conforme posts_per_month do schedule, crie briefs em clients/{CLIENT}/posts/.
4. node dashboard/notify.js --client {CLIENT} '{"step":1,"stepStatus":"done","agent":"estrategista","status":"done","message":"Temas prontos","log":"Estrategista concluiu","logType":"ok"}'
5. CHECKPOINT via dashboard: node dashboard/notify.js --client {CLIENT} --checkpoint '{"agent":"orquestrador","question":"Aprova os temas?","items":["LISTA DOS TEMAS"]}'
   AGUARDE resposta. Se approved=false, ajuste conforme feedback.
6. node dashboard/notify.js --client {CLIENT} '{"step":3,"stepStatus":"active","agent":"copywriter","status":"working","message":"Escrevendo copys...","log":"Copywriter iniciou","logType":"agent"}'
7. Gere copys e legendas pra cada post. Leia agents/copywriter.agent.md e use o agent_profiles.copywriter do config.yaml do cliente (tom, slides, estrutura, regras).
8. CHECKPOINT: node dashboard/notify.js --client {CLIENT} --checkpoint '{"agent":"orquestrador","question":"Aprova os copys?","items":["LISTA"]}'
9. node dashboard/notify.js --client {CLIENT} '{"pipeline":"done","log":"Planejamento concluido","logType":"ok"}'
EXECUTE AGORA.`,

  copys: SILENT + `Os temas ja existem em clients/{CLIENT}/posts/. Gere APENAS copys e legendas:
1. Leia clients/{CLIENT}/config.yaml para obter agent_profiles.copywriter (tom, slides, estrutura, regras).
2. Liste clients/{CLIENT}/posts/ com brief.md. Para cada, gere copy.md e legenda.md seguindo agents/copywriter.agent.md e o perfil do config.yaml.
3. Use notify.js --client {CLIENT} pra atualizar dashboard. CHECKPOINT pra aprovacao via dashboard.
EXECUTE AGORA.`,

  artes: SILENT + `Gere artes dos posts do cliente {CLIENT} que tem copy.md mas NAO tem assets/capa.jpg:
1. Leia clients/{CLIENT}/config.yaml para obter agent_profiles.ilustrador (estilo, composicoes, regras) e image_strategy.
2. Para cada post em clients/{CLIENT}/posts/: gere capa.jpg (seguindo image_strategy do config) e background.jpg (cenario escuro, --mode production)
3. node pipeline/build-slides.js --client {CLIENT} --slug {SLUG} --capa {a|b|c}
4. Renderize PNGs: suba http server na raiz (python -m http.server 8765 --directory .) e use playwright (viewport 1080x1350)
Use notify.js --client {CLIENT}. EXECUTE AGORA.`,

  arte1: SILENT + `Gere arte do PRIMEIRO post do cliente {CLIENT} sem capa.jpg.
1. Leia clients/{CLIENT}/config.yaml para obter agent_profiles.ilustrador e image_strategy.
2. Mesmo fluxo de artes, usando build-slides.js --client {CLIENT}.
EXECUTE AGORA.`,

  arte2: SILENT + `Gere arte do SEGUNDO post do cliente {CLIENT} sem capa.jpg.
1. Leia clients/{CLIENT}/config.yaml para obter agent_profiles.ilustrador e image_strategy.
2. Mesmo fluxo de artes, usando build-slides.js --client {CLIENT}.
EXECUTE AGORA.`,

  teste: SILENT + `Fluxo completo pra 1 post do cliente {CLIENT}:
1. Leia clients/{CLIENT}/config.yaml para obter TODAS as configuracoes (pilares, tom, visual, image_strategy, agent_profiles).
2. Defina 1 tema baseado nos pilares e research_topics do config, crie brief.md em clients/{CLIENT}/posts/
3. Gere copy.md (slides conforme agent_profiles.copywriter.slides) e legenda.md
4. Gere capa.jpg e background.jpg com --mode production (seguindo image_strategy do config)
5. node pipeline/build-slides.js --client {CLIENT} --slug {SLUG}
6. Renderize PNGs (http server na raiz + playwright 1080x1350)
Use notify.js --client {CLIENT} a cada passo. EXECUTE AGORA.`,

  onboarding: SILENT + `Voce vai conduzir o onboarding de um novo cliente. Leia clients/salvatech/config.yaml como REFERENCIA de estrutura.
Faca as perguntas abaixo via checkpoint (uma por vez ou agrupadas logicamente). Use node dashboard/notify.js --client {CLIENT} --checkpoint para cada pergunta.

PERGUNTAS DO ONBOARDING:
1. Qual o nome da empresa?
2. Quais as cores da marca? (primaria, secundaria, destaque, fundo, texto, muted) — pode mandar link do site que eu extraio
3. Quais as fontes? (headline e body)
4. Tem logo? Se sim, coloque em clients/{slug}/assets/logo.png e informe o caminho. Se nao, deixe vazio por enquanto.
5. Qual a estrategia de imagem? (mascote-ia, imagem-ia, fotos, mix)
   - Se mascote-ia: descreva o personagem/mascote
   - Se imagem-ia: descreva o estilo visual desejado
   - Se fotos: confirme que vai colocar fotos em assets/photos/
   - Se mix: defina qual estrategia pra cada tipo de slide
6. Quais canais? (Instagram, LinkedIn, TikTok)
7. Quantos posts por mes?
8. Quais dias da semana posta? E em qual canal cada dia?
9. Quais os pilares de conteudo? (minimo 2 — nome e descricao de cada)
10. Qual o publico-alvo?
11. Qual o tom de voz? (formal, casual, tecnico, provocativo, etc)
12. Quais topicos de pesquisa pro estrategista buscar?

APOS COLETAR TUDO:
1. Gere o slug em kebab-case a partir do nome
2. Gere o config.yaml completo incluindo agent_profiles (estrategista, copywriter, ilustrador, designer) baseados nas respostas. Os agent_profiles devem refletir o tom, estilo e estrategia do cliente:
   - estrategista: fontes de pesquisa, tipo de temas, prioridade de tendencias
   - copywriter: tom de voz, quantidade de slides, estrutura narrativa, regras de linguagem
   - ilustrador: estilo visual, composicoes, regras de imagem baseadas na image_strategy
   - designer: templates disponiveis, efeitos visuais, estilo de rodape
3. Apresente um RESUMO COMPLETO via checkpoint pra confirmacao (incluindo os agent_profiles gerados): node dashboard/notify.js --client {CLIENT} --checkpoint '{"agent":"orquestrador","question":"Confirma essa configuracao?","items":["RESUMO COMPLETO COM AGENT_PROFILES"]}'
4. Se o operador pedir mudancas: ajuste a configuracao conforme o feedback e apresente NOVO resumo via checkpoint. Repita ate aprovacao.
5. Se aprovado: crie a estrutura em clients/{slug}/ (posts/, templates/, assets/, assets/photos/, _memory/)
6. Copie templates base de pipeline/templates/ pra clients/{slug}/templates/
7. Salve o config.yaml em clients/{slug}/config.yaml
8. node dashboard/notify.js --client {CLIENT} '{"pipeline":"done","log":"Onboarding concluido para {slug}","logType":"ok"}'
EXECUTE AGORA.`
};

function pollCommand() {
  if (busy) return;
  const pollUrl = `/api/clients/${activeClient}/command`;
  const req = http.get(`http://localhost:${API_PORT}${pollUrl}`, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      try {
        const data = JSON.parse(body);
        // Support setting activeClient via API response
        if (data.activeClient) {
          activeClient = data.activeClient;
          console.log(`  >> Cliente ativo: ${activeClient}`);
        }
        if (data.command && PROMPTS[data.command]) {
          console.log(`\n  >> Comando: ${data.command} (cliente: ${activeClient})`);
          executeCommand(data.command);
        }
      } catch {}
    });
  });
  req.on('error', () => {});
  req.setTimeout(3000, () => req.destroy());
}

function executeCommand(cmd) {
  busy = true;
  // Replace {CLIENT} placeholder with the active client slug
  const prompt = PROMPTS[cmd].replace(/{CLIENT}/g, activeClient);

  notify({ pipeline: 'running', agent: 'orquestrador', status: 'working', message: 'Coordenando...', log: `${cmd} iniciado (${activeClient})`, logType: 'agent' });

  // Run Claude Code as background process — NO window, capture output
  const claude = spawn('claude', ['--dangerously-skip-permissions', prompt], {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    windowsHide: true  // No CMD window on Windows
  });

  let lastLine = '';

  claude.stdout.on('data', d => {
    const text = d.toString();
    process.stdout.write(text);
    // Send meaningful lines to dashboard log
    text.split('\n').filter(l => l.trim()).forEach(line => {
      const clean = line.trim().substring(0, 150);
      if (clean && clean !== lastLine) {
        lastLine = clean;
        notify({ log: clean, logType: '' });
      }
    });
  });

  claude.stderr.on('data', d => {
    process.stderr.write(d.toString());
  });

  claude.on('close', (code) => {
    console.log(`\n  >> Finalizado (exit ${code}) — cliente: ${activeClient}`);
    notify({
      pipeline: code === 0 ? 'done' : 'error',
      agent: 'orquestrador', status: code === 0 ? 'done' : 'error',
      message: code === 0 ? 'Concluido!' : 'Erro',
      log: code === 0 ? 'Pipeline concluido' : `Erro (exit ${code})`,
      logType: code === 0 ? 'ok' : 'err'
    });
    busy = false;
  });

  claude.on('error', (err) => {
    console.error(`  >> Erro: ${err.message}`);
    notify({ pipeline: 'error', agent: 'orquestrador', status: 'error', message: 'Erro', log: err.message, logType: 'err' });
    busy = false;
  });
}

function notify(obj) {
  const json = JSON.stringify(obj);
  const data = Buffer.from(json, 'utf-8');
  const statusPath = `/api/clients/${activeClient}/status`;
  const req = http.request({
    hostname: 'localhost', port: API_PORT, path: statusPath,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
  }, () => {});
  req.on('error', () => {});
  req.write(data);
  req.end();
}

console.log(`  Watcher ativo — cliente: ${activeClient} — aguardando comandos...`);
setInterval(pollCommand, POLL_INTERVAL);
