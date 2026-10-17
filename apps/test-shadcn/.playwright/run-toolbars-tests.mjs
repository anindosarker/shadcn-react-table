import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const BASE = process.env.SRT_BASE ?? 'http://localhost:5273/';

const LAYOUT = '#srt-toolbars-layout';
const TOP = `${LAYOUT} > div:first-child`;
const BOTTOM = `${LAYOUT} > div:last-child`;
// Pagination root: structural equivalent of the removed SrtTablePagination-root
// class hook — the div whose rows-per-page label sits one level down (root > div
// > label), unique to the pagination container.
const PAG = 'div:has(> div > label[for^="srt-rows-per-page"])';
// AlertBanner: the shadcn Alert root (data-slot="alert"), scoped to the layout so
// other demos' alerts are never matched (replaces the removed class hook).
const BANNER = `${LAYOUT} [data-slot="alert"]`;

const results = [];
const record = (id, status, evidence, shot) => {
  results.push({ id, status, evidence, shot });
  console.log(`${status} [${id}] ${evidence}${shot ? ` shot=${shot}` : ''}`);
};

const browser = await chromium.launch({ headless: true });

async function newPage() {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
    if (m.type() === 'warning') errors.push('WARN: ' + m.text());
  });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector(LAYOUT, { timeout: 15000 });
  await page.waitForTimeout(300);
  page._errors = errors;
  return page;
}

// Drive a shadcn (Radix) Select by trigger id + option text.
async function pickSelect(page, triggerId, optionText) {
  await page.locator(`#${triggerId}`).click();
  await page.getByRole('option', { name: optionText, exact: true }).click();
  await page.waitForTimeout(300);
}

// Toggle a shadcn Checkbox found via its wrapping <label> text.
async function toggleCheckbox(page, labelText) {
  await page
    .locator(`label:has-text("${labelText}") [role="checkbox"]`)
    .first()
    .click();
  await page.waitForTimeout(300);
}

const btn = (label) => `${LAYOUT} button[aria-label="${label}"]`;

// ---------- Case a: pagination cutoff (the original bug) ----------
{
  const page = await newPage();
  const metrics = await page.evaluate(
    ({ BOTTOM, PAG, LAYOUT }) => {
      const bottom = document.querySelector(BOTTOM);
      const pag = bottom.querySelector(PAG);
      const layout = document.querySelector(LAYOUT);
      const cs = getComputedStyle(bottom);
      const b = bottom.getBoundingClientRect();
      const p = pag.getBoundingClientRect();
      const l = layout.getBoundingClientRect();
      return {
        minHeight: cs.minHeight,
        bottomBox: { top: b.top, bottom: b.bottom, height: b.height },
        pagBox: { top: p.top, bottom: p.bottom, height: p.height },
        layoutBottom: l.bottom,
        overflowY: cs.overflowY,
      };
    },
    { BOTTOM, PAG, LAYOUT },
  );
  const shot = '20-toolbars-pagination-cutoff.png';
  await page.locator(BOTTOM).screenshot({ path: path.join(SHOTS, shot) });
  const minH = parseFloat(metrics.minHeight);
  // pagination fully inside the bottom toolbar (not clipped) and toolbar inside card
  const pagInsideToolbar =
    metrics.pagBox.bottom <= metrics.bottomBox.bottom + 1 &&
    metrics.pagBox.top >= metrics.bottomBox.top - 1;
  const toolbarInsideCard =
    metrics.bottomBox.bottom <= metrics.layoutBottom + 1;
  const pass = minH >= 56 && pagInsideToolbar && toolbarInsideCard;
  record(
    'a-pagination-cutoff',
    pass ? 'PASS' : 'FAIL',
    `min-height=${metrics.minHeight}(>=56); pag[top=${metrics.pagBox.top.toFixed(0)},bot=${metrics.pagBox.bottom.toFixed(0)},h=${metrics.pagBox.height.toFixed(0)}] inside toolbar[top=${metrics.bottomBox.top.toFixed(0)},bot=${metrics.bottomBox.bottom.toFixed(0)}]=${pagInsideToolbar}; toolbar within card(bot<=${metrics.layoutBottom.toFixed(0)})=${toolbarInsideCard}`,
    shot,
  );
  await page.close();
}

// ---------- Case b: pagination works (next/prev, rows-per-page, first/last) ----------
{
  const page = await newPage();
  const rangeText = () =>
    page.locator(`${BOTTOM} ${PAG} > span`).first().innerText();
  const firstCell = () =>
    page.locator(`${LAYOUT} tbody tr:first-child td`).nth(1).innerText();

  const range0 = await rangeText();
  const cell0 = await firstCell();
  await page.locator(btn('Go to next page')).click();
  await page.waitForTimeout(200);
  const range1 = await rangeText();
  const cell1 = await firstCell();
  await page.locator(btn('Go to previous page')).click();
  await page.waitForTimeout(200);
  const range2 = await rangeText();

  // rows-per-page radix Select (trigger = button role=combobox)
  const rppSel = `${BOTTOM} button[role="combobox"][aria-label="Rows per page"]`;
  const selectRpp = async (value) => {
    await page.locator(rppSel).click();
    await page.locator(`[role="option"]:has-text("${value}")`).first().click();
    await page.waitForTimeout(200);
  };
  await selectRpp('10');
  const rangeRpp = await rangeText();

  // reset to 5, then test last/first
  await selectRpp('5');
  await page.locator(btn('Go to last page')).click();
  await page.waitForTimeout(200);
  const rangeLast = await rangeText();
  await page.locator(btn('Go to first page')).click();
  await page.waitForTimeout(200);
  const rangeFirst = await rangeText();

  const shot = '21-toolbars-pagination-works.png';
  await page.locator(BOTTOM).screenshot({ path: path.join(SHOTS, shot) });

  const nextWorked = range0 !== range1 && cell0 !== cell1;
  const prevWorked = range2 === range0;
  const rppWorked = /1-10 of 40/.test(rangeRpp);
  const lastWorked = /36-40 of 40/.test(rangeLast);
  const firstWorked = /1-5 of 40/.test(rangeFirst);
  const pass =
    nextWorked && prevWorked && rppWorked && lastWorked && firstWorked;
  record(
    'b-pagination-works',
    pass ? 'PASS' : 'FAIL',
    `next:"${range0}"->"${range1}"(cell ${cell0}->${cell1})=${nextWorked}; prev back to "${range2}"=${prevWorked}; rpp10="${rangeRpp}"=${rppWorked}; last="${rangeLast}"=${lastWorked}; first="${rangeFirst}"=${firstWorked}`,
    shot,
  );
  await page.close();
}

// ---------- Case c: pages mode (numbered buttons + ellipsis, active highlight) ----------
{
  const page = await newPage();
  await pickSelect(page, 'srt-toolbars-pagmode', 'pages');
  const numBtns = await page
    .locator(`${BOTTOM} ${PAG} button[aria-label^="Go to page"]`)
    .count();
  const ellipsis = await page
    .locator(`${BOTTOM} ${PAG} [data-slot="pagination-ellipsis"]`)
    .count();
  // click page 2 (windowed items at page 1 of 8 are [1,2,…,8])
  await page
    .locator(`${BOTTOM} ${PAG} button[aria-label="Go to page 2"]`)
    .click();
  await page.waitForTimeout(200);
  const active = await page
    .locator(`${BOTTOM} ${PAG} button[aria-current="page"]`)
    .innerText();
  const shot = '22-toolbars-pages-mode.png';
  await page.locator(BOTTOM).screenshot({ path: path.join(SHOTS, shot) });
  const pass = numBtns >= 3 && ellipsis >= 1 && active === '2';
  record(
    'c-pages-mode',
    pass ? 'PASS' : 'FAIL',
    `numbered-buttons=${numBtns}(>=3); ellipsis=${ellipsis}(>=1); clicked page2 -> active="${active}"`,
    shot,
  );
  await page.close();
}

// ---------- Case c2: custom mode drops built-in pagination UI ----------
{
  const page = await newPage();
  await pickSelect(page, 'srt-toolbars-pagmode', 'custom');
  // custom mode: pagination root still renders rows-per-page but no default/pages nav
  const nav = await page
    .locator(`${BOTTOM} ${PAG} button[aria-label^="Go to"]`)
    .count();
  const rangeSpan = await page
    .locator(`${BOTTOM} ${PAG} span:has-text(" of ")`)
    .count();
  const shot = '23-toolbars-custom-mode.png';
  await page.locator(BOTTOM).screenshot({ path: path.join(SHOTS, shot) });
  const pass = nav === 0 && rangeSpan === 0;
  record(
    'c2-custom-mode',
    pass ? 'PASS' : 'FAIL',
    `custom mode: nav-buttons=${nav}(==0), range-span=${rangeSpan}(==0) — built-in pagination UI dropped`,
    shot,
  );
  await page.close();
}

// ---------- Case d: global search ----------
{
  const page = await newPage();
  const rowCount = () => page.locator(`${LAYOUT} tbody tr`).count();
  const before = await rowCount();
  await page.locator(btn('Show/Hide search')).click();
  await page.waitForTimeout(300);
  const input = page
    .locator(`${TOP} input[type="search"], ${TOP} input`)
    .first();
  const inputVisible = await input.isVisible().catch(() => false);
  let after = before;
  let typed = false;
  if (inputVisible) {
    await input.fill('Lovelace');
    await page.waitForTimeout(500);
    after = await rowCount();
    typed = true;
  }
  const shot = '24-toolbars-global-search.png';
  await page.locator(TOP).screenshot({ path: path.join(SHOTS, shot) });
  const filtered = typed && after < before && after > 0;
  const pass = inputVisible && filtered;
  record(
    'd-global-search',
    pass ? 'PASS' : filtered || !inputVisible ? 'EXPECTED-GAP' : 'FAIL',
    `search button reveal input=${inputVisible}; typed "Lovelace": rows ${before}->${after} filtered=${filtered} (input styling is inputs/ garbage-zone)`,
    shot,
  );
  await page.close();
}

// ---------- Case e: internal buttons (filters, density, fullscreen, columns) ----------
{
  const page = await newPage();
  // filters toggle -> filter row appears in thead
  const filterInputsBefore = await page
    .locator(`${LAYOUT} thead input`)
    .count();
  await page.locator(btn('Show/Hide filters')).click();
  await page.waitForTimeout(400);
  const filterInputsAfter = await page.locator(`${LAYOUT} thead input`).count();
  const filtersShown = filterInputsAfter > filterInputsBefore;

  // density cycle -> read a body cell padding before/after
  const pad = () =>
    page.$eval(
      `${LAYOUT} tbody tr:first-child td`,
      (el) => getComputedStyle(el).paddingTop,
    );
  const padBefore = await pad();
  await page.locator(btn('Toggle density')).click();
  await page.waitForTimeout(300);
  const padAfter = await pad();
  const densityChanged = padBefore !== padAfter;

  // fullscreen -> layout gets fixed inset-0
  await page.locator(btn('Toggle full screen')).click();
  await page.waitForTimeout(400);
  const fsClass = await page.getAttribute(LAYOUT, 'class');
  const enteredFs = /\bfixed\b/.test(fsClass) && /\binset-0\b/.test(fsClass);
  const shot = '25-toolbars-fullscreen.png';
  await page.screenshot({ path: path.join(SHOTS, shot) });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const exitClass = await page.getAttribute(LAYOUT, 'class');
  const exitedFs = !/\bfixed\b/.test(exitClass);

  // columns menu button just clicks without console error (menu is garbage-zone)
  const errBefore = page._errors.length;
  await page.locator(btn('Show/Hide columns')).click();
  await page.waitForTimeout(300);
  const errAfter = page._errors.length;
  const columnsClickClean = errAfter === errBefore;
  await page.keyboard.press('Escape');

  const pass =
    filtersShown &&
    densityChanged &&
    enteredFs &&
    exitedFs &&
    columnsClickClean;
  record(
    'e-internal-buttons',
    pass ? 'PASS' : 'FAIL',
    `filters row ${filterInputsBefore}->${filterInputsAfter}=${filtersShown}; density pad ${padBefore}->${padAfter}=${densityChanged}; fullscreen enter=${enteredFs}/exit=${exitedFs}; columns-btn click clean=${columnsClickClean}`,
    shot,
  );
  await page.close();
}

// ---------- Case f: alert banner (selection + grouping) ----------
{
  const page = await newPage(); // selection ON by default, alert bottom
  // click a row checkbox
  await page
    .locator(
      `${LAYOUT} tbody [role="checkbox"][aria-label="Toggle select row"]`,
    )
    .first()
    .click();
  await page.waitForTimeout(300);
  const bannerText1 = await page.locator(BANNER).first().innerText();
  const selShown = /1 of 40 row/i.test(bannerText1);
  const shotSel = '26-toolbars-banner-selection.png';
  await page.locator(BOTTOM).screenshot({ path: path.join(SHOTS, shotSel) });
  // clear selection
  await page.locator(`${BANNER} button:has-text("Clear selection")`).click();
  await page.waitForTimeout(300);
  const bannerAfterClear = await page.locator(BANNER).count();
  const cleared = bannerAfterClear === 0;
  record(
    'f-banner-selection',
    selShown && cleared ? 'PASS' : 'FAIL',
    `select 1 row -> banner "${bannerText1.replace(/\n/g, ' ').trim()}"=${selShown}; clear-selection removes banner=${cleared}`,
    shotSel,
  );
  await page.close();
}

// ---------- Case f2: grouping chip ----------
{
  const page = await newPage();
  await toggleCheckbox(page, 'grouping'); // remounts with initialState.grouping
  await page.waitForTimeout(400);
  const bannerText = await page.locator(BANNER).first().innerText();
  const chipShown =
    /grouped by/i.test(bannerText) && /department/i.test(bannerText);
  const shot = '27-toolbars-banner-grouping.png';
  await page.locator(BOTTOM).screenshot({ path: path.join(SHOTS, shot) });
  // delete chip -> ungroup
  const chipClose = page.locator(`${BANNER} span button`).last();
  await chipClose.click();
  await page.waitForTimeout(400);
  const bannerAfter = await page.locator(BANNER).count();
  const ungrouped = bannerAfter === 0;
  record(
    'f2-banner-grouping',
    chipShown && ungrouped ? 'PASS' : 'FAIL',
    `grouping on -> banner "${bannerText.replace(/\n/g, ' ').trim()}"=${chipShown}; chip delete ungroups (banner gone=${ungrouped})`,
    shot,
  );
  await page.close();
}

// ---------- Case g: progress bars in both toolbars ----------
{
  const page = await newPage();
  await toggleCheckbox(page, 'progress bars');
  await page.waitForTimeout(600);
  const bars = await page.evaluate(
    ({ TOP, BOTTOM }) => {
      // radix Progress: manual aria dropped (the primitive supplies
      // role=progressbar); the indicator animates via translateX, not width.
      const q = (root) => {
        const el = document
          .querySelector(root)
          .querySelector('[data-slot="progress"]');
        if (!el) return null;
        const inner = el.querySelector('[data-slot="progress-indicator"]');
        const wrapper =
          el.closest('[data-slot="collapsible"]') ?? el.parentElement;
        const cs = inner ? getComputedStyle(inner) : null;
        return {
          present: true,
          width: cs ? `${cs.animationName}@${cs.animationDuration}` : '',
          wrapperClass: wrapper.className,
        };
      };
      return { top: q(TOP), bottom: q(BOTTOM) };
    },
    { TOP, BOTTOM },
  );
  const shot = '28-toolbars-progress-bars.png';
  await page.screenshot({ path: path.join(SHOTS, shot) });
  const topOk = bars.top?.present && /bottom-0/.test(bars.top.wrapperClass);
  const botOk = bars.bottom?.present && /top-0/.test(bars.bottom.wrapperClass);
  // MUI LinearProgress animates in CSS (indeterminate keyframes), not by value.
  const animating =
    bars.top?.width === 'srt-linear-progress-indeterminate@2.1s' &&
    bars.bottom?.width === 'srt-linear-progress-indeterminate@2.1s';
  const pass = topOk && botOk && animating;
  record(
    'g-progress-bars',
    pass ? 'PASS' : 'FAIL',
    `top bar present=${bars.top?.present} pos=${topOk ? 'bottom-0' : bars.top?.wrapperClass}; bottom bar present=${bars.bottom?.present} pos=${botOk ? 'top-0' : bars.bottom?.wrapperClass}; widths top=${bars.top?.width} bottom=${bars.bottom?.width} animating=${animating}`,
    shot,
  );
  await page.close();
}

// ---------- Case h: console errors from toolbar components ----------
{
  const page = await newPage();
  // exercise a chain of toolbar interactions
  await page.locator(btn('Go to next page')).click();
  await page.waitForTimeout(150);
  await pickSelect(page, 'srt-toolbars-pagmode', 'pages');
  await pickSelect(page, 'srt-toolbars-pagpos', 'both');
  await toggleCheckbox(page, 'progress bars');
  await toggleCheckbox(page, 'custom actions');
  await page.waitForTimeout(300);
  // custom action buttons present
  const topAction = await page.locator('#srt-toolbars-top-action').count();
  const botAction = await page.locator('#srt-toolbars-bottom-action').count();
  await pickSelect(page, 'srt-toolbars-alertpos', 'head-overlay');
  await page.waitForTimeout(300);
  const shot = '29-toolbars-combined.png';
  await page.screenshot({ path: path.join(SHOTS, shot) });

  // garbage-zone noise to ignore: input/menu clusters not part of toolbar cluster.
  // "controlled input to be uncontrolled": MRT-exact range filter under StrictMode
  // (isMounted effect double-runs -> handleClear -> [undefined, undefined] ->
  // value={filterValue} undefined, same as MRT_FilterTextField:530-535); baseline.
  const garbage =
    /GlobalFilterTextField|SelectCheckbox|filter|menu|popover|command|Download the React DevTools|Radix|controlled input to be uncontrolled/i;
  const toolbarErrors = page._errors.filter((e) => !garbage.test(e));
  const pass = toolbarErrors.length === 0;
  record(
    'h-console',
    pass ? 'PASS' : 'FAIL',
    `custom-actions rendered top=${topAction}/bottom=${botAction}; toolbar-cluster console errors=${toolbarErrors.length}${toolbarErrors.length ? ' :: ' + toolbarErrors.slice(0, 3).join(' | ') : ''}; total-console-msgs=${page._errors.length}`,
    shot,
  );
  await page.close();
}

// ---------- Case h2: native <select> rows-per-page on mobile (MRT isMobile rule) ----------
{
  const page = await newPage();
  await page.setViewportSize({ width: 600, height: 900 });
  await page.waitForTimeout(300);
  const rows = () => page.locator(`${LAYOUT} tbody tr`).count();
  const sel = page.locator(`${BOTTOM} ${PAG} select`);
  const selCount = await sel.count();
  const value0 = selCount ? await sel.inputValue() : null;
  const rows0 = await rows();
  if (selCount) {
    await sel.selectOption('10');
    await page.waitForTimeout(300);
  }
  const rows1 = await rows();
  const shot = '30-toolbars-native-select-mobile.png';
  await page.locator(BOTTOM).screenshot({ path: path.join(SHOTS, shot) });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(300);
  const comboAfter = await page
    .locator(`${BOTTOM} button[role="combobox"][aria-label="Rows per page"]`)
    .count();
  const pass =
    selCount === 1 &&
    value0 === '5' &&
    rows0 === 5 &&
    rows1 === 10 &&
    comboAfter === 1;
  record(
    'h-native-select-mobile',
    pass ? 'PASS' : 'FAIL',
    `select present=${selCount === 1} value=${value0}; rows 5->10: ${rows0}->${rows1}; desktop restores radix combobox=${comboAfter === 1}`,
    shot,
  );
  await page.close();
}

await browser.close();

const pass = results.filter((r) => r.status === 'PASS').length;
const fail = results.filter((r) => r.status === 'FAIL').length;
const gap = results.filter((r) => r.status === 'EXPECTED-GAP').length;
console.log(
  `\n=== SUMMARY: ${pass} PASS, ${fail} FAIL, ${gap} EXPECTED-GAP (of ${results.length}) ===`,
);
process.exit(fail ? 1 : 0);
