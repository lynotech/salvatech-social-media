#!/usr/bin/env node
const { exec } = require('child_process');

if (process.platform === 'win32') {
  // Kill next server and watcher
  ['next', 'watcher.js'].forEach(term => {
    exec(`wmic process where "commandline like '%${term}%'" get processid /format:value`, { shell: 'cmd.exe' }, (err, stdout) => {
      const pids = stdout.match(/ProcessId=(\d+)/g);
      if (pids) pids.forEach(p => exec(`taskkill /F /PID ${p.split('=')[1]}`, { shell: 'cmd.exe' }));
    });
  });
  setTimeout(() => console.log('  🐒 Parado.'), 1500);
} else {
  exec('pkill -f "next start" 2>/dev/null; pkill -f "watcher.js" 2>/dev/null', () => {
    console.log('  🐒 Parado.');
  });
}
