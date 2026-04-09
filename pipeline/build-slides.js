#!/usr/bin/env node
/**
 * SalvaTech — Build Slides (4 slides)
 * Uso: node pipeline/build-slides.js --slug 2026-04-09-tema
 */
const fs = require('fs');
const path = require('path');

const args = {};
process.argv.slice(2).forEach((a, i, arr) => { if (a.startsWith('--')) args[a.slice(2)] = arr[i+1]; });
const slug = args.slug;
const capaStyle = (args.capa || 'a').toLowerCase(); // a, b, ou c
if (!slug) { console.error('--slug obrigatório'); process.exit(1); }

const ROOT = path.resolve(__dirname, '..');
const POST = path.join(ROOT, 'posts', slug);
const COPY = path.join(POST, 'copy.md');
const TMPL = path.join(ROOT, 'pipeline', 'templates');
const OUT = path.join(POST, 'slides');

if (!fs.existsSync(COPY)) { console.error(`${COPY} não encontrado`); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });

// Parse copy.md
const raw = fs.readFileSync(COPY, 'utf-8');
const slides = []; let cur = null;
raw.split('\n').forEach(line => {
  const m = line.match(/^\[SLIDE\s+(\d+)/i);
  if (m) { if (cur) slides.push(cur); cur = { num: parseInt(m[1]), z: {} }; return; }
  const z = line.match(/^(ZONA_\w+)(?:\s*\([^)]*\))?\s*:\s*(.+)/i);
  if (z && cur) cur.z[z[1].toUpperCase()] = z[2].trim();
});
if (cur) slides.push(cur);

console.log(`\n  Build — ${slug} (${slides.length} slides, capa ${capaStyle.toUpperCase()})\n`);

// Paths — capa.jpg pra slide 1, background.jpg pros internos
const capaPath = `/posts/${slug}/assets/capa.jpg`;
const bgPath = `/posts/${slug}/assets/background.jpg`;
function read(f) { return fs.readFileSync(path.join(TMPL, f), 'utf-8'); }

// Slide 01 — Capa
const s1 = slides.find(s => s.num === 1);
if (s1) {
  let h = read(`capa-${capaStyle}.html`)
    .replace('{{ZONA_LABEL}}', s1.z.ZONA_LABEL || '')
    .replace('{{ZONA_HEADLINE_L1}}', s1.z.ZONA_HEADLINE_L1 || '')
    .replace('{{ZONA_HEADLINE_L2}}', s1.z.ZONA_HEADLINE_L2 || '')
    .replace('{{ZONA_SUB}}', s1.z.ZONA_SUB || '')
    .replace('{{CAPA_JPG_PATH}}', capaPath);
  fs.writeFileSync(path.join(OUT, 'slide-01.html'), h);
  console.log('  ✓ slide-01.html (capa)');
}

// Slides 02, 03 — Internos
slides.filter(s => s.num >= 2 && s.num <= 3).forEach((s, i) => {
  const tmpl = i % 2 === 0 ? 'slide-i1.html' : 'slide-i2.html';
  const n = String(s.num).padStart(2, '0');
  let h = read(tmpl)
    .replace('{{ZONA_LABEL}}', s.z.ZONA_LABEL || '')
    .replace('{{ZONA_HEADLINE}}', s.z.ZONA_HEADLINE || '')
    .replace('{{ZONA_BODY}}', s.z.ZONA_BODY || '')
    .replace('{{BG_JPG_PATH}}', bgPath)
    .replace('{{SLIDE_NUM}}', n);
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
    .replace('{{BG_JPG_PATH}}', bgPath);
  fs.writeFileSync(path.join(OUT, 'slide-04.html'), h);
  console.log('  ✓ slide-04.html (cta)');
}

console.log(`\n  ${fs.readdirSync(OUT).filter(f=>f.endsWith('.html')).length} slides prontos\n`);
