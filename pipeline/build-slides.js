#!/usr/bin/env node
/**
 * Build Slides — Multi-Client
 * Uso: node pipeline/build-slides.js --client salvatech --slug 2026-04-09-tema [--capa a]
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ── Parse CLI args ──────────────────────────────────────────────────
const args = {};
process.argv.slice(2).forEach((a, i, arr) => {
  if (a.startsWith('--')) args[a.slice(2)] = arr[i + 1];
});

const client = args.client;
const slug = args.slug;
const capaStyle = (args.capa || 'a').toLowerCase();

if (!client) { console.error('--client obrigatório'); process.exit(1); }
if (!slug) { console.error('--slug obrigatório'); process.exit(1); }

// ── Resolve paths ───────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const CLIENT_DIR = path.join(ROOT, 'clients', client);
const POST = path.join(CLIENT_DIR, 'posts', slug);
const COPY = path.join(POST, 'copy.md');
const OUT = path.join(POST, 'slides');

// Templates: client-specific first, fallback to pipeline/templates/
const clientTmplDir = path.join(CLIENT_DIR, 'templates');
const globalTmplDir = path.join(ROOT, 'pipeline', 'templates');
const TMPL = fs.existsSync(clientTmplDir) ? clientTmplDir : globalTmplDir;

// Logo: clients/{client}/assets/logo.png
const LOGO_PATH = `/clients/${client}/assets/logo.png`;

// ── Load client config for slide count ──────────────────────────────
let slideCount = 4; // default
const configPath = path.join(CLIENT_DIR, 'config.yaml');
if (fs.existsSync(configPath)) {
  try {
    const configData = yaml.load(fs.readFileSync(configPath, 'utf-8'));
    if (configData?.agent_profiles?.copywriter?.slides) {
      slideCount = configData.agent_profiles.copywriter.slides;
    }
  } catch (e) {
    console.warn(`  ⚠ Erro ao ler config.yaml: ${e.message}. Usando ${slideCount} slides.`);
  }
} else {
  console.warn(`  ⚠ config.yaml não encontrado em ${configPath}. Usando ${slideCount} slides.`);
}

// ── Validate ────────────────────────────────────────────────────────
if (!fs.existsSync(CLIENT_DIR)) {
  console.error(`Diretório do cliente não encontrado: ${CLIENT_DIR}`);
  process.exit(1);
}
if (!fs.existsSync(COPY)) {
  console.error(`${COPY} não encontrado`);
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });

// ── Parse copy.md ───────────────────────────────────────────────────
const raw = fs.readFileSync(COPY, 'utf-8');
const slides = []; let cur = null;
raw.split('\n').forEach(line => {
  const m = line.match(/^\[SLIDE\s+(\d+)/i);
  if (m) { if (cur) slides.push(cur); cur = { num: parseInt(m[1]), z: {} }; return; }
  const z = line.match(/^(ZONA_\w+)(?:\s*\([^)]*\))?\s*:\s*(.+)/i);
  if (z && cur) cur.z[z[1].toUpperCase()] = z[2].trim();
});
if (cur) slides.push(cur);

console.log(`\n  Build — ${client}/${slug} (${slides.length} slides, capa ${capaStyle.toUpperCase()}, config: ${slideCount} slides)\n`);

// ── Asset paths (relative to client) ────────────────────────────────
const capaPath = `/clients/${client}/posts/${slug}/assets/capa.jpg`;
const bgPath = `/clients/${client}/posts/${slug}/assets/background.jpg`;

function read(f) { return fs.readFileSync(path.join(TMPL, f), 'utf-8'); }

function replaceLogo(html) {
  // Replace hardcoded /logo.png with client-specific logo path
  return html.replace(/src="\/logo\.png"/g, `src="${LOGO_PATH}"`);
}

// ── Slide 01 — Capa ─────────────────────────────────────────────────
const s1 = slides.find(s => s.num === 1);
if (s1) {
  let h = read(`capa-${capaStyle}.html`)
    .replace('{{ZONA_LABEL}}', s1.z.ZONA_LABEL || '')
    .replace('{{ZONA_HEADLINE_L1}}', s1.z.ZONA_HEADLINE_L1 || '')
    .replace('{{ZONA_HEADLINE_L2}}', s1.z.ZONA_HEADLINE_L2 || '')
    .replace('{{ZONA_SUB}}', s1.z.ZONA_SUB || '')
    .replace('{{CAPA_JPG_PATH}}', capaPath);
  h = replaceLogo(h);
  fs.writeFileSync(path.join(OUT, 'slide-01.html'), h);
  console.log('  ✓ slide-01.html (capa)');
}

// ── Slides internos (02 até slideCount-1) ───────────────────────────
const lastSlide = slideCount;
slides.filter(s => s.num >= 2 && s.num <= lastSlide - 1).forEach((s, i) => {
  const tmpl = i % 2 === 0 ? 'slide-i1.html' : 'slide-i2.html';
  const n = String(s.num).padStart(2, '0');
  let h = read(tmpl)
    .replace('{{ZONA_LABEL}}', s.z.ZONA_LABEL || '')
    .replace('{{ZONA_HEADLINE}}', s.z.ZONA_HEADLINE || '')
    .replace('{{ZONA_BODY}}', s.z.ZONA_BODY || '')
    .replace('{{BG_JPG_PATH}}', bgPath)
    .replace('{{SLIDE_NUM}}', n);
  h = replaceLogo(h);
  fs.writeFileSync(path.join(OUT, `slide-${n}.html`), h);
  console.log(`  ✓ slide-${n}.html`);
});

// ── Último slide — CTA ──────────────────────────────────────────────
const sCta = slides.find(s => s.num === lastSlide);
if (sCta) {
  const n = String(lastSlide).padStart(2, '0');
  let h = read('slide-cta.html')
    .replace('{{ZONA_HEADLINE_L1}}', sCta.z.ZONA_HEADLINE_L1 || '')
    .replace('{{ZONA_HEADLINE_L2}}', sCta.z.ZONA_HEADLINE_L2 || '')
    .replace('{{ZONA_BODY}}', sCta.z.ZONA_BODY || '')
    .replace('{{ZONA_CTA}}', sCta.z.ZONA_CTA || '')
    .replace('{{BG_JPG_PATH}}', bgPath);
  h = replaceLogo(h);
  fs.writeFileSync(path.join(OUT, `slide-${n}.html`), h);
  console.log(`  ✓ slide-${n}.html (cta)`);
}

console.log(`\n  ${fs.readdirSync(OUT).filter(f => f.endsWith('.html')).length} slides prontos em ${path.relative(ROOT, OUT)}\n`);
