// Usage: node carousel/render.js posts/2026-11-10
// Reads <dir>/content.json and writes <dir>/slide-1.jpg ... (JPEG, 1080x1350, no metadata).
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { buildSlides } = require('./template');

const CHROME_PATHS = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].filter(Boolean);

(async () => {
  const dir = path.resolve(process.argv[2] || '.');
  const content = JSON.parse(fs.readFileSync(path.join(dir, 'content.json'), 'utf8'));
  const executablePath = CHROME_PATHS.find((p) => fs.existsSync(p));
  if (!executablePath) throw new Error('No Chrome found. Run: npx @puppeteer/browsers install chrome-headless-shell@stable  and set CHROME_PATH to the printed path');

  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });

  const slides = buildSlides(content);
  for (let i = 0; i < slides.length; i++) {
    await page.setContent(slides[i], { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const out = path.join(dir, `slide-${i + 1}.jpg`);
    await page.screenshot({ path: out, type: 'jpeg', quality: 92 });
    console.log('wrote', out);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
