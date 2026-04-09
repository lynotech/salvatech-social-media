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

const PROMPTS = {
  planejamento: `Voce é o Orquestrador da SalvaTech. Execute o planejamento mensal AGORA, sem perguntar nada.

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

  artes: `Voce é o Orquestrador da SalvaTech. Gere as artes da semana AGORA, sem perguntar nada.

PASSO 1 — Identifique os 2 posts da semana atual em posts/ que ja tem brief.md e copy.md

PASSO 2 — Para cada post, execute o Ilustrador:
node dashboard/notify.js '{"pipeline":"running","step":5,"stepStatus":"active","agent":"ilustrador","status":"working","message":"Gerando arte...","log":"Ilustrador iniciou","logType":"agent"}'
- Leia pipeline/steps/05-ilustrador.md e agents/ilustrador.agent.md
- Construa o prompt seguindo as camadas e o mapa de zonas da composicao definida no brief
- Gere capa.jpg: python skills/image-ai-generator/scripts/generate.py --prompt "..." --output "posts/{slug}/assets/capa.jpg" --mode test
- Gere background.jpg (OBRIGATORIO): python skills/image-ai-generator/scripts/generate.py --prompt "Abstract deep space dark background. Base color deep black #0a0414. Faint violet #9755FF glowing circuit-like geometric lines and soft nebula clouds. Low contrast, very dark. No characters, no objects, no text. Vertical portrait 1080x1350px. Photorealistic, cinematic color grade." --output "posts/{slug}/assets/background.jpg" --mode test
- SEM o background.jpg os slides internos ficam sem fundo. Sempre gere os 2.

PASSO 3 — Monte os slides:
node dashboard/notify.js '{"step":6,"stepStatus":"active","agent":"designer","status":"working","message":"Montando slides...","log":"Designer iniciou","logType":"agent"}'
node pipeline/build-slides.js --slug {SLUG} --composicao {TIPO}

PASSO 4 — Renderize os PNGs:
node dashboard/notify.js '{"step":7,"stepStatus":"active","agent":"designer","status":"working","message":"Renderizando PNGs...","log":"Renderizador iniciou","logType":"agent"}'
- Use playwright para renderizar cada slide HTML em PNG

PASSO 5 — Finalize:
node dashboard/notify.js '{"pipeline":"done","agent":"orquestrador","status":"done","message":"Artes prontas!","log":"Artes da semana concluidas","logType":"ok"}'

EXECUTE TUDO SEM PERGUNTAR. Comece agora.`
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
