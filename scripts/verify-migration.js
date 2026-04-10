#!/usr/bin/env node
/**
 * verify-migration.js
 * Verifica que a migração da SalvaTech está completa:
 *  1. Carrega config.yaml via loadClientConfig('salvatech')
 *  2. Verifica estrutura de diretórios
 *  3. Verifica que posts foram migrados
 *  4. Verifica que templates foram copiados
 *  5. Verifica que logo existe
 *  6. Verifica que runs.md foi movido
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..');
const CLIENT_DIR = path.join(ROOT, 'clients', 'salvatech');

let passed = 0;
let failed = 0;

function check(description, condition) {
  if (condition) {
    console.log(`  ✅ ${description}`);
    passed++;
  } else {
    console.log(`  ❌ ${description}`);
    failed++;
  }
}

console.log('\n🔍 Verificando migração SalvaTech...\n');

// ── 1. Config.yaml validation ───────────────────────────────────────

console.log('1. Validação do config.yaml:');

const configPath = path.join(CLIENT_DIR, 'config.yaml');
check('config.yaml existe', fs.existsSync(configPath));

let config = null;
try {
  const raw = fs.readFileSync(configPath, 'utf-8');
  config = yaml.load(raw);
  check('config.yaml é YAML válido', config !== null && typeof config === 'object');
} catch (e) {
  check(`config.yaml é YAML válido (erro: ${e.message})`, false);
}

if (config) {
  check('name = "SalvaTech"', config.name === 'SalvaTech');
  check('slug = "salvatech"', config.slug === 'salvatech');

  // Visual
  check('visual.background definido', !!config.visual?.background);
  check('visual.primary definido', !!config.visual?.primary);
  check('visual.secondary definido', !!config.visual?.secondary);
  check('visual.highlight definido', !!config.visual?.highlight);
  check('visual.text definido', !!config.visual?.text);
  check('visual.muted definido', !!config.visual?.muted);
  check('visual.headline_font definido', !!config.visual?.headline_font);
  check('visual.body_font definido', !!config.visual?.body_font);
  check('visual.logo definido', !!config.visual?.logo);

  // Image strategy
  check('image_strategy = "mascote-ia"', config.image_strategy === 'mascote-ia');
  check('mascot_prompt definido', !!config.mascot_prompt);

  // Channels
  check('channels tem pelo menos 1', Array.isArray(config.channels) && config.channels.length >= 1);

  // Schedule
  check('schedule.posts_per_month >= 1', config.schedule?.posts_per_month >= 1);
  check('schedule.weeks tem entradas', Array.isArray(config.schedule?.weeks) && config.schedule.weeks.length >= 1);

  // Pillars
  check('pillars tem pelo menos 2', Array.isArray(config.pillars) && config.pillars.length >= 2);

  // Audience
  check('audience definido', !!config.audience);

  // Research topics
  check('research_topics tem pelo menos 1', Array.isArray(config.research_topics) && config.research_topics.length >= 1);

  // Agent profiles
  check('agent_profiles.estrategista definido', !!config.agent_profiles?.estrategista);
  check('agent_profiles.copywriter definido', !!config.agent_profiles?.copywriter);
  check('agent_profiles.ilustrador definido', !!config.agent_profiles?.ilustrador);
  check('agent_profiles.designer definido', !!config.agent_profiles?.designer);
}

// ── 2. Directory structure ──────────────────────────────────────────

console.log('\n2. Estrutura de diretórios:');
check('clients/salvatech/ existe', fs.existsSync(CLIENT_DIR));
check('clients/salvatech/posts/ existe', fs.existsSync(path.join(CLIENT_DIR, 'posts')));
check('clients/salvatech/templates/ existe', fs.existsSync(path.join(CLIENT_DIR, 'templates')));
check('clients/salvatech/assets/ existe', fs.existsSync(path.join(CLIENT_DIR, 'assets')));
check('clients/salvatech/assets/photos/ existe', fs.existsSync(path.join(CLIENT_DIR, 'assets', 'photos')));
check('clients/salvatech/_memory/ existe', fs.existsSync(path.join(CLIENT_DIR, '_memory')));

// ── 3. Posts migrated ───────────────────────────────────────────────

console.log('\n3. Posts migrados:');
const postsDir = path.join(CLIENT_DIR, 'posts');
if (fs.existsSync(postsDir)) {
  const posts = fs.readdirSync(postsDir, { withFileTypes: true })
    .filter(e => e.isDirectory());
  check(`Posts encontrados: ${posts.length}`, posts.length > 0);
  for (const post of posts) {
    const postPath = path.join(postsDir, post.name);
    check(`  ${post.name}/brief.md existe`, fs.existsSync(path.join(postPath, 'brief.md')));
    check(`  ${post.name}/copy.md existe`, fs.existsSync(path.join(postPath, 'copy.md')));
  }
} else {
  check('Posts directory exists', false);
}

// Verify posts/ was removed from root
check('posts/ removido da raiz', !fs.existsSync(path.join(ROOT, 'posts')));

// ── 4. Templates copied ────────────────────────────────────────────

console.log('\n4. Templates copiados:');
const templatesDir = path.join(CLIENT_DIR, 'templates');
const expectedTemplates = ['capa-a.html', 'capa-b.html', 'capa-c.html', 'slide-cta.html', 'slide-i1.html', 'slide-i2.html'];
for (const tmpl of expectedTemplates) {
  check(`${tmpl} existe`, fs.existsSync(path.join(templatesDir, tmpl)));
}

// ── 5. Logo ─────────────────────────────────────────────────────────

console.log('\n5. Logo:');
check('assets/logo.png existe', fs.existsSync(path.join(CLIENT_DIR, 'assets', 'logo.png')));

// ── 6. Memory ───────────────────────────────────────────────────────

console.log('\n6. Memória:');
check('_memory/runs.md existe', fs.existsSync(path.join(CLIENT_DIR, '_memory', 'runs.md')));
check('_memory/ removido da raiz', !fs.existsSync(path.join(ROOT, '_memory')));

// ── 7. loadClientConfig validation ──────────────────────────────────

console.log('\n7. Validação via loadClientConfig (TypeScript compilado):');
try {
  // Try loading the compiled version
  const schemaPath = path.join(ROOT, 'dist', 'pipeline', 'client-config-schema.js');
  if (fs.existsSync(schemaPath)) {
    const { loadClientConfig, listClients } = require(schemaPath);
    const loadedConfig = loadClientConfig('salvatech');
    check('loadClientConfig("salvatech") carregou sem erro', !!loadedConfig);
    check('loadClientConfig retornou name = "SalvaTech"', loadedConfig.name === 'SalvaTech');

    const clients = listClients();
    check('listClients() inclui "salvatech"', clients.includes('salvatech'));
  } else {
    console.log('  ⚠ dist/ não encontrado — compilando TypeScript...');
    const { execSync } = require('child_process');
    execSync('npx tsc', { cwd: ROOT, stdio: 'pipe' });
    
    const { loadClientConfig, listClients } = require(schemaPath);
    const loadedConfig = loadClientConfig('salvatech');
    check('loadClientConfig("salvatech") carregou sem erro', !!loadedConfig);
    check('loadClientConfig retornou name = "SalvaTech"', loadedConfig.name === 'SalvaTech');

    const clients = listClients();
    check('listClients() inclui "salvatech"', clients.includes('salvatech'));
  }
} catch (e) {
  check(`loadClientConfig funciona (erro: ${e.message})`, false);
}

// ── Summary ─────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(50)}`);
console.log(`  Resultado: ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
