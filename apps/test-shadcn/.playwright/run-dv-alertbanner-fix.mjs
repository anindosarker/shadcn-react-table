import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const AB = '#srt-alertbanner-layout';
const BANNER = `${AB} [data-slot="alert"]`;
const IGNORE = /React DevTools/i;

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 3000 } });
const errs = [];
p.on('console', (m) => {
  if (['error', 'warning'].includes(m.type()))
    errs.push(m.type() + ': ' + m.text());
});
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message));
await p.goto('http://localhost:5273/', { waitUntil: 'networkidle' });
await p.waitForSelector(AB, { timeout: 15000 });
await p.waitForTimeout(400);
// select-all so count text + clear button appear alongside the (default) grouping chips
await p.locator(`${AB} thead [role="checkbox"]`).first().click();
await p.waitForTimeout(300);

const info = await p.evaluate((BANNER) => {
  const el = document.querySelector(BANNER);
  const cs = getComputedStyle(el);
  const child = el.firstElementChild; // SRT content wrapper (now col-start-2)
  const ccs = child ? getComputedStyle(child) : null;
  const crect = child?.getBoundingClientRect();
  const erect = el.getBoundingClientRect();
  // the line holding the count text — locate its wrapping height to detect vertical stacking
  const countNode = [...el.querySelectorAll('div')].find(
    (d) =>
      /of \d+ row\(s\) selected/i.test(d.textContent) && d.children.length <= 3,
  );
  const selLineRect = countNode?.getBoundingClientRect();
  const badges = [...el.querySelectorAll('[data-slot="badge"]')].map((x) => ({
    text: x.textContent.trim(),
    close: !!x.querySelector('button'),
  }));
  return {
    display: cs.display,
    gridCols: cs.gridTemplateColumns,
    border: cs.borderTopWidth + '/' + cs.borderTopStyle,
    radius: cs.borderTopLeftRadius,
    padding: cs.paddingTop + ' ' + cs.paddingLeft,
    fontSize: cs.fontSize,
    bg: cs.backgroundColor,
    childColStart: ccs?.gridColumnStart,
    childWidth: Math.round(crect?.width),
    bannerWidth: Math.round(erect.width),
    selLineHeight: selLineRect ? Math.round(selLineRect.height) : null,
    text: el.innerText.replace(/\n/g, ' ').trim(),
    selShown: /of \d+ row\(s\) selected/i.test(el.innerText),
    groupedBy: /grouped by/i.test(el.innerText),
    thenBy: /then by/i.test(el.innerText),
    badges,
  };
}, BANNER);

await p
  .locator(BANNER)
  .screenshot({ path: path.join(SHOTS, 'dv-01-fix-banner.png') });
await p
  .locator(AB)
  .screenshot({ path: path.join(SHOTS, 'dv-01-fix-context.png') });

// interactions: clear selection + chip ungroup
await p
  .locator(`${BANNER} button`, { hasText: /clear selection/i })
  .first()
  .click();
await p.waitForTimeout(250);
const selGone = !/of \d+ row\(s\) selected/i.test(
  await p.locator(BANNER).innerText(),
);
const chipsBefore = await p.locator(`${BANNER} [data-slot="badge"]`).count();
await p.locator(`${BANNER} [data-slot="badge"] button`).first().click();
await p.waitForTimeout(250);
const chipsAfter = await p.locator(`${BANNER} [data-slot="badge"]`).count();

await b.close();

// A single unwrapped count line is ~20-24px tall; vertical stacking would be 60px+.
const contentFullWidth =
  info.childColStart === '2' && info.childWidth > info.bannerWidth * 0.7;
const oneLine = info.selLineHeight !== null && info.selLineHeight <= 32;
const defaultLook =
  info.border === '1px/solid' &&
  info.radius === '10px' &&
  info.fontSize === '14px';
const chipsOk =
  info.badges.length === 2 &&
  info.badges.every((x) => x.close) &&
  chipsBefore === 2 &&
  chipsAfter === 1;
const pass =
  contentFullWidth &&
  oneLine &&
  defaultLook &&
  info.selShown &&
  info.groupedBy &&
  info.thenBy &&
  selGone &&
  chipsOk &&
  errs.filter((e) => !IGNORE.test(e)).length === 0;

console.log('display=' + info.display + ' gridCols=[' + info.gridCols + ']');
console.log(
  'childColStart=' +
    info.childColStart +
    ' childWidth=' +
    info.childWidth +
    ' bannerWidth=' +
    info.bannerWidth +
    ' -> contentFullWidth=' +
    contentFullWidth,
);
console.log(
  'countLineHeight=' +
    info.selLineHeight +
    'px -> oneLine(no vertical stack)=' +
    oneLine,
);
console.log(
  'defaultLook border=' +
    info.border +
    ' radius=' +
    info.radius +
    ' fontSize=' +
    info.fontSize +
    ' bg=' +
    info.bg +
    ' -> ' +
    defaultLook,
);
console.log('text="' + info.text + '"');
console.log(
  'sel=' +
    info.selShown +
    ' groupedBy=' +
    info.groupedBy +
    ' thenBy=' +
    info.thenBy +
    ' badges=' +
    JSON.stringify(info.badges),
);
console.log(
  'clearSelection->selGone=' +
    selGone +
    ' chipX ' +
    chipsBefore +
    '->' +
    chipsAfter,
);
console.log(
  'console msgs=' +
    errs.filter((e) => !IGNORE.test(e)).length +
    (errs.length ? ' :: ' + errs.slice(0, 5).join(' | ') : ''),
);
console.log('\n=== ITEM 1 RE-VERIFY: ' + (pass ? 'PASS' : 'FAIL') + ' ===');
process.exit(pass ? 0 : 1);
