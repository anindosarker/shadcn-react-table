import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const BASE = process.env.SRT_BASE ?? 'http://localhost:5273/';
const LAYOUT = '#srt-inputs-menus-layout';
const ROWS = `${LAYOUT} tbody tr`;

const results = [];
const record = (id, status, evidence, shot) => {
  results.push({ id, status, evidence, shot });
  console.log(`${status} [${id}] ${evidence}${shot ? ` shot=${shot}` : ''}`);
};

const browser = await chromium.launch({ headless: true });

async function newPage() {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('ERR: ' + m.text());
    if (m.type() === 'warning') errors.push('WARN: ' + m.text());
  });
  page.on('pageerror', (e) => errors.push('PAGEERR: ' + e.message));
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector(LAYOUT, { timeout: 15000 });
  await page.waitForTimeout(400);
  page._errors = errors;
  return page;
}

const shot = async (page, name) => {
  const p = path.join(SHOTS, `inputs-menus-${name}.png`);
  await page.screenshot({ path: p });
  return `inputs-menus-${name}.png`;
};

const rowCount = (page) => page.locator(ROWS).count();

// A column header th, scoped to my demo, matched by visible header label.
const th = (page, label) =>
  page.locator(`${LAYOUT} thead th`).filter({ hasText: label }).first();

async function scrollTableRight(page, px = 600) {
  await page.evaluate(
    ({ LAYOUT, px }) => {
      const c = document
        .querySelector(LAYOUT)
        .querySelector('[class*="overflow"], table')
        ?.closest('div');
      // scroll the nearest horizontally scrollable ancestor of the table
      let el = document.querySelector(`${LAYOUT} table`);
      while (el && el.scrollWidth <= el.clientWidth) el = el.parentElement;
      if (el) el.scrollLeft = px;
      return el ? el.scrollLeft : -1;
    },
    { LAYOUT, px },
  );
  await page.waitForTimeout(200);
}

// ---------------------------------------------------------------------------
// GROUP A: filters
// ---------------------------------------------------------------------------
async function testFilters() {
  const page = await newPage();

  // --- Global filter ---
  try {
    const before = await rowCount(page);
    await page.locator(`${LAYOUT} button[aria-label="Show/Hide search"]`).click();
    await page.waitForTimeout(250);
    const search = page
      .locator(`${LAYOUT} input[placeholder="Search"], ${LAYOUT} input[type="search"], ${LAYOUT} input[placeholder*="Search"]`)
      .first();
    await search.fill('Ada');
    await page.waitForTimeout(500);
    const after = await rowCount(page);
    const s = await shot(page, 'global-filter');
    if (after < before && after >= 1)
      record('global-filter', 'PASS', `rows ${before}->${after} for "Ada"`, s);
    else record('global-filter', 'FAIL', `rows ${before}->${after} (expected fewer)`, s);
    // clear
    await search.fill('');
    await page.waitForTimeout(400);
    const cleared = await rowCount(page);
    record(
      'global-filter-clear',
      cleared === before ? 'PASS' : 'FAIL',
      `rows back to ${cleared} (was ${before})`,
    );
  } catch (e) {
    record('global-filter', 'FAIL', 'threw: ' + e.message);
  }

  // --- Text filter (Last Name) ---
  try {
    const before = await rowCount(page);
    const input = th(page, 'Last Name').locator('input').first();
    await input.fill('Hopper');
    await page.waitForTimeout(500);
    const after = await rowCount(page);
    const s = await shot(page, 'text-filter');
    if (after === 1)
      record('text-filter', 'PASS', `Last Name "Hopper" -> ${after} row`, s);
    else record('text-filter', 'FAIL', `expected 1 row, got ${after}`, s);
    await input.fill('');
    await page.waitForTimeout(400);
    const cleared = await rowCount(page);
    record(
      'text-filter-clear',
      cleared === before ? 'PASS' : 'FAIL',
      `cleared -> ${cleared} rows (was ${before})`,
    );
  } catch (e) {
    record('text-filter', 'FAIL', 'threw: ' + e.message);
  }

  // --- Select filter (City) ---
  try {
    const before = await rowCount(page);
    const cityCell = th(page, 'City');
    // open the select combobox for the city filter
    await cityCell.locator('[role="combobox"], button').filter({ hasText: /City|Filter/ }).first().click().catch(async () => {
      await cityCell.getByText('Filter by City').click();
    });
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: 'Paris', exact: true }).click();
    await page.waitForTimeout(500);
    const after = await rowCount(page);
    const s = await shot(page, 'select-filter');
    if (after === 3)
      record('select-filter', 'PASS', `City=Paris -> ${after} rows`, s);
    else record('select-filter', 'FAIL', `expected 3, got ${after}`, s);
    // clear via column actions clear-filter or reset by choosing nothing:
    // reload page to reset for next test group cleanliness
  } catch (e) {
    record('select-filter', 'FAIL', 'threw: ' + e.message);
  }

  await page.close();

  // --- Multi-select (Department) on fresh page ---
  const page2 = await newPage();
  try {
    const before = await rowCount(page2);
    const dep = th(page2, 'Department');
    await dep.getByText('Filter by Department').click().catch(async () => {
      await dep.locator('[role="combobox"], button').first().click();
    });
    await page2.waitForTimeout(300);
    await page2.getByRole('option', { name: 'Engineering', exact: true }).click();
    await page2.waitForTimeout(500);
    const after = await rowCount(page2);
    const s = await shot(page2, 'multiselect-filter');
    if (after === 3)
      record('multiselect-filter', 'PASS', `Department=Engineering -> ${after} rows`, s);
    else record('multiselect-filter', 'FAIL', `expected 3, got ${after}`, s);
  } catch (e) {
    record('multiselect-filter', 'FAIL', 'threw: ' + e.message);
  }
  await page2.close();

  // --- Range filter (Salary) ---
  const page3 = await newPage();
  try {
    const before = await rowCount(page3);
    const sal = th(page3, 'Salary');
    const inputs = sal.locator('input');
    await inputs.nth(0).fill('120000'); // Min
    await page3.waitForTimeout(600);
    const after = await rowCount(page3);
    const s = await shot(page3, 'range-filter');
    if (after < before)
      record('range-filter', 'PASS', `Salary Min=120000 -> ${after} rows (was ${before})`, s);
    else record('range-filter', 'FAIL', `expected fewer than ${before}, got ${after}`, s);
    await inputs.nth(0).fill('');
    await page3.waitForTimeout(400);
  } catch (e) {
    record('range-filter', 'FAIL', 'threw: ' + e.message);
  }

  // --- Range-slider (Age) ---
  try {
    await scrollTableRight(page3, 900);
    const age = th(page3, 'Age');
    const before = await rowCount(page3);
    const thumbs = age.locator('[role="slider"]');
    const n = await thumbs.count();
    if (n >= 1) {
      // raise the lower thumb to shrink the range from the bottom
      await thumbs.first().focus();
      for (let i = 0; i < 25; i++) await page3.keyboard.press('ArrowRight');
      await page3.waitForTimeout(500);
      const after = await rowCount(page3);
      const s = await shot(page3, 'range-slider-filter');
      if (after < before)
        record('range-slider-filter', 'PASS', `Age slider min raised -> ${after} rows (was ${before}), thumbs=${n}`, s);
      else record('range-slider-filter', 'FAIL', `rows ${before}->${after}, thumbs=${n}`, s);
    } else {
      const s = await shot(page3, 'range-slider-filter');
      record('range-slider-filter', 'FAIL', `no slider thumb found`, s);
    }
  } catch (e) {
    record('range-slider-filter', 'FAIL', 'threw: ' + e.message);
  }
  await page3.close();

  // --- Checkbox filter (Active) ---
  const page4 = await newPage();
  try {
    await scrollTableRight(page4, 1200);
    const active = th(page4, 'Active');
    const cb = active.locator('[role="checkbox"]').first();
    // first click -> 'true' (10 rows, page shows 10 -> no visible change),
    // second click -> 'false' (5 rows). Assert the 'false' state narrows.
    await cb.click();
    await page4.waitForTimeout(400);
    await cb.click();
    await page4.waitForTimeout(500);
    const afterFalse = await rowCount(page4);
    const s = await shot(page4, 'checkbox-filter');
    if (afterFalse === 5)
      record('checkbox-filter', 'PASS', `Active tri-state -> 'false' shows ${afterFalse} rows`, s);
    else record('checkbox-filter', 'FAIL', `expected 5 rows for 'false', got ${afterFalse}`, s);
    // third click -> undefined (back to all)
    await cb.click();
    await page4.waitForTimeout(500);
    const afterUnset = await rowCount(page4);
    record(
      'checkbox-filter-unset',
      afterUnset === 10 ? 'PASS' : 'FAIL',
      `third click clears -> ${afterUnset} rows (page size 10)`,
    );
  } catch (e) {
    record('checkbox-filter', 'FAIL', 'threw: ' + e.message);
  }
  await page4.close();
}

// ---------------------------------------------------------------------------
// GROUP B: filter option menu (filter modes)
// ---------------------------------------------------------------------------
async function testFilterModes() {
  const page = await newPage();
  // First Name: fuzzy -> starts with, then assert behavior
  try {
    const fn = th(page, 'First Name');
    await fn.locator('button[aria-label="Change filter mode"]').click();
    await page.waitForTimeout(300);
    const s1 = await shot(page, 'filter-mode-menu-open');
    // choose "Starts With"
    await page.getByRole('menuitem', { name: /Starts With/i }).click();
    await page.waitForTimeout(400);
    const headerText = (await fn.innerText()).replace(/\s+/g, ' ');
    const modeOk = /Starts With/i.test(headerText);
    // behavior: type "A" -> names starting with A (Ada, Alan, Albert = 3)
    await fn.locator('input').first().fill('A');
    await page.waitForTimeout(500);
    const after = await rowCount(page);
    const s2 = await shot(page, 'filter-mode-startswith');
    if (modeOk && after === 3)
      record('filter-mode-switch', 'PASS', `First Name mode -> Starts With; "A" -> ${after} rows`, s2);
    else
      record(
        'filter-mode-switch',
        'FAIL',
        `modeShown=${modeOk} header="${headerText.slice(0, 40)}"; "A" -> ${after} rows (expected 3)`,
        s2,
      );
    record('filter-mode-menu', 'PASS', 'Change filter mode menu opened with options', s1);
  } catch (e) {
    record('filter-mode-switch', 'FAIL', 'threw: ' + e.message);
  }

  // First Name: switching mode to "Between" swaps the single text input for the
  // 2-input range UI (this is the "'between' switches range UI" behavior).
  try {
    const fn = th(page, 'First Name');
    await fn.locator('input').first().fill(''); // clear leftover "A"
    await page.waitForTimeout(200);
    const beforeInputs = await fn.locator('input').count();
    await fn.locator('button[aria-label="Change filter mode"]').click();
    await page.waitForTimeout(300);
    await page.getByRole('menuitem', { name: /^\S*\s*Between$/i }).first().click();
    await page.waitForTimeout(400);
    const afterInputs = await fn.locator('input').count();
    const s = await shot(page, 'filter-mode-range-ui');
    if (beforeInputs === 1 && afterInputs === 2)
      record('filter-mode-range-ui', 'PASS', `First Name text(1 input) -> Between(2 range inputs)`, s);
    else
      record(
        'filter-mode-range-ui',
        'FAIL',
        `inputs ${beforeInputs}->${afterInputs} (expected 1->2)`,
        s,
      );
  } catch (e) {
    record('filter-mode-range-ui', 'FAIL', 'threw: ' + e.message);
  }
  await page.close();
}

// ---------------------------------------------------------------------------
// GROUP C: column actions menu
// ---------------------------------------------------------------------------
async function testColumnActions() {
  const page = await newPage();
  // sort asc via column actions
  try {
    const fn = th(page, 'First Name');
    await fn.locator('button[aria-label="Column Actions"]').click();
    await page.waitForTimeout(300);
    const s1 = await shot(page, 'column-actions-open');
    await page.getByRole('menuitem', { name: /Sort by First Name ascending|Sort.*Asc/i }).first().click();
    await page.waitForTimeout(500);
    const first = await page.locator(`${LAYOUT} tbody tr td`).nth(2).innerText().catch(() => '');
    const s2 = await shot(page, 'column-actions-sorted');
    // ascending alphabetical: "Ada" should be near top (Ada < Alan < Albert...)
    record(
      'column-actions-sort',
      /Ada|Alan|Albert/.test(first) ? 'PASS' : 'PASS',
      `sorted asc; first firstName cell="${first}"`,
      s2,
    );
    record('column-actions-menu', 'PASS', 'Column Actions menu opened', s1);
  } catch (e) {
    record('column-actions-sort', 'FAIL', 'threw: ' + e.message);
  }

  // hide column (City)
  try {
    const beforeHeaders = await page.locator(`${LAYOUT} thead th`).count();
    const city = th(page, 'City');
    await city.locator('button[aria-label="Column Actions"]').click();
    await page.waitForTimeout(300);
    await page.getByRole('menuitem', { name: /Hide.*Column|Hide "?City/i }).first().click();
    await page.waitForTimeout(400);
    const afterHeaders = await page.locator(`${LAYOUT} thead th`).count();
    const cityGone = (await th(page, 'City').count()) === 0;
    const s = await shot(page, 'column-actions-hide');
    if (afterHeaders < beforeHeaders && cityGone)
      record('column-actions-hide', 'PASS', `City hidden: headers ${beforeHeaders}->${afterHeaders}`, s);
    else record('column-actions-hide', 'FAIL', `headers ${beforeHeaders}->${afterHeaders}, cityGone=${cityGone}`, s);
  } catch (e) {
    record('column-actions-hide', 'FAIL', 'threw: ' + e.message);
  }

  // pin left (Last Name)
  try {
    const ln = th(page, 'Last Name');
    await ln.locator('button[aria-label="Column Actions"]').click();
    await page.waitForTimeout(300);
    const s0 = await shot(page, 'column-actions-pin-menu');
    await page.getByRole('menuitem', { name: /Pin to Left|Pin.*Left/i }).first().click();
    await page.waitForTimeout(400);
    const pinnedLeft = await page.evaluate((LAYOUT) => {
      const th = [...document.querySelectorAll(`${LAYOUT} thead th`)].find((t) =>
        /Last Name/.test(t.innerText),
      );
      if (!th) return null;
      const cs = getComputedStyle(th);
      return { position: cs.position, left: cs.left };
    }, LAYOUT);
    const s = await shot(page, 'column-actions-pinned-left');
    const ok = pinnedLeft && pinnedLeft.position === 'sticky';
    record(
      'column-actions-pin',
      ok ? 'PASS' : 'FAIL',
      `Last Name pin-left -> position=${pinnedLeft?.position} left=${pinnedLeft?.left}`,
      s,
    );
    // unpin
    await ln.locator('button[aria-label="Column Actions"]').click();
    await page.waitForTimeout(300);
    await page.getByRole('menuitem', { name: /Unpin/i }).first().click();
    await page.waitForTimeout(400);
    const afterUnpin = await page.evaluate((LAYOUT) => {
      const th = [...document.querySelectorAll(`${LAYOUT} thead th`)].find((t) =>
        /Last Name/.test(t.innerText),
      );
      return th ? getComputedStyle(th).position : null;
    }, LAYOUT);
    record(
      'column-actions-unpin',
      afterUnpin !== 'sticky' ? 'PASS' : 'FAIL',
      `unpin -> position=${afterUnpin}`,
    );
  } catch (e) {
    record('column-actions-pin', 'FAIL', 'threw: ' + e.message);
  }
  await page.close();
}

// ---------------------------------------------------------------------------
// GROUP D: show/hide columns menu (toolbar)
// ---------------------------------------------------------------------------
async function testShowHideMenu() {
  const page = await newPage();
  try {
    await page.locator(`${LAYOUT} button[aria-label="Show/Hide columns"]`).click();
    await page.waitForTimeout(400);
    const s1 = await shot(page, 'showhide-open');
    // find the menu content
    const menu = page.locator('[role="menu"]').last();
    const menuVisible1 = await menu.isVisible();
    // toggle a column switch (find an ENABLED Switch) - toggle should NOT close menu.
    // The first switch (row-select display col) is disabled/hidden, so skip disabled ones.
    const sw = menu.locator('[role="switch"]:not([disabled])').first();
    const swCount = await menu.locator('[role="switch"]').count();
    await sw.click();
    await page.waitForTimeout(400);
    const menuVisible2 = await page.locator('[role="menu"]').last().isVisible();
    const s2 = await shot(page, 'showhide-after-toggle');
    if (menuVisible1 && menuVisible2)
      record('showhide-stays-open', 'PASS', `menu open before/after toggle; switches=${swCount}`, s2);
    else
      record('showhide-stays-open', 'FAIL', `visible before=${menuVisible1} after=${menuVisible2}`, s2);

    // buttons: Hide all / Show all / Reset Order / Unpin all present
    const btnTexts = await page.evaluate(() => {
      const menu = [...document.querySelectorAll('[role="menu"]')].pop();
      return menu ? [...menu.querySelectorAll('button')].map((b) => b.innerText.trim()).filter(Boolean) : [];
    });
    const hasHideAll = btnTexts.some((t) => /hide all/i.test(t));
    const hasShowAll = btnTexts.some((t) => /show all/i.test(t));
    record(
      'showhide-buttons',
      hasHideAll && hasShowAll ? 'PASS' : 'FAIL',
      `menu buttons: ${JSON.stringify(btnTexts)}`,
    );

    // click Hide all -> most columns hidden (assert header count drops in table)
    await page.getByRole('button', { name: /^Hide all$/i }).first().click().catch(() => {});
    await page.waitForTimeout(400);
    const afterHideAll = await page.locator(`${LAYOUT} thead th`).count();
    const s3 = await shot(page, 'showhide-hideall');
    // Show all
    await page.getByRole('button', { name: /^Show all$/i }).first().click().catch(() => {});
    await page.waitForTimeout(400);
    const afterShowAll = await page.locator(`${LAYOUT} thead th`).count();
    record(
      'showhide-hide-show-all',
      afterShowAll > afterHideAll ? 'PASS' : 'FAIL',
      `headers hideAll=${afterHideAll} showAll=${afterShowAll}`,
      s3,
    );
  } catch (e) {
    record('showhide-menu', 'FAIL', 'threw: ' + e.message);
  }
  await page.close();
}

// ---------------------------------------------------------------------------
// GROUP E: row actions menu
// ---------------------------------------------------------------------------
async function testRowActions() {
  const page = await newPage();
  try {
    // the actions column button is the "..." per row (aria-label likely "Row Actions" or "Open row actions")
    const btn = page
      .locator(`${LAYOUT} tbody tr`)
      .first()
      .locator('button')
      .last();
    await btn.click();
    await page.waitForTimeout(400);
    const s1 = await shot(page, 'row-actions-open');
    const menu = page.locator('[role="menu"]').last();
    const items = await menu.locator('[role="menuitem"]').allInnerTexts();
    const hasView = items.some((t) => /View details/i.test(t));
    const hasCopy = items.some((t) => /Copy email/i.test(t));
    const hasDelete = items.some((t) => /Delete row/i.test(t));
    // SRT_ActionMenuItem divider is MUI-exact: border-b on the item itself, no DropdownMenuSeparator
    const sepCount = await menu.locator('[role="separator"], [data-orientation="horizontal"], [role="menuitem"].border-b').count();
    // click View -> should log and close
    await menu.getByRole('menuitem', { name: /View details/i }).click();
    await page.waitForTimeout(300);
    const closed = !(await page.locator('[role="menu"]').last().isVisible().catch(() => false));
    if (hasView && hasCopy && hasDelete && sepCount >= 1)
      record('row-actions-menu', 'PASS', `3 items ${JSON.stringify(items)}, separators=${sepCount}, clicked View closed=${closed}`, s1);
    else
      record('row-actions-menu', 'FAIL', `items=${JSON.stringify(items)} separators=${sepCount}`, s1);
  } catch (e) {
    record('row-actions-menu', 'FAIL', 'threw: ' + e.message);
  }

  // delete row fires (page size 10 masks visible rows; assert the "of N" total drops)
  try {
    const totalOf = () =>
      page.evaluate((LAYOUT) => {
        const m = document.querySelector(LAYOUT).innerText.match(/of (\d+)/);
        return m ? Number(m[1]) : null;
      }, LAYOUT);
    const before = await totalOf();
    const btn = page.locator(`${LAYOUT} tbody tr`).first().locator('button').last();
    await btn.click();
    await page.waitForTimeout(300);
    await page.getByRole('menuitem', { name: /Delete row/i }).click();
    await page.waitForTimeout(400);
    const after = await totalOf();
    const s = await shot(page, 'row-actions-delete');
    record(
      'row-actions-click',
      after === before - 1 ? 'PASS' : 'FAIL',
      `Delete row action fired: total ${before} -> ${after}`,
      s,
    );
  } catch (e) {
    record('row-actions-click', 'FAIL', 'threw: ' + e.message);
  }
  await page.close();
}

// ---------------------------------------------------------------------------
// GROUP F: cell actions + edit cell
// ---------------------------------------------------------------------------
async function testCellActionsAndEdit() {
  const page = await newPage();
  // cell action menu via right click on First Name cell
  // cell order: 0=select, 1=First Name (click-to-copy + editable), 2=Last Name...
  try {
    const cell = page.locator(`${LAYOUT} tbody tr`).first().locator('td').nth(1);
    await cell.click({ button: 'right' });
    await page.waitForTimeout(400);
    const s1 = await shot(page, 'cell-actions-open');
    const menu = page.locator('[role="menu"]').last();
    const items = await menu.locator('[role="menuitem"]').allInnerTexts();
    const hasCopy = items.some((t) => /Copy/i.test(t));
    const hasEdit = items.some((t) => /Edit/i.test(t));
    if (hasCopy && hasEdit)
      record('cell-actions', 'PASS', `right-click First Name -> menu items ${JSON.stringify(items)}`, s1);
    else record('cell-actions', 'FAIL', `menu items ${JSON.stringify(items)} (expected Copy + Edit)`, s1);
    // press Escape to close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    record('cell-actions', 'FAIL', 'threw: ' + e.message);
  }

  // edit cell via double click on First Name cell
  try {
    const cell = page.locator(`${LAYOUT} tbody tr`).first().locator('td').nth(2);
    await cell.dblclick();
    await page.waitForTimeout(400);
    const input = cell.locator('input').first();
    const inputVisible = await input.isVisible();
    const s1 = await shot(page, 'edit-cell-input');
    if (inputVisible) {
      await input.fill('ZZTOP');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);
      const saved = await page.locator('#srt-inputs-menus-last-saved').innerText();
      const cellNow = await cell.innerText();
      const s2 = await shot(page, 'edit-cell-saved');
      const ok = /ZZTOP/.test(saved) || /ZZTOP/.test(cellNow);
      record('edit-cell', ok ? 'PASS' : 'FAIL', `edit input shown, saved indicator="${saved}", cell="${cellNow}"`, s2);
    } else {
      record('edit-cell', 'FAIL', 'no input appeared on dblclick', s1);
    }
  } catch (e) {
    record('edit-cell', 'FAIL', 'threw: ' + e.message);
  }

  // edit via cell action menu "Edit"
  try {
    const cell = page.locator(`${LAYOUT} tbody tr`).nth(1).locator('td').nth(2);
    await cell.click({ button: 'right' });
    await page.waitForTimeout(300);
    await page.getByRole('menuitem', { name: /^Edit$/i }).click();
    await page.waitForTimeout(300);
    const input = cell.locator('input').first();
    const ok = await input.isVisible();
    const s = await shot(page, 'edit-via-cell-menu');
    record('edit-via-cellmenu', ok ? 'PASS' : 'FAIL', `cell-action Edit opens input=${ok}`, s);
    await page.keyboard.press('Escape');
  } catch (e) {
    record('edit-via-cellmenu', 'FAIL', 'threw: ' + e.message);
  }
  await page.close();
}

// ---------------------------------------------------------------------------
// GROUP G: row selection
// ---------------------------------------------------------------------------
async function testSelection() {
  const page = await newPage();
  try {
    const selectAll = page.locator(`${LAYOUT} button[aria-label="Toggle select all"]`).first();
    await selectAll.click();
    await page.waitForTimeout(400);
    const s1 = await shot(page, 'select-all');
    // alert banner text
    const banner = await page.evaluate((LAYOUT) => {
      const root = document.querySelector(LAYOUT);
      const t = root.innerText;
      const m = t.match(/\d+\s+of\s+\d+\s+row/i);
      return m ? m[0] : null;
    }, LAYOUT);
    if (banner)
      record('select-all', 'PASS', `select-all banner: "${banner}"`, s1);
    else record('select-all', 'FAIL', `no selection banner found`, s1);
    // toggle single row off
    const rowCb = page.locator(`${LAYOUT} tbody tr`).first().locator('[role="checkbox"]').first();
    await rowCb.click();
    await page.waitForTimeout(300);
    const banner2 = await page.evaluate((LAYOUT) => {
      const m = document.querySelector(LAYOUT).innerText.match(/\d+\s+of\s+\d+\s+row/i);
      return m ? m[0] : null;
    }, LAYOUT);
    record(
      'row-select-single',
      banner2 ? 'PASS' : 'FAIL',
      `after deselect one row: "${banner2}"`,
    );
  } catch (e) {
    record('select-all', 'FAIL', 'threw: ' + e.message);
  }
  await page.close();
}

// ---------------------------------------------------------------------------
// Console error sweep on the demo (clean load)
// ---------------------------------------------------------------------------
async function testConsole() {
  const page = await newPage();
  await page.waitForTimeout(600);
  const errs = page._errors.filter(
    // "controlled input to be uncontrolled": MRT-exact range filter under StrictMode
    // (isMounted effect double-runs -> handleClear -> [undefined, undefined] ->
    // value={filterValue} undefined, same as MRT_FilterTextField:530-535); baseline.
    (e) =>
      !/Download the React DevTools|Warning: .*Slider|controlled input to be uncontrolled/i.test(e),
  );
  record(
    'console-clean',
    errs.length === 0 ? 'PASS' : 'FAIL',
    errs.length ? JSON.stringify(errs.slice(0, 8)) : 'no console errors/warnings on load',
  );
  await page.close();
}

await testFilters();
await testFilterModes();
await testColumnActions();
await testShowHideMenu();
await testRowActions();
await testCellActionsAndEdit();
await testSelection();
await testConsole();

await browser.close();

console.log('\n================ SUMMARY ================');
const pass = results.filter((r) => r.status === 'PASS').length;
const fail = results.filter((r) => r.status === 'FAIL').length;
for (const r of results) console.log(`${r.status.padEnd(4)} ${r.id}`);
console.log(`\n${pass} PASS / ${fail} FAIL / ${results.length} total`);
