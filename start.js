#!/usr/bin/env node
const { spawn, exec } = require('child_process');
const path = require('path');
const http = require('http');

const PORT = 3000;
const DASHBOARD_DIR = path.join(__dirname, 'dashboard-next');
const WATCHER_DIR = path.join(__dirname, 'dashboard');

function isRunning() {
  return new Promise(resolve => {
    const req = http.get(`http://localhost:${PORT}`, res => {
      res.on('data', () => {});
      res.on('end', () => resolve(true));
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => { req.destroy(); resolve(false); });
  });
}

function openBrowser(url) {
  const cmds = { win32: `start ${url}`, darwin: `open ${url}`, linux: `xdg-open ${url}` };
  exec(cmds[process.platform] || cmds.linux);
}

function waitForServer(retries = 60) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      isRunning().then(up => {
        if (up) return resolve();
        if (++attempts >= retries) return reject(new Error('Server did not start'));
        setTimeout(check, 1000);
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
    console.log('  Subindo Next.js...');
    const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
      cwd: DASHBOARD_DIR, detached: true, stdio: 'ignore', shell: true
    });
    server.unref();
    await waitForServer();
    console.log(`  Dashboard rodando em http://localhost:${PORT}`);
  }

  // Start watcher
  console.log('  Subindo watcher...');
  const watcher = spawn('node', ['watcher.js'], {
    cwd: WATCHER_DIR, detached: true, stdio: 'ignore'
  });
  watcher.unref();

  openBrowser(`http://localhost:${PORT}`);
  console.log('  Navegador aberto.\n');
  console.log('  Pronto! Use os controles no dashboard.\n');
}

main().catch(e => { console.error('Erro:', e.message); process.exit(1); });
