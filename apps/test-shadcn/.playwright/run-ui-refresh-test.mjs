import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const BASE = 'http://localhost:5273/';

const TOOLBARS = '#srt-toolbars-layout';
const AB = '#srt-alertbanner-layout';
const BANNER = `${AB} [data-slot="alert"]`;
const IGNORE = /Download the React DevTools/i;
const PROVIDER_ERR = /must be used within .*TooltipProvider/i;

const results = [];
const record = (id, status, evidence, shot) => {
  results.push({ id, status, evidence, shot });
  console.log(`${status} [${id}] ${evidence}${shot ? ` shot=${shot}` : ''}`);
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 2400 } });

const msgs = []; // every console error/warning + pageerror, timestamped by check
page.on('console', (m) => {
  if (['error', 'warning'].includes(m.type()))
    msgs.push(m.type() + ': ' + m.text());
});
page.on('pageerror', (e) => msgs.push('PAGEERROR: ' + e.message));

const shot = (name, sel) =>
  (sel ? page.locator(sel) : page).screenshot({ path: path.join(SHOTS, name) });

await page.goto(BASE, { waitUntil: 'networkidle' });
// If the page had crashed at render (the old TooltipProvider bug) neither demo
// layout would mount — waiting for both is itself a no-crash assertion.
await page.waitForSelector(TOOLBARS, { timeout: 15000 });
await page.waitForSelector(AB, { timeout: 15000 });
await page.waitForTimeout(500);

// ---------- Check 0: no render crash / provider error at load ----------
{
  const providerErrs = msgs.filter((m) => PROVIDER_ERR.test(m));
  const toolbarsMounted = await page.locator(TOOLBARS).count();
  const abMounted = await page.locator(AB).count();
  const pass =
    providerErrs.length === 0 && toolbarsMounted === 1 && abMounted === 1;
  record(
    '0-no-render-crash',
    pass ? 'PASS' : 'FAIL',
    `toolbarsLayout=${toolbarsMounted} alertBannerLayout=${abMounted} providerErrors=${providerErrs.length}${providerErrs.length ? ' :: ' + providerErrs.slice(0, 3).join(' | ') : ''}`,
  );
}

// ---------- Check 1: hovering a toolbar toggle shows a tooltip ----------
{
  // The ToggleFilters button is an icon button with aria-label "Show/Hide filters".
  const btn = page
    .locator(`${TOOLBARS} button[aria-label="Show/Hide filters"]`)
    .first();
  const btnCount = await btn.count();
  // delayDuration on the SRT tooltip Root is 1000ms; hover then wait past it.
  await btn.hover();
  await page.waitForTimeout(1300);
  const content = page.locator('[data-slot="tooltip-content"]');
  const visible =
    (await content.count()) > 0 && (await content.first().isVisible());
  const tipText = visible
    ? (await content.first().innerText()).trim()
    : '(none)';
  // role=tooltip is the ARIA fallback assertion the brief mentions
  const roleTooltip = await page.locator('[role="tooltip"]').count();
  await shot('ui-refresh-tooltip-open.png', TOOLBARS);
  const providerErrsNow = msgs.filter((m) => PROVIDER_ERR.test(m));
  const pass = btnCount === 1 && visible && providerErrsNow.length === 0;
  record(
    '1-tooltip-appears',
    pass ? 'PASS' : 'FAIL',
    `toggleBtn=${btnCount} tooltipContentVisible=${visible} text="${tipText}" roleTooltipEls=${roleTooltip} providerErrors=${providerErrsNow.length}`,
    'ui-refresh-tooltip-open.png',
  );
  // move pointer away so the tooltip closes before the next interaction
  await page.mouse.move(5, 5);
  await page.waitForTimeout(400);
}

// ---------- Check 2a: grouping chip is a single <button data-slot="badge"> ----------
{
  const info = await page.evaluate((BANNER) => {
    const banner = document.querySelector(BANNER);
    if (!banner) return { chips: [] };
    const badges = [...banner.querySelectorAll('[data-slot="badge"]')];
    return {
      groupedBy: /grouped by/i.test(banner.innerText),
      chips: badges.map((b) => {
        const svg = b.querySelector('svg');
        const r = svg?.getBoundingClientRect();
        return {
          tag: b.tagName.toLowerCase(),
          dataSlot: b.getAttribute('data-slot'),
          nestedButtons: b.querySelectorAll('button').length,
          text: b.textContent.trim(),
          // CancelIcon/CircleX draws a <circle>; a plain X (Lucide X) has none.
          svgHasCircle: !!svg?.querySelector('circle'),
          svgW: r ? Math.round(r.width) : null,
          svgH: r ? Math.round(r.height) : null,
        };
      }),
    };
  }, BANNER);

  const chips = info.chips;
  const allButtons = chips.every((c) => c.tag === 'button');
  const allBadgeSlot = chips.every((c) => c.dataSlot === 'badge');
  const noNested = chips.every((c) => c.nestedButtons === 0);
  const allCircleIcon = chips.every((c) => c.svgHasCircle);
  const iconSizeOk = chips.every((c) => c.svgW >= 10 && c.svgW <= 16);
  await shot('ui-refresh-chip-before.png', BANNER);
  const pass =
    chips.length === 2 &&
    info.groupedBy &&
    allButtons &&
    allBadgeSlot &&
    noNested &&
    allCircleIcon &&
    iconSizeOk;
  record(
    '2a-chip-single-button-circleX',
    pass ? 'PASS' : 'FAIL',
    `chips=${chips.length} groupedBy=${info.groupedBy} tags=[${chips.map((c) => c.tag).join(',')}] dataSlot=[${chips.map((c) => c.dataSlot).join(',')}] nested=[${chips.map((c) => c.nestedButtons).join(',')}] circleIcon=[${chips.map((c) => c.svgHasCircle).join(',')}] iconPx=[${chips.map((c) => `${c.svgW}x${c.svgH}`).join(',')}] text=[${chips.map((c) => `"${c.text}"`).join(',')}]`,
    'ui-refresh-chip-before.png',
  );
}

// ---------- Check 2b: clicking a chip ungroups that column ----------
{
  const before = await page.locator(`${BANNER} [data-slot="badge"]`).count();
  await page.locator(`${BANNER} [data-slot="badge"]`).first().click();
  await page.waitForTimeout(400);
  const after = await page.locator(`${BANNER} [data-slot="badge"]`).count();
  await shot('ui-refresh-chip-after.png', AB);
  const pass = before === 2 && after === 1;
  record(
    '2b-chip-click-ungroups',
    pass ? 'PASS' : 'FAIL',
    `chipsBefore=${before} chipsAfter=${after}`,
    'ui-refresh-chip-after.png',
  );
}

// ---------- Check 3: general console smoke ----------
{
  const errs = msgs.filter((m) => !IGNORE.test(m));
  const pass = errs.length === 0;
  record(
    '3-console-clean',
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
