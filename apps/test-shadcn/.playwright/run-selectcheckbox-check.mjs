import { chromium } from 'playwright';
const BASE = process.env.SRT_BASE ?? 'http://localhost:5273/';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('#layout', { timeout: 15000 });
await page.waitForTimeout(400);
const head = page.locator('#layout thead [role="checkbox"]').first();
const rows = page.locator('#layout tbody [role="checkbox"]');
const states = async () => ({
  head: await head.getAttribute('data-state'),
  rows: await rows.evaluateAll((els) => els.map((e) => e.getAttribute('data-state')[0]).join('')),
  size: await rows.first().evaluate((el) => el.getBoundingClientRect().width),
  cls: await rows.first().getAttribute('class'),
  aria: await rows.first().getAttribute('aria-label'),
});
console.log('initial', await states());
await rows.nth(1).click(); await page.waitForTimeout(200);
console.log('after row1 click', await states());
await rows.nth(4).click({ modifiers: ['Shift'] }); await page.waitForTimeout(200);
console.log('after shift row4', await states());
await head.click(); await page.waitForTimeout(200);
console.log('after head click', await states());
await head.click(); await page.waitForTimeout(200);
console.log('after head click 2', await states());
await rows.nth(0).focus(); await page.keyboard.press('Space'); await page.waitForTimeout(200);
console.log('after space row0', await states());
await rows.nth(0).hover(); await page.waitForTimeout(1300);
console.log('tooltip', await page.locator('[role="tooltip"]').count(), await page.locator('[role="tooltip"]').first().innerText().catch(() => ''));
console.log('errors', errors);
await browser.close();
