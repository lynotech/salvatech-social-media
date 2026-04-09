#!/usr/bin/env node
/**
 * SalvaTech — Watcher
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

const SILENT = `REGRAS: NAO explique o que vai fazer. Apenas FACA. Zero narração. Cada palavra custa dinheiro. Execute comandos em SILENCIO. So fale quando mostrar resultado ao usuario.
APROVACOES: Use SEMPRE o dashboard para aprovacoes. Execute: node dashboard/notify.js --checkpoint '{"agent":"orquestrador","question":"PERGUNTA","items":["item1","item2"]}' e AGUARDE a resposta antes de continuar. NAO peca aprovacao no terminal. O usuario responde pelo dashboard.
NOTIFICACOES: Use node dashboard/notify.js '{"JSON"}' para atualizar o dashboard a cada transicao de step.
`;

const PROMPTS = {
  planejamento: SILENT + `Execute o planejamento mensal:
1. node dashboard/notify.js '{"pipeline":"running","step":1,"stepStatus":"active","agent":"estrategista","status":"working","message":"Pesquisando...","log":"Estrategista iniciou","logType":"agent"}'
2. Leia agents/estrategista.agent.md e pipeline/steps/01-estrategista.md. Pesquise tendencias, defina 8 temas, crie briefs.
3. node dashboard/notify.js '{"step":1,"stepStatus":"done","agent":"estrategista","status":"done","message":"8 temas prontos","log":"Estrategista concluiu","logType":"ok"}'
4. CHECKPOINT via dashboard: node dashboard/notify.js --checkpoint '{"agent":"orquestrador","question":"Aprova os 8 temas?","items":["LISTA DOS TEMAS"]}'
   AGUARDE resposta. Se approved=false, ajuste conforme feedback.
5. node dashboard/notify.js '{"step":3,"stepStatus":"active","agent":"copywriter","status":"working","message":"Escrevendo copys...","log":"Copywriter iniciou","logType":"agent"}'
6. Gere copys (4 slides) e legendas pra cada post. Leia agents/copywriter.agent.md.
7. CHECKPOINT: node dashboard/notify.js --checkpoint '{"agent":"orquestrador","question":"Aprova os copys?","items":["LISTA"]}'
8. node dashboard/notify.js '{"pipeline":"done","log":"Planejamento concluido","logType":"ok"}'
EXECUTE AGORA.`,

  copys: SILENT + `Os temas ja existem em posts/. Gere APENAS copys e legendas:
1. Liste posts/ com brief.md. Para cada, gere copy.md e legenda.md seguindo agents/copywriter.agent.md.
2. Use notify.js pra atualizar dashboard. CHECKPOINT pra aprovacao via dashboard.
EXECUTE AGORA.`,

  artes: SILENT + `Gere artes dos posts que tem copy.md mas NAO tem assets/capa.jpg:
1. Para cada: gere capa.jpg (mascote+cenario, --mode production) e background.jpg (cenario escuro, --mode production)
2. node pipeline/build-slides.js --slug {SLUG} --capa {a|b|c}
3. Renderize PNGs: suba http server na raiz (python -m http.server 8765 --directory .) e use playwright (viewport 1080x1350)
Use notify.js. EXECUTE AGORA.`,

  arte1: SILENT + `Gere arte do PRIMEIRO post sem capa.jpg. Mesmo fluxo de artes. EXECUTE AGORA.`,
  arte2: SILENT + `Gere arte do SEGUNDO post sem capa.jpg. Mesmo fluxo. EXECUTE AGORA.`,

  teste: SILENT + `Fluxo completo pra 1 post:
1. Defina 1 tema, crie brief.md
2. Gere copy.md (4 slides) e legenda.md
3. Gere capa.jpg e background.jpg com --mode production
4. node pipeline/build-slides.js --slug {SLUG}
5. Renderize PNGs (http server na raiz + playwright 1080x1350)
Use notify.js a cada passo. EXECUTE AGORA.`
};

function pollCommand() {
  if (busy) return;
  const req = http.get(`http://localhost:${API_PORT}/api/command`, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.command && PROMPTS[data.command]) {
          console.log(`\n  >> Comando: ${data.command}`);
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
  const prompt = PROMPTS[cmd];

  notify({ pipeline: 'running', agent: 'orquestrador', status: 'working', message: 'Coordenando...', log: `${cmd} iniciado`, logType: 'agent' });

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
    console.log(`\n  >> Finalizado (exit ${code})`);
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
  const req = http.request({
    hostname: 'localhost', port: API_PORT, path: '/api/status',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
  }, () => {});
  req.on('error', () => {});
  req.write(data);
  req.end();
}

console.log('  Watcher ativo — aguardando comandos...');
setInterval(pollCommand, POLL_INTERVAL);
