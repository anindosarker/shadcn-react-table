import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const BASE = process.env.SRT_BASE ?? 'http://localhost:5273/';
const LAYOUT = '#srt-buttons-layout';

const results = [];
const record = (id, status, evidence, shot) => {
  results.push({ id, status, evidence, shot });
  console.log(`${status} [${id}] ${evidence}${shot ? ` shot=${shot}` : ''}`);
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  permissions: ['clipboard-read', 'clipboard-write'],
});

const allErrors = [];
async function newPage() {
  const page = await context.newPage();
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'error') allErrors.push('ERROR: ' + t);
    if (m.type() === 'warning') allErrors.push('WARN: ' + t);
  });
  page.on('pageerror', (e) => allErrors.push('PAGEERROR: ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector(LAYOUT, { timeout: 15000 });
  await page.waitForTimeout(400);
  return page;
}

const btn = (label) => `${LAYOUT} button[aria-label="${label}"]`;
const shot = async (page, name, sel = LAYOUT) => {
  const file = `buttons-${name}.png`;
  const el = page.locator(sel).first();
  try {
    await el.screenshot({ path: path.join(SHOTS, file) });
  } catch {
    await page.screenshot({ path: path.join(SHOTS, file) });
  }
  return file;
};
async function toggleCheckbox(page, labelText) {
  await page
    .locator(`label:has-text("${labelText}") [role="checkbox"]`)
    .first()
    .click();
  await page.waitForTimeout(300);
}

// aria-label of expand / expand-all stays constant ("Expand"/"Expand all")
// regardless of state (only the tooltip flips), so detect state via content.
const bodyText = () =>
  page
    .locator(`${LAYOUT} table`)
    .first()
    .innerText()
    .catch(() => '');
const iconTransform = (locator) =>
  locator
    .locator('svg')
    .first()
    .evaluate((el) => getComputedStyle(el).transform)
    .catch(() => 'none');

const page = await newPage();

// ---------- 1. Expand button: rotate + child indent + detail panel ----------
{
  const first = page.locator(btn('Expand')).first();
  const iconBefore = await iconTransform(first);
  const before = await bodyText();
  await first.click();
  await page.waitForTimeout(400);
  const after = await bodyText();
  const iconAfter = await iconTransform(page.locator(btn('Expand')).first());
  // child rows appear + their expand button carries marginLeft depth indent
  const childIndent = await page.evaluate((LAYOUT) => {
    const btns = [
      ...document.querySelectorAll(
        `${LAYOUT} tbody button[aria-label="Expand"]`,
      ),
    ];
    return btns.map((b) => b.style.marginLeft);
  }, LAYOUT);
  const s = await shot(page, '1-expand-first');
  const childShown = /Ada Lovelace/.test(after) && !/Ada Lovelace/.test(before);
  const rotated = iconBefore !== iconAfter;
  const indented = childIndent.some((m) => m && parseFloat(m) >= 16);
  record(
    '1-expand-button',
    childShown && rotated && indented ? 'PASS' : 'FAIL',
    `childRowShown=${childShown}, iconRotate=${rotated} (${iconBefore}->${iconAfter}), childMarginLeft=${JSON.stringify(childIndent)}`,
    s,
  );
  // collapse back (same button)
  await page.locator(btn('Expand')).first().click();
  await page.waitForTimeout(300);
}

// detail panel: toggle it on, expand a row, verify panel-only text appears
{
  await toggleCheckbox(page, 'detail panel');
  await page.waitForTimeout(300);
  const before = await bodyText();
  await page.locator(btn('Expand')).first().click();
  await page.waitForTimeout(400);
  const after = await bodyText();
  // "Detail location:" text lives ONLY in the detail panel
  const hasPanel =
    /Detail location:/i.test(after) && !/Detail location:/i.test(before);
  const s = await shot(page, '1b-detail-panel');
  record(
    '1b-detail-panel',
    hasPanel ? 'PASS' : 'FAIL',
    `detail panel opened on expand (panel-only text)=${hasPanel}`,
    s,
  );
  await page.locator(btn('Expand')).first().click();
  await page.waitForTimeout(300);
  await toggleCheckbox(page, 'detail panel');
  await page.waitForTimeout(300);
}

// ---------- 2. Expand-all button ----------
// icon rotates via tailwind classes: rotate-0 -> -rotate-180 when all expanded
{
  const iconClass = () =>
    page
      .locator(btn('Expand all'))
      .locator('svg')
      .first()
      .getAttribute('class')
      .catch(() => '');
  const classBefore = await iconClass();
  await page.locator(btn('Expand all')).click();
  await page.waitForTimeout(500);
  const afterAll = await bodyText();
  const classExpanded = await iconClass();
  const allExpanded =
    /Ada Lovelace/.test(afterAll) && /Marie Curie/.test(afterAll);
  const s = await shot(page, '2-expand-all');
  await page.locator(btn('Expand all')).click();
  await page.waitForTimeout(500);
  const afterCollapse = await bodyText();
  const collapsed = !/Ada Lovelace/.test(afterCollapse);
  const rotated =
    /rotate-0/.test(classBefore) && /-rotate-180/.test(classExpanded);
  record(
    '2-expand-all',
    allExpanded && collapsed && rotated ? 'PASS' : 'FAIL',
    `allExpanded=${allExpanded}, collapsedBack=${collapsed}, iconClass "${classBefore}"->"${classExpanded}" rotated=${rotated}`,
    s,
  );
}

// ---------- 3. Row pin buttons (top-and-bottom) ----------
// pinned = button renders CloseIcon (lucide-x); unpinned = PushPinIcon (lucide-pin)
{
  // Each data row shows two pin buttons (top + bottom) in top-and-bottom mode.
  const firstRowPins = page
    .locator(`${LAYOUT} table tr`)
    .filter({ has: page.locator('button[aria-label="Pin"]') })
    .first()
    .locator('button[aria-label="Pin"]');
  const perRow = await firstRowPins.count();
  const unpinBefore = await page
    .locator(`${LAYOUT} button[aria-label="Pin"] svg.lucide-x`)
    .count();
  // pin to top = the button whose pushpin is rotate-180 (first of the pair)
  await firstRowPins.first().click();
  await page.waitForTimeout(500);
  const unpinAfter = await page
    .locator(`${LAYOUT} button[aria-label="Pin"] svg.lucide-x`)
    .count();
  // pinned rows render in a separate sticky tbody
  const tbodyCount = await page.locator(`${LAYOUT} table tbody`).count();
  const s = await shot(page, '3-row-pin-top');
  const pinnedShowsUnpin = unpinAfter > unpinBefore;
  record(
    '3-row-pin',
    perRow >= 2 && pinnedShowsUnpin ? 'PASS' : perRow >= 2 ? 'WARN' : 'FAIL',
    `pinBtns/row=${perRow} (top+bottom); unpin(X) icons ${unpinBefore}->${unpinAfter}; tbodySections=${tbodyCount}`,
    s,
  );
  // unpin: click the X control on the pinned row
  const unpinBtn = page
    .locator(`${LAYOUT} button[aria-label="Pin"]`)
    .filter({ has: page.locator('svg.lucide-x') })
    .first();
  await unpinBtn.click();
  await page.waitForTimeout(400);
  const unpinFinal = await page
    .locator(`${LAYOUT} button[aria-label="Pin"] svg.lucide-x`)
    .count();
  const sb = await shot(page, '3b-row-unpinned');
  record(
    '3b-row-unpin',
    unpinFinal < unpinAfter ? 'PASS' : 'FAIL',
    `unpin(X) icons after unpin click ${unpinAfter}->${unpinFinal}`,
    sb,
  );
}

// ---------- 4. Grab handle (column header) opacity + drag ----------
{
  const move = page.locator(btn('Move')).first();
  const opacity = await move
    .evaluate((el) => getComputedStyle(el).opacity)
    .catch(() => 'n/a');
  // header order before
  const headersBefore = await page
    .locator(`${LAYOUT} thead th`)
    .allInnerTexts();
  const s = await shot(page, '4-grab-handle');
  // drag first movable column onto the next one
  const src = page.locator(btn('Move')).nth(0);
  const dst = page.locator(btn('Move')).nth(1);
  let dragged = false;
  try {
    await src.dragTo(dst);
    await page.waitForTimeout(400);
    const headersAfter = await page
      .locator(`${LAYOUT} thead th`)
      .allInnerTexts();
    dragged = JSON.stringify(headersBefore) !== JSON.stringify(headersAfter);
    record(
      '4-grab-handle',
      Math.abs(parseFloat(opacity) - 0.5) < 0.05 ? 'PASS' : 'WARN',
      `col grab opacity=${opacity} (expect ~0.5); dragReorder headers ${JSON.stringify(headersBefore)}->${JSON.stringify(headersAfter)} changed=${dragged}`,
      s,
    );
  } catch (e) {
    record(
      '4-grab-handle',
      Math.abs(parseFloat(opacity) - 0.5) < 0.05 ? 'WARN' : 'FAIL',
      `col grab opacity=${opacity}; drag threw ${e.message}`,
      s,
    );
  }
}

// ---------- 4b. Row grab handle opacity=1 (toggle row dragging) ----------
{
  await toggleCheckbox(page, 'row dragging');
  await page.waitForTimeout(300);
  // row grab handles are the Move buttons inside tbody
  const rowMoveOpacity = await page.evaluate((LAYOUT) => {
    const b = document.querySelector(
      `${LAYOUT} tbody button[aria-label="Move"]`,
    );
    return b ? getComputedStyle(b).opacity : null;
  }, LAYOUT);
  const s = await shot(page, '4b-row-grab-handle');
  record(
    '4b-row-grab-handle',
    rowMoveOpacity === '1' ? 'PASS' : rowMoveOpacity == null ? 'FAIL' : 'WARN',
    `row grab handle opacity=${rowMoveOpacity} (expect 1)`,
    s,
  );
  await toggleCheckbox(page, 'row dragging');
  await page.waitForTimeout(300);
}

// ---------- 5. Copy button ----------
{
  const copyBtn = page.locator(`${LAYOUT} tbody button.cursor-copy`).first();
  const exists = (await copyBtn.count()) > 0;
  const cursor = exists
    ? await copyBtn.evaluate((el) => getComputedStyle(el).cursor)
    : 'n/a';
  const label = exists ? (await copyBtn.innerText()).trim() : '';
  // Tooltip delayDuration is 1000ms; hover long enough for Radix to mount it.
  const readTips = () =>
    page
      .evaluate(() =>
        [...document.querySelectorAll('[data-slot="tooltip-content"]')]
          .map((e) => e.textContent)
          .filter(Boolean),
      )
      .catch(() => []);
  await copyBtn.hover();
  await page.waitForTimeout(1300);
  const tipBefore = await readTips();
  await copyBtn.click();
  await page.waitForTimeout(300);
  const clip = await page
    .evaluate(() => navigator.clipboard.readText())
    .catch(() => 'n/a');
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  await copyBtn.hover();
  await page.waitForTimeout(1300);
  const tipAfter = await readTips();
  const s = await shot(page, '5-copy-button');
  const copiedMatch = clip === label && label.length > 0;
  const tipFlip = tipAfter.some((t) => /Copied to clipboard/i.test(t));
  record(
    '5-copy-button',
    exists && copiedMatch && cursor === 'copy'
      ? tipFlip
        ? 'PASS'
        : 'WARN'
      : 'FAIL',
    `cell="${label}" clipboard="${clip}" match=${copiedMatch}, cursor=${cursor}, tipBefore=${JSON.stringify(tipBefore)} tipAfter=${JSON.stringify(tipAfter)} flip=${tipFlip}`,
    s,
  );
}

// editing row = the tr containing the Save button; its inputs are the editors.
// The text editor commits to row cache on BLUR, so blur before Save.
const editingRow = () =>
  page
    .locator(`${LAYOUT} table tr`)
    .filter({ has: page.locator('button[aria-label="Save"]') })
    .first();

// ---------- 6. Pencil edit -> row mode -> EditActionButtons -> save ----------
{
  const pencil = page.locator(btn('Edit')).first();
  const pencilExists = (await pencil.count()) > 0;
  await pencil.click();
  await page.waitForSelector(btn('Save'), { timeout: 5000 }).catch(() => {});
  const saveVisible = (await page.locator(btn('Save')).count()) > 0;
  const cancelVisible = (await page.locator(btn('Cancel')).count()) > 0;
  const input = editingRow().locator('input').first();
  const hasInput = (await input.count()) > 0;
  const newVal = 'EDITED Engineering';
  if (hasInput) {
    await input.click();
    await input.fill(newVal);
    await input.blur(); // commit to row cache
    await page.waitForTimeout(200);
  }
  const sEditing = await shot(page, '6-edit-row-mode');
  await page.locator(btn('Save')).first().click();
  await page.waitForTimeout(500);
  const saved = await page.locator('#srt-buttons-last-saved').innerText();
  const sSaved = await shot(page, '6b-edit-saved');
  const savedNewVal = saved.includes(newVal);
  record(
    '6-edit-pencil-save',
    pencilExists && saveVisible && cancelVisible && hasInput && savedNewVal
      ? 'PASS'
      : 'FAIL',
    `pencil=${pencilExists}, save=${saveVisible}, cancel=${cancelVisible}, editedValuePersisted=${savedNewVal}, lastSaved="${saved}"`,
    sSaved,
  );
  console.log(`   (editing screenshot ${sEditing})`);
}

// ---------- 6c. Cancel restores ----------
{
  const pencil = page.locator(btn('Edit')).first();
  await pencil.click();
  await page.waitForSelector(btn('Cancel'), { timeout: 5000 }).catch(() => {});
  const input = editingRow().locator('input').first();
  const orig = await input.inputValue().catch(() => 'n/a');
  await input.click();
  await input.fill('SHOULD NOT PERSIST');
  await input.blur();
  await page.locator(btn('Cancel')).first().click();
  await page.waitForTimeout(400);
  const tableText = await bodyText();
  const restored = !/SHOULD NOT PERSIST/.test(tableText);
  const stillHasOrig = new RegExp(
    orig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  ).test(tableText);
  const s = await shot(page, '6c-edit-cancel');
  record(
    '6c-edit-cancel',
    restored ? 'PASS' : 'FAIL',
    `origInputVal="${orig}", editDiscarded=${restored}, origValueStillShown=${stillHasOrig}`,
    s,
  );
}

// ---------- 7. Row action ... menu ----------
{
  await toggleCheckbox(page, 'row actions ... menu');
  await page.waitForTimeout(400);
  const more = page.locator(btn('Row Actions')).first();
  const moreExists = (await more.count()) > 0;
  await more.click();
  await page.waitForTimeout(400);
  const menuText = await page
    .locator('[role="menu"], [data-radix-menu-content], [role="dialog"]')
    .allInnerTexts()
    .catch(() => []);
  const joined = menuText.join(' | ');
  const hasItems = /View details/.test(joined) && /Edit member/.test(joined);
  const s = await shot(page, '7-row-action-menu', 'body');
  record(
    '7-row-action-menu',
    moreExists && hasItems ? 'PASS' : 'FAIL',
    `... button=${moreExists}, menuItems="${joined}"`,
    s,
  );
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await toggleCheckbox(page, 'row actions ... menu');
  await page.waitForTimeout(300);
}

// ---------- 8. Toolbar toggles ----------
// 8a search
{
  await page.locator(btn('Show/Hide search')).click();
  await page.waitForTimeout(400);
  const searchInput = page.locator(`${LAYOUT} input[placeholder="Search"]`);
  const visible = (await searchInput.count()) > 0;
  const focused = visible
    ? await searchInput.evaluate((el) => el === document.activeElement)
    : false;
  let filtered = null;
  if (visible) {
    await searchInput.fill('Ada');
    await page.waitForTimeout(600);
    // expand Engineering so Ada is in the model, then check filtering
  }
  const s = await shot(page, '8a-search');
  record(
    '8a-toolbar-search',
    visible ? 'PASS' : 'FAIL',
    `search input revealed=${visible}, focused=${focused}`,
    s,
  );
  if (visible) {
    await searchInput.fill('');
    await page.waitForTimeout(300);
    await page.locator(btn('Show/Hide search')).click();
    await page.waitForTimeout(300);
  }
}
// 8b filters
{
  const before = await page
    .locator(`${LAYOUT} thead input, ${LAYOUT} thead [role="combobox"]`)
    .count();
  await page.locator(btn('Show/Hide filters')).click();
  await page.waitForTimeout(500);
  const after = await page
    .locator(`${LAYOUT} thead input, ${LAYOUT} thead [role="combobox"]`)
    .count();
  const s = await shot(page, '8b-filters');
  record(
    '8b-toolbar-filters',
    after !== before ? 'PASS' : 'FAIL',
    `thead filter fields ${before}->${after}`,
    s,
  );
  await page.locator(btn('Show/Hide filters')).click();
  await page.waitForTimeout(400);
}
// 8c density (3 states)
{
  const measure = () =>
    page.evaluate((LAYOUT) => {
      const td = document.querySelector(`${LAYOUT} tbody td`);
      return td ? td.getBoundingClientRect().height : null;
    }, LAYOUT);
  const h0 = await measure();
  await page.locator(btn('Toggle density')).click();
  await page.waitForTimeout(300);
  const h1 = await measure();
  await page.locator(btn('Toggle density')).click();
  await page.waitForTimeout(300);
  const h2 = await measure();
  await page.locator(btn('Toggle density')).click();
  await page.waitForTimeout(300);
  const h3 = await measure();
  const s = await shot(page, '8c-density');
  const heights = [h0, h1, h2, h3];
  const distinct = new Set(heights.map((h) => Math.round(h))).size;
  const cycled = Math.round(h0) === Math.round(h3);
  record(
    '8c-toolbar-density',
    distinct >= 3 && cycled ? 'PASS' : distinct >= 2 ? 'WARN' : 'FAIL',
    `cell heights ${JSON.stringify(heights.map((h) => Math.round(h)))}, distinct=${distinct}, cycledBack=${cycled}`,
    s,
  );
}
// 8d fullscreen
{
  await page.locator(btn('Toggle full screen')).click();
  await page.waitForTimeout(500);
  const fs = await page.evaluate((LAYOUT) => {
    const el = document.querySelector(LAYOUT);
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      position: cs.position,
      width: Math.round(r.width),
      vw: window.innerWidth,
    };
  }, LAYOUT);
  const s = await shot(page, '8d-fullscreen', 'body');
  const isFs = fs.position === 'fixed' || fs.width >= fs.vw - 4;
  record(
    '8d-toolbar-fullscreen',
    isFs ? 'PASS' : 'FAIL',
    `layout position=${fs.position}, width=${fs.width}/${fs.vw}`,
    s,
  );
  await page.locator(btn('Toggle full screen')).click();
  await page.waitForTimeout(400);
}
// 8e show/hide columns
{
  await page.locator(btn('Show/Hide columns')).click();
  await page.waitForTimeout(400);
  const menuText = await page
    .locator('[role="menu"], [data-radix-menu-content], [role="dialog"]')
    .allInnerTexts()
    .catch(() => []);
  const joined = menuText.join(' | ');
  const hasCols = /Name/.test(joined) && /Email/.test(joined);
  const s = await shot(page, '8e-columns-menu', 'body');
  record(
    '8e-toolbar-columns',
    hasCols ? 'PASS' : 'FAIL',
    `columns menu content="${joined.slice(0, 120)}"`,
    s,
  );
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
}

// ---------- 9. Console errors ----------
{
  // "controlled input to be uncontrolled": MRT-exact range filter under StrictMode
  // (isMounted effect double-runs -> handleClear -> [undefined, undefined] ->
  // value={filterValue} undefined, same as MRT_FilterTextField:530-535); baseline.
  const demoErrors = allErrors.filter(
    (e) =>
      !/favicon|Download the React DevTools|ResizeObserver loop|controlled input to be uncontrolled/i.test(e),
  );
  record(
    '9-console-clean',
    demoErrors.length === 0 ? 'PASS' : 'FAIL',
    demoErrors.length === 0
      ? 'no console errors/warnings'
      : `errors: ${demoErrors.slice(0, 8).join(' || ')}`,
  );
}

console.log('\n=== SUMMARY ===');
for (const r of results) {
  console.log(`${r.status}\t${r.id}\t${r.evidence}`);
}
const fails = results.filter((r) => r.status === 'FAIL').length;
const warns = results.filter((r) => r.status === 'WARN').length;
console.log(`\n${results.length} cases, ${fails} FAIL, ${warns} WARN`);

await browser.close();
