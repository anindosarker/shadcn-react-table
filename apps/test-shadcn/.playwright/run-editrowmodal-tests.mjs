import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const BASE = process.env.SRT_BASE ?? 'http://localhost:5273/';

const demoSel = '#srt-editrowmodal-demo';
const dialogSel = '[data-slot="dialog-content"]';
const lastSavedSel = '#srt-editrowmodal-lastsaved';

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
  const warnings = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
    if (m.type() === 'warning') warnings.push(m.text());
  });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector(demoSel, { timeout: 15000 });
  await page.waitForTimeout(400);
  // scroll demo into view
  await page.locator(demoSel).scrollIntoViewIfNeeded();
  page._errors = errors;
  page._warnings = warnings;
  return page;
}

// pencil edit button inside our demo section only
const editPencil = (page) =>
  page.locator(`${demoSel} button[aria-label="Edit"]`).first();

// ---------- Case a: row edit opens modal (title/inputs/width/no-X) ----------
{
  const page = await newPage();
  const before = await page.locator(dialogSel).count();
  await editPencil(page).click();
  await page.waitForTimeout(400);
  const dialog = page.locator(dialogSel);
  const after = await dialog.count();
  const info = await dialog.first().evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const title = el.querySelector('[data-slot="dialog-title"]');
    const closeBtn = el.querySelector('[data-slot="dialog-close"]');
    const inputs = el.querySelectorAll('input');
    return {
      width: Math.round(rect.width),
      titleText: title?.textContent ?? '(none)',
      titleAlign: title ? getComputedStyle(title).textAlign : '(none)',
      hasCloseX: !!closeBtn,
      inputCount: inputs.length,
      disabledInputs: Array.from(inputs).filter((i) => i.disabled).length,
      ariaDescribedby: el.getAttribute('aria-describedby'),
      viewportCenterX: Math.round(rect.left + rect.width / 2),
      windowCenterX: Math.round(window.innerWidth / 2),
    };
  });
  const shot = '20-editmodal-open.png';
  await page.screenshot({ path: path.join(SHOTS, shot) });
  // 4 data columns get inputs (id,firstName,lastName,email,city = 5 data cols; id is enableEditing:false but still rendered)
  const centered = Math.abs(info.viewportCenterX - info.windowCenterX) < 3;
  // default-variants ruling (2026-07-14): DialogContent default sm:max-w-lg (512px)
  // replaced the 444px cva; DialogHeader default alignment replaced text-center.
  const widthOk = info.width >= 500 && info.width <= 520;
  const pass =
    before === 0 &&
    after > 0 &&
    info.titleText === 'Edit' &&
    info.titleAlign === 'left' &&
    !info.hasCloseX &&
    info.inputCount >= 5 &&
    widthOk &&
    centered;
  record(
    'a-row-edit-open',
    pass ? 'PASS' : 'FAIL',
    `before=${before} after=${after}; title="${info.titleText}" align=${info.titleAlign}; closeX=${info.hasCloseX}; inputs=${info.inputCount} (disabled=${info.disabledInputs}); width=${info.width}px; centered=${centered} (dlg=${info.viewportCenterX} vs win=${info.windowCenterX}); aria-describedby=${info.ariaDescribedby}`,
    shot,
  );
  await page.close();
}

// ---------- Case b: save persists via onEditingRowSave ----------
{
  const page = await newPage();
  await editPencil(page).click();
  await page.waitForTimeout(300);
  const dialog = page.locator(dialogSel).first();
  // edit the firstName field (find input whose value is a known first name)
  const fnInput = dialog.locator('input[name="firstName"]');
  let usedSel = 'input[name="firstName"]';
  let count = await fnInput.count();
  let target;
  if (count > 0) {
    target = fnInput.first();
  } else {
    // fallback: first enabled input
    target = dialog.locator('input:not([disabled])').first();
    usedSel = 'first enabled input';
  }
  await target.fill('CHANGED');
  // action buttons: variant text -> Cancel / Save (MRT min-w-[100px] dropped per
  // the default-variants ruling; shadcn Button default width wins)
  const saveBtn = dialog.getByRole('button', { name: /save/i });
  const btnInfo = await saveBtn.first().evaluate((el) => {
    const cs = getComputedStyle(el);
    return { minWidth: cs.minWidth, text: el.textContent };
  });
  await saveBtn.first().click();
  await page.waitForTimeout(400);
  const dialogGone = (await page.locator(dialogSel).count()) === 0;
  const lastSaved = await page.locator(lastSavedSel).textContent();
  const shot = '21-editmodal-saved.png';
  await page.screenshot({ path: path.join(SHOTS, shot) });
  const pass =
    dialogGone &&
    /CHANGED/.test(lastSaved) &&
    /edit/.test(lastSaved) &&
    btnInfo.minWidth === 'auto';
  record(
    'b-save',
    pass ? 'PASS' : 'FAIL',
    `sel="${usedSel}"; save-btn text="${btnInfo.text}" minW=${btnInfo.minWidth}; dialogClosed=${dialogGone}; lastSaved="${lastSaved?.replace(/\s+/g, ' ').trim()}"`,
    shot,
  );
  await page.close();
}

// ---------- Case c: cancel discards + closes ----------
{
  const page = await newPage();
  const savedBefore = (await page.locator(lastSavedSel).textContent())?.trim();
  await editPencil(page).click();
  await page.waitForTimeout(300);
  const dialog = page.locator(dialogSel).first();
  const target = dialog.locator('input:not([disabled])').first();
  await target.fill('DISCARDME');
  const cancelBtn = dialog.getByRole('button', { name: /cancel/i });
  await cancelBtn.first().click();
  await page.waitForTimeout(400);
  const dialogGone = (await page.locator(dialogSel).count()) === 0;
  const savedAfter = (await page.locator(lastSavedSel).textContent())?.trim();
  const shot = '22-editmodal-cancel.png';
  await page.screenshot({ path: path.join(SHOTS, shot) });
  const pass =
    dialogGone && savedAfter === savedBefore && !/DISCARDME/.test(savedAfter);
  record(
    'c-cancel',
    pass ? 'PASS' : 'FAIL',
    `dialogClosed=${dialogGone}; lastSaved unchanged=${savedAfter === savedBefore} ("${savedAfter}")`,
    shot,
  );
  await page.close();
}

// ---------- Case d: Escape key closes via cancel path ----------
{
  const page = await newPage();
  const savedBefore = (await page.locator(lastSavedSel).textContent())?.trim();
  await editPencil(page).click();
  await page.waitForTimeout(300);
  const dialog = page.locator(dialogSel).first();
  await dialog.locator('input:not([disabled])').first().fill('ESCTEST');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const dialogGone = (await page.locator(dialogSel).count()) === 0;
  const savedAfter = (await page.locator(lastSavedSel).textContent())?.trim();
  const shot = '23-editmodal-escape.png';
  await page.screenshot({ path: path.join(SHOTS, shot) });
  const pass =
    dialogGone && savedAfter === savedBefore && !/ESCTEST/.test(savedAfter);
  record(
    'd-escape',
    pass ? 'PASS' : 'FAIL',
    `dialogClosed=${dialogGone}; discarded=${!/ESCTEST/.test(savedAfter)}; lastSaved="${savedAfter}"`,
    shot,
  );
  await page.close();
}

// ---------- Case e: overlay click closes via cancel path ----------
{
  const page = await newPage();
  const savedBefore = (await page.locator(lastSavedSel).textContent())?.trim();
  await editPencil(page).click();
  await page.waitForTimeout(300);
  const dialog = page.locator(dialogSel).first();
  await dialog.locator('input:not([disabled])').first().fill('OVERLAYTEST');
  // click the overlay at a corner away from the dialog content
  const overlay = page.locator('[data-slot="dialog-overlay"]');
  const overlayCount = await overlay.count();
  let clicked = false;
  if (overlayCount > 0) {
    await overlay.first().click({ position: { x: 5, y: 5 }, force: true });
    clicked = true;
  } else {
    // fallback: click top-left of viewport (outside centered dialog)
    await page.mouse.click(5, 5);
    clicked = true;
  }
  await page.waitForTimeout(400);
  const dialogGone = (await page.locator(dialogSel).count()) === 0;
  const savedAfter = (await page.locator(lastSavedSel).textContent())?.trim();
  const shot = '24-editmodal-overlay.png';
  await page.screenshot({ path: path.join(SHOTS, shot) });
  const pass =
    clicked &&
    dialogGone &&
    savedAfter === savedBefore &&
    !/OVERLAYTEST/.test(savedAfter);
  record(
    'e-overlay-click',
    pass ? 'PASS' : 'FAIL',
    `overlayFound=${overlayCount}; dialogClosed=${dialogGone}; discarded=${!/OVERLAYTEST/.test(savedAfter)}; lastSaved="${savedAfter}"`,
    shot,
  );
  await page.close();
}

// ---------- Case f: create row via custom toolbar button ----------
{
  const page = await newPage();
  const createBtn = page.locator('#srt-editrowmodal-create');
  const createCount = await createBtn.count();
  await createBtn.click();
  await page.waitForTimeout(400);
  const dialog = page.locator(dialogSel).first();
  const after = await page.locator(dialogSel).count();
  const emptyInputs = await dialog.evaluate((el) => {
    const inputs = Array.from(el.querySelectorAll('input'));
    return {
      total: inputs.length,
      empty: inputs.filter((i) => i.value === '').length,
      values: inputs.map((i) => i.value),
    };
  });
  const shot = '25-createmodal-open.png';
  await page.screenshot({ path: path.join(SHOTS, shot) });
  // fill and save
  const target = dialog.locator('input:not([disabled])').first();
  await target.fill('NewPerson');
  const saveBtn = dialog.getByRole('button', { name: /save/i });
  await saveBtn.first().click();
  await page.waitForTimeout(400);
  const dialogGone = (await page.locator(dialogSel).count()) === 0;
  const lastSaved = (await page.locator(lastSavedSel).textContent())?.trim();
  const shot2 = '26-createmodal-saved.png';
  await page.screenshot({ path: path.join(SHOTS, shot2) });
  const pass =
    createCount > 0 &&
    after > 0 &&
    emptyInputs.empty === emptyInputs.total &&
    dialogGone &&
    /create/.test(lastSaved) &&
    /NewPerson/.test(lastSaved);
  record(
    'f-create',
    pass ? 'PASS' : 'FAIL',
    `btn=${createCount}; modalOpened=${after > 0}; inputs=${emptyInputs.total} allEmpty=${emptyInputs.empty === emptyInputs.total} (${JSON.stringify(emptyInputs.values)}); saved-closed=${dialogGone}; lastSaved="${lastSaved}"`,
    shot2,
  );
  await page.close();
}

// ---------- Case g: console clean (no radix Missing Description, no React errors) ----------
{
  const page = await newPage();
  await editPencil(page).click();
  await page.waitForTimeout(400);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await page.locator('#srt-editrowmodal-create').click();
  await page.waitForTimeout(400);
  const missingDesc = [...page._errors, ...page._warnings].filter((m) =>
    /Missing.*Description|aria-describedby|DialogContent.*requires/i.test(m),
  );
  // "controlled input to be uncontrolled": MRT-exact range filter under StrictMode
  // (isMounted effect double-runs -> handleClear -> [undefined, undefined] ->
  // value={filterValue} undefined, same as MRT_FilterTextField:530-535); baseline.
  const reactErrors = page._errors.filter(
    (m) => !/Missing.*Description|controlled input to be uncontrolled/i.test(m),
  );
  const shot = '27-console.png';
  await page.screenshot({ path: path.join(SHOTS, shot) });
  const pass = missingDesc.length === 0 && reactErrors.length === 0;
  record(
    'g-console',
    pass ? 'PASS' : 'FAIL',
    `missingDescriptionWarnings=${missingDesc.length}; otherErrors=${reactErrors.length}${reactErrors.length ? ' [' + reactErrors.slice(0, 3).join(' | ') + ']' : ''}`,
    shot,
  );
  await page.close();
}

await browser.close();

const failed = results.filter((r) => r.status === 'FAIL');
const skipped = results.filter((r) => r.status === 'SKIP');
console.log(
  `\n=== SUMMARY: ${results.filter((r) => r.status === 'PASS').length} PASS, ${failed.length} FAIL, ${skipped.length} SKIP (of ${results.length}) ===`,
);
process.exit(failed.length ? 1 : 0);
