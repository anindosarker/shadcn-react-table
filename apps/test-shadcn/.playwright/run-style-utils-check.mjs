import { chromium } from 'playwright';
const BASE = process.env.SRT_BASE ?? 'http://localhost:5319/';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('section h2', { timeout: 15000 });
const section = page.locator('section', { hasText: 'SRT_TableHead' }).first();
await section.getByText('column pinning', { exact: true }).click();
await page.waitForTimeout(500);
const out = await section.evaluate((s) => {
  const pick = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const b = getComputedStyle(el, '::before');
    return {
      tag: el.tagName,
      position: cs.position,
      opacity: cs.opacity,
      zIndex: cs.zIndex,
      left: cs.left,
      right: cs.right,
      width: cs.width,
      transition: cs.transitionProperty,
      beforeContent: b.content,
      beforePosition: b.position,
      beforeBg: b.backgroundColor,
      beforeZ: b.zIndex,
      beforeShadow: b.boxShadow,
      beforeInset: `${b.top} ${b.left} ${b.width} ${b.height}`,
    };
  };
  const tds = [...s.querySelectorAll('tbody tr:first-child td')];
  return {
    pinnedTh: pick(s.querySelector('th[data-pinned="true"]')),
    pinnedTdLeft: pick(tds.find((t) => t.dataset.pinned === 'true')),
    pinnedTdRight: pick([...tds].reverse().find((t) => t.dataset.pinned === 'true')),
    plainTd: pick(tds.find((t) => !t.dataset.pinned)),
    pinnedTdCount: s.querySelectorAll('td[data-pinned="true"]').length,
  };
});
console.log(JSON.stringify(out, null, 2));
console.log('errors:', errors);
await browser.close();
