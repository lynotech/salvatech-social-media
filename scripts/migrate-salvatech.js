#!/usr/bin/env node
/**
 * migrate-salvatech.js
 * Migra a SalvaTech como primeiro cliente na estrutura multi-client.
 * Idempotente — seguro pra rodar múltiplas vezes.
 *
 * Operações:
 *  1. Cria estrutura clients/salvatech/ (posts, templates, assets, _memory)
 *  2. Move posts/* → clients/salvatech/posts/
 *  3. Copia pipeline/templates/* → clients/salvatech/templates/
 *  4. Copia logo.png → clients/salvatech/assets/logo.png
 *  5. Move _memory/runs.md → clients/salvatech/_memory/runs.md
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CLIENT_DIR = path.join(ROOT, 'clients', 'salvatech');

// ── Helpers ─────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  ✓ Criado: ${path.relative(ROOT, dir)}`);
  }
}

function copyFileIfNeeded(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`  ⚠ Origem não existe, pulando: ${path.relative(ROOT, src)}`);
    return;
  }
  ensureDir(path.dirname(dest));
  if (fs.existsSync(dest)) {
    console.log(`  → Já existe, pulando: ${path.relative(ROOT, dest)}`);
    return;
  }
  fs.copyFileSync(src, dest);
  console.log(`  ✓ Copiado: ${path.relative(ROOT, src)} → ${path.relative(ROOT, dest)}`);
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`  ⚠ Diretório origem não existe, pulando: ${path.relative(ROOT, src)}`);
    return;
  }
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFileIfNeeded(srcPath, destPath);
    }
  }
}

function moveDirRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`  ⚠ Diretório origem não existe, pulando: ${path.relative(ROOT, src)}`);
    return;
  }
  copyDirRecursive(src, dest);
  // Remove source after successful copy
  fs.rmSync(src, { recursive: true, force: true });
  console.log(`  ✓ Removido origem: ${path.relative(ROOT, src)}`);
}

function moveFileIfNeeded(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`  ⚠ Origem não existe, pulando: ${path.relative(ROOT, src)}`);
    return;
  }
  ensureDir(path.dirname(dest));
  if (fs.existsSync(dest)) {
    console.log(`  → Já existe no destino, pulando: ${path.relative(ROOT, dest)}`);
    return;
  }
  fs.copyFileSync(src, dest);
  fs.unlinkSync(src);
  console.log(`  ✓ Movido: ${path.relative(ROOT, src)} → ${path.relative(ROOT, dest)}`);
}

// ── Migration Steps ─────────────────────────────────────────────────

console.log('\n🚀 Migração SalvaTech → clients/salvatech/\n');

// Step 1: Create directory structure
console.log('1. Criando estrutura de diretórios...');
ensureDir(path.join(CLIENT_DIR, 'posts'));
ensureDir(path.join(CLIENT_DIR, 'templates'));
ensureDir(path.join(CLIENT_DIR, 'assets', 'photos'));
ensureDir(path.join(CLIENT_DIR, '_memory'));

// Step 2: Verify config.yaml exists (created separately as task 2.2)
console.log('\n2. Verificando config.yaml...');
const configPath = path.join(CLIENT_DIR, 'config.yaml');
if (fs.existsSync(configPath)) {
  console.log('  ✓ config.yaml já existe');
} else {
  console.log('  ⚠ config.yaml não encontrado — crie manualmente (task 2.2)');
}

// Step 3: Move posts/* → clients/salvatech/posts/
console.log('\n3. Movendo posts/ → clients/salvatech/posts/...');
const postsDir = path.join(ROOT, 'posts');
const destPosts = path.join(CLIENT_DIR, 'posts');
if (fs.existsSync(postsDir)) {
  const postEntries = fs.readdirSync(postsDir, { withFileTypes: true });
  for (const entry of postEntries) {
    if (entry.isDirectory()) {
      const src = path.join(postsDir, entry.name);
      const dest = path.join(destPosts, entry.name);
      if (fs.existsSync(dest)) {
        console.log(`  → Já existe, pulando: clients/salvatech/posts/${entry.name}`);
      } else {
        copyDirRecursive(src, dest);
      }
    }
  }
  // Remove original posts dir only if all content was moved
  const remaining = fs.readdirSync(postsDir, { withFileTypes: true })
    .filter(e => e.isDirectory());
  if (remaining.length > 0) {
    // Check if all were already copied
    let allCopied = true;
    for (const entry of remaining) {
      if (!fs.existsSync(path.join(destPosts, entry.name))) {
        allCopied = false;
        break;
      }
    }
    if (allCopied) {
      fs.rmSync(postsDir, { recursive: true, force: true });
      console.log('  ✓ Removido posts/ original');
    }
  } else {
    fs.rmSync(postsDir, { recursive: true, force: true });
    console.log('  ✓ Removido posts/ original (vazio)');
  }
} else {
  console.log('  ⚠ posts/ não existe na raiz, pulando');
}

// Step 4: Copy pipeline/templates/* → clients/salvatech/templates/
console.log('\n4. Copiando pipeline/templates/ → clients/salvatech/templates/...');
copyDirRecursive(
  path.join(ROOT, 'pipeline', 'templates'),
  path.join(CLIENT_DIR, 'templates')
);

// Step 5: Copy logo.png → clients/salvatech/assets/logo.png
console.log('\n5. Copiando logo.png → clients/salvatech/assets/logo.png...');
copyFileIfNeeded(
  path.join(ROOT, 'logo.png'),
  path.join(CLIENT_DIR, 'assets', 'logo.png')
);

// Step 6: Move _memory/runs.md → clients/salvatech/_memory/runs.md
console.log('\n6. Movendo _memory/runs.md → clients/salvatech/_memory/runs.md...');
const memoryDir = path.join(ROOT, '_memory');
const runsFile = path.join(memoryDir, 'runs.md');
moveFileIfNeeded(runsFile, path.join(CLIENT_DIR, '_memory', 'runs.md'));
// Clean up empty _memory dir
if (fs.existsSync(memoryDir)) {
  const memoryContents = fs.readdirSync(memoryDir);
  if (memoryContents.length === 0) {
    fs.rmdirSync(memoryDir);
    console.log('  ✓ Removido _memory/ vazio');
  }
}

// Summary
console.log('\n✅ Migração concluída!\n');
console.log('Estrutura:');
function printTree(dir, prefix = '') {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });
  entries.forEach((entry, i) => {
    const isLast = i === entries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = isLast ? '    ' : '│   ';
    console.log(`${prefix}${connector}${entry.name}${entry.isDirectory() ? '/' : ''}`);
    if (entry.isDirectory()) {
      printTree(path.join(dir, entry.name), prefix + childPrefix);
    }
  });
}
printTree(CLIENT_DIR);
