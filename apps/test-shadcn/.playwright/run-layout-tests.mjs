import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const URL = 'http://localhost:5273/';

const results = [];
const record = (id, pass, evidence) => {
  results.push({ id, pass, evidence });
  console.log(`${pass ? 'PASS' : 'FAIL'} [${id}] ${evidence}`);
};

const has = (cls, token) =>
  cls.split(/\s+/).includes(token);

const layoutSel = '[data-testid="layout"]';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message));

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector(layoutSel, { timeout: 15000 });

// ---- Test A: default render ----
{
  const cls = await page.getAttribute(layoutSel, 'class');
  const wantBase = [
    'rounded-md',
    'border',
    'shadow',
    'bg-background',
    'p-2',
    'relative',
    'overflow-hidden',
  ];
  const missing = wantBase.filter((t) => !has(cls, t));
  // structure: top toolbar (contains fullscreen button), a <table>, bottom toolbar
  const hasTopToolbar = await page.locator(`${layoutSel} button[aria-label="Toggle full screen"]`).count();
  const hasTable = await page.locator(`${layoutSel} table`).count();
  // bottom toolbar = last direct child with border-t
  const childInfo = await page.$eval(layoutSel, (el) => {
    const kids = Array.from(el.children);
    return {
      count: kids.length,
      first: kids[0]?.className ?? '',
      last: kids[kids.length - 1]?.className ?? '',
    };
  });
  const topToolbarPresent = hasTopToolbar > 0 && childInfo.first.includes('relative') && childInfo.first.includes('w-full');
  const bottomToolbarPresent = childInfo.last.includes('border-t');
  const pass =
    missing.length === 0 &&
    topToolbarPresent &&
    hasTable > 0 &&
    bottomToolbarPresent &&
    childInfo.count === 3;
  await page.screenshot({ path: path.join(SHOTS, '01-default.png') });
  record(
    'A-default',
    pass,
    `card-classes missing=[${missing.join(',')}]; children=${childInfo.count} (top=${topToolbarPresent}, table=${hasTable}, bottom=${bottomToolbarPresent}); shot=01-default.png`,
  );
}

// ---- Test B: enter fullscreen ----
{
  await page.click(`${layoutSel} button[aria-label="Toggle full screen"]`);
  await page.waitForTimeout(300);
  const cls = await page.getAttribute(layoutSel, 'class');
  const wantFS = [
    'fixed',
    'inset-0',
    'z-50',
    'h-dvh',
    'max-h-dvh',
    'w-dvw',
    'max-w-dvw',
    'm-0',
    'p-0',
    'rounded-none',
    'border-0',
  ];
  const missing = wantFS.filter((t) => !has(cls, t));
  const style = await page.$eval(layoutSel, (el) => {
    const cs = getComputedStyle(el);
    return {
      position: cs.position,
      paddingTop: cs.paddingTop,
      paddingLeft: cs.paddingLeft,
      zIndex: cs.zIndex,
      top: cs.top,
      left: cs.left,
    };
  });
  const styleOk =
    style.position === 'fixed' &&
    style.paddingTop === '0px' &&
    style.paddingLeft === '0px';
  await page.screenshot({ path: path.join(SHOTS, '02-fullscreen.png') });
  record(
    'B-fullscreen',
    missing.length === 0 && styleOk,
    `fs-classes missing=[${missing.join(',')}]; computed position=${style.position} padding=${style.paddingTop}/${style.paddingLeft} z=${style.zIndex} top=${style.top}; shot=02-fullscreen.png`,
  );
}

// ---- Test C: Escape exits fullscreen ----
{
  // focus an element inside the layout so keydown bubbles to layout onKeyDown
  await page.click(`${layoutSel} table td, ${layoutSel} table th`, { position: { x: 5, y: 5 } }).catch(() => {});
  await page.focus(`${layoutSel} button[aria-label="Toggle full screen"]`).catch(() => {});
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const cls = await page.getAttribute(layoutSel, 'class');
  const style = await page.$eval(layoutSel, (el) => getComputedStyle(el).position);
  const reverted =
    !has(cls, 'fixed') &&
    !has(cls, 'inset-0') &&
    has(cls, 'rounded-md') &&
    has(cls, 'p-2') &&
    style !== 'fixed';
  await page.screenshot({ path: path.join(SHOTS, '03-after-escape.png') });
  record(
    'C-escape',
    reverted,
    `after-escape has fixed=${has(cls, 'fixed')} rounded-md=${has(cls, 'rounded-md')} p-2=${has(cls, 'p-2')} position=${style}; shot=03-after-escape.png`,
  );
}

// ---- Test D: slot props ----
{
  const testid = await page.getAttribute(layoutSel, 'data-testid');
  const cls = await page.getAttribute(layoutSel, 'class');
  const hasCustom = has(cls, 'srt-custom-layout');
  const variantIntact = has(cls, 'rounded-md') && has(cls, 'relative') && has(cls, 'overflow-hidden');
  record(
    'D-slot-props',
    testid === 'layout' && hasCustom && variantIntact,
    `data-testid=${testid}; custom-class=${hasCustom}; variant-classes-intact=${variantIntact}`,
  );
}

record(
  'console',
  consoleErrors.length === 0,
  consoleErrors.length ? `errors: ${consoleErrors.slice(0, 3).join(' | ')}` : 'no console/page errors',
);

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n=== SUMMARY: ${results.length - failed.length}/${results.length} passed ===`);
process.exit(failed.length ? 1 : 0);
