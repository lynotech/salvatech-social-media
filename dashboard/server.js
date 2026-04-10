/**
 * ⚠️  DEPRECATED — Este servidor foi substituído pelo dashboard-next (Next.js, porta 3000).
 *
 * Todos os endpoints abaixo existem no Next.js dashboard:
 *   GET  /api/state              → dashboard-next/src/app/api/state/route.ts
 *   POST /api/status             → dashboard-next/src/app/api/status/route.ts
 *   POST /api/checkpoint         → dashboard-next/src/app/api/checkpoint/route.ts
 *   GET  /api/checkpoint         → dashboard-next/src/app/api/checkpoint/route.ts
 *   POST /api/checkpoint/respond → dashboard-next/src/app/api/checkpoint/respond/route.ts
 *   POST /api/reset              → dashboard-next/src/app/api/reset/route.ts
 *   POST /api/command            → dashboard-next/src/app/api/command/route.ts
 *   GET  /api/command            → dashboard-next/src/app/api/command/route.ts
 *
 * Além disso, o Next.js tem rotas multi-client:
 *   GET  /api/clients
 *   GET  /api/clients/[slug]/state
 *   POST /api/clients/[slug]/status
 *   POST /api/clients/[slug]/command
 *   GET  /api/clients/[slug]/command
 *   POST /api/clients/[slug]/checkpoint
 *   POST /api/clients/[slug]/checkpoint/respond
 *   GET  /api/clients/overview
 *   POST /api/clients/active
 *
 * O watcher.js e notify.js já apontam pra porta 3000 (Next.js).
 * O agentroom agora é servido pelo Next.js em page.tsx (/).
 *
 * Para rodar o dashboard:
 *   cd dashboard-next && npm run dev
 *
 * Este arquivo é mantido apenas como referência. NÃO use em produção.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = 3737;
const ROOT = __dirname;

// ── State ──
let state = {
  pipeline: 'idle',
  currentStep: 0,
  slug: null,
  tema: null,
  composicao: null,
  agents: {
    orquestrador: { status: 'idle', message: '' },
    estrategista: { status: 'idle', message: '' },
    copywriter:   { status: 'idle', message: '' },
    ilustrador:   { status: 'idle', message: '' },
    designer:     { status: 'idle', message: '' },
  },
  steps: {1:'pending',2:'pending',3:'pending',4:'pending',5:'pending',6:'pending',7:'pending'},
  log: [],
  checkpoint: null  // { agent, question, items, responded, response }
};

let pendingCommand = null; // 'planejamento' | 'artes' | null

function resetState() {
  state = {
    pipeline: 'idle', currentStep: 0, slug: null, tema: null, composicao: null,
    agents: {
      orquestrador:{status:'idle',message:''},estrategista:{status:'idle',message:''},
      copywriter:{status:'idle',message:''},ilustrador:{status:'idle',message:''},
      designer:{status:'idle',message:''}
    },
    steps: {1:'pending',2:'pending',3:'pending',4:'pending',5:'pending',6:'pending',7:'pending'},
    log: [],
    checkpoint: null
  };
}

function addLog(msg, type) {
  const time = new Date().toTimeString().slice(0,5);
  state.log.push({ time, msg, type: type || '' });
  if (state.log.length > 100) state.log.shift();
}

// ── WebSocket ──
const wsClients = new Set();
function broadcast(data) {
  const json = JSON.stringify(data);
  wsClients.forEach(ws => { try { ws.send(json); } catch(e) {} });
}

// ── MIME ──
const MIME = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.json':'application/json','.png':'image/png','.jpg':'image/jpeg',
  '.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon'
};

// ── Helper: parse body ──
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch(e) { reject(e); } });
  });
}

// ── HTTP Server ──
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── GET /api/state ──
  if (req.url === '/api/state' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify(state));
    return;
  }

  // ── POST /api/status ──
  if (req.url === '/api/status' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      if (data.agent && state.agents[data.agent]) {
        state.agents[data.agent].status = data.status || 'idle';
        state.agents[data.agent].message = data.message || '';
      }
      if (data.step) {
        state.currentStep = data.step;
        state.steps[data.step] = data.stepStatus || data.status || 'active';
      }
      if (data.pipeline) state.pipeline = data.pipeline;
      if (data.slug) state.slug = data.slug;
      if (data.tema) state.tema = data.tema;
      if (data.composicao) state.composicao = data.composicao;
      if (data.log) addLog(data.log, data.logType || '');
      broadcast({ type: 'update', state });
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end('{"ok":true}');
    } catch(e) {
      res.writeHead(400, {'Content-Type':'application/json'});
      res.end(`{"error":"${e.message}"}`);
    }
    return;
  }

  // ── POST /api/checkpoint ── Claude Code envia pergunta, fica esperando resposta
  if (req.url === '/api/checkpoint' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      // data: { agent, question, items? }
      state.checkpoint = {
        agent: data.agent || 'orquestrador',
        question: data.question || 'Aprova?',
        items: data.items || [],       // lista de itens pra aprovar (temas, copys, etc)
        responded: false,
        response: null
      };
      state.pipeline = 'checkpoint';
      if (state.agents[state.checkpoint.agent]) {
        state.agents[state.checkpoint.agent].status = 'waiting';
        state.agents[state.checkpoint.agent].message = 'Aguardando aprovação...';
      }
      addLog(`Checkpoint: ${data.question}`, 'warn');
      broadcast({ type: 'checkpoint', state });

      // Long-poll: espera até 120s pela resposta do usuário
      const start = Date.now();
      const poll = setInterval(() => {
        if (state.checkpoint && state.checkpoint.responded) {
          clearInterval(poll);
          const resp = state.checkpoint.response;
          res.writeHead(200, {'Content-Type':'application/json'});
          res.end(JSON.stringify({ ok: true, approved: resp.approved, feedback: resp.feedback }));
        } else if (Date.now() - start > 120000) {
          clearInterval(poll);
          res.writeHead(408, {'Content-Type':'application/json'});
          res.end('{"error":"timeout","message":"Nenhuma resposta em 120s"}');
        }
      }, 500);
    } catch(e) {
      res.writeHead(400, {'Content-Type':'application/json'});
      res.end(`{"error":"${e.message}"}`);
    }
    return;
  }

  // ── GET /api/checkpoint ── Claude Code pode fazer polling alternativo
  if (req.url === '/api/checkpoint' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type':'application/json'});
    if (state.checkpoint && state.checkpoint.responded) {
      res.end(JSON.stringify({ pending: false, approved: state.checkpoint.response.approved, feedback: state.checkpoint.response.feedback }));
    } else if (state.checkpoint) {
      res.end(JSON.stringify({ pending: true, question: state.checkpoint.question }));
    } else {
      res.end(JSON.stringify({ pending: false }));
    }
    return;
  }

  // ── POST /api/checkpoint/respond ── Dashboard envia resposta do usuário
  if (req.url === '/api/checkpoint/respond' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      // data: { approved: true/false, feedback: "texto" }
      if (state.checkpoint) {
        state.checkpoint.responded = true;
        state.checkpoint.response = { approved: !!data.approved, feedback: data.feedback || '' };
        const agent = state.checkpoint.agent;
        if (state.agents[agent]) {
          state.agents[agent].status = data.approved ? 'done' : 'working';
          state.agents[agent].message = data.approved ? 'Aprovado!' : 'Ajustando...';
        }
        state.pipeline = data.approved ? 'running' : 'running';
        addLog(data.approved ? 'Aprovado ✓' : `Ajuste: ${data.feedback}`, data.approved ? 'ok' : 'warn');
        broadcast({ type: 'update', state });
      }
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end('{"ok":true}');
    } catch(e) {
      res.writeHead(400, {'Content-Type':'application/json'});
      res.end(`{"error":"${e.message}"}`);
    }
    return;
  }

  // ── POST /api/reset ──
  if (req.url === '/api/reset' && req.method === 'POST') {
    resetState();
    pendingCommand = null;
    broadcast({ type: 'reset', state });
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end('{"ok":true}');
    return;
  }

  // ── POST /api/command ── Dashboard envia comando (botão clicado)
  if (req.url === '/api/command' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      pendingCommand = data.command || null;
      addLog(`Comando: ${pendingCommand}`, 'agent');
      broadcast({ type: 'update', state });
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end('{"ok":true}');
    } catch(e) {
      res.writeHead(400, {'Content-Type':'application/json'});
      res.end(`{"error":"${e.message}"}`);
    }
    return;
  }

  // ── GET /api/command ── Claude Code faz polling pra ver se tem comando
  if (req.url === '/api/command' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type':'application/json'});
    if (pendingCommand) {
      const cmd = pendingCommand;
      pendingCommand = null; // consume o comando
      res.end(JSON.stringify({ command: cmd }));
    } else {
      res.end('{"command":null}');
    }
    return;
  }

  // ── Static files ──
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(ROOT, decodeURIComponent(filePath));
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {'Content-Type': MIME[ext] || 'application/octet-stream'});
    res.end(data);
  });
});

// ── WebSocket ──
const wss = new WebSocketServer({ server });
wss.on('connection', ws => {
  wsClients.add(ws);
  ws.send(JSON.stringify({ type: 'init', state }));
  ws.on('close', () => wsClients.delete(ws));
});

server.listen(PORT, () => {
  console.log(`\n  🐒 SalvaTech Dashboard — http://localhost:${PORT}\n`);
  console.log(`  Endpoints:`);
  console.log(`    POST /api/status              → atualizar status`);
  console.log(`    POST /api/checkpoint           → enviar pergunta (long-poll)`);
  console.log(`    POST /api/checkpoint/respond    → resposta do usuário`);
  console.log(`    POST /api/reset               → resetar\n`);
});
