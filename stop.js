#!/usr/bin/env node
/**
 * SalvaTech — Stop
 * Para o dashboard e o watcher.
 */
const { exec } = require('child_process');

if (process.platform === 'win32') {
  // Kill all node processes running server.js or watcher.js
  exec('wmic process where "commandline like \'%server.js%\' and commandline like \'%dashboard%\'" get processid /format:value', { shell: 'cmd.exe' }, (err, stdout) => {
    const pids = stdout.match(/ProcessId=(\d+)/g);
    if (pids) {
      pids.forEach(p => {
        const pid = p.split('=')[1];
        exec(`taskkill /F /PID ${pid}`, { shell: 'cmd.exe' }, () => {});
      });
    }
  });
  exec('wmic process where "commandline like \'%watcher.js%\' and commandline like \'%dashboard%\'" get processid /format:value', { shell: 'cmd.exe' }, (err, stdout) => {
    const pids = stdout.match(/ProcessId=(\d+)/g);
    if (pids) {
      pids.forEach(p => {
        const pid = p.split('=')[1];
        exec(`taskkill /F /PID ${pid}`, { shell: 'cmd.exe' }, () => {});
      });
    }
  });
  setTimeout(() => console.log('  🐒 Dashboard e watcher parados.'), 1000);
} else {
  exec('pkill -f "node.*server.js" 2>/dev/null; pkill -f "node.*watcher.js" 2>/dev/null', () => {
    console.log('  🐒 Dashboard e watcher parados.');
  });
}
