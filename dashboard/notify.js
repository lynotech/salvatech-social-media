#!/usr/bin/env node
/**
 * SalvaTech Dashboard — Notifier
 * 
 * Status update (fire and forget):
 *   node dashboard/notify.js '{"step":1,"agent":"estrategista","status":"working"}'
 * 
 * Checkpoint (espera resposta do usuário no dashboard):
 *   node dashboard/notify.js --checkpoint '{"agent":"orquestrador","question":"Aprova os 8 temas?","items":["Tema 1: IA","Tema 2: Automação"]}'
 *   
 *   Retorna JSON: {"ok":true,"approved":true,"feedback":""}
 *   ou:           {"ok":true,"approved":false,"feedback":"troca o tema 3"}
 */
const http = require('http');

const isCheckpoint = process.argv[2] === '--checkpoint';
const json = isCheckpoint ? process.argv[3] : process.argv[2];

if (!json) {
  console.error('Uso:');
  console.error('  node notify.js \'{"step":1,"agent":"estrategista","status":"working"}\'');
  console.error('  node notify.js --checkpoint \'{"agent":"orquestrador","question":"Aprova?"}\'');
  process.exit(1);
}

const endpoint = isCheckpoint ? '/api/checkpoint' : '/api/status';
const data = Buffer.from(json, 'utf-8');

const req = http.request({
  hostname: 'localhost',
  port: 3737,
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
