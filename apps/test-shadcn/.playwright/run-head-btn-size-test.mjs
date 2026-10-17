import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const BASE = 'http://localhost:5273/';
const LAYOUT = '#srt-inputs-menus-layout';
const IGNORE = /Download the React DevTools/i;

const results = [];
const record = (id, status, evidence, shot) => {
  results.push({ id, status, evidence, shot });
  console.log(`${status} [${id}] ${evidence}${shot ? ` shot=${shot}` : ''}`);
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1600 } });

const msgs = [];
page.on('console', (m) => {
  if (['error', 'warning'].includes(m.type())) msgs.push(m.type() + ': ' + m.text());
});
page.on('pageerror', (e) => msgs.push('PAGEERROR: ' + e.message));

const shot = (name, sel) =>
  (sel ? page.locator(sel) : page).screenshot({ path: path.join(SHOTS, name) });

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector(LAYOUT, { timeout: 15000 });
await page.locator(`${LAYOUT}`).scrollIntoViewIfNeeded();
await page.waitForTimeout(500);

// Helper: measure every button inside thead, classify by aria-label, size, svg.
const scanHeadButtons = () =>
  page.evaluate((LAYOUT) => {
    const thead = document.querySelector(`${LAYOUT} thead`);
    if (!thead) return { found: false, buttons: [] };
    const btns = [...thead.querySelectorAll('button')];
    return {
      found: true,
      buttons: btns.map((b) => {
        const r = b.getBoundingClientRect();
        const svg = b.querySelector('svg');
        const sr = svg?.getBoundingClientRect();
        const cs = getComputedStyle(b);
        return {
          aria: b.getAttribute('aria-label') || '',
          w: Math.round(r.width),
          h: Math.round(r.height),
          classes: b.className,
          hasIconSm: /(^|\s)size-8(\s|$)/.test(b.className),
          svgW: sr ? Math.round(sr.width) : null,
          svgH: sr ? Math.round(sr.height) : null,
          cursor: cs.cursor,
          draggable: b.getAttribute('draggable'),
          visible: r.width > 0 && r.height > 0,
        };
      }),
    };
  }, LAYOUT);

// ---------- Check 1: header cell buttons measure 32x32, svg 16px ----------
{
  const scan = await scanHeadButtons();
  const vis = scan.buttons.filter((b) => b.visible);
  const sortBtns = vis.filter((b) => /^sort/i.test(b.aria));
  const colActionBtns = vis.filter((b) => /column actions/i.test(b.aria));
  const filterBtns = vis.filter((b) => /filter(ing)? by/i.test(b.aria));
  const grabBtns = vis.filter((b) => /^move$/i.test(b.aria) || b.draggable === 'true');

  const sized = [...sortBtns, ...colActionBtns, ...filterBtns];
  const allSized = sized.length > 0 && sized.every((b) => b.w === 32 && b.h === 32);
  const svgOk = sized.length > 0 && sized.every((b) => b.svgW === 16 && b.svgH === 16);
  await shot('head-btn-normal.png', LAYOUT);
  record(
    '1-head-buttons-32x32-svg16',
    allSized && svgOk ? 'PASS' : 'FAIL',
    `sort=${sortBtns.length} colActions=${colActionBtns.length} filter=${filterBtns.length} grab=${grabBtns.length} | sizes=[${sized.map((b) => `${b.aria.slice(0, 14)}:${b.w}x${b.h}/svg${b.svgW}`).join(', ')}]`,
    'head-btn-normal.png',
  );
  // Stash for later checks
  globalThis.__grabCount = grabBtns.length;
}

// ---------- Check 2a: sort toggles order ----------
{
  const layout = page.locator(LAYOUT);
  const sortBtn = layout.getByRole('button', { name: /^sort by .* ascending$/i }).first();
  const cnt = await sortBtn.count();
  let toggled = false;
  let before = '';
  let after = '';
  if (cnt) {
    before = (await sortBtn.getAttribute('aria-label')) || '';
    await sortBtn.click();
    await page.waitForTimeout(300);
    // aria-label recomputes to sortedBy... / sortByDesc after activation
    const same = layout.getByRole('button', { name: /^(sort|sorted) by/i }).first();
    after = (await same.getAttribute('aria-label')) || '';
    toggled = after !== before;
  }
  record(
    '2a-sort-toggles',
    cnt && toggled ? 'PASS' : 'FAIL',
    `sortBtns=${cnt} before="${before}" after="${after}"`,
  );
}

// ---------- Check 2b: column-actions opens menu ----------
{
  const layout = page.locator(LAYOUT);
  const colBtn = layout.getByRole('button', { name: /column actions/i }).first();
  const cnt = await colBtn.count();
  let menuVisible = false;
  if (cnt) {
    await colBtn.click();
    await page.waitForTimeout(300);
    const menu = page.locator('[data-slot="dropdown-menu-content"]');
    menuVisible = (await menu.count()) > 0 && (await menu.first().isVisible());
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }
  record(
    '2b-column-actions-opens-menu',
    cnt && menuVisible ? 'PASS' : 'FAIL',
    `colActionBtns=${cnt} menuVisible=${menuVisible}`,
  );
}

// ---------- Check 2c: filter label opens popover (if visible) ----------
{
  const layout = page.locator(LAYOUT);
  const filterBtn = layout.getByRole('button', { name: /filter(ing)? by/i }).first();
  const cnt = await filterBtn.count();
  if (!cnt) {
    record('2c-filter-label-opens-popover', 'SKIP', 'no filter label rendered (no active filter)');
  } else {
    await filterBtn.click();
    await page.waitForTimeout(300);
    const pop = page.locator('[data-slot="popover-content"]');
    const popVisible = (await pop.count()) > 0 && (await pop.first().isVisible());
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    record(
      '2c-filter-label-opens-popover',
      popVisible ? 'PASS' : 'FAIL',
      `filterBtns=${cnt} popoverVisible=${popVisible}`,
    );
  }
}

// ---------- Check 3: compact density — buttons not clipped ----------
{
  const layout = page.locator(LAYOUT);
  const densityBtn = layout.getByRole('button', { name: /density/i }).first();
  const cnt = await densityBtn.count();
  if (!cnt) {
    record('3-compact-density', 'SKIP', 'no density toggle button found');
  } else {
    // MRT cycles comfortable -> compact -> spacious. Click until compact (small padding).
    // Two clicks from default 'comfortable' reaches 'spacious'; one reaches 'compact'.
    await densityBtn.click();
    await page.waitForTimeout(400);
    const scan = await scanHeadButtons();
    const vis = scan.buttons.filter((b) => b.visible);
    const sized = vis.filter((b) => /^sort|column actions|filter(ing)? by/i.test(b.aria));
    // Not clipped => still 32x32 and svg 16.
    const ok = sized.length > 0 && sized.every((b) => b.w === 32 && b.h === 32 && b.svgW === 16);
    await shot('head-btn-compact.png', LAYOUT);
    record(
      '3-compact-density',
      ok ? 'PASS' : 'FAIL',
      `density-toggled sizes=[${sized.map((b) => `${b.w}x${b.h}/svg${b.svgW}`).join(', ')}]`,
      'head-btn-compact.png',
    );
  }
}

// ---------- Check 4: grab handle (column drag) 32px + grab cursor ----------
{
  const scan = await scanHeadButtons();
  const vis = scan.buttons.filter((b) => b.visible);
  const grab = vis.filter((b) => /^move$/i.test(b.aria) || b.draggable === 'true');
  if (grab.length === 0) {
    record('4-grab-handle', 'SKIP', 'no grab handle rendered in mounted demos');
  } else {
    const g = grab[0];
    const sizeOk = g.w === 32 && g.h === 32;
    const cursorOk = /grab|move|pointer/i.test(g.cursor);
    record(
      '4-grab-handle',
      sizeOk ? 'PASS' : 'FAIL',
      `count=${grab.length} size=${g.w}x${g.h} svg=${g.svgW} cursor=${g.cursor} draggable=${g.draggable} cursorOk=${cursorOk}`,
    );
  }
}

// ---------- Check 5: console clean ----------
{
  const errs = msgs.filter((m) => !IGNORE.test(m));
  record(
    '5-console-clean',
    errs.length === 0 ? 'PASS' : 'FAIL',
    `msgs=${errs.length}${errs.length ? ' :: ' + errs.slice(0, 8).join(' | ') : ''}`,
  );
}

await browser.close();

const pass = results.filter((r) => r.status === 'PASS').length;
const fail = results.filter((r) => r.status === 'FAIL').length;
const skip = results.filter((r) => r.status === 'SKIP').length;
console.log(`\n=== SUMMARY: ${pass} PASS, ${fail} FAIL, ${skip} SKIP (of ${results.length}) ===`);
process.exit(fail ? 1 : 0);
