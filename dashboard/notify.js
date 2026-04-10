#!/usr/bin/env node
/**
 * SalvaTech Dashboard — Notifier (Multi-Client)
 * 
 * Status update (fire and forget):
 *   node dashboard/notify.js '{"step":1,"agent":"estrategista","status":"working"}'
 *   node dashboard/notify.js --client salvatech '{"step":1,"agent":"estrategista","status":"working"}'
 * 
 * Checkpoint (espera resposta do usuário no dashboard):
 *   node dashboard/notify.js --checkpoint '{"agent":"orquestrador","question":"Aprova os 8 temas?"}'
 *   node dashboard/notify.js --client salvatech --checkpoint '{"agent":"orquestrador","question":"Aprova?"}'
 *   
 *   Retorna JSON: {"ok":true,"approved":true,"feedback":""}
 *   ou:           {"ok":true,"approved":false,"feedback":"troca o tema 3"}
 */
const http = require('http');

// Parse args: [--client <slug>] [--checkpoint] '<json>'
const args = process.argv.slice(2);
let client = null;
let isCheckpoint = false;
let json = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--client' && i + 1 < args.length) {
    client = args[++i];
  } else if (args[i] === '--checkpoint') {
    isCheckpoint = true;
  } else {
    json = args[i];
  }
}

if (!json) {
  console.error('Uso:');
  console.error('  node notify.js \'{"step":1,"agent":"estrategista","status":"working"}\'');
  console.error('  node notify.js --client salvatech \'{"step":1,...}\'');
  console.error('  node notify.js --checkpoint \'{"agent":"orquestrador","question":"Aprova?"}\'');
  console.error('  node notify.js --client salvatech --checkpoint \'{"agent":"orquestrador","question":"Aprova?"}\'');
  process.exit(1);
}

// Resolve endpoint: multi-client routes when --client is present, fallback to old routes
let endpoint;
if (client) {
  endpoint = isCheckpoint
    ? `/api/clients/${client}/checkpoint`
    : `/api/clients/${client}/status`;
} else {
  endpoint = isCheckpoint ? '/api/checkpoint' : '/api/status';
}

const data = Buffer.from(json, 'utf-8');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: endpoint,
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
  timeout: isCheckpoint ? 130000 : 5000  // checkpoint espera até 130s
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    if (isCheckpoint) {
      // Print response so Claude Code can read it
      console.log(body);
    }
    process.exit(0);
  });
});

req.on('error', () => {
  if (isCheckpoint) console.log('{"ok":false,"error":"dashboard offline"}');
  process.exit(0);
});
req.on('timeout', () => {
  if (isCheckpoint) console.log('{"ok":false,"error":"timeout"}');
  req.destroy();
  process.exit(0);
});

req.write(data);
req.end();
