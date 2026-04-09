#!/usr/bin/env node
/**
 * SalvaTech — Build Slides (4 slides panorâmicos)
 * 
 * Uso:
 *   node pipeline/build-slides.js --slug 2026-04-09-tema-aqui
 */
const fs = require('fs');
const path = require('path');

const args = {};
process.argv.slice(2).forEach((arg, i, arr) => {
  if (arg.startsWith('--')) args[arg.slice(2)] = arr[i + 1];
});

const slug = args.slug;
if (!slug) { console.error('Erro: --slug obrigatório'); process.exit(1); }

const ROOT = path.resolve(__dirname, '..');
const POST = path.join(ROOT, 'posts', slug);
const COPY = path.join(POST, 'copy.md');
const TMPL = path.join(ROOT, 'pipeline', 'templates');
const OUT = path.join(POST, 'slides');

if (!fs.existsSync(COPY)) { console.error(`Erro: ${COPY} não encontrado`); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });

// Parse copy.md
const raw = fs.readFileSync(COPY, 'utf-8');
const slides = [];
let cur = null;
raw.split('\n').forEach(line => {
  const m = line.match(/^\[SLIDE\s+(\d+)/i);
  if (m) { if (cur) slides.push(cur); cur = { num: parseInt(m[1]), z: {} }; return; }
  const z = line.match(/^(ZONA_\w+)(?:\s*\([^)]*\))?\s*:\s*(.+)/i);
  if (z && cur) cur.z[z[1].toUpperCase()] = z[2].trim();
});
if (cur) slides.push(cur);

console.log(`\n  Build Slides — ${slug} (${slides.length} slides)\n`);

function slice(n) { return `../assets/slices/slice-${String(n).padStart(2,'0')}.jpg`; }
function read(f) { return fs.readFileSync(path.join(TMPL, f), 'utf-8'); }

// Slide 01 — Capa
const s1 = slides.find(s => s.num === 1);
if (s1) {
  let h = read('capa-a.html')
    .replace('{{ZONA_LABEL}}', s1.z.ZONA_LABEL || '')
    .replace('{{ZONA_HEADLINE_L1}}', s1.z.ZONA_HEADLINE_L1 || '')
    .replace('{{ZONA_HEADLINE_L2}}', s1.z.ZONA_HEADLINE_L2 || '')
    .replace('{{ZONA_SUB}}', s1.z.ZONA_SUB || '')
    .replace('{{CAPA_JPG_PATH}}', slice(1));
  fs.writeFileSync(path.join(OUT, 'slide-01.html'), h);
  console.log('  ✓ slide-01.html (capa)');
}

// Slides internos (02, 03)
slides.filter(s => s.num >= 2 && s.num <= 3).forEach((s, i) => {
  const tmpl = i % 2 === 0 ? 'slide-i1.html' : 'slide-i2.html';
  const n = String(s.num).padStart(2, '0');
  let h = read(tmpl)
    .replace('{{ZONA_LABEL}}', s.z.ZONA_LABEL || '')
    .replace('{{ZONA_HEADLINE}}', s.z.ZONA_HEADLINE || '')
    .replace('{{ZONA_BODY}}', s.z.ZONA_BODY || '')
    .replace('{{BG_JPG_PATH}}', slice(s.num))
    .replace('{{SLIDE_NUM}}', n)
    .replace('{{SLIDE_NUM_DISPLAY}}', `${n} / 04`);
  fs.writeFileSync(path.join(OUT, `slide-${n}.html`), h);
  console.log(`  ✓ slide-${n}.html`);
});

// Slide 04 — CTA
const s4 = slides.find(s => s.num === 4);
if (s4) {
  let h = read('slide-cta.html')
    .replace('{{ZONA_HEADLINE_L1}}', s4.z.ZONA_HEADLINE_L1 || '')
    .replace('{{ZONA_HEADLINE_L2}}', s4.z.ZONA_HEADLINE_L2 || '')
    .replace('{{ZONA_BODY}}', s4.z.ZONA_BODY || '')
    .replace('{{ZONA_CTA}}', s4.z.ZONA_CTA || '')
    .replace('{{BG_JPG_PATH}}', slice(4))
    .replace('07 / 07', '04 / 04');
  fs.writeFileSync(path.join(OUT, 'slide-04.html'), h);
  console.log('  ✓ slide-04.html (cta)');
}

console.log(`\n  ${fs.readdirSync(OUT).filter(f=>f.endsWith('.html')).length} slides em posts/${slug}/slides/\n`);
