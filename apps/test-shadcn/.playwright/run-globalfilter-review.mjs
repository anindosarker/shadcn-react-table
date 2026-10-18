import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const BASE = process.env.SRT_BASE || 'http://localhost:5273/';
const rec = (id, status, ev) => console.log(`${status} [${id}] ${ev}`);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1500, height: 1100 } });
const errors = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') errors.push('ERROR:' + m.text()); if (m.type() === 'warning') errors.push('WARN:' + m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR:' + e.message));
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

const region = page.locator('#srt-inputs-menus-layout');
await region.scrollIntoViewIfNeeded();
await page.waitForTimeout(200);

const SEL = '#srt-inputs-menus-layout [data-slot="collapsible-content"]:has(input[placeholder="Search"])';
const content = () => page.locator(SEL).first();
const toggle = region.locator('button[aria-label="Show/Hide search"]').first();
rec('toggle', (await toggle.count()) ? 'PASS' : 'FAIL', `toggle aria="${await toggle.getAttribute('aria-label')}"`);

if (!(await content().count())) { await toggle.click({ force: true }); await page.waitForTimeout(500); }
rec('present', (await content().count()) ? 'PASS' : 'FAIL', `global-filter collapsible-content present`);

const m = await content().evaluate((el) => {
  const cs = getComputedStyle(el);
  const grp = el.querySelector('[data-slot="input-group"]');
  const input = el.querySelector('input');
  const btns = [...el.querySelectorAll('button')].map((b) => ({ aria: b.getAttribute('aria-label'), w: b.getBoundingClientRect().width, h: b.getBoundingClientRect().height, type: b.type, disabled: b.disabled }));
  const r = el.getBoundingClientRect();
  return {
    box: { x: r.x, y: r.y + window.scrollY, w: r.width, h: r.height },
    varW: el.style.getPropertyValue('--radix-collapsible-content-width'),
    overflow: cs.overflow,
    groupW: grp?.getBoundingClientRect().width,
    inputW: input?.getBoundingClientRect().width,
    autoComplete: input?.getAttribute('autocomplete'),
    placeholder: input?.getAttribute('placeholder'),
    btns,
  };
});
rec('measure', m.box.w > 150 && m.box.w < 400 ? 'PASS' : 'FAIL', JSON.stringify(m));
await page.screenshot({ path: path.join(SHOTS, 'globalfilter-review-open.png'), clip: { x: Math.max(0, m.box.x - 40), y: Math.max(0, m.box.y - 20), width: m.box.w + 160, height: m.box.h + 40 }, fullPage: true });

// close: sample mid-animation, then unmount
await toggle.click({ force: true });
await page.waitForTimeout(100);
const mid = await page.evaluate((sel) => { const el = document.querySelector(sel); return el ? { state: el.dataset.state, w: el.getBoundingClientRect().width, anim: getComputedStyle(el).animationName, dur: getComputedStyle(el).animationDuration, ease: getComputedStyle(el).animationTimingFunction } : null; }, SEL);
await page.waitForTimeout(600);
const after = await content().count();
rec('close-anim', mid && mid.state === 'closed' && mid.w > 0 && mid.w < m.box.w && after === 0 ? 'PASS' : 'FAIL', `mid=${JSON.stringify(mid)} mountedAfter=${after}`);

// reopen: sample mid-animation
await toggle.click({ force: true });
await page.waitForTimeout(100);
const midOpen = await page.evaluate((sel) => { const el = document.querySelector(sel); return el ? { state: el.dataset.state, w: el.getBoundingClientRect().width, anim: getComputedStyle(el).animationName, varW: el.style.getPropertyValue('--radix-collapsible-content-width') } : null; }, SEL);
await page.waitForTimeout(600);
const finalW = await content().evaluate((el) => el.getBoundingClientRect().width);
rec('open-anim', midOpen && midOpen.w > 0 && midOpen.w < finalW && Math.abs(finalW - m.box.w) < 2 ? 'PASS' : 'FAIL', `midOpen=${JSON.stringify(midOpen)} final=${finalW}`);

// typing filters, clear button enables and clears
const input = content().locator('input');
const rows = () => region.locator('table tbody tr').count();
const r0 = await rows();
await input.fill('zzzzqqq'); await page.waitForTimeout(700);
const r1 = await rows();
const clearBtn = content().locator('button[aria-label="Clear search"]');
const clearEnabled = await clearBtn.isEnabled();
await clearBtn.click({ force: true }); await page.waitForTimeout(700);
const r2 = await rows();
const v = await input.inputValue();
const clearDisabledAfter = await clearBtn.isDisabled();
rec('filter-clear', r1 < r0 && clearEnabled && r2 === r0 && v === '' && clearDisabledAfter ? 'PASS' : 'FAIL', `rows ${r0} -> ${r1} -> ${r2}, clearEnabled=${clearEnabled}, value="${v}", disabledAfter=${clearDisabledAfter}`);
rec('console', [...new Set(errors)].length === 0 ? 'PASS' : 'FAIL', [...new Set(errors)].slice(0, 8).join(' || ') || 'zero errors/warnings');
await browser.close();
