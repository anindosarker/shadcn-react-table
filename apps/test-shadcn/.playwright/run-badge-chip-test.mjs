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
await page.waitForTimeout(400);

const shot = (name, sel) =>
  (sel ? page.locator(sel) : page).screenshot({
    path: path.join(SHOTS, name),
  });

// ---------- Check 1: grouping enabled => "Grouped by" chip(s) ----------
{
  const bannerText = await page.locator(BANNER).innerText();
  const groupedBy = /grouped by/i.test(bannerText);
  const chipCount = await page.locator(`${BANNER} [data-slot="badge"]`).count();
  await shot('badge-chip-before.png', BANNER);
  const pass = groupedBy && chipCount >= 1;
  record(
    '1-grouped-by-shown',
    pass ? 'PASS' : 'FAIL',
    `groupedByText=${groupedBy} chips=${chipCount} bannerText="${bannerText
      .replace(/\n/g, ' ')
      .trim()}"`,
    'badge-chip-before.png',
  );
}

// ---------- Check 2: chip IS a single <button data-slot="badge"> ----------
{
  const info = await page.evaluate((BANNER) => {
    const banner = document.querySelector(BANNER);
    const badges = [...banner.querySelectorAll('[data-slot="badge"]')];
    return badges.map((b) => ({
      tag: b.tagName.toLowerCase(),
      dataSlot: b.getAttribute('data-slot'),
      // badge base classes live on this same element (not a wrapper)
      hasBadgeClasses:
        b.classList.contains('inline-flex') &&
        b.classList.contains('rounded-md'),
      // no <button> nested INSIDE the badge (the badge element itself is it)
      nestedButtons: b.querySelectorAll('button').length,
      type: b.getAttribute('type'),
    }));
  }, BANNER);
  const allButtons = info.every((b) => b.tag === 'button');
  const allBadgeSlot = info.every((b) => b.dataSlot === 'badge');
  const allBadgeClasses = info.every((b) => b.hasBadgeClasses);
  const noNested = info.every((b) => b.nestedButtons === 0);
  const pass =
    info.length >= 1 &&
    allButtons &&
    allBadgeSlot &&
    allBadgeClasses &&
    noNested;
  record(
    '2-chip-is-single-button',
    pass ? 'PASS' : 'FAIL',
    `chips=${info.length} tags=[${info
      .map((b) => b.tag)
      .join(',')}] dataSlot=[${info
      .map((b) => b.dataSlot)
      .join(
        ',',
      )}] badgeClassesOnEl=${allBadgeClasses} nestedButtonsInside=[${info
      .map((b) => b.nestedButtons)
      .join(',')}] type=[${info.map((b) => b.type).join(',')}]`,
  );
}

// ---------- Check 3: CloseIcon svg = 12px (size-3) ----------
{
  const svgSizes = await page.evaluate((BANNER) => {
    const banner = document.querySelector(BANNER);
    const badges = [...banner.querySelectorAll('[data-slot="badge"]')];
    return badges.map((b) => {
      const svg = b.querySelector('svg');
      if (!svg) return null;
      const r = svg.getBoundingClientRect();
      const cs = getComputedStyle(svg);
      return {
        w: Math.round(r.width),
        h: Math.round(r.height),
        cssW: cs.width,
        cssH: cs.height,
      };
    });
  }, BANNER);
  const all12 = svgSizes.every((s) => s && s.w === 12 && s.h === 12);
  const pass = svgSizes.length >= 1 && all12;
  record(
    '3-close-icon-12px',
    pass ? 'PASS' : 'FAIL',
    `svgs=${svgSizes
      .map((s) => (s ? `${s.w}x${s.h}(css ${s.cssW}x${s.cssH})` : 'none'))
      .join(' | ')}`,
  );
}

// ---------- Check 5: accessible name = column header text ----------
// (measured before the click removes a chip)
{
  const names = await page
    .locator(`${BANNER} [data-slot="badge"]`)
    .evaluateAll((els) =>
      els.map((el) => ({
        // accessible name for a button w/ no aria-label = its text content
        accName: (el.getAttribute('aria-label') || el.textContent).trim(),
        text: el.textContent.trim(),
      })),
    );
  // header texts from the demo grouping: ['department','city'] -> 'Department','City'
  const expected = ['Department', 'City'];
  // accessible name is the text content; the trailing X icon has no text so
  // accName should equal the header label exactly.
  const match = names.every((n, i) => n.accName === expected[i]);
  const pass = names.length === 2 && match;
  record(
    '5-accessible-name',
    pass ? 'PASS' : 'FAIL',
    `names=[${names
      .map((n) => `"${n.accName}"`)
      .join(', ')}] expected=[${expected.map((e) => `"${e}"`).join(', ')}]`,
  );
}

// ---------- Check 4: clicking the LABEL (not the X) ungroups ----------
{
  const chipBefore = await page
    .locator(`${BANNER} [data-slot="badge"]`)
    .count();
  const firstChip = page.locator(`${BANNER} [data-slot="badge"]`).first();
  const box = await firstChip.boundingBox();
  // click near the LEFT edge where the header text sits, well away from the
  // right-side X icon
  await page.mouse.click(box.x + 10, box.y + box.height / 2);
  await page.waitForTimeout(400);
  const chipAfter = await page.locator(`${BANNER} [data-slot="badge"]`).count();
  const bannerTextAfter = (await page.locator(BANNER).count())
    ? (await page.locator(BANNER).innerText()).replace(/\n/g, ' ').trim()
    : '(banner unmounted)';
  await shot('badge-chip-after.png', LAYOUT);
  const pass = chipBefore === 2 && chipAfter === 1;
  record(
    '4-label-click-ungroups',
    pass ? 'PASS' : 'FAIL',
    `chipsBefore=${chipBefore} chipsAfter=${chipAfter} (clicked label text, not X) bannerAfter="${bannerTextAfter}"`,
    'badge-chip-after.png',
  );
}

// ---------- Check 6: console clean ----------
{
  const ignore = /Download the React DevTools/i;
  const errs = errors.filter((e) => !ignore.test(e));
  const pass = errs.length === 0;
  record(
    '6-console-clean',
    pass ? 'PASS' : 'FAIL',
    `msgs=${errs.length}${errs.length ? ' :: ' + errs.slice(0, 5).join(' | ') : ''}`,
  );
}

await browser.close();

const pass = results.filter((r) => r.status === 'PASS').length;
const fail = results.filter((r) => r.status === 'FAIL').length;
console.log(
  `\n=== SUMMARY: ${pass} PASS, ${fail} FAIL (of ${results.length}) ===`,
);
process.exit(fail ? 1 : 0);
