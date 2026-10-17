import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const BASE = process.env.SRT_BASE || 'http://localhost:5404/';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1500, height: 1100 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.addStyleTag({ content: `
@keyframes srt-collapsible-right { from { width: 0; overflow: hidden } to { width: var(--radix-collapsible-content-width); overflow: hidden } }
@keyframes srt-collapsible-left { from { width: var(--radix-collapsible-content-width); overflow: hidden } to { width: 0; overflow: hidden } }
` });
await page.waitForTimeout(400);
const region = page.locator('#srt-inputs-menus-layout');
await region.scrollIntoViewIfNeeded();
const SEL = '#srt-inputs-menus-layout [data-slot="collapsible-content"]:has(input[placeholder="Search"])';
const toggle = region.locator('button[aria-label="Show/Hide search"]').first();
// make sure closed first
if (await page.locator(SEL).count()) { await region.locator('button[aria-label="Show/Hide search"]').first().evaluate((b) => b.click()); await page.waitForTimeout(600); }
// observe class removal continuously via MutationObserver on the layout region
await page.evaluate((sel) => {
  const strip = () => document.querySelectorAll(sel).forEach((el) => { if (el.classList.contains('overflow-hidden')) el.classList.remove('overflow-hidden'); });
  new MutationObserver(strip).observe(document.querySelector('#srt-inputs-menus-layout'), { childList: true, subtree: true, attributes: true });
  strip();
}, SEL);
await region.locator('button[aria-label="Show/Hide search"]').first().evaluate((b) => b.click());
await page.waitForTimeout(100);
const mid = await page.evaluate((sel) => { const el = document.querySelector(sel); const cs = getComputedStyle(el); return { cls: el.className, overflow: cs.overflow, w: el.getBoundingClientRect().width, anim: cs.animationName }; }, SEL);
await page.waitForTimeout(600);
const after = await page.evaluate((sel) => { const el = document.querySelector(sel); const cs = getComputedStyle(el); return { overflow: cs.overflow, w: el.getBoundingClientRect().width, anim: cs.animationName }; }, SEL);
console.log('mid', JSON.stringify(mid)); console.log('after', JSON.stringify(after));
await page.locator(SEL).locator('input').focus();
await page.waitForTimeout(100);
const b = await page.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, SEL);
await page.screenshot({ path: path.join(SHOTS, 'globalfilter-skeptic-fix-focus.png'), clip: { x: b.x - 20, y: b.y - 20, width: b.w + 40, height: b.h + 40 } });
// close mid-animation overflow
await region.locator('button[aria-label="Show/Hide search"]').first().evaluate((b) => b.click());
await page.waitForTimeout(100);
const midClose = await page.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return null; const cs = getComputedStyle(el); return { state: el.dataset.state, overflow: cs.overflow, w: el.getBoundingClientRect().width }; }, SEL);
await page.waitForTimeout(600);
console.log('midClose', JSON.stringify(midClose), 'mountedAfter', await page.locator(SEL).count());
await browser.close();
