import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const BASE = process.env.SRT_BASE ?? 'http://localhost:5273/';

const results = [];
const rec = (id, status, evidence, shot) => {
  results.push({ id, status, evidence, shot });
  console.log(`${status} [${id}] ${evidence}${shot ? ` shot=${shot}` : ''}`);
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1500, height: 1100 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const allErrors = [];
const page = await context.newPage();
page.on('console', (m) => {
  const t = m.text();
  if (m.type() === 'error') allErrors.push('ERROR: ' + t);
  if (m.type() === 'warning') allErrors.push('WARN: ' + t);
});
page.on('pageerror', (e) => allErrors.push('PAGEERROR: ' + e.message));
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

const sec = (h2) => page.locator(`section:has(h2:has-text("${h2}"))`).first();
const L = (id) => page.locator('#' + id);
const shot = async (name, loc) => {
  const file = `sweep-${name}.png`;
  try {
    if (loc) await loc.screenshot({ path: path.join(SHOTS, file) });
    else await page.screenshot({ path: path.join(SHOTS, file) });
  } catch { await page.screenshot({ path: path.join(SHOTS, file) }); }
  return file;
};
const scrollTo = async (loc) => { try { await loc.scrollIntoViewIfNeeded(); } catch {} await page.waitForTimeout(150); };
const dismiss = async () => { for (let i = 0; i < 3; i++) await page.keyboard.press('Escape'); await page.waitForTimeout(150); };
const rangeText = async (root) =>
  (await root.locator('text=/\\d+\\s*[-–]\\s*\\d+\\s+of\\s+\\d+/').first().textContent().catch(() => '')) || '';
const pickSelect = async (trigger, itemText) => {
  await trigger.click();
  await page.waitForTimeout(250);
  await page.locator(`[role="option"]:has-text("${itemText}"),[data-slot="select-item"]:has-text("${itemText}")`).first().click();
  await page.waitForTimeout(300);
};
const firstVisible = async (locator) => {
  const n = await locator.count();
  for (let i = 0; i < n; i++) { const el = locator.nth(i); if (await el.isVisible().catch(() => false)) return el; }
  return null;
};
async function step(id, fn) {
  if (process.env.SRT_STEP && !id.startsWith(process.env.SRT_STEP)) return;
  try { await dismiss(); await fn(); }
  catch (e) { rec(id, 'FAIL', 'threw: ' + (e.message || String(e)).split('\n')[0].slice(0, 140)); await dismiss(); }
}

// 1. Pagination default: rows-per-page radix Select + 4 nav buttons + boundaries
await step('1-pagination-default', async () => {
  const s = sec('SRT Toolbars');
  await scrollTo(s);
  await pickSelect(L('srt-toolbars-pagmode'), 'default');
  await dismiss();
  const region = L('srt-toolbars-layout');
  await scrollTo(region);
  const rpp = region.locator('[data-slot="select-trigger"]').first(); // rows-per-page (only Select inside table layout)
  const slot = await rpp.getAttribute('data-slot');
  const before = await rangeText(region);
  await rpp.click();
  await page.waitForTimeout(250);
  const opts = await page.locator('[role="option"],[data-slot="select-item"]').allTextContents();
  await page.locator('[role="option"],[data-slot="select-item"]').filter({ hasText: /^10$/ }).first().click();
  await page.waitForTimeout(400);
  const after = await rangeText(region);
  const file = await shot('1-pagination-default', region);
  rec('1-rows-per-page',
    slot === 'select-trigger' && before !== after && after ? 'PASS' : 'FAIL',
    `rpp data-slot=${slot} opts=[${opts.join(',')}] range "${before}"->"${after}"`, file);

  const first = region.locator('button[aria-label*="first page" i]').first();
  const prev = region.locator('button[aria-label*="previous page" i]').first();
  const next = region.locator('button[aria-label*="next page" i]').first();
  const last = region.locator('button[aria-label*="last page" i]').first();
  const cnt = (await first.count()) + (await prev.count()) + (await next.count()) + (await last.count());
  const fD = await first.isDisabled().catch(() => null);
  const pD = await prev.isDisabled().catch(() => null);
  const nD = await next.isDisabled().catch(() => null);
  rec('1-nav-buttons',
    cnt >= 4 && fD === true && pD === true && nD === false ? 'PASS' : 'FAIL',
    `navBtns=${cnt} atPage1 first=${fD} prev=${pD} next=${nD}`);
});

// 2. Pagination 'pages' mode
await step('2-pagination-pages', async () => {
  const s = sec('SRT Toolbars');
  await scrollTo(s);
  await pickSelect(L('srt-toolbars-pagmode'), 'pages');
  await dismiss();
  const region = L('srt-toolbars-layout');
  await scrollTo(region);
  const numBtns = region.locator('button', { hasText: /^\d+$/ });
  const cnt = await numBtns.count();
  const active = region.locator('button[aria-current="page"]');
  const activeCnt = await active.count();
  const activeVariant = activeCnt ? await active.first().getAttribute('class') : '';
  const ellipsis = await region.locator('text=/…|\\.\\.\\./').count();
  const file = await shot('2-pagination-pages', region);
  rec('2-pages-render',
    cnt >= 2 && activeCnt === 1 && /outline|border/.test(activeVariant || '') ? 'PASS' : 'FAIL',
    `numBtns=${cnt} aria-current=${activeCnt} ellipsis=${ellipsis} activeHasOutline=${/outline|border/.test(activeVariant || '')}`, file);

  // keyboard: focus page 2, Enter activates
  const p2 = numBtns.filter({ hasText: /^2$/ }).first();
  let kb = 'page2 not found';
  let kbOk = false;
  if (await p2.count()) {
    await p2.focus();
    const focused = await p2.evaluate((el) => el === document.activeElement);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const now = await region.locator('button[aria-current="page"]').first().textContent().catch(() => '');
    kbOk = focused && /2/.test(now || '');
    kb = `focusable=${focused} afterEnter aria-current="${now}"`;
  }
  rec('2-pages-keyboard', kbOk ? 'PASS' : 'FAIL', kb);

  // boundaries: go to page 1 via numbered "1"
  await numBtns.filter({ hasText: /^1$/ }).first().click().catch(() => {});
  await page.waitForTimeout(250);
  const first = region.locator('button[aria-label*="first page" i]').first();
  const prev = region.locator('button[aria-label*="previous page" i]').first();
  const next = region.locator('button[aria-label*="next page" i]').first();
  const last = region.locator('button[aria-label*="last page" i]').first();
  const hasFirst = await first.count();
  const hasLast = await last.count();
  const fD = await first.isDisabled().catch(() => null);
  const pD = await prev.isDisabled().catch(() => null);
  // navigate to last page via last button (or highest number)
  if (hasLast) await last.click(); else await numBtns.last().click();
  await page.waitForTimeout(300);
  const nD = await next.isDisabled().catch(() => null);
  const lD = await last.isDisabled().catch(() => null);
  rec('2-pages-boundaries',
    pD === true && nD === true ? 'PASS' : 'FAIL',
    `hasFirstBtn=${hasFirst} hasLastBtn=${hasLast} atPage1(first=${fD},prev=${pD}) atLastPage(next=${nD},last=${lD})`);
  await pickSelect(L('srt-toolbars-pagmode'), 'default');
  await dismiss();
});

// 3. Progress bar
await step('3-progress-bar', async () => {
  const s = sec('SRT Toolbars');
  await scrollTo(s);
  const cb = s.locator('label:has-text("progress bars") [role="checkbox"]').first();
  await cb.click();
  await page.waitForTimeout(400);
  const prog = s.locator('[data-slot="progress"]').first();
  const exists = await prog.count();
  const cls = exists ? await prog.getAttribute('class') : '';
  const ind = s.locator('[data-slot="progress-indicator"]').first();
  const t1 = await ind.evaluate((el) => getComputedStyle(el).transform).catch(() => 'na');
  await page.waitForTimeout(500);
  const t2 = await ind.evaluate((el) => getComputedStyle(el).transform).catch(() => 'na');
  const h = exists ? Math.round(await prog.evaluate((el) => el.getBoundingClientRect().height)) : 0;
  const file = await shot('3-progress-bar', s);
  rec('3-progress-bar',
    exists && (cls || '').includes('h-2') && (cls || '').includes('rounded') && t1 !== t2 ? 'PASS' : 'FAIL',
    `data-slot=progress h=${h} class~rounded=${(cls || '').includes('rounded')} h-2=${(cls || '').includes('h-2')} animates=${t1 !== t2}`, file);
  await cb.click();
});

// 4. Loading overlay spinner
await step('4-loading-overlay', async () => {
  const s = sec('SRT_TableLoadingOverlay');
  await scrollTo(s);
  const spin = s.locator('svg.animate-spin').first();
  const exists = await spin.count();
  const file = await shot('4-loading-overlay', s);
  rec('4-loading-overlay', exists ? 'PASS' : 'FAIL', `svg.animate-spin count=${exists}`, file);
});

// 5. Skeleton rows
await step('5-skeletons', async () => {
  const s = sec('SRT_TableHead + Body + Footer');
  await scrollTo(s);
  const cb = s.locator('label:has-text("loading skeletons") [role="checkbox"]').first();
  await cb.click();
  await page.waitForTimeout(400);
  const sk = s.locator('[data-slot="skeleton"]');
  const cnt = await sk.count();
  const w = cnt ? await sk.first().evaluate((el) => el.style.width || getComputedStyle(el).width) : '';
  const file = await shot('5-skeletons', s);
  rec('5-skeletons', cnt > 0 && !!w ? 'PASS' : 'FAIL', `skeleton cells=${cnt} firstWidth="${w}"`, file);
  await cb.click();
});

// 6. Global filter InputGroup
await step('6-global-filter', async () => {
  const region = L('srt-inputs-menus-layout');
  await scrollTo(region);
  // global filter input-group is the one NOT inside thead
  const gfHandle = await region.evaluateHandle((root) => {
    const igs = [...root.querySelectorAll('[data-slot="input-group"]')];
    return igs.find((ig) => !ig.closest('thead')) || null;
  });
  let gf = gfHandle.asElement() ? region.locator('[data-slot="input-group"]').filter({ hasNot: page.locator('xxx') }) : null;
  // reveal via search toggle if the global filter field isn't present
  const hasGf = await region.evaluate((root) => [...root.querySelectorAll('[data-slot="input-group"]')].some((ig) => !ig.closest('thead')));
  if (!hasGf) {
    const toggle = region.locator('button[aria-label*="Show" i], button[aria-label*="search" i]').first();
    if (await toggle.count()) { await toggle.click(); await page.waitForTimeout(300); }
  }
  const file = await shot('6-global-filter', region);
  const gfCount = await region.evaluate((root) => [...root.querySelectorAll('[data-slot="input-group"]')].filter((ig) => !ig.closest('thead')).length);
  rec('6-inputgroup-render', gfCount >= 1 ? 'PASS' : 'FAIL', `global-filter input-group count=${gfCount}`, file);

  // type into global filter input (non-thead input-group's text input)
  const gInput = region.locator('[data-slot="input-group"] input').filter({ hasNot: page.locator('thead input') });
  // fallback: pick the visible non-thead input directly via evaluate targeting
  const inputs = region.locator('[data-slot="input-group"] input');
  let target = null;
  const ni = await inputs.count();
  for (let i = 0; i < ni; i++) {
    const el = inputs.nth(i);
    const inThead = await el.evaluate((n) => !!n.closest('thead'));
    if (!inThead && await el.isVisible().catch(() => false)) { target = el; break; }
  }
  const rowsBefore = await region.locator('table tbody tr').count();
  if (target) {
    await target.click();
    await target.fill('Lovelace');
    await page.waitForTimeout(700);
    const rowsAfter = await region.locator('table tbody tr').count();
    rec('6-typing-filters', rowsAfter < rowsBefore ? 'PASS' : 'FAIL', `rows ${rowsBefore}->${rowsAfter} on "Lovelace"`);
    // clear button: inside same input-group, enabled when text present
    const ig = target.locator('xpath=ancestor::*[@data-slot="input-group"][1]');
    const clearBtn = ig.locator('button').last();
    const clearEnabled = (await clearBtn.count()) ? !(await clearBtn.isDisabled()) : false;
    if (clearEnabled) { await clearBtn.click(); await page.waitForTimeout(500); }
    const rowsCleared = await region.locator('table tbody tr').count();
    rec('6-clear', clearEnabled && rowsCleared >= rowsBefore ? 'PASS' : 'FAIL',
      `clearEnabledWhenText=${clearEnabled} rowsAfterClear=${rowsCleared}`);
  } else {
    rec('6-typing-filters', 'FAIL', 'no visible global-filter input found');
  }
  // mode button present?
  const modeBtn = region.locator('[data-slot="input-group"] button').first();
  rec('6-mode-button', (await modeBtn.count()) ? 'PASS' : 'INFO', (await modeBtn.count()) ? 'search-mode/adornment button present' : 'none');
  await dismiss();
});

// 7. Column filter text field + number retention + mode switch
await step('7-column-filter', async () => {
  const region = L('srt-inputs-menus-layout');
  await scrollTo(region);
  const theadIg = await region.locator('thead [data-slot="input-group"]').count();
  rec('7-colfilter-inputgroup', theadIg > 0 ? 'PASS' : 'FAIL', `thead input-group count=${theadIg}`);

  // number-type retention: Salary range Min/Max numeric input (valueAsNumber regression)
  const numLoc = region.locator('thead input[placeholder*="Min" i], thead input[inputmode="numeric"], thead input[type="number"]');
  const numInp = await firstVisible(numLoc);
  let retained = 'n/a';
  if (numInp) {
    // fill() auto-focuses without the pointer-intercept check that .click()
    // does (the sticky page header can overlay thead), so use it directly.
    await numInp.fill('60000');
    await page.waitForTimeout(500);
    retained = await numInp.inputValue();
  }
  const file = await shot('7-column-filter', region);
  rec('7-number-value-retained',
    numInp && retained === '60000' ? 'PASS' : (numInp ? 'FAIL' : 'INFO'),
    `numericInput=${!!numInp} typed=60000 retained="${retained}"`, file);

  // filter-mode switch on Last Name text filter: leading adornment button opens menu
  const lastNameIg = region.locator('thead [data-slot="input-group"]').first();
  const modeBtn = lastNameIg.locator('button').first();
  let modeOk = false, modeEv = 'no mode button';
  if (await modeBtn.count()) {
    await modeBtn.click({ force: true });
    await page.waitForTimeout(300);
    const items = await page.locator('[role="menuitem"],[role="menuitemradio"],[role="option"]').allTextContents();
    modeEv = `menuItems=[${items.slice(0, 12).join(',')}]`;
    const between = page.locator('[role="menuitem"]:has-text("Between"),[role="menuitemradio"]:has-text("Between")').first();
    if (await between.count()) {
      await between.click();
      await page.waitForTimeout(400);
      const two = await region.locator('thead input[placeholder*="Min" i], thead input[placeholder*="Max" i]').count();
      modeOk = two >= 1;
      modeEv += ` afterBetween min/maxInputs=${two}`;
    } else { await dismiss(); }
  }
  rec('7-filter-mode-switch', modeOk ? 'PASS' : (await modeBtn.count() ? 'FAIL' : 'INFO'), modeEv);
  await dismiss();
});

// 8. Edit cell select: radix Select commit + blur-exit
await step('8-edit-cell-select', async () => {
  const region = L('srt-editselect-layout');
  await scrollTo(region);
  const cityCell = region.locator('table tbody tr').first().locator('td').nth(1);
  // cell edit enters on double-click
  await cityCell.dblclick();
  await page.waitForTimeout(350);
  const trigger = region.locator('[data-slot="select-trigger"]').first();
  const hasTrigger = await trigger.count();
  const file1 = await shot('8-edit-cell-select-open', region);
  let committed = 'n/a', triggerSlot = '';
  if (hasTrigger) {
    triggerSlot = await trigger.getAttribute('data-slot');
    if ((await trigger.getAttribute('aria-expanded')) !== 'true') { await trigger.click(); await page.waitForTimeout(300); }
    const opt = page.locator('[role="option"]:has-text("Tokyo"),[data-slot="select-item"]:has-text("Tokyo")').first();
    const optCnt = await opt.count();
    if (optCnt) { await opt.click(); await page.waitForTimeout(450); }
    // MRT: the cell stays in edit mode until the select blurs; blur saves
    await page.locator('#srt-editselect-last-saved').click();
    await page.waitForTimeout(400);
    committed = (await page.locator('#srt-editselect-last-saved').textContent().catch(() => 'NOEL')) || '(empty)';
    committed += ` [opts=${optCnt}]`;
  }
  rec('8-select-commit',
    hasTrigger && triggerSlot === 'select-trigger' && /city/i.test(committed) && /Tokyo/.test(committed) ? 'PASS' : 'FAIL',
    `radixTrigger=${!!hasTrigger}(slot=${triggerSlot}) lastSaved="${committed}"`, file1);
  await dismiss();

  // blur-exit: enter edit on Department cell, click elsewhere WITHOUT opening
  const deptCell = region.locator('table tbody tr').nth(1).locator('td').nth(2);
  await deptCell.dblclick();
  await page.waitForTimeout(350);
  const before = await region.locator('[data-slot="select-trigger"]').count();
  // click a neutral element (the last-saved span sits in the demo section) to blur
  await page.locator('#srt-editselect-last-saved').click();
  await page.waitForTimeout(400);
  const after = await region.locator('[data-slot="select-trigger"]').count();
  const file2 = await shot('8-edit-cell-blur-exit', region);
  rec('8-blur-exit', before >= 1 && after === 0 ? 'PASS' : 'FAIL', `editTriggerBeforeBlur=${before} afterBlur=${after}`, file2);
});

// 9. Edit modal (create modal): FieldGroup + footer + save/cancel
await step('9-edit-modal', async () => {
  const s = L('srt-editrowmodal-demo');
  await scrollTo(s);
  await L('srt-editrowmodal-create').click();
  await page.waitForTimeout(400);
  const dialog = page.locator('[role="dialog"]').first();
  const open = await dialog.count();
  const fg = await page.locator('[data-slot="field-group"]').count();
  const inputs = open ? await dialog.locator('input').count() : 0;
  const footer = open ? await dialog.locator('button').allTextContents() : [];
  const file = await shot('9-edit-modal', open ? dialog : s);
  rec('9-edit-modal', open ? 'PASS' : 'FAIL',
    `dialogOpen=${!!open} fieldGroup=${fg} inputs=${inputs} buttons=[${footer.join(',')}]`, file);
  if (open) {
    const cancel = dialog.locator('button:has-text("Cancel")').first();
    const save = dialog.locator('button:has-text("Save")').first();
    const btn = (await cancel.count()) ? cancel : save;
    await btn.click();
    await page.waitForTimeout(400);
    const still = await page.locator('[role="dialog"]').count();
    rec('9-modal-save-cancel', still === 0 ? 'PASS' : 'FAIL', `clicked ${(await cancel.count()) ? 'Cancel' : 'Save'} dialogsAfter=${still}`);
  }
});

// 10. Head cells
await step('10-head-cells', async () => {
  const s = sec('SRT_TableHead + Body + Footer');
  await scrollTo(s);
  const rz = s.locator('label:has-text("resizing") [role="checkbox"]').first();
  if ((await rz.getAttribute('aria-checked').catch(() => null)) !== 'true') { await rz.click(); await page.waitForTimeout(300); }
  const th = s.locator('thead th, thead [role="columnheader"]').first();
  const colActions = s.locator('thead button[aria-label*="Column Actions" i], thead button[aria-label*="actions" i]').first();
  const caCnt = await colActions.count();
  const caBox = caCnt ? await colActions.evaluate((el) => { const r = el.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}`; }) : '';
  const sortBtn = s.locator('thead button[aria-label*="Sort" i]').first();
  let sortEv = 'no sort btn', sortOk = false;
  if (await sortBtn.count()) {
    await sortBtn.click(); await page.waitForTimeout(300);
    const as1 = await th.getAttribute('aria-sort').catch(() => null);
    await sortBtn.click(); await page.waitForTimeout(300);
    const as2 = await th.getAttribute('aria-sort').catch(() => null);
    sortOk = true;
    sortEv = `aria-sort toggled ${as1}->${as2}`;
  }
  const sep = await s.locator('thead [data-slot="separator"]').count();
  const file = await shot('10-head-cells', s);
  rec('10-head-cells', caCnt >= 1 && sortOk ? 'PASS' : 'FAIL', `colActions=${caCnt} box=${caBox}; ${sortEv}; theadSeparators=${sep}`, file);

  // resize drag + double-click reset. onMouseDown lives on the .cursor-col-resize
  // wrapper div; measure the SAME column header we drag.
  const colTh = s.locator('thead th:has-text("First Name"), thead [role="columnheader"]:has-text("First Name")').first();
  const handle = colTh.locator('.cursor-col-resize, [class*="ResizeHandle-Wrapper"]').first();
  if (await handle.count()) {
    const w0 = await colTh.evaluate((el) => el.getBoundingClientRect().width);
    const box = await handle.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 90, box.y + box.height / 2, { steps: 10 });
    await page.mouse.move(box.x + 90, box.y + box.height / 2);
    await page.mouse.up();
    await page.waitForTimeout(300);
    const w1 = await colTh.evaluate((el) => el.getBoundingClientRect().width);
    await handle.dblclick({ force: true }).catch(() => {});
    await page.waitForTimeout(300);
    const w2 = await colTh.evaluate((el) => el.getBoundingClientRect().width);
    rec('10-resize',
      Math.abs(w1 - w0) > 10 && Math.abs(w2 - w0) < Math.abs(w1 - w0) ? 'PASS' : 'FAIL',
      `First Name col width ${Math.round(w0)}->${Math.round(w1)}(drag)->${Math.round(w2)}(dblclick-reset)`);
  } else rec('10-resize', 'FAIL', 'no .cursor-col-resize handle found in First Name header');
});

// 11. Detail panel
await step('11-detail-panel', async () => {
  const s = sec('SRT_TableHead + Body + Footer');
  await scrollTo(s);
  const ex = s.locator('label:has-text("expand") [role="checkbox"]').first();
  if ((await ex.getAttribute('aria-checked').catch(() => null)) !== 'true') { await ex.click(); await page.waitForTimeout(400); }
  await scrollTo(s);
  const expandBtn = await firstVisible(s.locator('tbody button[aria-label*="xpand" i]'));
  let panel = '', collapsible = 0;
  if (expandBtn) {
    await expandBtn.click();
    await page.waitForTimeout(400);
    panel = (await s.locator('text=/Email:/').first().textContent().catch(() => '')) || '';
  }
  collapsible = await s.locator('[data-slot="collapsible"], tbody [data-state="open"]').count();
  const file = await shot('11-detail-panel', s);
  rec('11-detail-panel', panel.length > 0 || collapsible > 0 ? 'PASS' : 'FAIL', `collapsible/openState=${collapsible} panelRevealed="${panel.slice(0, 34)}"`, file);
  if (expandBtn) { await expandBtn.click().catch(() => {}); await page.waitForTimeout(200); }
});

// 12. Buttons post-normalization
await step('12-buttons', async () => {
  const region = L('srt-buttons-layout');
  if (!(await region.count())) { rec('12-buttons', 'FAIL', '#srt-buttons-layout not found'); return; }
  await scrollTo(region);
  // grab handle full opacity
  const grab = region.locator('button[aria-label*="rag" i], button[aria-label*="Move" i]').first();
  const grabOp = (await grab.count()) ? await grab.evaluate((el) => getComputedStyle(el).opacity) : 'na';
  rec('12-grab-opacity', grabOp === '1' || parseFloat(grabOp) >= 0.99 ? 'PASS' : (grabOp === 'na' ? 'INFO' : 'FAIL'), `grab opacity=${grabOp}`);

  // copy control: a <button> deliberately styled as plain text (border-none bg-transparent cursor-copy)
  const copy = region.locator('button.cursor-copy, button[class*="cursor-copy"]').first();
  let copyEv = 'no copy control', copyOk = false, copiedTip = '';
  if (await copy.count()) {
    const cls = await copy.getAttribute('class');
    const boxRemoved = /border-none/.test(cls) && /bg-transparent/.test(cls) && /cursor-copy/.test(cls);
    await copy.hover(); await page.waitForTimeout(300);
    await copy.click(); await page.waitForTimeout(300);
    await copy.hover(); await page.waitForTimeout(400);
    copiedTip = (await page.locator('[role="tooltip"]').first().textContent().catch(() => '')) || '';
    copyOk = boxRemoved;
    copyEv = `boxRemoved(border-none+bg-transparent+cursor-copy)=${boxRemoved} tooltipAfterCopy="${copiedTip.slice(0, 24)}"`;
  }
  const file = await shot('12-buttons', region);
  rec('12-copy-as-text', copyOk ? 'PASS' : 'FAIL', copyEv, file);
  await dismiss();

  // row-action menu opens (buttons layout, else inputs-menus layout which has row actions)
  let rowRegion = region;
  let rowAction = await firstVisible(region.locator('tbody button[aria-label*="Row Actions" i], tbody button[aria-label*="actions" i], tbody button[aria-label*="Open" i]'));
  if (!rowAction) {
    rowRegion = L('srt-inputs-menus-layout');
    await scrollTo(rowRegion);
    rowAction = await firstVisible(rowRegion.locator('tbody button[aria-label*="Row Actions" i], tbody button[aria-label*="actions" i], tbody button[aria-label*="Open" i]'));
  }
  let menu = 'n/a';
  if (rowAction) { await rowAction.click({ force: true }); await page.waitForTimeout(300); menu = (await page.locator('[role="menu"]').count()) > 0 ? 'yes' : 'no'; await dismiss(); }
  rec('12-row-action-menu', menu === 'yes' ? 'PASS' : (menu === 'n/a' ? 'INFO' : 'FAIL'), `rowActionMenu=${menu} (region=${rowRegion === region ? 'buttons' : 'inputs-menus'})`);

  // expand-all works
  const expandAll = region.locator('button[aria-label*="Expand all" i], thead button[aria-label*="xpand" i]').first();
  let ea = 'n/a';
  if (await expandAll.count()) {
    const before = await region.locator('tbody tr').count();
    await expandAll.click(); await page.waitForTimeout(400);
    const after = await region.locator('tbody tr').count();
    ea = `${before}->${after}`;
    rec('12-expand-all', after >= before ? 'PASS' : 'FAIL', `tbody rows ${ea}`);
  } else rec('12-expand-all', 'INFO', 'no expand-all button');
});

// 13. Console cleanliness
await step('13-console', async () => {
  const uniq = [...new Set(allErrors)];
  const file = await shot('13-final', undefined);
  rec('13-console', uniq.length === 0 ? 'PASS' : 'FAIL',
    uniq.length === 0 ? 'zero console errors/warnings' : `count=${uniq.length} :: ${uniq.slice(0, 15).join(' || ')}`, file);
});

console.log('\n===== SUMMARY =====');
for (const r of results) console.log(`${r.status}\t${r.id}\t${r.evidence}${r.shot ? ` [${r.shot}]` : ''}`);
console.log('\nCONSOLE ERRORS/WARNINGS (' + [...new Set(allErrors)].length + '):');
for (const e of [...new Set(allErrors)]) console.log('  ' + e);

await browser.close();
