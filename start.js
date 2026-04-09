#!/usr/bin/env node
const { spawn, execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const PORT = 3000;
const NEXT_DIR = path.join(__dirname, 'dashboard-next');
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
        if (++attempts >= retries) return reject(new Error('Server timeout'));
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
    // Build se não tem .next/
    const nextBuild = path.join(NEXT_DIR, '.next');
    if (!fs.existsSync(nextBuild)) {
      console.log('  Buildando Next.js (primeira vez)...');
      execSync('npx next build', { cwd: NEXT_DIR, stdio: 'inherit' });
    }

    console.log('  Subindo dashboard...');
    const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
      cwd: NEXT_DIR, detached: true, stdio: 'ignore', shell: true
    });
    server.unref();
    await waitForServer();
    console.log(`  Dashboard em http://localhost:${PORT}`);
  }

  // Watcher
  console.log('  Subindo watcher...');
  const watcher = spawn('node', ['watcher.js'], {
    cwd: WATCHER_DIR, detached: true, stdio: 'ignore'
  });
  watcher.unref();

  openBrowser(`http://localhost:${PORT}`);
  console.log('  Tudo pronto!\n');
}

main().catch(e => { console.error('Erro:', e.message); process.exit(1); });
