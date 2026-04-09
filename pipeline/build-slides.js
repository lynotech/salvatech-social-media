#!/usr/bin/env node
/**
 * SalvaTech — Build Slides
 * 
 * Lê o copy.md estruturado por zonas e gera os 7 HTMLs a partir dos templates.
 * O Designer (modelo fast) só precisa rodar este script.
 * 
 * Uso:
 *   node pipeline/build-slides.js --slug 2026-04-08-ia-acelera-desenvolvimento --composicao A
 * 
 * Opções:
 *   --slug        Slug do post (pasta em posts/)
 *   --composicao  Tipo de capa: A, B, C ou D
 *   --interno     Tipo de slide interno: i1, i2 ou mix (default: mix)
 */
const fs = require('fs');
const path = require('path');

// ── Parse args ──
const args = {};
process.argv.slice(2).forEach((arg, i, arr) => {
  if (arg.startsWith('--')) args[arg.slice(2)] = arr[i + 1];
});

const slug = args.slug;
const composicao = (args.composicao || 'A').toUpperCase();
const interno = (args.interno || 'mix').toLowerCase();

if (!slug) { console.error('Erro: --slug é obrigatório'); process.exit(1); }

const ROOT = path.resolve(__dirname, '..');
const POST_DIR = path.join(ROOT, 'posts', slug);
const COPY_FILE = path.join(POST_DIR, 'copy.md');
const TMPL_DIR = path.join(ROOT, 'pipeline', 'templates');
const SLIDES_DIR = path.join(POST_DIR, 'slides');

// ── Verify files exist ──
if (!fs.existsSync(COPY_FILE)) {
  console.error(`Erro: ${COPY_FILE} não encontrado`);
  process.exit(1);
}

fs.mkdirSync(SLIDES_DIR, { recursive: true });

// ── Parse copy.md ──
const copyRaw = fs.readFileSync(COPY_FILE, 'utf-8');
const slides = [];
let current = null;

copyRaw.split('\n').forEach(line => {
  const slideMatch = line.match(/^\[SLIDE\s+(\d+)/i);
  if (slideMatch) {
    if (current) slides.push(current);
    current = { num: parseInt(slideMatch[1]), zones: {} };
    return;
  }
  const zoneMatch = line.match(/^(ZONA_\w+)(?:\s*\([^)]*\))?\s*:\s*(.+)/i);
  if (zoneMatch && current) {
    current.zones[zoneMatch[1].toUpperCase()] = zoneMatch[2].trim();
  }
});
if (current) slides.push(current);

console.log(`\n  🎨 Build Slides — ${slug}`);
console.log(`  Composição: Tipo ${composicao} | Interno: ${interno}`);
console.log(`  Slides encontrados no copy: ${slides.length}\n`);

// ── Paths ──
const capaPath = `../assets/capa.jpg`;
const bgPath = `../assets/background.jpg`;

// ── Build slide 01 (capa) ──
const capaTemplate = fs.readFileSync(
  path.join(TMPL_DIR, `capa-${composicao.toLowerCase()}.html`), 'utf-8'
);

const slide01 = slides.find(s => s.num === 1);
if (slide01) {
  let html = capaTemplate
    .replace('{{ZONA_LABEL}}', slide01.zones.ZONA_LABEL || '')
    .replace('{{ZONA_HEADLINE_L1}}', slide01.zones.ZONA_HEADLINE_L1 || '')
    .replace('{{ZONA_HEADLINE_L2}}', slide01.zones.ZONA_HEADLINE_L2 || '')
    .replace('{{ZONA_SUB}}', slide01.zones.ZONA_SUB || '')
    .replace('{{CAPA_JPG_PATH}}', capaPath);
  
  fs.writeFileSync(path.join(SLIDES_DIR, 'slide-01.html'), html);
  console.log('  ✓ slide-01.html (capa)');
}

// ── Build slides 02-06 (internos) ──
const internoSlides = slides.filter(s => s.num >= 2 && s.num <= 6);
internoSlides.forEach((slide, idx) => {
  let tmplName;
  if (interno === 'i1') tmplName = 'slide-i1.html';
  else if (interno === 'i2') tmplName = 'slide-i2.html';
  else tmplName = idx % 2 === 0 ? 'slide-i1.html' : 'slide-i2.html'; // mix

  const tmpl = fs.readFileSync(path.join(TMPL_DIR, tmplName), 'utf-8');
  const numPad = String(slide.num).padStart(2, '0');

  let html = tmpl
    .replace('{{ZONA_LABEL}}', slide.zones.ZONA_LABEL || '')
    .replace('{{ZONA_HEADLINE}}', slide.zones.ZONA_HEADLINE || '')
    .replace('{{ZONA_BODY}}', slide.zones.ZONA_BODY || '')
    .replace('{{BG_JPG_PATH}}', bgPath)
    .replace('{{SLIDE_NUM}}', numPad)
    .replace('{{SLIDE_NUM_DISPLAY}}', `${numPad} / 07`);

  fs.writeFileSync(path.join(SLIDES_DIR, `slide-${numPad}.html`), html);
  console.log(`  ✓ slide-${numPad}.html (${tmplName.replace('.html','')})`);
});

// ── Build slide 07 (CTA) ──
const ctaSlide = slides.find(s => s.num === 7);
if (ctaSlide) {
  const ctaTmpl = fs.readFileSync(path.join(TMPL_DIR, 'slide-cta.html'), 'utf-8');
  let html = ctaTmpl
    .replace('{{ZONA_HEADLINE_L1}}', ctaSlide.zones.ZONA_HEADLINE_L1 || '')
    .replace('{{ZONA_HEADLINE_L2}}', ctaSlide.zones.ZONA_HEADLINE_L2 || '')
    .replace('{{ZONA_BODY}}', ctaSlide.zones.ZONA_BODY || '')
    .replace('{{ZONA_CTA}}', ctaSlide.zones.ZONA_CTA || '')
    .replace('{{BG_JPG_PATH}}', bgPath);

  fs.writeFileSync(path.join(SLIDES_DIR, 'slide-07.html'), html);
  console.log('  ✓ slide-07.html (cta)');
}

console.log(`\n  Pronto! ${fs.readdirSync(SLIDES_DIR).length} slides em posts/${slug}/slides/\n`);
