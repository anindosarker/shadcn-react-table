import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const URL = 'http://localhost:5273/';
const layoutSel = '[data-testid="layout"]';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector(layoutSel, { timeout: 15000 });
await page.waitForTimeout(300);

const info = await page.$eval(layoutSel, (el) => {
  const kids = Array.from(el.children);
  return {
    count: kids.length,
    classes: kids.map((k) => k.className.slice(0, 40)),
    hasBorderT: kids.some((k) => k.className.split(/\s+/).includes('border-t')),
  };
});
const fsBtn = await page.locator(`${layoutSel} button[aria-label="Toggle full screen"]`).count();
const hasTable = await page.locator(`${layoutSel} table`).count();
await page.screenshot({ path: path.join(SHOTS, '04-toolbars-off.png') });

// toolbars off => only the table container remains; no fullscreen btn (lives in top toolbar), no bottom toolbar (border-t)
const pass = info.count === 1 && hasTable > 0 && fsBtn === 0 && !info.hasBorderT;
console.log(
  `${pass ? 'PASS' : 'FAIL'} [E-toolbars-off] children=${info.count} [${info.classes.join(' | ')}]; table=${hasTable}; fullscreen-btn=${fsBtn}; bottom-toolbar(border-t)=${info.hasBorderT}; shot=04-toolbars-off.png`,
);
await browser.close();
process.exit(pass ? 0 : 1);
