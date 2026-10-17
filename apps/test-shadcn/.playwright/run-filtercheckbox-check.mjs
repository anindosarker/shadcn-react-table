import { chromium } from 'playwright';
const BASE = process.env.SRT_BASE ?? 'http://localhost:5273/';
const LAYOUT = '#srt-inputs-menus-layout';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector(LAYOUT, { timeout: 15000 });
await page.waitForTimeout(400);
const ths = await page.locator(`${LAYOUT} thead th`).evaluateAll((els) => els.map((t) => t.innerText.replace(/\s+/g, ' ').slice(0, 40)));
console.log('ths', ths);
const labels = page.locator(`${LAYOUT} thead label:has([role="checkbox"])`);
console.log('label count', await labels.count());
const label = labels.first();
const cb = label.locator('[role="checkbox"]').first();
const info = async () => ({
  state: await cb.getAttribute('data-state'),
  cls: await cb.getAttribute('class'),
  bg: await cb.evaluate((el) => getComputedStyle(el).backgroundColor),
  size: await cb.evaluate((el) => el.getBoundingClientRect().width),
  rows: await page.locator(`${LAYOUT} tbody tr`).count(),
  labelCls: await label.getAttribute('class'),
  labelText: await label.innerText(),
});
await label.scrollIntoViewIfNeeded();
console.log('initial', await info());
const box = await label.boundingBox();
await page.mouse.click(box.x + box.width - 10, box.y + box.height / 2); // click the text end, not the box
await page.waitForTimeout(400);
console.log('after label-text click', await info());
await cb.click();
await page.waitForTimeout(400);
console.log('after box click', await info());
await cb.click();
await page.waitForTimeout(400);
console.log('after third click', await info());
console.log('errors', errors);
await browser.close();
