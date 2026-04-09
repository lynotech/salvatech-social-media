#!/usr/bin/env node
/**
 * SalvaTech — Command Watcher
 * Polls dashboard for commands, opens Claude Code in interactive mode with the right prompt.
 */
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const POLL_INTERVAL = 2000;
let busy = false;

// Prefixo adicionado a todos os prompts pra economizar tokens
const SILENT_PREFIX = `REGRAS DE OUTPUT — SIGA RIGOROSAMENTE:
- NAO explique o que vai fazer antes de fazer. Apenas FACA.
- NAO descreva seus passos. NAO fale "vou agora...", "primeiro vou...", "deixa eu...".
- NAO repita instrucoes que recebeu. NAO resuma o plano.
- NAO faca comentarios sobre o processo. NAO diga "pronto, agora vou...".
- Responda APENAS quando precisar mostrar um resultado ao usuario (ex: lista de temas pra aprovar).
- Fora isso, execute os comandos em SILENCIO. Cada palavra que voce escreve custa dinheiro.
- Seja EXTREMAMENTE conciso. Zero fluff. Zero narração.

`;

const PROMPTS = {
  planejamento: SILENT_PREFIX + `Voce é o Orquestrador da SalvaTech. Execute o planejamento mensal AGORA, sem perguntar nada.

PASSO 1 — Notifique o dashboard:
node dashboard/notify.js '{"pipeline":"running","step":1,"stepStatus":"active","agent":"estrategista","status":"working","message":"Pesquisando tendencias...","log":"Estrategista iniciou","logType":"agent"}'

PASSO 2 — Execute o papel do Estrategista:
- Leia pipeline/steps/01-estrategista.md para saber o formato
- Leia _memory/runs.md para nao repetir temas
- Use apify para pesquisar tendencias reais
- Defina 8 temas para o mes
- Crie as pastas e briefs para cada post
- Salve o planejamento consolidado

PASSO 3 — Notifique conclusao:
node dashboard/notify.js '{"step":1,"stepStatus":"done","agent":"estrategista","status":"done","message":"8 temas prontos!","log":"Estrategista concluiu","logType":"ok"}'

PASSO 4 — Checkpoint de temas (APROVACAO VIA DASHBOARD):
Envie os temas para aprovacao no dashboard usando o notify.js com --checkpoint.
O comando vai esperar a resposta do usuario no dashboard e retornar JSON com {approved, feedback}.
Exemplo:
node dashboard/notify.js --checkpoint '{"agent":"orquestrador","question":"Aprova os 8 temas de abril?","items":["1. Tema X (Tipo A)","2. Tema Y (Tipo C)","..."]}'
O comando vai bloquear ate o usuario responder no dashboard.
Se approved=true, continue. Se approved=false, leia o feedback e ajuste os temas.

PASSO 5 — Apos aprovacao, execute o Copywriter:
node dashboard/notify.js '{"step":3,"stepStatus":"active","agent":"copywriter","status":"working","message":"Escrevendo copys...","log":"Copywriter iniciou","logType":"agent"}'
- Leia pipeline/steps/03-copywriter.md
- Gere o copy de cada post e salve em posts/{slug}/copy.md

PASSO 6 — Checkpoint de copys (APROVACAO VIA DASHBOARD):
node dashboard/notify.js --checkpoint '{"agent":"orquestrador","question":"Aprova os 8 copys?","items":["Post 1: titulo","Post 2: titulo","..."]}'
Aguarde resposta. Se approved=false, ajuste conforme o feedback.

EXECUTE TUDO SEM PERGUNTAR. Comece agora.`,

  copys: SILENT_PREFIX + `Voce é o Orquestrador da SalvaTech. Os temas ja foram definidos e aprovados. Gere APENAS os copys e legendas AGORA, sem pesquisar temas novos.

PASSO 1 — Notifique o dashboard:
node dashboard/notify.js '{"pipeline":"running","step":1,"stepStatus":"done","step":2,"stepStatus":"done"}'
node dashboard/notify.js '{"step":3,"stepStatus":"active","agent":"copywriter","status":"working","message":"Escrevendo copys...","log":"Copywriter iniciou","logType":"agent"}'

PASSO 2 — Leia os briefs existentes:
- Liste as pastas em posts/ que tem brief.md
- Para cada post, leia o brief.md
- NAO crie temas novos, NAO pesquise, NAO mude os briefs

PASSO 3 — Gere os copys:
- Leia agents/copywriter.agent.md para o formato e regras
- Leia pipeline/steps/03-copywriter.md para o processo
- Para cada post, gere copy.md e legenda.md seguindo o formato panoramico
- Maximo 20 palavras por slide, arco narrativo, ZONA_BODY opcional

PASSO 4 — Checkpoint de copys (APROVACAO VIA DASHBOARD):
node dashboard/notify.js --checkpoint '{"agent":"orquestrador","question":"Aprova os 8 copys?","items":["Post 1: titulo","Post 2: titulo","..."]}'
Aguarde resposta. Se approved=false, ajuste conforme o feedback.

PASSO 5 — Finalize:
node dashboard/notify.js '{"step":3,"stepStatus":"done","agent":"copywriter","status":"done","message":"Copys prontos!","log":"Copywriter concluiu","logType":"ok"}'
node dashboard/notify.js '{"pipeline":"done","agent":"orquestrador","status":"done","message":"Copys prontos!","log":"Copys e legendas gerados","logType":"ok"}'

EXECUTE TUDO SEM PERGUNTAR. NAO pesquise temas. NAO mude briefs. Comece agora.`,

  artes: SILENT_PREFIX + `Voce é o Orquestrador. Gere as artes da semana. Para cada post em posts/ que tenha copy.md mas NAO tenha assets/capa.jpg:
1. Leia agents/ilustrador.agent.md
2. Gere capa.jpg (mascote + cenario juntos): python skills/image-ai-generator/scripts/generate.py --prompt "PROMPT" --output "posts/{slug}/assets/capa.jpg" --mode production
3. Gere background.jpg (cenario escuro sem personagem): python skills/image-ai-generator/scripts/generate.py --prompt "Dark cinematic environment... No characters, no text. Vertical 1080x1350px." --output "posts/{slug}/assets/background.jpg" --mode production
4. Monte slides: node pipeline/build-slides.js --slug {SLUG}
5. Renderize PNGs: suba http server na raiz (python -m http.server 8765 --directory .) e use playwright pra cada slide
Use node dashboard/notify.js pra atualizar status. EXECUTE SEM PERGUNTAR.`,

  arte1: SILENT_PREFIX + `Gere a arte do PRIMEIRO post em posts/ que tenha copy.md mas NAO tenha assets/capa.jpg. Siga: gere capa.jpg + background.jpg com --mode production, rode node pipeline/build-slides.js, renderize PNGs. Use notify.js. EXECUTE SEM PERGUNTAR.`,

  arte2: SILENT_PREFIX + `Gere a arte do SEGUNDO post em posts/ que tenha copy.md mas NAO tenha assets/capa.jpg. Mesmo fluxo. EXECUTE SEM PERGUNTAR.`,

  teste: SILENT_PREFIX + `Execute o fluxo COMPLETO para 1 post de teste:
1. ESTRATEGISTA: defina 1 tema, crie posts/{slug}/brief.md
2. COPYWRITER: gere copy.md (4 slides) e legenda.md seguindo agents/copywriter.agent.md
3. ILUSTRADOR: gere capa.jpg (mascote+cenario juntos, --mode production) e background.jpg (cenario escuro, --mode production) seguindo agents/ilustrador.agent.md
4. DESIGNER: node pipeline/build-slides.js --slug {SLUG}
5. RENDERIZADOR: suba http server na raiz (python -m http.server 8765 --directory .) e renderize os 4 slides em PNG com playwright (viewport 1080x1350)
Use node dashboard/notify.js pra atualizar status a cada passo. EXECUTE TUDO SEM PERGUNTAR.`
};

function pollCommand() {
  if (busy) return;
  const req = http.get('http://localhost:3737/api/command', res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.command && PROMPTS[data.command]) {
          console.log(`\n  >> Comando: ${data.command}`);
          executeCommand(data.command);
        }
      } catch(e) {}
    });
  });
  req.on('error', () => {});
  req.setTimeout(3000, () => req.destroy());
}

function executeCommand(cmd) {
  busy = true;
  const prompt = PROMPTS[cmd];

  notify({
    pipeline: 'running',
    agent: 'orquestrador', status: 'working', message: 'Coordenando...',
    log: cmd === 'planejamento' ? 'Planejamento mensal iniciado' : 'Geracao de artes iniciada',
    logType: 'agent'
  });

  // Write prompt to a bat file and open Claude Code interactively
  const promptOneLine = prompt.replace(/\r?\n/g, ' ').replace(/"/g, "'");
  const batFile = path.join(PROJECT_ROOT, 'dashboard', '.run-pipeline.bat');
  fs.writeFileSync(batFile, [
    '@echo off',
    'title SalvaTech Pipeline',
    `cd /d "${PROJECT_ROOT}"`,
    `claude --dangerously-skip-permissions "${promptOneLine}"`,
  ].join('\r\n'), 'utf-8');

  const child = spawn('cmd.exe', ['/c', 'start', '', batFile], {
    detached: true, stdio: 'ignore', shell: false
  });
  child.unref();

  setTimeout(() => { busy = false; }, 5000);
}

function notify(obj) {
  const json = JSON.stringify(obj);
  const data = Buffer.from(json, 'utf-8');
  const req = http.request({
    hostname: 'localhost', port: 3737, path: '/api/status',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
  }, () => {});
  req.on('error', () => {});
  req.write(data);
  req.end();
}

console.log('  Watcher ativo — aguardando comandos...');
setInterval(pollCommand, POLL_INTERVAL);
