#!/usr/bin/env node
/**
 * Start — Dashboard Next.js + Watcher
 * Sobe tudo num terminal só. Ctrl+C mata os dois.
 */
const { spawn } = require('child_process');
const path = require('path');

const ROOT = __dirname;
const NEXT_DIR = path.join(ROOT, 'dashboard-next');

const C = { reset: '\x1b[0m', cyan: '\x1b[36m', yellow: '\x1b[33m', green: '\x1b[32m', red: '\x1b[31m', dim: '\x1b[2m' };

function prefix(name, color) {
  return (data) => {
    data.toString().split('\n').filter(l => l.trim()).forEach(line => {
      console.log(`${color}[${name}]${C.reset} ${line}`);
    });
  };
}

// ── 1. Next.js ──────────────────────────────────────────────────────
console.log(`${C.cyan}[start]${C.reset} Iniciando Next.js...`);

const next = spawn('npm', ['run', 'dev'], {
  cwd: NEXT_DIR,
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
});

const logNext = prefix('next', C.green);
const logNextErr = prefix('next', C.dim);
next.stdout.on('data', logNext);
next.stderr.on('data', logNextErr);

// ── 2. Watcher — inicia após Next.js ou timeout de 8s ──────────────
let watcherStarted = false;
let watcher = null;

function startWatcher() {
  if (watcherStarted) return;
  watcherStarted = true;
  console.log(`${C.yellow}[start]${C.reset} Iniciando watcher...`);

  watcher = spawn('node', ['dashboard/watcher.js'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });
  watcher.stdout.on('data', prefix('watcher', C.yellow));
  watcher.stderr.on('data', prefix('watcher', C.red));
  watcher.on('close', (code) => {
    console.log(`${C.yellow}[watcher]${C.reset} Encerrado (exit ${code})`);
  });
}

// Detectar ready em stdout E stderr (Next.js varia)
function checkReady(data) {
  const t = data.toString().toLowerCase();
  if (t.includes('ready') || t.includes('started server') || t.includes('localhost:3000') || t.includes('✓ ready')) {
    startWatcher();
  }
}
next.stdout.on('data', checkReady);
next.stderr.on('data', checkReady);

// Fallback: 8s
setTimeout(() => {
  if (!watcherStarted) {
    console.log(`${C.cyan}[start]${C.reset} Timeout 8s — iniciando watcher`);
    startWatcher();
  }
}, 8000);

// ── Cleanup ─────────────────────────────────────────────────────────
function cleanup() {
  console.log(`\n${C.cyan}[start]${C.reset} Encerrando...`);
  if (watcher && !watcher.killed) watcher.kill();
  if (next && !next.killed) next.kill();
  process.exit(0);
}
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
next.on('close', (code) => { console.log(`${C.green}[next]${C.reset} Encerrado (exit ${code})`); cleanup(); });
