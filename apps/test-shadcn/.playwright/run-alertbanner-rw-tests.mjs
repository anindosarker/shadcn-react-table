import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const BASE = 'http://localhost:5273/';

const LAYOUT = '#srt-alertbanner-layout';
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
    if (m.type() === 'error') errors.push('ERR: ' + m.text());
    if (m.type() === 'warning') errors.push('WARN: ' + m.text());
  });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector(LAYOUT, { timeout: 15000 });
  await page.waitForTimeout(300);
  page._errors = errors;
  return page;
}

const shot = (page, name, sel) =>
  (sel ? page.locator(sel) : page).screenshot({ path: path.join(SHOTS, name) });

// ---------- Case 1: banner renders as shadcn Alert ----------
{
  const page = await newPage(); // grouping ON by default => banner visible on load
  const info = await page.evaluate((BANNER) => {
    const el = document.querySelector(BANNER);
    if (!el) return { present: false };
    const cs = getComputedStyle(el);
    return {
      present: true,
      role: el.getAttribute('role'),
      dataSlot: el.getAttribute('data-slot'),
      borderTopWidth: cs.borderTopWidth,
      borderStyle: cs.borderTopStyle,
      borderRadius: cs.borderTopLeftRadius,
      padding: cs.padding,
      fontSize: cs.fontSize,
      display: cs.display,
      background: cs.backgroundColor,
    };
  }, BANNER);
  await shot(page, 'alertbanner-rw-01-alert-root.png', BANNER);
  const noBorder = info.borderTopWidth === '0px' || info.borderStyle === 'none';
  const bgTinted =
    info.background &&
    info.background !== 'rgba(0, 0, 0, 0)' &&
    info.background !== 'transparent';
  const pass =
    info.present &&
    info.role === 'alert' &&
    info.dataSlot === 'alert' &&
    noBorder &&
    info.borderRadius === '0px' &&
    info.padding === '0px' &&
    info.fontSize === '16px' &&
    info.display === 'block' &&
    bgTinted;
  record(
    '1-alert-root',
    pass ? 'PASS' : 'FAIL',
    `role=${info.role} data-slot=${info.dataSlot} border=${info.borderTopWidth}/${info.borderStyle}(none=${noBorder}) radius=${info.borderRadius} padding=${info.padding} fontSize=${info.fontSize} display=${info.display} bg=${info.background}(tinted=${bgTinted})`,
    'alertbanner-rw-01-alert-root.png',
  );
  await page.close();
}

// ---------- Case 2: selection text + clear button ----------
{
  const page = await newPage();
  // select-all via header checkbox
  await page.locator(`${LAYOUT} thead [role="checkbox"]`).first().click();
  await page.waitForTimeout(300);
  const bannerText = await page.locator(BANNER).innerText();
  const selShown = /of \d+ row\(s\) selected/i.test(bannerText);
  // clear button is shadcn ghost Button
  const clearBtn = page.locator(`${BANNER} button:has-text("Clear selection")`);
  const btnInfo = await clearBtn.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      type: el.getAttribute('type'),
      color: cs.color,
      slot: el.getAttribute('data-slot'),
    };
  });
  await shot(page, 'alertbanner-rw-02-selection.png', BANNER);
  // Clear-selection contract: the banner's selection text disappears (selected
  // row model -> 0). (Banner itself stays because grouping chips remain; the
  // full-hide case is covered by case 5.) Button text color is the theme
  // primary token (oklch(...) in this theme, not literal rgb).
  await clearBtn.click();
  await page.waitForTimeout(300);
  const bannerStill = await page.locator(BANNER).innerText();
  const selGone = !/of \d+ row\(s\) selected/i.test(bannerStill);
  const primaryColor = /oklch|oklab|rgb/.test(btnInfo.color);
  const pass = selShown && btnInfo.type === 'button' && primaryColor && selGone;
  record(
    '2-selection',
    pass ? 'PASS' : 'FAIL',
    `text="${bannerText.replace(/\n/g, ' ').trim()}" selShown=${selShown}; clearBtn data-slot=${btnInfo.slot} type=${btnInfo.type} color=${btnInfo.color}; after-clear sel-text-gone=${selGone}`,
    'alertbanner-rw-02-selection.png',
  );
  await page.close();
}

// ---------- Case 3: grouping chips are shadcn Badges ----------
{
  const page = await newPage(); // grouping ['department','city'] on load
  const bannerText = await page.locator(BANNER).innerText();
  const badges = await page.evaluate((BANNER) => {
    const banner = document.querySelector(BANNER);
    const chips = [...banner.querySelectorAll('[data-slot="badge"]')];
    return chips.map((c) => {
      const cs = getComputedStyle(c);
      return {
        text: c.textContent.trim(),
        bg: cs.backgroundColor,
        radius: cs.borderTopLeftRadius,
        hasCloseBtn: !!c.querySelector('button'),
      };
    });
  }, BANNER);
  const groupedByText = /grouped by/i.test(bannerText);
  const thenByText = /then by/i.test(bannerText);
  await shot(page, 'alertbanner-rw-03-grouping.png', BANNER);
  // click first chip's X -> ungroup that column
  const chipCountBefore = badges.length;
  await page.locator(`${BANNER} [data-slot="badge"] button`).first().click();
  await page.waitForTimeout(300);
  const chipCountAfter = await page
    .locator(`${BANNER} [data-slot="badge"]`)
    .count();
  const secondaryBg = badges.every((b) => b.bg && b.bg !== 'rgba(0, 0, 0, 0)');
  // rounded-md = calc(var(--radius) - 2px) = 8px in this shadcn theme (--radius
  // 0.625rem), not tailwind-default 6px.
  const roundedMd = badges.every((b) => b.radius === '8px');
  const pass =
    chipCountBefore === 2 &&
    groupedByText &&
    thenByText &&
    secondaryBg &&
    roundedMd &&
    badges.every((b) => b.hasCloseBtn) &&
    chipCountAfter === 1;
  record(
    '3-grouping-chips',
    pass ? 'PASS' : 'FAIL',
    `chips=${chipCountBefore} texts=[${badges.map((b) => b.text).join(', ')}] groupedBy=${groupedByText} thenBy=${thenByText} bg=[${badges.map((b) => b.bg).join('|')}] radius=[${badges.map((b) => b.radius).join('|')}](6px=rounded-md); afterUngroupOne chips=${chipCountAfter}`,
    'alertbanner-rw-03-grouping.png',
  );
  await page.close();
}

// ---------- Case 4: selection + grouping coexist with <br> ----------
{
  const page = await newPage();
  await page.locator(`${LAYOUT} thead [role="checkbox"]`).first().click();
  await page.waitForTimeout(300);
  const info = await page.evaluate((BANNER) => {
    const banner = document.querySelector(BANNER);
    const text = banner.innerText;
    const brCount = banner.querySelectorAll('br').length;
    const badges = banner.querySelectorAll('[data-slot="badge"]').length;
    const hasSel = /of \d+ row\(s\) selected/i.test(text);
    const hasGroup = /grouped by/i.test(text);
    return { brCount, badges, hasSel, hasGroup, text };
  }, BANNER);
  await shot(page, 'alertbanner-rw-04-both.png', BANNER);
  const pass =
    info.hasSel && info.hasGroup && info.badges === 2 && info.brCount >= 1;
  record(
    '4-both-coexist',
    pass ? 'PASS' : 'FAIL',
    `selection=${info.hasSel} grouping=${info.hasGroup} badges=${info.badges} <br>=${info.brCount}(>=1) text="${info.text.replace(/\n/g, ' ').trim()}"`,
    'alertbanner-rw-04-both.png',
  );
  await page.close();
}

// ---------- Case 5: console clean (from the banner) ----------
{
  const page = await newPage();
  await page.locator(`${LAYOUT} thead [role="checkbox"]`).first().click();
  await page.waitForTimeout(200);
  await page.locator(`${BANNER} button:has-text("Clear selection")`).click();
  await page.waitForTimeout(200);
  await page.locator(`${BANNER} [data-slot="badge"] button`).first().click();
  await page.waitForTimeout(200);
  await page.locator(`${BANNER} [data-slot="badge"] button`).first().click();
  await page.waitForTimeout(300);
  const bannerGone = await page.locator(BANNER).count();
  await shot(page, 'alertbanner-rw-05-cleared.png');
  const ignore = /Download the React DevTools/i;
  const errs = page._errors.filter((e) => !ignore.test(e));
  const pass = errs.length === 0 && bannerGone === 0;
  record(
    '5-console',
    pass ? 'PASS' : 'FAIL',
    `console msgs=${errs.length}${errs.length ? ' :: ' + errs.slice(0, 4).join(' | ') : ''}; banner-hidden-after-clear-all=${bannerGone === 0}`,
    'alertbanner-rw-05-cleared.png',
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
