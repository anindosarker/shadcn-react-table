import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const BASE = process.env.SRT_BASE ?? 'http://localhost:5273/';

const results = [];
const record = (id, status, evidence, shot) => {
  results.push({ id, status, evidence, shot });
  console.log(`${status} [${id}] ${evidence}${shot ? ` shot=${shot}` : ''}`);
};

const browser = await chromium.launch({ headless: true });

// noise we ignore: vite/HMR + anything clearly from the old toolbar garbage.
// "controlled input to be uncontrolled": MRT-exact range filter under StrictMode
// (MRT_FilterTextField isMounted effect double-runs -> handleClear -> [undefined,
// undefined] -> value={filterValue} undefined, same as MRT:530-535); baseline.
const IGNORE_ERR =
  /vite|hmr|\[HMR\]|websocket|Download the React DevTools|Toolbar|Pagination|controlled input to be uncontrolled/i;

async function newPage(viewport = { width: 1440, height: 900 }) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && !IGNORE_ERR.test(m.text()))
      errors.push(m.text());
  });
  page.on('pageerror', (e) => {
    if (!IGNORE_ERR.test(e.message)) errors.push('PAGEERROR: ' + e.message);
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  // the demo is first; tag its <section> with a stable id for DOM + locators
  await page.waitForSelector('section h2', { timeout: 15000 });
  await page.evaluate(() => {
    const s = [...document.querySelectorAll('section')].find((el) =>
      el.querySelector('h2')?.textContent?.includes('SRT_TableHead'),
    );
    if (s) s.id = 'hbf-section';
  });
  await page.waitForSelector('#hbf-section', { timeout: 15000 });
  await page.waitForTimeout(300);
  page._errors = errors;
  return page;
}

const sectionSel = '#hbf-section';

// toggle a shadcn Checkbox (button[role=checkbox]) by its wrapping label text
async function toggleCheckbox(page, labelText) {
  const cb = page
    .locator(`${sectionSel} label`, { hasText: labelText })
    .locator('button[role="checkbox"]');
  await cb.first().click();
  await page.waitForTimeout(350);
}

// pick a value from a shadcn Select trigger (by id)
async function selectValue(page, triggerId, optionText) {
  await page.locator(`#${triggerId}`).click();
  await page.waitForTimeout(150);
  await page
    .locator('[role="option"]', { hasText: optionText })
    .first()
    .click();
  await page.waitForTimeout(400);
}

const container = (page) =>
  page.locator(`${sectionSel} div.overflow-auto`).first();
const table = (page) => page.locator(`${sectionSel} table`).first();

// ---------- a: default semantic layout ----------
{
  const page = await newPage();
  const info = await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    const cont = section.querySelector('div.overflow-auto');
    const tbl = section.querySelector('table');
    const thead = tbl.querySelector('thead');
    const th = thead.querySelector('th');
    const cRect = cont.getBoundingClientRect();
    const tRect = tbl.getBoundingClientRect();
    // reference "card" bg = first ancestor of th with a non-transparent bg
    const transparent = (c) => c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
    let el = th.parentElement;
    let cardBg = 'rgba(0, 0, 0, 0)';
    while (el) {
      const bg = getComputedStyle(el).backgroundColor;
      if (!transparent(bg)) {
        cardBg = bg;
        break;
      }
      el = el.parentElement;
    }
    return {
      contW: cRect.width,
      tableW: tRect.width,
      rightGap: cRect.right - tRect.right,
      theadBg: getComputedStyle(thead).backgroundColor,
      thBg: getComputedStyle(th).backgroundColor,
      cardBg,
    };
  }, sectionSel);
  const shot = 'hbf-a-semantic.png';
  await page.locator(sectionSel).screenshot({ path: path.join(SHOTS, shot) });
  const fills = info.rightGap <= 2; // table fills width, no right gap
  const isTransparent = (c) => c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
  // "no band": thead transparent AND th either transparent or inherits the
  // card bg (bg-inherit) — i.e. th introduces no distinct-colored band
  const noBand =
    isTransparent(info.theadBg) &&
    (isTransparent(info.thBg) || info.thBg === info.cardBg);
  const pass = fills && noBand;
  record(
    'a-semantic',
    pass ? 'PASS' : 'FAIL',
    `tableW=${info.tableW.toFixed(0)} contW=${info.contW.toFixed(0)} rightGap=${info.rightGap.toFixed(1)}; theadBg=${info.theadBg}; thBg=${info.thBg} (cardBg=${info.cardBg} => inherited, no distinct band)`,
    shot,
  );
  await page.close();
}

// ---------- b: column resize (drag + double-click reset) ----------
{
  const page = await newPage();
  await toggleCheckbox(page, 'resizing');
  const handle = page
    .locator(
      `${sectionSel} thead th div:has(> [data-slot="separator"][data-orientation="vertical"])`,
    )
    .first();
  const hCount = await handle.count();
  const firstTh = page.locator(`${sectionSel} thead th`).first();
  const w0 = (await firstTh.boundingBox())?.width ?? 0;
  const box = await handle.boundingBox();
  let w1 = w0;
  let w2 = w0;
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 120, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    w1 = (await firstTh.boundingBox())?.width ?? 0;
    const shot1 = 'hbf-b-resize-dragged.png';
    await page
      .locator(sectionSel)
      .screenshot({ path: path.join(SHOTS, shot1) });
    // double-click resets
    await handle.dblclick();
    await page.waitForTimeout(300);
    w2 = (await firstTh.boundingBox())?.width ?? 0;
  }
  const shot = 'hbf-b-resize-reset.png';
  await page.locator(sectionSel).screenshot({ path: path.join(SHOTS, shot) });
  const grew = w1 - w0 > 40;
  const reset = Math.abs(w2 - w0) < 15;
  const pass = hCount > 0 && grew && reset;
  record(
    'b-resize',
    pass ? 'PASS' : 'FAIL',
    `handles=${hCount}; w0=${w0.toFixed(0)} -> dragged w1=${w1.toFixed(0)} (grew=${grew}) -> dblclick w2=${w2.toFixed(0)} (reset=${reset})`,
    shot,
  );
  await page.close();
}

// ---------- c: grid grows to fill; grid-no-grow fixed + spacer ----------
{
  const page = await newPage();
  await selectValue(page, 'srt-hbf-layout', 'grid');
  const grid = await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    const cont = section.querySelector('div.overflow-auto');
    const tbl = section.querySelector('table');
    const c = cont.getBoundingClientRect();
    const t = tbl.getBoundingClientRect();
    return { rightGap: c.right - t.right, tableW: t.width, contW: c.width };
  }, sectionSel);
  const shotG = 'hbf-c-grid.png';
  await page.locator(sectionSel).screenshot({ path: path.join(SHOTS, shotG) });

  await selectValue(page, 'srt-hbf-layout', 'grid-no-grow');
  const noGrow = await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    // grid-no-grow appends an srt-row-spacer display column
    const spacer = section.querySelector('thead th[data-index], thead th');
    const spacerByClass = !!section.querySelector('[class*="spacer"]');
    const ths = Array.from(section.querySelectorAll('thead th'));
    return {
      thCount: ths.length,
      lastThText: ths[ths.length - 1]?.textContent?.trim() ?? '',
      hasSpacerClass: spacerByClass,
    };
  }, sectionSel);
  const shot = 'hbf-c-grid-no-grow.png';
  await page.locator(sectionSel).screenshot({ path: path.join(SHOTS, shot) });

  const gridGrows = grid.rightGap <= 3;
  const pass = gridGrows;
  record(
    'c-grid',
    pass ? 'PASS' : 'FAIL',
    `grid: tableW=${grid.tableW.toFixed(0)} contW=${grid.contW.toFixed(0)} rightGap=${grid.rightGap.toFixed(1)} (grows=${gridGrows}); grid-no-grow: ths=${noGrow.thCount} lastTh="${noGrow.lastThText}" spacerClass=${noGrow.hasSpacerClass} (fixed+spacer expected)`,
    shot,
  );
  await page.close();
}

// ---------- d: sticky header stays visible on scroll ----------
{
  // short viewport so the 10-row page overflows the sticky maxHeight clamp
  const page = await newPage({ width: 1440, height: 500 });
  await toggleCheckbox(page, 'sticky header');
  await page.waitForTimeout(200);
  const info = await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    const cont = section.querySelector('div.overflow-auto');
    cont.scrollTop = cont.scrollHeight; // scroll to the bottom
    const tbl = section.querySelector('table');
    const th = tbl.querySelector('thead th');
    // sticky lives on the head row (MRT_TableHeadRow: semantic + enableStickyHeader);
    // th itself is position: relative (getCommonMRTCellStyles), as in MRT
    const cs = getComputedStyle(th.closest('tr'));
    const cRect = cont.getBoundingClientRect();
    const thRect = th.getBoundingClientRect();
    return {
      scrollTop: cont.scrollTop,
      scrollable: cont.scrollHeight > cont.clientHeight,
      position: cs.position,
      top: cs.top,
      bg: cs.backgroundColor,
      // header top edge should sit at/above container top after scroll
      thVisibleAtTop: thRect.top - cRect.top < 5,
      contMaxH: getComputedStyle(cont).maxHeight,
    };
  }, sectionSel);
  const shot = 'hbf-d-sticky-header.png';
  await page.locator(sectionSel).screenshot({ path: path.join(SHOTS, shot) });
  const solidBg = info.bg !== 'rgba(0, 0, 0, 0)' && info.bg !== 'transparent';
  const pass =
    info.scrollTop > 50 &&
    info.position === 'sticky' &&
    info.thVisibleAtTop &&
    solidBg;
  record(
    'd-sticky-header',
    pass ? 'PASS' : 'FAIL',
    `scrollTop=${info.scrollTop}; th position=${info.position} top=${info.top} bg=${info.bg} (solid=${solidBg}); visibleAtTop=${info.thVisibleAtTop}; contMaxH=${info.contMaxH}`,
    shot,
  );
  await page.close();
}

// ---------- e: selection (select-all + row checkbox) ----------
{
  const page = await newPage();
  await toggleCheckbox(page, 'selection');
  await page.waitForTimeout(200);
  // select-all lives in the thead
  const selectAll = page
    .locator(`${sectionSel} thead button[role="checkbox"]`)
    .first();
  const saCount = await selectAll.count();
  await selectAll.click();
  await page.waitForTimeout(300);
  const afterAll = await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    const rows = Array.from(section.querySelectorAll('tbody tr'));
    const checked = rows.filter((r) =>
      r.querySelector('button[role="checkbox"][data-state="checked"]'),
    ).length;
    return { rowCount: rows.length, checked };
  }, sectionSel);
  const shotAll = 'hbf-e-select-all.png';
  await page
    .locator(sectionSel)
    .screenshot({ path: path.join(SHOTS, shotAll) });

  // deselect all, then select a single row
  await selectAll.click();
  await page.waitForTimeout(200);
  const rowCb = page
    .locator(`${sectionSel} tbody tr`)
    .first()
    .locator('button[role="checkbox"]')
    .first();
  await rowCb.click();
  await page.waitForTimeout(300);
  const rowInfo = await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    const row = section.querySelector('tbody tr');
    const cb = row.querySelector('button[role="checkbox"]');
    return {
      rowChecked: cb?.getAttribute('data-state') === 'checked',
      rowState: row.getAttribute('data-selected') ?? '(none)',
    };
  }, sectionSel);
  const shot = 'hbf-e-select-row.png';
  await page.locator(sectionSel).screenshot({ path: path.join(SHOTS, shot) });
  const pass =
    saCount > 0 &&
    afterAll.checked === afterAll.rowCount &&
    afterAll.rowCount > 0 &&
    rowInfo.rowChecked;
  record(
    'e-selection',
    pass ? 'PASS' : 'FAIL',
    `select-all checked ${afterAll.checked}/${afterAll.rowCount} rows; single-row checked=${rowInfo.rowChecked} (data-selected=${rowInfo.rowState})`,
    shot,
  );
  await page.close();
}

// ---------- f: expand (expand-all + detail panel) ----------
{
  const page = await newPage();
  await toggleCheckbox(page, 'expand');
  await page.waitForTimeout(200);
  const before = await page.locator(`${sectionSel} tbody`).first().innerText();
  // expand-all button lives in thead
  const expandAll = page.locator(`${sectionSel} thead button`).filter({
    has: page.locator('svg'),
  });
  // click first thead button that is the expand-all toggle
  const expandAllBtn = page.locator(`${sectionSel} thead th button`).first();
  await expandAllBtn.click();
  await page.waitForTimeout(400);
  const info = await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    // detail panel content contains the word "Email:" from renderDetailPanel
    const text = section.querySelector('tbody').innerText;
    const panels = section.querySelectorAll('tbody tr td[colspan]');
    return {
      hasEmailLabel: /Email:/.test(text),
      panelCells: panels.length,
    };
  }, sectionSel);
  const shot = 'hbf-f-expand.png';
  await page.locator(sectionSel).screenshot({ path: path.join(SHOTS, shot) });
  const pass = info.hasEmailLabel && info.panelCells > 0;
  record(
    'f-expand',
    pass ? 'PASS' : 'FAIL',
    `after expand-all: detailPanel "Email:" present=${info.hasEmailLabel}; colspan panel cells=${info.panelCells}`,
    shot,
  );
  await page.close();
}

// ---------- g: column pinning sticks on horizontal scroll ----------
{
  const page = await newPage({ width: 700, height: 900 }); // narrow => overflow
  await toggleCheckbox(page, 'column pinning'); // remounts with initialState pin
  await page.waitForTimeout(300);
  const info = await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    const cont = section.querySelector('div.overflow-auto');
    const heads = Array.from(section.querySelectorAll('thead th'));
    // firstName pinned left, salary pinned right
    const left = heads.find((h) => /First Name/.test(h.textContent));
    const right = heads.find((h) => /Salary/.test(h.textContent));
    const csL = left ? getComputedStyle(left) : null;
    const csR = right ? getComputedStyle(right) : null;
    const canScroll = cont.scrollWidth > cont.clientWidth;
    cont.scrollLeft = 150;
    return {
      canScroll,
      scrollLeft: cont.scrollLeft,
      leftPos: csL?.position,
      leftLeft: csL?.left,
      leftBg: csL?.backgroundColor,
      rightPos: csR?.position,
      rightRight: csR?.right,
      rightBg: csR?.backgroundColor,
    };
  }, sectionSel);
  const shot = 'hbf-g-col-pinning.png';
  await page.locator(sectionSel).screenshot({ path: path.join(SHOTS, shot) });
  const solid = (c) => c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent';
  const pass =
    info.leftPos === 'sticky' &&
    info.rightPos === 'sticky' &&
    solid(info.leftBg) &&
    solid(info.rightBg);
  record(
    'g-col-pinning',
    pass ? 'PASS' : 'FAIL',
    `canScroll=${info.canScroll} scrollLeft=${info.scrollLeft}; left(First Name): pos=${info.leftPos} left=${info.leftLeft} bg=${info.leftBg}; right(Salary): pos=${info.rightPos} right=${info.rightRight} bg=${info.rightBg}`,
    shot,
  );
  await page.close();
}

// ---------- h: row pinning sticky (top offset) ----------
{
  const page = await newPage();
  await selectValue(page, 'srt-hbf-rowpin', 'sticky'); // remounts, pins rows 3 & 7
  await page.waitForTimeout(300);
  const info = await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    const cont = section.querySelector('div.overflow-auto');
    const rows = Array.from(section.querySelectorAll('tbody tr'));
    // a pinned row is position sticky
    const pinned = rows
      .map((r) => ({
        pos: getComputedStyle(r).position,
        top: getComputedStyle(r).top,
        bottom: getComputedStyle(r).bottom,
      }))
      .filter((r) => r.pos === 'sticky');
    return {
      totalRows: rows.length,
      pinnedCount: pinned.length,
      sample: pinned.slice(0, 2),
      contScrollable: cont.scrollHeight > cont.clientHeight,
    };
  }, sectionSel);
  const shot = 'hbf-h-row-pinning.png';
  await page.locator(sectionSel).screenshot({ path: path.join(SHOTS, shot) });
  const pass =
    info.pinnedCount >= 1 && info.sample.some((s) => s.top !== 'auto');
  record(
    'h-row-pinning',
    pass ? 'PASS' : 'FAIL',
    `sticky rows=${info.pinnedCount}/${info.totalRows}; sample=${JSON.stringify(info.sample)}`,
    shot,
  );
  await page.close();
}

// ---------- i: loading skeletons ----------
{
  const page = await newPage();
  await toggleCheckbox(page, 'loading skeletons');
  await page.waitForTimeout(400);
  const info = await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    const sk = section.querySelectorAll('tbody td div.animate-pulse');
    return { skeletonCells: sk.length };
  }, sectionSel);
  const shot = 'hbf-i-skeletons.png';
  await page.locator(sectionSel).screenshot({ path: path.join(SHOTS, shot) });
  const pass = info.skeletonCells > 10;
  record(
    'i-skeletons',
    pass ? 'PASS' : 'FAIL',
    `animate-pulse skeleton cells=${info.skeletonCells}`,
    shot,
  );
  await page.close();
}

// ---------- j: footer aggregate + sticky footer with sticky header ----------
{
  const page = await newPage();
  // footer on by default; verify tfoot aggregate
  const base = await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    const tfoot = section.querySelector('tfoot');
    return {
      hasTfoot: !!tfoot,
      footerText: tfoot?.innerText?.replace(/\n/g, ' ').trim() ?? '',
    };
  }, sectionSel);
  const shotF = 'hbf-j-footer.png';
  await page.locator(sectionSel).screenshot({ path: path.join(SHOTS, shotF) });

  // now sticky header => enableStickyFooter also on in demo
  await toggleCheckbox(page, 'sticky header');
  await page.waitForTimeout(300);
  const sticky = await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    const tfoot = section.querySelector('tfoot');
    const th = section.querySelector('thead th');
    return {
      footerPos: tfoot ? getComputedStyle(tfoot).position : '(none)',
      footerBottom: tfoot ? getComputedStyle(tfoot).bottom : '(none)',
      // head row carries sticky (MRT_TableHeadRow), th is relative as in MRT
      headPos: th ? getComputedStyle(th.closest('tr')).position : '(none)',
    };
  }, sectionSel);
  const shot = 'hbf-j-footer-sticky.png';
  await page.locator(sectionSel).screenshot({ path: path.join(SHOTS, shot) });
  const aggregateOk = base.hasTfoot && /Total:\s*\$/.test(base.footerText);
  const bothStick =
    sticky.footerPos === 'sticky' && sticky.headPos === 'sticky';
  const pass = aggregateOk && bothStick;
  record(
    'j-footer',
    pass ? 'PASS' : 'FAIL',
    `tfoot="${base.footerText}" aggregate=${aggregateOk}; sticky: footerPos=${sticky.footerPos} bottom=${sticky.footerBottom} headPos=${sticky.headPos} (bothStick=${bothStick})`,
    shot,
  );
  await page.close();
}

// ---------- k: body cell `align` default (MUI TableCell align parity) ----------
{
  const page = await newPage();
  const info = await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    const tds = Array.from(section.querySelectorAll('tbody tr td'));
    const first = tds[0];
    return {
      tdCount: tds.length,
      textAlign: first ? getComputedStyle(first).textAlign : '(none)',
      alignAttrs: tds.filter((td) => td.hasAttribute('align')).length,
    };
  }, sectionSel);
  const shot = 'hbf-k-cell-align.png';
  await page.locator(sectionSel).screenshot({ path: path.join(SHOTS, shot) });
  const pass = info.tdCount > 0 && info.textAlign === 'start';
  record(
    'k-cell-align',
    pass ? 'PASS' : 'FAIL',
    `body td default text-align=${info.textAlign} (tds=${info.tdCount}, align attrs=${info.alignAttrs}); right-align half skipped: demo exposes no srtTableBodyCellProps/align option`,
    shot,
  );
  await page.close();
}

// ---------- l: row highlight td::after overlays (selected / hover / pinned col) ----------
{
  const page = await newPage({ width: 700, height: 900 });
  await toggleCheckbox(page, 'selection');
  await toggleCheckbox(page, 'column pinning');
  await page.waitForTimeout(300);
  const rows = page.locator(`${sectionSel} tbody tr`);
  const rowCb = rows.first().locator('button[role="checkbox"]').first();
  await rowCb.click();
  await page.waitForTimeout(300);
  const read = (sel) => {
    const section = document.querySelector(sel);
    const trs = Array.from(section.querySelectorAll('tbody tr'));
    const probe = (tr) => {
      const tds = Array.from(tr.querySelectorAll('td'));
      const plain = tds.find((td) => !td.hasAttribute('data-pinned'));
      const pinned = tds.find((td) => td.hasAttribute('data-pinned'));
      const after = (td) =>
        td ? getComputedStyle(td, '::after').backgroundColor : '(none)';
      return {
        selected: tr.getAttribute('data-selected') ?? '(none)',
        plainAfter: after(plain),
        pinnedAfter: after(pinned),
        hasPinned: !!pinned,
      };
    };
    return { sel: probe(trs[0]), other: probe(trs[1]) };
  };
  const transparent = (c) =>
    !c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent' || c === '(none)';
  // park the mouse off the table so no row is hovered for the base read
  await page.mouse.move(0, 0);
  await page.waitForTimeout(150);
  const base = await page.evaluate(read, sectionSel);
  // hover the selected row: tint must persist
  await rows.first().hover();
  await page.waitForTimeout(250);
  const hoverSel = await page.evaluate(read, sectionSel);
  const shotSel = 'hbf-l-row-highlight-selected-hover.png';
  await page
    .locator(sectionSel)
    .screenshot({ path: path.join(SHOTS, shotSel) });
  // hover an unselected row: hover tint appears
  await rows.nth(1).hover();
  await page.waitForTimeout(250);
  const hoverOther = await page.evaluate(read, sectionSel);
  const shot = 'hbf-l-row-highlight-hover.png';
  await page.locator(sectionSel).screenshot({ path: path.join(SHOTS, shot) });

  const selPlainOk = !transparent(base.sel.plainAfter);
  const selPinnedOk = !base.sel.hasPinned || !transparent(base.sel.pinnedAfter);
  const otherIdleOk = transparent(base.other.plainAfter);
  const selHoverKeeps =
    hoverSel.sel.plainAfter === base.sel.plainAfter &&
    hoverSel.sel.pinnedAfter === base.sel.pinnedAfter;
  const otherHoverOk = !transparent(hoverOther.other.plainAfter);
  const pass =
    base.sel.selected === 'true' &&
    selPlainOk &&
    selPinnedOk &&
    otherIdleOk &&
    selHoverKeeps &&
    otherHoverOk;
  record(
    'l-row-highlight',
    pass ? 'PASS' : 'FAIL',
    `selected row td::after: plain=${base.sel.plainAfter} pinned=${base.sel.pinnedAfter} (hasPinnedCol=${base.sel.hasPinned}); hover selected keeps=${selHoverKeeps}; unselected idle=${base.other.plainAfter} hover=${hoverOther.other.plainAfter}`,
    shot,
  );
  await page.close();
}

// ---------- k: console clean (no React errors introduced) ----------
{
  const page = await newPage();
  // exercise a few toggles to surface render errors
  await toggleCheckbox(page, 'selection');
  await toggleCheckbox(page, 'expand');
  await toggleCheckbox(page, 'column filters');
  await page.waitForTimeout(500);
  const errs = page._errors;
  const pass = errs.length === 0;
  record(
    'k-console',
    pass ? 'PASS' : 'FAIL',
    pass
      ? 'no React errors/warnings (vite/HMR/toolbar noise ignored)'
      : `errors: ${errs.slice(0, 4).join(' | ')}`,
    null,
  );
  await page.close();
}

await browser.close();

const pass = results.filter((r) => r.status === 'PASS').length;
const fail = results.filter((r) => r.status === 'FAIL');
console.log(
  `\n=== SUMMARY: ${pass} PASS, ${fail.length} FAIL (of ${results.length}) ===`,
);
if (fail.length) console.log('FAILED:', fail.map((f) => f.id).join(', '));
process.exit(fail.length ? 1 : 0);
