const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const slug = process.argv[2];
if (!slug) { console.error('Usage: node render-slides.js <slug>'); process.exit(1); }

(async () => {
  const browser = await chromium.launch();
  const slidesDir = path.resolve('posts', slug, 'slides');
  const exportDir = path.resolve('posts', slug, 'export');

  fs.mkdirSync(exportDir, { recursive: true });

  const files = fs.readdirSync(slidesDir).filter(f => f.endsWith('.html')).sort();
  console.log(`  Rendering ${files.length} slides for ${slug}`);

  for (const file of files) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1080, height: 1350 });
    const htmlPath = 'file:///' + path.join(slidesDir, file).replace(/\\/g, '/');
    await page.goto(htmlPath, { waitUntil: 'networkidle' });
    const outFile = file.replace('.html', '.png');
    const outPath = path.join(exportDir, outFile);
    await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
    await page.close();
    console.log('  OK: export/' + outFile);
  }

  await browser.close();
  console.log(`  Done: ${files.length} PNGs in posts/${slug}/export/`);
})().catch(e => { console.error(e); process.exit(1); });
