#!/usr/bin/env node
/**
 * SalvaTech — Start
 * 
 * Sobe o dashboard + watcher em background e abre o navegador.
 * Uso: node start.js
 */
const { spawn, exec } = require('child_process');
const path = require('path');
const http = require('http');

const PORT = 3737;
const DASHBOARD_DIR = path.join(__dirname, 'dashboard');

function isRunning() {
  return new Promise(resolve => {
    const req = http.get(`http://localhost:${PORT}/api/state`, res => {
      res.on('data', () => {});
      res.on('end', () => resolve(true));
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => { req.destroy(); resolve(false); });
  });
}

function openBrowser(url) {
  const cmds = { win32: `start ${url}`, darwin: `open ${url}`, linux: `xdg-open ${url}` };
  exec(cmds[process.platform] || cmds.linux);
}

function waitForServer(retries = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      isRunning().then(up => {
        if (up) return resolve();
        if (++attempts >= retries) return reject(new Error('Server did not start'));
        setTimeout(check, 200);
      });
    };
    check();
  });
}

async function main() {
  console.log('\n  🐒 SalvaTech Social Media Squad\n');

  const alreadyUp = await isRunning();

  if (alreadyUp) {
    console.log(`  Dashboard já rodando em http://localhost:${PORT}`);
  } else {
    console.log('  Subindo dashboard...');
    const server = spawn('node', ['server.js'], {
      cwd: DASHBOARD_DIR, detached: true, stdio: 'ignore'
    });
    server.unref();
    await waitForServer();
    console.log(`  Dashboard rodando em http://localhost:${PORT}`);
  }

  // Start watcher (polls for commands and runs Claude Code)
  console.log('  Subindo watcher...');
  const watcher = spawn('node', ['watcher.js'], {
    cwd: DASHBOARD_DIR, detached: true, stdio: 'ignore'
  });
  watcher.unref();
  console.log('  Watcher ativo — escutando comandos do dashboard');

  openBrowser(`http://localhost:${PORT}`);
  console.log('  Navegador aberto.\n');
  console.log('  Tudo pronto! Use os botões no dashboard:');
  console.log('    "Iniciar planejamento do mês" — pesquisa + temas + copys');
  console.log('    "Gerar artes da semana" — imagens + slides + PNGs\n');
  console.log('  Para parar tudo: node stop.js\n');
}

main().catch(e => { console.error('Erro:', e.message); process.exit(1); });
