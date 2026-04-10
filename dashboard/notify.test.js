#!/usr/bin/env node
/**
 * Quick test for notify.js arg parsing and endpoint resolution.
 * Run: node dashboard/notify.test.js
 */
const assert = require('assert');

// Simulate the arg parsing logic from notify.js
function parseArgs(argv) {
  let client = null;
  let isCheckpoint = false;
  let json = null;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--client' && i + 1 < argv.length) {
      client = argv[++i];
    } else if (argv[i] === '--checkpoint') {
      isCheckpoint = true;
    } else {
      json = argv[i];
    }
  }

  let endpoint;
  if (client) {
    endpoint = isCheckpoint
      ? `/api/clients/${client}/checkpoint`
      : `/api/clients/${client}/status`;
  } else {
    endpoint = isCheckpoint ? '/api/checkpoint' : '/api/status';
  }

  return { client, isCheckpoint, json, endpoint };
}

// 5.1 — --client param is optional and parsed correctly
console.log('5.1 — --client param parsing...');
const withClient = parseArgs(['--client', 'salvatech', '{"step":1}']);
assert.strictEqual(withClient.client, 'salvatech');
assert.strictEqual(withClient.json, '{"step":1}');

const withoutClient = parseArgs(['{"step":1}']);
assert.strictEqual(withoutClient.client, null);
assert.strictEqual(withoutClient.json, '{"step":1}');
console.log('  OK');

// 5.2 — With --client, status goes to /api/clients/{slug}/status
console.log('5.2 — Multi-client status endpoint...');
const statusMulti = parseArgs(['--client', 'salvatech', '{"step":1}']);
assert.strictEqual(statusMulti.endpoint, '/api/clients/salvatech/status');
assert.strictEqual(statusMulti.isCheckpoint, false);
console.log('  OK');

// 5.3 — With --client + --checkpoint, goes to /api/clients/{slug}/checkpoint
console.log('5.3 — Multi-client checkpoint endpoint...');
const cpMulti = parseArgs(['--client', 'salvatech', '--checkpoint', '{"agent":"orq"}']);
assert.strictEqual(cpMulti.endpoint, '/api/clients/salvatech/checkpoint');
assert.strictEqual(cpMulti.isCheckpoint, true);
assert.strictEqual(cpMulti.json, '{"agent":"orq"}');
console.log('  OK');

// 5.4 — Without --client, fallback to old endpoints
console.log('5.4 — Fallback to old endpoints...');
const statusOld = parseArgs(['{"step":1}']);
assert.strictEqual(statusOld.endpoint, '/api/status');

const cpOld = parseArgs(['--checkpoint', '{"agent":"orq"}']);
assert.strictEqual(cpOld.endpoint, '/api/checkpoint');
assert.strictEqual(cpOld.isCheckpoint, true);
console.log('  OK');

// Edge: --client with different slug
const otherClient = parseArgs(['--client', 'cliente-b', '{"step":2}']);
assert.strictEqual(otherClient.endpoint, '/api/clients/cliente-b/status');
assert.strictEqual(otherClient.client, 'cliente-b');

// Edge: --checkpoint before --client (order shouldn't matter)
const reversed = parseArgs(['--checkpoint', '--client', 'salvatech', '{"q":"ok?"}']);
assert.strictEqual(reversed.endpoint, '/api/clients/salvatech/checkpoint');
assert.strictEqual(reversed.isCheckpoint, true);
assert.strictEqual(reversed.client, 'salvatech');

console.log('\nAll tests passed!');
