import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const BASE = 'http://localhost:5273/';

const AB = '#srt-alertbanner-layout';
const BANNER = `${AB} [data-slot="alert"]`;
const IM = '#srt-inputs-menus-layout';
const EDIT = '#srt-editrowmodal-demo';

const results = [];
const record = (id, status, evidence, shot) => {
  results.push({ id, status, evidence, shot });
  console.log(`${status} [${id}] ${evidence}${shot ? ` shot=${shot}` : ''}`);
};

const browser = await chromium.launch({ headless: true });
const IGNORE = /Download the React DevTools|React DevTools/i;

async function newPage() {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 3000 },
  });
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('ERR: ' + m.text());
    if (m.type() === 'warning') errors.push('WARN: ' + m.text());
  });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector(AB, { timeout: 15000 });
  await page.waitForTimeout(400);
  page._errors = errors;
  return page;
}
const cleanErrs = (page) => page._errors.filter((e) => !IGNORE.test(e));
const shot = (target, name) =>
  target.screenshot({ path: path.join(SHOTS, name) });

// ===== 1. AlertBanner: shadcn DEFAULT Alert look =====
{
  const page = await newPage(); // grouping on by default => banner visible
  // select-all so selection text + clear button appear alongside chips
  await page.locator(`${AB} thead [role="checkbox"]`).first().click();
  await page.waitForTimeout(300);

  const info = await page.evaluate((BANNER) => {
    const el = document.querySelector(BANNER);
    if (!el) return { present: false };
    const cs = getComputedStyle(el);
    const text = el.innerText;
    const badges = [...el.querySelectorAll('[data-slot="badge"]')].map((b) => ({
      text: b.textContent.trim(),
      hasClose: !!b.querySelector('button'),
    }));
    const clearBtn = [...el.querySelectorAll('button')].find((b) =>
      /clear selection/i.test(b.textContent),
    );
    return {
      present: true,
      role: el.getAttribute('role'),
      dataSlot: el.getAttribute('data-slot'),
      borderTopWidth: cs.borderTopWidth,
      borderStyle: cs.borderTopStyle,
      radius: cs.borderTopLeftRadius,
      padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
      fontSize: cs.fontSize,
      bg: cs.backgroundColor,
      cardVar: getComputedStyle(document.documentElement)
        .getPropertyValue('--card')
        .trim(),
      text: text.replace(/\n/g, ' ').trim(),
      selShown: /of \d+ row\(s\) selected/i.test(text),
      groupedBy: /grouped by/i.test(text),
      thenBy: /then by/i.test(text),
      badges,
      clearBtnSlot: clearBtn?.getAttribute('data-slot'),
    };
  }, BANNER);
  await shot(page.locator(BANNER), 'dv-01-alertbanner-default.png');

  const bordered = info.borderTopWidth !== '0px' && info.borderStyle !== 'none';
  const rounded = info.radius !== '0px';
  const padded = info.padding !== '0px 0px 0px 0px';
  const textSm = info.fontSize === '14px';
  const bgSet = info.bg && info.bg !== 'rgba(0, 0, 0, 0)';
  const pass =
    info.present &&
    info.role === 'alert' &&
    info.dataSlot === 'alert' &&
    bordered &&
    rounded &&
    padded &&
    textSm &&
    bgSet &&
    info.selShown &&
    info.groupedBy &&
    info.thenBy &&
    info.badges.length === 2 &&
    info.badges.every((b) => b.hasClose) &&
    info.clearBtnSlot === 'button';
  record(
    '1-alertbanner-default-look',
    pass ? 'PASS' : 'FAIL',
    `role=${info.role} slot=${info.dataSlot} border=${info.borderTopWidth}/${info.borderStyle}(set=${bordered}) radius=${info.radius}(set=${rounded}) padding=[${info.padding}](set=${padded}) fontSize=${info.fontSize}(14px=${textSm}) bg=${info.bg}(--card=${info.cardVar}) sel=${info.selShown} groupedBy=${info.groupedBy} thenBy=${info.thenBy} badges=${info.badges.length}[${info.badges.map((b) => b.text).join('|')}] clearBtnSlot=${info.clearBtnSlot}`,
    'dv-01-alertbanner-default.png',
  );
  await page.close();
}

// ===== 1b. AlertBanner interactions: clear selection + chip ungroup =====
{
  const page = await newPage();
  await page.locator(`${AB} thead [role="checkbox"]`).first().click();
  await page.waitForTimeout(250);
  const chipsBefore = await page
    .locator(`${BANNER} [data-slot="badge"]`)
    .count();
  // clear selection button
  await page
    .locator(`${BANNER} button`, { hasText: /clear selection/i })
    .first()
    .click();
  await page.waitForTimeout(250);
  const selText = await page.locator(BANNER).innerText();
  const selGone = !/of \d+ row\(s\) selected/i.test(selText);
  // ungroup one column via chip X
  await page.locator(`${BANNER} [data-slot="badge"] button`).first().click();
  await page.waitForTimeout(250);
  const chipsAfter = await page
    .locator(`${BANNER} [data-slot="badge"]`)
    .count();
  await shot(page.locator(BANNER), 'dv-01b-alertbanner-interactions.png');
  const pass = chipsBefore === 2 && selGone && chipsAfter === 1;
  record(
    '1b-alertbanner-interactions',
    pass ? 'PASS' : 'FAIL',
    `chipsBefore=${chipsBefore} clearSelection->selGone=${selGone} chipX->chipsAfter=${chipsAfter}(expect 1)`,
    'dv-01b-alertbanner-interactions.png',
  );
  await page.close();
}

// ===== 2. EditRowModal: default max-w-lg (~512px) =====
{
  const page = await newPage();
  const editSection = page.locator(EDIT);
  await editSection.scrollIntoViewIfNeeded();
  await page.locator(`${EDIT} button[aria-label="Edit"]`).first().click();
  await page.waitForTimeout(400);
  const dc = page.locator('[data-slot="dialog-content"]');
  const info = await dc.evaluate((el) => {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const title = el.querySelector('[data-slot="dialog-title"]');
    const titleCs = title ? getComputedStyle(title) : null;
    const fieldGroup = el.querySelector('[data-slot="field-group"]');
    const inputs = el.querySelectorAll('input');
    const closeX = el.querySelector('[data-slot="dialog-close"]');
    const saveBtn = [...el.querySelectorAll('button')].find((b) =>
      /save/i.test(b.textContent + (b.getAttribute('aria-label') || '')),
    );
    const cancelBtn = [...el.querySelectorAll('button')].find((b) =>
      /cancel/i.test(b.textContent + (b.getAttribute('aria-label') || '')),
    );
    return {
      maxWidth: cs.maxWidth,
      width: Math.round(rect.width),
      title: title?.textContent,
      titleAlign: titleCs?.textAlign,
      hasFieldGroup: !!fieldGroup,
      inputCount: inputs.length,
      hasCloseX: !!closeX,
      hasSave: !!saveBtn,
      hasCancel: !!cancelBtn,
    };
  });
  await shot(dc, 'dv-02-editmodal-open.png');
  // 512px = 32rem. In this theme sm:max-w-lg => 32rem. width should be ~512.
  const widthOk = info.width >= 500 && info.width <= 520;
  const maxWOk = /512px|32rem/.test(info.maxWidth);
  const pass =
    (widthOk || maxWOk) &&
    !!info.title &&
    info.hasFieldGroup &&
    info.inputCount >= 4 &&
    info.hasSave &&
    info.hasCancel &&
    !info.hasCloseX;
  record(
    '2-editmodal-width-default',
    pass ? 'PASS' : 'FAIL',
    `maxWidth=${info.maxWidth}(ok=${maxWOk}) renderedWidth=${info.width}px(500-520=${widthOk}) title="${info.title}" titleAlign=${info.titleAlign} fieldGroup=${info.hasFieldGroup} inputs=${info.inputCount} save=${info.hasSave} cancel=${info.hasCancel} closeX(should be absent)=${info.hasCloseX}`,
    'dv-02-editmodal-open.png',
  );

  // save + cancel functional check
  const firstInput = dc.locator('input:not([disabled])').first();
  await firstInput.fill('ZZTestName');
  await dc.locator('button', { hasText: /save/i }).first().click();
  await page.waitForTimeout(300);
  const modalGoneAfterSave =
    (await page.locator('[data-slot="dialog-content"]').count()) === 0;
  const lastSaved = await page
    .locator('#srt-editrowmodal-lastsaved')
    .innerText();
  const savedOk = /ZZTestName/.test(lastSaved);
  // reopen -> cancel
  await page.locator(`${EDIT} button[aria-label="Edit"]`).first().click();
  await page.waitForTimeout(300);
  await page
    .locator('[data-slot="dialog-content"] button', { hasText: /cancel/i })
    .first()
    .click();
  await page.waitForTimeout(300);
  const modalGoneAfterCancel =
    (await page.locator('[data-slot="dialog-content"]').count()) === 0;
  const pass2 = modalGoneAfterSave && savedOk && modalGoneAfterCancel;
  record(
    '2b-editmodal-save-cancel',
    pass2 ? 'PASS' : 'FAIL',
    `save->modalClosed=${modalGoneAfterSave} lastSaved="${lastSaved.replace(/\n/g, ' ').trim()}"(hasValue=${savedOk}) cancel->modalClosed=${modalGoneAfterCancel}`,
  );
  await page.close();
}

// ===== 3. Show/Hide columns menu: default padding, toggle stays open =====
{
  const page = await newPage();
  await page.locator(`${IM}`).scrollIntoViewIfNeeded();
  await page
    .locator(`${IM} button[aria-label="Show/Hide columns"]`)
    .first()
    .click();
  await page.waitForTimeout(300);
  const menu = page.locator('[data-slot="dropdown-menu-content"]').last();
  const before = await menu.evaluate((el) => {
    const items = [...el.querySelectorAll('[data-slot="dropdown-menu-item"]')];
    const first = items[0];
    const cs = first ? getComputedStyle(first) : null;
    return {
      itemCount: items.length,
      switchCount: el.querySelectorAll('[role="switch"]').length,
      firstItemPadding: cs
        ? `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`
        : null,
    };
  });
  await shot(menu, 'dv-03-showhide-menu.png');
  // toggle first ENABLED switch (row-select/actions columns render disabled switches)
  // Switch is asChild-merged with a tooltip trigger, so data-state reflects the
  // tooltip, not the toggle — read aria-checked for the real checked state.
  const firstSwitch = menu.locator('[role="switch"]:not([disabled])').first();
  const stateBefore = await firstSwitch.getAttribute('aria-checked');
  await firstSwitch.click();
  await page.waitForTimeout(300);
  const menuStillOpen =
    (await page.locator('[data-slot="dropdown-menu-content"]').count()) > 0;
  const stateAfter = await page
    .locator('[data-slot="dropdown-menu-content"]')
    .last()
    .locator('[role="switch"]:not([disabled])')
    .first()
    .getAttribute('aria-checked');
  await shot(
    page.locator('[data-slot="dropdown-menu-content"]').last(),
    'dv-03b-showhide-after-toggle.png',
  );
  const pass =
    before.switchCount >= 4 && menuStillOpen && stateBefore !== stateAfter;
  record(
    '3-showhide-menu',
    pass ? 'PASS' : 'FAIL',
    `items=${before.itemCount} switches=${before.switchCount} firstItemPadding=[${before.firstItemPadding}] toggle: ${stateBefore}->${stateAfter}(changed=${stateBefore !== stateAfter}) menuStaysOpen=${menuStillOpen}`,
    'dv-03-showhide-menu.png',
  );
  await page.close();
}

// ===== 4. Range slider: drag thumbs to MIN and MAX, check no clipping =====
{
  const page = await newPage();
  await page.locator(`${IM}`).scrollIntoViewIfNeeded();
  // Age column is the only range-slider (2 thumbs). Salary 'range' uses text inputs.
  const thumbs = page.locator(`${IM} [role="slider"]`);
  const thumbCount = await thumbs.count();

  const measure = async (label) => {
    return await page.evaluate((IM) => {
      const layout = document.querySelector(IM);
      const sliders = [...layout.querySelectorAll('[role="slider"]')];
      // slider root: closest [data-slot="slider"] ancestor
      const root = sliders[0]?.closest('[data-slot="slider"]');
      const track = root?.querySelector('[data-slot="slider-track"]') ?? root;
      const rr = root?.getBoundingClientRect();
      const tr = track?.getBoundingClientRect();
      // enclosing header cell (overflow container candidate)
      const cell = root?.closest('th') ?? root?.parentElement;
      const cr = cell?.getBoundingClientRect();
      return {
        thumbs: sliders.map((s) => {
          const r = s.getBoundingClientRect();
          return {
            left: Math.round(r.left),
            right: Math.round(r.right),
            width: Math.round(r.width),
            val: s.getAttribute('aria-valuenow'),
          };
        }),
        root: rr
          ? { left: Math.round(rr.left), right: Math.round(rr.right) }
          : null,
        track: tr
          ? { left: Math.round(tr.left), right: Math.round(tr.right) }
          : null,
        cell: cr
          ? { left: Math.round(cr.left), right: Math.round(cr.right) }
          : null,
      };
    }, IM);
  };

  // MIN: focus low thumb, press Home
  await thumbs.first().focus();
  await page.keyboard.press('Home');
  await page.waitForTimeout(200);
  await thumbs.last().focus();
  await page.keyboard.press('Home'); // push high thumb toward min too? no - keep high at max
  await page.keyboard.press('End'); // high thumb to max
  await page.waitForTimeout(200);
  // Now low=min, high=max => both extremes represented
  const atExtremes = await measure('extremes');
  const sliderRegion = page.locator(`${IM} [data-slot="slider"]`).first();
  await shot(sliderRegion, 'dv-04-slider-extremes.png');

  // Explicit MIN-only screenshot: both thumbs to min
  await thumbs.last().focus();
  await page.keyboard.press('Home');
  await page.waitForTimeout(200);
  const atMin = await measure('min');
  await shot(sliderRegion, 'dv-04b-slider-min.png');

  // MAX-only: both thumbs to max
  await thumbs.first().focus();
  await page.keyboard.press('End');
  await page.waitForTimeout(200);
  const atMax = await measure('max');
  await shot(sliderRegion, 'dv-04c-slider-max.png');

  // Clipping test: at each extreme, no thumb edge should fall outside the
  // enclosing cell bounds (that would mean the thumb is visually clipped).
  const clipCheck = (m) => {
    if (!m.cell) return { clipped: false, note: 'no-cell' };
    const bad = m.thumbs.filter(
      (t) => t.left < m.cell.left - 1 || t.right > m.cell.right + 1,
    );
    return { clipped: bad.length > 0, bad };
  };
  const cMin = clipCheck(atMin);
  const cMax = clipCheck(atMax);
  const cExt = clipCheck(atExtremes);
  const pass =
    thumbCount === 2 && !cMin.clipped && !cMax.clipped && !cExt.clipped;
  record(
    '4-slider-thumb-clipping',
    pass ? 'PASS' : 'FAIL',
    `thumbs=${thumbCount} | MIN thumbs=${JSON.stringify(atMin.thumbs)} cell=${JSON.stringify(atMin.cell)} clipped=${cMin.clipped} | MAX thumbs=${JSON.stringify(atMax.thumbs)} cell=${JSON.stringify(atMax.cell)} clipped=${cMax.clipped} | EXTREMES thumbs=${JSON.stringify(atExtremes.thumbs)} clipped=${cExt.clipped}`,
    'dv-04-slider-extremes.png',
  );
  await page.close();
}

// ===== 5. Filter checkbox: tri-state cycle =====
{
  const page = await newPage();
  await page.locator(`${IM}`).scrollIntoViewIfNeeded();
  // Active column checkbox filter. Label text "Filter by Active".
  const cb = page
    .locator(`${IM} thead [role="checkbox"]`)
    .filter({ has: page.locator('*') }); // all header checkboxes (select-all + filter)
  // The filter checkbox is inside the Active column's filter row; select by the
  // label wrapping it.
  const activeLabel = page
    .locator(`${IM} thead label`, { hasText: /filter by active/i })
    .first();
  const box = activeLabel.locator('[role="checkbox"]').first();
  const read = () => box.getAttribute('data-state');
  const s0 = await read(); // indeterminate initially (undefined filter)
  await box.click();
  await page.waitForTimeout(150);
  const s1 = await read(); // checked (true)
  await box.click();
  await page.waitForTimeout(150);
  const s2 = await read(); // unchecked (false)
  await box.click();
  await page.waitForTimeout(150);
  const s3 = await read(); // back to indeterminate (undefined)
  await shot(activeLabel, 'dv-05-filter-checkbox.png');
  const cycled =
    s0 === 'indeterminate' &&
    s1 === 'checked' &&
    s2 === 'unchecked' &&
    s3 === 'indeterminate';
  record(
    '5-filter-checkbox-tristate',
    cycled ? 'PASS' : 'FAIL',
    `states: ${s0} -> ${s1} -> ${s2} -> ${s3} (expect indeterminate->checked->unchecked->indeterminate)`,
    'dv-05-filter-checkbox.png',
  );
  await page.close();
}

// ===== 6. Filter option menu: active mode bg-accent highlight follows =====
{
  const page = await newPage();
  await page.locator(`${IM}`).scrollIntoViewIfNeeded();
  // Last Name text filter has a "Change filter mode" button.
  await page
    .locator(`${IM} button[aria-label="Change filter mode"]`)
    .first()
    .click();
  await page.waitForTimeout(300);
  const menu = page.locator('[data-slot="dropdown-menu-content"]').last();
  const before = await menu.evaluate((el) => {
    const items = [...el.querySelectorAll('[data-slot="dropdown-menu-item"]')];
    // classList.contains matches the exact `bg-accent` token, not the base
    // `focus:bg-accent` substring every item carries.
    const highlighted = items
      .map((it, i) => ({
        i,
        text: it.textContent.trim(),
        accent: it.classList.contains('bg-accent'),
      }))
      .filter((x) => x.accent);
    return { count: items.length, highlighted };
  });
  await shot(menu, 'dv-06-filtermode-before.png');
  // Pick a DIFFERENT mode than the currently-highlighted one.
  const items = menu.locator('[data-slot="dropdown-menu-item"]');
  const n = await items.count();
  let targetIdx = 0;
  for (let i = 0; i < n; i++) {
    const isActive = await items
      .nth(i)
      .evaluate((el) => el.classList.contains('bg-accent'));
    if (!isActive) {
      targetIdx = i;
      break;
    }
  }
  const targetText = (await items.nth(targetIdx).textContent()).trim();
  await items.nth(targetIdx).click();
  await page.waitForTimeout(300);
  // reopen menu to inspect new highlight
  await page
    .locator(`${IM} button[aria-label="Change filter mode"]`)
    .first()
    .click();
  await page.waitForTimeout(300);
  const menu2 = page.locator('[data-slot="dropdown-menu-content"]').last();
  const after = await menu2.evaluate((el) => {
    const items = [...el.querySelectorAll('[data-slot="dropdown-menu-item"]')];
    return items
      .map((it) => ({
        text: it.textContent.trim(),
        accent: it.classList.contains('bg-accent'),
      }))
      .filter((x) => x.accent);
  });
  await shot(menu2, 'dv-06b-filtermode-after.png');
  const highlightFollowed =
    before.highlighted.length === 1 &&
    after.length === 1 &&
    after[0].text === targetText;
  record(
    '6-filter-option-menu-highlight',
    highlightFollowed ? 'PASS' : 'FAIL',
    `beforeHighlight=[${before.highlighted.map((h) => h.text).join(',')}] (count ${before.highlighted.length}) selected="${targetText}" afterHighlight=[${after.map((h) => h.text).join(',')}] followed=${highlightFollowed}`,
    'dv-06-filtermode-before.png',
  );
  await page.close();
}

// ===== 7. Console cleanliness — full sweep on one page =====
{
  const page = await newPage();
  // exercise a bunch of the changed surfaces
  await page.locator(`${AB} thead [role="checkbox"]`).first().click();
  await page.waitForTimeout(150);
  await page
    .locator(`${BANNER} button`, { hasText: /clear selection/i })
    .first()
    .click();
  await page.waitForTimeout(150);
  await page.locator(`${EDIT} button[aria-label="Edit"]`).first().click();
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await page
    .locator(`${IM} button[aria-label="Show/Hide columns"]`)
    .first()
    .click();
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const errs = cleanErrs(page);
  await shot(page, 'dv-07-console-final.png');
  record(
    '7-console-clean',
    errs.length === 0 ? 'PASS' : 'FAIL',
    `console msgs=${errs.length}${errs.length ? ' :: ' + errs.slice(0, 6).join(' | ') : ' (clean)'}`,
    'dv-07-console-final.png',
  );
  await page.close();
}

await browser.close();

const pass = results.filter((r) => r.status === 'PASS').length;
const fail = results.filter((r) => r.status === 'FAIL').length;
console.log(
  `\n=== SUMMARY: ${pass} PASS, ${fail} FAIL (of ${results.length}) ===`,
);
process.exit(fail ? 1 : 0);
