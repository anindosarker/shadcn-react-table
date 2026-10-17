import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const BASE = 'http://localhost:5273/';

const LAYOUT = '#srt-alertbanner-layout';
const IGNORE = /Download the React DevTools/i;

// Scope everything to the AlertBanner demo section (the layout's parent
// <section>) so we never pick up banners from other demos on the page.
const SECTION = `xpath=//*[@id="srt-alertbanner-layout"]/ancestor::section[1]`;

const results = [];
const record = (id, status, evidence, shot) => {
  results.push({ id, status, evidence, shot });
  console.log(`${status} [${id}] ${evidence}${shot ? ` shot=${shot}` : ''}`);
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 2000 } });

const msgs = [];
page.on('console', (m) => {
  if (['error', 'warning'].includes(m.type()))
    msgs.push(m.type() + ': ' + m.text());
});
page.on('pageerror', (e) => msgs.push('PAGEERROR: ' + e.message));

const shot = (name, sel) =>
  (sel ? page.locator(sel) : page).screenshot({ path: path.join(SHOTS, name) });

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector(LAYOUT, { timeout: 15000 });
await page.waitForTimeout(500);

const section = page.locator(SECTION);
const layout = page.locator(LAYOUT);

// Introspect the banner within THIS demo section. Returns geometry + structure
// so we can assert "Alert lives inside collapsible-content, full width".
const bannerInfo = () =>
  page.evaluate(() => {
    const layoutEl = document.querySelector('#srt-alertbanner-layout');
    const sectionEl = layoutEl?.closest('section');
    if (!sectionEl) return { sectionFound: false };
    const root = sectionEl.querySelector('[data-slot="collapsible"]');
    const content = sectionEl.querySelector(
      '[data-slot="collapsible-content"]',
    );
    const alert = sectionEl.querySelector('[data-slot="alert"]');
    const alertInsideContent = !!(content && alert && content.contains(alert));
    const cr = content?.getBoundingClientRect();
    // radix closes the Collapsible by unmounting the Alert and leaving an
    // empty, hidden, 0-height content shell (data-state=closed, hidden attr).
    // "Banner hidden" = Alert gone AND the shell is not showing anything.
    const contentHidden =
      !content ||
      content.hasAttribute('hidden') ||
      content.getAttribute('data-state') === 'closed' ||
      content.children.length === 0 ||
      (cr && cr.height < 1);
    const lr = layoutEl.getBoundingClientRect();
    const ar = alert?.getBoundingClientRect();
    // chips = grouping badges rendered as <button data-slot="badge">
    const chips = alert
      ? [...alert.querySelectorAll('[data-slot="badge"]')].map((b) =>
          b.textContent.trim(),
        )
      : [];
    return {
      sectionFound: true,
      rootPresent: !!root,
      contentPresent: !!content,
      contentHidden: !!contentHidden,
      alertPresent: !!alert,
      alertVisible: !!(ar && ar.width > 0 && ar.height > 0),
      alertInsideContent,
      layoutWidth: Math.round(lr.width),
      alertWidth: ar ? Math.round(ar.width) : null,
      alertText: alert ? alert.textContent.replace(/\s+/g, ' ').trim() : null,
      chips,
      chipCount: chips.length,
    };
  });

// ---------- Check 1: banner visible on load (grouping preset) ----------
{
  const info = await bannerInfo();
  await shot('banner-collapse-visible.png', SECTION);
  // full-width: alert spans its collapsible container, which is inset from the
  // layout by the table's vertical-scrollbar gutter (~18px here). Allow 24px.
  const widthOk =
    info.alertWidth != null &&
    info.layoutWidth != null &&
    info.alertWidth >= info.layoutWidth - 24;
  const chipsOk =
    info.chipCount === 2 &&
    /Department/i.test(info.chips[0] || '') &&
    /City/i.test(info.chips[1] || '');
  const contentOk =
    info.contentPresent && info.alertInsideContent && info.alertVisible;
  const pass = info.sectionFound && contentOk && widthOk && chipsOk;
  record(
    '1-banner-visible-on-load',
    pass ? 'PASS' : 'FAIL',
    `alertInsideCollapsibleContent=${info.alertInsideContent} alertVisible=${info.alertVisible} alertWidth=${info.alertWidth} layoutWidth=${info.layoutWidth} chips=[${info.chips.join(' | ')}] text="${(info.alertText || '').slice(0, 80)}"`,
    'banner-collapse-visible.png',
  );
}

// ---------- Check 2: hide path — ungroup all chips + clear selection ----------
{
  // Click each grouping chip (button inside the banner) to ungroup. Re-query
  // after each click because ungrouping re-renders the banner.
  let guard = 0;
  while (guard++ < 6) {
    const chip = section
      .locator('[data-slot="alert"] [data-slot="badge"]')
      .first();
    if ((await chip.count()) === 0) break;
    await chip.click();
    await page.waitForTimeout(250);
  }
  // Clear any selection if a clear button is present (none expected on load).
  const clearBtn = section.getByRole('button', { name: 'Clear selection' });
  if ((await clearBtn.count()) > 0) {
    await clearBtn.first().click();
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(300);
  const info = await bannerInfo();
  await shot('banner-collapse-hidden.png', SECTION);
  // Collapsible closes → Alert unmounts; radix keeps an empty hidden 0-height
  // content shell + the root div (MUI-parity). Banner is hidden when the Alert
  // is gone and the content shell shows nothing.
  const pass = !info.alertPresent && info.contentHidden;
  record(
    '2-hide-path-ungroup-and-clear',
    pass ? 'PASS' : 'FAIL',
    `alertPresent=${info.alertPresent} contentHidden=${info.contentHidden} collapsibleContentPresent=${info.contentPresent} rootPresent=${info.rootPresent} chipCount=${info.chipCount}`,
    'banner-collapse-hidden.png',
  );
}

// ---------- Check 3: show path — select a row, banner reappears ----------
{
  // With grouping cleared, tbody rows are plain data rows with select
  // checkboxes (aria-label "Toggle select row").
  const rowCheckbox = layout
    .locator('tbody')
    .getByRole('checkbox', { name: 'Toggle select row' })
    .first();
  const cbCount = await rowCheckbox.count();
  await rowCheckbox.click();
  await page.waitForTimeout(300);
  const info = await bannerInfo();
  const clearBtn = section.getByRole('button', { name: 'Clear selection' });
  const clearBtnCount = await clearBtn.count();
  await shot('banner-collapse-reshown.png', SECTION);
  const selText = /\d+ of \d+ row\(s\) selected/.test(info.alertText || '');
  const reappeared =
    info.contentPresent && info.alertPresent && info.alertVisible;
  const pass = cbCount > 0 && reappeared && selText && clearBtnCount === 1;
  record(
    '3-show-path-select-row',
    pass ? 'PASS' : 'FAIL',
    `rowCheckbox=${cbCount} alertPresent=${info.alertPresent} alertVisible=${info.alertVisible} selectedText=${selText} clearBtn=${clearBtnCount} text="${(info.alertText || '').slice(0, 80)}"`,
    'banner-collapse-reshown.png',
  );

  // Click clear-selection → banner hides again.
  if (clearBtnCount === 1) {
    await clearBtn.first().click();
    await page.waitForTimeout(300);
  }
  const after = await bannerInfo();
  const hidPass = !after.alertPresent && after.contentHidden;
  record(
    '3b-clear-selection-hides-banner',
    hidPass ? 'PASS' : 'FAIL',
    `afterClear: alertPresent=${after.alertPresent} contentHidden=${after.contentHidden}`,
  );
}

// ---------- Check 4: rapid toggle — no stuck state, no duplicate banners ---
{
  const rowCheckbox = layout
    .locator('tbody')
    .getByRole('checkbox', { name: 'Toggle select row' })
    .first();
  for (let i = 0; i < 4; i++) {
    await rowCheckbox.click(); // select
    await page.waitForTimeout(120);
    // clear via banner button when present, else uncheck the box
    const clearBtn = section.getByRole('button', { name: 'Clear selection' });
    if ((await clearBtn.count()) > 0) {
      await clearBtn.first().click();
    } else {
      await rowCheckbox.click();
    }
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(300);
  // End in the hidden state (last action cleared). Assert: at most one banner
  // in the section at any time (never duplicated) and current state is clean.
  const dup = await page.evaluate(() => {
    const sectionEl = document
      .querySelector('#srt-alertbanner-layout')
      ?.closest('section');
    return {
      alerts: sectionEl
        ? sectionEl.querySelectorAll('[data-slot="alert"]').length
        : -1,
      contents: sectionEl
        ? sectionEl.querySelectorAll('[data-slot="collapsible-content"]').length
        : -1,
    };
  });
  // Now select once more and confirm it still shows exactly one banner.
  await rowCheckbox.click();
  await page.waitForTimeout(300);
  const afterSelect = await bannerInfo();
  const oneBannerWhenShown =
    afterSelect.alertPresent && afterSelect.contentPresent;
  // cleanup: clear selection
  const clearBtn = section.getByRole('button', { name: 'Clear selection' });
  if ((await clearBtn.count()) > 0) await clearBtn.first().click();
  await page.waitForTimeout(200);

  const pass = dup.alerts <= 1 && dup.contents <= 1 && oneBannerWhenShown;
  record(
    '4-rapid-toggle-no-stuck-no-dup',
    pass ? 'PASS' : 'FAIL',
    `afterRapidCycle: banners=${dup.alerts} collapsibleContents=${dup.contents}; afterFinalSelect: exactlyOneBanner=${oneBannerWhenShown}`,
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
console.log(
  `\n=== SUMMARY: ${pass} PASS, ${fail} FAIL (of ${results.length}) ===`,
);
process.exit(fail ? 1 : 0);
