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
const page = await browser.newPage({ viewport: { width: 1440, height: 2000 } });

const msgs = [];
page.on('console', (m) => {
  if (['error', 'warning'].includes(m.type())) msgs.push(m.type() + ': ' + m.text());
});
page.on('pageerror', (e) => msgs.push('PAGEERROR: ' + e.message));

const shot = (name, sel) =>
  (sel ? page.locator(sel) : page).screenshot({ path: path.join(SHOTS, name) });

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector(LAYOUT, { timeout: 15000 });
await page.waitForTimeout(500);

const layout = page.locator(LAYOUT);
// The Last Name column uses filterVariant:'text' → InputGroup with a
// "Change filter mode" button in its inline-start addon. Target its InputGroup
// via the input's aria-label ("Filter by Last Name").
const lastNameInput = layout.getByLabel('Filter by Last Name');
const lastNameGroup = lastNameInput.locator(
  'xpath=ancestor::*[@data-slot="input-group"]',
);
const modeBtn = lastNameGroup.getByRole('button', { name: 'Change filter mode' });

// count of data rows (a helper to prove filtering happened)
const bodyRowCount = () =>
  page.evaluate((LAYOUT) => {
    const tbody = document.querySelector(`${LAYOUT} tbody`);
    if (!tbody) return -1;
    return [...tbody.querySelectorAll('tr')].filter(
      (tr) => !/no records|no results/i.test(tr.textContent || ''),
    ).length;
  }, LAYOUT);

// ---------- Check 1: open filter-mode menu, switch to Empty ----------
let rowsUnfiltered = -1;
{
  rowsUnfiltered = await bodyRowCount();
  const modeBtnCount = await modeBtn.count();
  await modeBtn.first().click();
  await page.waitForTimeout(300);
  const menu = page.locator('[data-slot="dropdown-menu-content"]');
  const menuVisible = (await menu.count()) > 0 && (await menu.first().isVisible());
  // Menu items render a symbol span before the label ("∅Empty" / "!∅Not Empty");
  // match the "Empty" item while excluding "Not Empty".
  const emptyItem = menu
    .getByRole('menuitem')
    .filter({ hasText: 'Empty' })
    .filter({ hasNotText: 'Not' });
  const emptyItemCount = await emptyItem.count();
  await emptyItem.first().click();
  await page.waitForTimeout(400);
  const chip = lastNameGroup.locator('[data-slot="badge"]');
  const chipVisible = (await chip.count()) > 0 && (await chip.first().isVisible());
  await shot('filter-chip-visible.png', LAYOUT);
  const pass = modeBtnCount >= 1 && menuVisible && emptyItemCount === 1 && chipVisible;
  record(
    '1-switch-to-empty-shows-chip',
    pass ? 'PASS' : 'FAIL',
    `modeBtns=${modeBtnCount} menuVisible=${menuVisible} emptyMenuItem=${emptyItemCount} chipVisible=${chipVisible} rowsUnfiltered=${rowsUnfiltered}`,
    'filter-chip-visible.png',
  );
}

// ---------- Check 2: chip = single <button data-slot="badge"> + circle-X ~12px ----------
{
  const info = await page.evaluate((LAYOUT) => {
    const group = document
      .querySelector(`${LAYOUT}`)
      .querySelector('[data-slot="input-group"]'); // first input-group; refine below
    // find the group that actually contains a badge chip
    const groups = [
      ...document.querySelectorAll(`${LAYOUT} [data-slot="input-group"]`),
    ];
    const g = groups.find((gr) => gr.querySelector('[data-slot="badge"]')) || group;
    const b = g?.querySelector('[data-slot="badge"]');
    if (!b) return { found: false };
    const svg = b.querySelector('svg');
    const r = svg?.getBoundingClientRect();
    return {
      found: true,
      tag: b.tagName.toLowerCase(),
      dataSlot: b.getAttribute('data-slot'),
      nestedButtons: b.querySelectorAll('button').length,
      text: b.textContent.trim(),
      accName:
        b.getAttribute('aria-label') || b.textContent.trim(), // no aria-label → text is the name
      svgHasCircle: !!svg?.querySelector('circle'),
      svgTag: svg ? [...svg.querySelectorAll('*')].map((e) => e.tagName).join(',') : null,
      svgW: r ? Math.round(r.width) : null,
      svgH: r ? Math.round(r.height) : null,
    };
  }, LAYOUT);

  const tagOk = info.found && info.tag === 'button';
  const slotOk = info.dataSlot === 'badge';
  const noNested = info.nestedButtons === 0;
  const iconSizeOk = info.svgW >= 10 && info.svgW <= 16;
  const nameOk = info.text === 'Empty';
  // circle-X sub-assertion (checklist expectation)
  const circleOk = info.svgHasCircle;
  const pass = tagOk && slotOk && noNested && iconSizeOk && nameOk;
  record(
    '2-chip-single-button-shape',
    pass ? 'PASS' : 'FAIL',
    `found=${info.found} tag=${info.tag} dataSlot=${info.dataSlot} nested=${info.nestedButtons} text="${info.text}" accName="${info.accName}" iconPx=${info.svgW}x${info.svgH} svgChildren=[${info.svgTag}] svgHasCircle=${info.svgHasCircle}`,
  );
  record(
    '2b-chip-icon-is-circleX',
    circleOk ? 'PASS' : 'FAIL',
    `svgHasCircle=${info.svgHasCircle} (checklist expects a circle-X / <circle>; code uses icons.CloseIcon = lucide X)`,
  );
}

// ---------- Check 3: accessible name = "Empty" (role button) ----------
{
  const byRole = lastNameGroup.getByRole('button', { name: 'Empty', exact: true });
  const cnt = await byRole.count();
  const pass = cnt === 1;
  record(
    '3-chip-accessible-name',
    pass ? 'PASS' : 'FAIL',
    `getByRole(button,name="Empty") matches=${cnt}`,
  );
}

// ---------- Check 4: click chip clears filter, chip disappears, table unfiltered ----------
{
  const chip = lastNameGroup.getByRole('button', { name: 'Empty', exact: true });
  const rowsWhileEmpty = await bodyRowCount();
  await chip.first().click();
  await page.waitForTimeout(500);
  const chipAfter = await lastNameGroup.locator('[data-slot="badge"]').count();
  const inputEnabledAfter = await lastNameInput.isEnabled().catch(() => false);
  const rowsAfter = await bodyRowCount();
  await shot('filter-chip-after-clear.png', LAYOUT);
  // Empty mode on Last Name matches 0 data rows (all have a last name);
  // clearing should restore the full unfiltered row count.
  const pass =
    chipAfter === 0 &&
    rowsAfter === rowsUnfiltered &&
    rowsAfter > rowsWhileEmpty;
  record(
    '4-click-chip-clears-filter',
    pass ? 'PASS' : 'FAIL',
    `chipsAfter=${chipAfter} inputEnabledAfter=${inputEnabledAfter} rowsWhileEmpty=${rowsWhileEmpty} rowsAfter=${rowsAfter} rowsUnfiltered=${rowsUnfiltered}`,
    'filter-chip-after-clear.png',
  );
}

// ---------- Check 5: console clean ----------
{
  const errs = msgs.filter((m) => !IGNORE.test(m));
  const pass = errs.length === 0;
  record(
    '5-console-clean',
    pass ? 'PASS' : 'FAIL',
    `msgs=${errs.length}${errs.length ? ' :: ' + errs.slice(0, 8).join(' | ') : ''}`,
  );
}

await browser.close();

const pass = results.filter((r) => r.status === 'PASS').length;
const fail = results.filter((r) => r.status === 'FAIL').length;
console.log(`\n=== SUMMARY: ${pass} PASS, ${fail} FAIL (of ${results.length}) ===`);
process.exit(fail ? 1 : 0);
