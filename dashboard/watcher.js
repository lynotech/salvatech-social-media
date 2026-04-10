#!/usr/bin/env node
/**
 * SalvaTech — Watcher (Multi-Client)
 * Polls dashboard for commands, runs Claude Code in background, streams output to dashboard.
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

const SILENT = `Voce e um agente autonomo. Execute as instrucoes abaixo SEM perguntar, SEM explicar, SEM narrar. Apenas execute.
Use node dashboard/notify.js --client {CLIENT} '{"JSON"}' pra atualizar o dashboard.
Use node dashboard/notify.js --client {CLIENT} --checkpoint '{"agent":"orquestrador","question":"PERGUNTA","items":["item1"]}' pra pedir aprovacao e AGUARDE a resposta.
Leia clients/{CLIENT}/config.yaml ANTES de qualquer decisao.
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

// ── Agent auto-detection from tool output ──────────────────────────────────

const AGENT_PATTERNS = [
  { agent: 'estrategista', patterns: ['estrategista', 'brief.md', 'estrategista.agent', 'research_topic', 'tendencia', 'pilares'] },
  { agent: 'copywriter',   patterns: ['copywriter', 'copy.md', 'legenda.md', 'copywriter.agent'] },
  { agent: 'ilustrador',   patterns: ['ilustrador', 'capa.jpg', 'background.jpg', 'ilustrador.agent', 'image-ai', 'image_creator'] },
  { agent: 'designer',     patterns: ['designer', 'build-slides', 'designer.agent', 'slide-0', 'slide-i', 'capa-', 'template'] },
];

function detectAgent(text) {
  const lower = text.toLowerCase();
  for (const { agent, patterns } of AGENT_PATTERNS) {
    if (patterns.some(p => lower.includes(p))) return agent;
  }
  return null;
}

// ── Polling ────────────────────────────────────────────────────────────────

function pollCommand() {
  if (busy) return;
  const pollUrl = `/api/clients/${activeClient}/command`;
  const req = http.get(`http://localhost:${API_PORT}${pollUrl}`, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      try {
        const data = JSON.parse(body);
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

// ── Execute ────────────────────────────────────────────────────────────────

function executeCommand(cmd) {
  busy = true;
  const prompt = PROMPTS[cmd].replace(/{CLIENT}/g, activeClient);

  // Write prompt to temp file — avoids cmd.exe double-quote escaping issues
  const tmpFile = path.join(PROJECT_ROOT, '.tmp-prompt.txt');
  try {
    fs.writeFileSync(tmpFile, prompt, 'utf-8');
  } catch (e) {
    console.error('  >> Erro escrevendo prompt:', e.message);
    notify({ pipeline: 'error', log: 'Erro interno ao iniciar', logType: 'err' });
    busy = false;
    return;
  }

  // Reset all agents to idle, activate orquestrador
  notify({
    pipeline: 'running',
    agent: 'orquestrador', status: 'working', message: 'Coordenando...',
    log: `${cmd} iniciado (${activeClient})`, logType: 'agent'
  });
  for (const a of ['estrategista', 'copywriter', 'ilustrador', 'designer']) {
    notify({ agent: a, status: 'idle', message: '' });
  }

  // Use PowerShell + -EncodedCommand to avoid ALL quoting/escaping issues on Windows
  // -EncodedCommand accepts base64-encoded UTF-16LE, no special chars to worry about
  const escapedPath = tmpFile.replace(/'/g, "''");
  const psScript = `$p = [System.IO.File]::ReadAllText('${escapedPath}'); & claude --dangerously-skip-permissions --output-format stream-json --verbose -p $p`;
  const encodedCmd = Buffer.from(psScript, 'utf16le').toString('base64');

  const claude = spawn('powershell.exe', [
    '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
    '-EncodedCommand', encodedCmd
  ], {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });

  let buffer = '';
  let lastLog = '';
  let currentAgent = 'orquestrador';

  claude.stdout.on('data', d => {
    buffer += d.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line);

        // Assistant message — text + tool_use blocks
        if (event.type === 'assistant' && event.message?.content) {
          for (const block of event.message.content) {

            // Text block
            if (block.type === 'text' && block.text) {
              const clean = block.text.trim().slice(0, 160);
              if (clean && clean !== lastLog) {
                lastLog = clean;
                console.log(`  [claude] ${clean}`);
                notify({ log: clean, logType: '' });
              }
            }

            // Tool use — auto-detect agent + log
            if (block.type === 'tool_use') {
              const toolName = block.name;
              let logMsg = null;
              let agentSwitch = null;

              if (toolName === 'Bash' && block.input?.command) {
                const c = block.input.command;
                logMsg = c.length > 120 ? c.slice(0, 120) + '...' : c;
                // Don't infer agent from notify.js calls (those set it explicitly)
                if (!c.includes('notify.js')) {
                  agentSwitch = detectAgent(c);
                }
              } else if (toolName === 'Write' && block.input?.file_path) {
                const fp = block.input.file_path;
                logMsg = `>> ${path.basename(fp)}`;
                agentSwitch = detectAgent(fp);
              } else if (toolName === 'Read' && block.input?.file_path) {
                // Only infer agent from reads, don't log (too noisy)
                agentSwitch = detectAgent(block.input.file_path);
              } else if (toolName === 'Glob' || toolName === 'Grep') {
                // Minimal — don't clutter logs
              }

              if (agentSwitch && agentSwitch !== currentAgent) {
                currentAgent = agentSwitch;
                const msg = logMsg ? logMsg.slice(0, 60) : 'Trabalhando...';
                console.log(`  [agente] ${currentAgent}`);
                notify({
                  agent: currentAgent, status: 'working', message: msg,
                  log: logMsg || `${currentAgent} ativado`, logType: 'agent'
                });
              } else if (logMsg && logMsg !== lastLog) {
                lastLog = logMsg;
                console.log(`  [${toolName}] ${logMsg}`);
                notify({ log: logMsg, logType: 'agent' });
              }
            }
          }
        }

      } catch {
        // Non-JSON raw output
        const clean = line.trim().slice(0, 160);
        if (clean && clean !== lastLog) {
          lastLog = clean;
          console.log(`  [raw] ${clean}`);
          notify({ log: clean, logType: '' });
        }
      }
    }
  });

  claude.stderr.on('data', d => {
    const text = d.toString().trim();
    if (text) {
      console.error(`  [stderr] ${text.slice(0, 200)}`);
      // Only surface to dashboard if it looks like an actual error
      if (text.toLowerCase().includes('error') || text.toLowerCase().includes('erro')) {
        notify({ log: text.slice(0, 120), logType: 'err' });
      }
    }
  });

  claude.on('close', code => {
    console.log(`\n  >> Finalizado (exit ${code}) — cliente: ${activeClient}`);
    try { fs.unlinkSync(tmpFile); } catch {}
    notify({
      pipeline: code === 0 ? 'done' : 'error',
      agent: 'orquestrador',
      status: code === 0 ? 'done' : 'error',
      message: code === 0 ? 'Concluido!' : `Erro (${code})`,
      log: code === 0 ? 'Pipeline concluido' : `Processo encerrou com erro (exit ${code})`,
      logType: code === 0 ? 'ok' : 'err'
    });
    busy = false;
  });

  claude.on('error', err => {
    console.error(`  >> Spawn erro: ${err.message}`);
    try { fs.unlinkSync(tmpFile); } catch {}
    notify({
      pipeline: 'error', agent: 'orquestrador', status: 'error',
      message: 'Falha ao iniciar', log: err.message, logType: 'err'
    });
    busy = false;
  });
}

// ── Notify ─────────────────────────────────────────────────────────────────

function notify(obj) {
  const json = JSON.stringify(obj);
  const data = Buffer.from(json, 'utf-8');
  const req = http.request({
    hostname: 'localhost', port: API_PORT,
    path: `/api/clients/${activeClient}/status`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
  }, () => {});
  req.on('error', () => {});
  req.write(data);
  req.end();
}

console.log(`  Watcher ativo — cliente: ${activeClient} — aguardando comandos...`);
setInterval(pollCommand, POLL_INTERVAL);
