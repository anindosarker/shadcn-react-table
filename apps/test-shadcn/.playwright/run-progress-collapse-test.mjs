import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const BASE = 'http://localhost:5273/';

const LAYOUT = '#srt-toolbars-layout';
const IGNORE = /Download the React DevTools/i;

// Scope everything to the Toolbars demo section so we never pick up
// progress bars / collapsibles from other demos on the page.
const SECTION = `xpath=//*[@id="srt-toolbars-layout"]/ancestor::section[1]`;

const results = [];
const record = (id, status, evidence, shot) => {
  results.push({ id, status, evidence, shot });
  console.log(`${status} [${id}] ${evidence}${shot ? ` shot=${shot}` : ''}`);
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 2000 } });

const msgs = [];
page.on('console', (m) => {
  if (['error', 'warning'].includes(m.type()) && !IGNORE.test(m.text()))
    msgs.push(m.type() + ': ' + m.text());
});
page.on('pageerror', (e) => msgs.push('PAGEERROR: ' + e.message));

const shot = (name, sel) =>
  (sel ? page.locator(sel) : page).screenshot({
    path: path.join(SHOTS, name),
  });

// Introspect all progress collapsibles within THIS demo section.
const progressInfo = () =>
  page.evaluate(() => {
    const layoutEl = document.querySelector('#srt-toolbars-layout');
    const sectionEl = layoutEl?.closest('section');
    if (!sectionEl) return { sectionFound: false };
    // Only progress collapsibles: a [data-slot=collapsible] whose content
    // contains a [data-slot=progress]. (AlertBanner also uses collapsible.)
    const collapsibles = [...sectionEl.querySelectorAll(
      '[data-slot="collapsible"]',
    )];
    const bars = [];
    for (const root of collapsibles) {
      const content = root.querySelector('[data-slot="collapsible-content"]');
      const progress = root.querySelector('[data-slot="progress"]');
      if (!progress) continue; // not a progress collapsible
      const cs = getComputedStyle(root);
      const contentCs = content ? getComputedStyle(content) : null;
      const rootRect = root.getBoundingClientRect();
      const progRect = progress.getBoundingClientRect();
      const parentRect = root.offsetParent?.getBoundingClientRect() ?? null;
      bars.push({
        rootPosition: cs.position,
        rootWidthPx: Math.round(rootRect.width),
        parentWidthPx: parentRect ? Math.round(parentRect.width) : null,
        contentState: content?.getAttribute('data-state') ?? null,
        contentAnimDuration: contentCs?.animationDuration ?? null,
        contentAnimName: contentCs?.animationName ?? null,
        inlineAnimVar:
          content?.style.getPropertyValue('--tw-animation-duration') || null,
        progressVisible: progRect.width > 0 && progRect.height > 0,
        // top-0 vs bottom-0: distance of root from parent top/bottom
        offsetTop: parentRect
          ? Math.round(rootRect.top - parentRect.top)
          : null,
        offsetBottom: parentRect
          ? Math.round(parentRect.bottom - rootRect.bottom)
          : null,
      });
    }
    return { sectionFound: true, count: bars.length, bars };
  });

const indicatorTransform = () =>
  page.evaluate(() => {
    const layoutEl = document.querySelector('#srt-toolbars-layout');
    const sectionEl = layoutEl?.closest('section');
    const ind = sectionEl?.querySelector('[data-slot="progress-indicator"]');
    if (!ind) return null;
    // computed transform (matrix) + inline transform string
    return {
      computed: getComputedStyle(ind).transform,
      inline: ind.style.transform,
    };
  });

try {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector(LAYOUT, { timeout: 15000 });
  await page.waitForTimeout(500);

  const section = page.locator(SECTION);
  const progressCheckbox = section.getByRole('checkbox', {
    name: /progress bars/i,
  });

  // --- baseline: progress OFF ---
  const before = await progressInfo();
  if (!before.sectionFound) {
    record('setup', 'FAIL', 'Toolbars demo section not found');
  } else {
    record(
      'baseline-off',
      before.count === 0 ? 'PASS' : 'WARN',
      `progress collapsibles with a visible bar at start: ${before.count} (expected 0)`,
    );
  }

  // --- Check 1: toggle ON → bars appear ---
  await progressCheckbox.click();
  await page.waitForTimeout(500); // let collapsible open + animate settle
  const on = await progressInfo();
  const visibleBars = on.bars.filter((b) => b.progressVisible);
  record(
    'toggle-on-appears',
    visibleBars.length >= 1 ? 'PASS' : 'FAIL',
    `progress bars visible after ON: ${visibleBars.length} of ${on.count} collapsibles; states=${on.bars.map((b) => b.contentState).join(',')}`,
  );

  // wrapper absolute + full width (root width matches offsetParent width)
  const posOk = on.bars.every(
    (b) =>
      b.rootPosition === 'absolute' &&
      b.parentWidthPx != null &&
      Math.abs(b.rootWidthPx - b.parentWidthPx) <= 2,
  );
  record(
    'wrapper-absolute-fullwidth',
    on.bars.length && posOk ? 'PASS' : 'FAIL',
    on.bars
      .map(
        (b) =>
          `pos=${b.rootPosition} w=${b.rootWidthPx}/parent=${b.parentWidthPx} top=${b.offsetTop} bottom=${b.offsetBottom}`,
      )
      .join(' | '),
  );

  // edge placement: each bar hugs either top-0 or bottom-0 of its toolbar
  const edgeOk = on.bars.every(
    (b) => b.offsetTop <= 2 || b.offsetBottom <= 2,
  );
  record(
    'edge-placement',
    on.bars.length && edgeOk ? 'PASS' : 'FAIL',
    `each bar hugs top-0 or bottom-0 edge: ${on.bars
      .map((b) => `top=${b.offsetTop},bottom=${b.offsetBottom}`)
      .join(' | ')}`,
  );

  await shot('progress-collapse-on.png', SECTION);

  // --- Check 2: animation duration 300ms ---
  const animDurations = on.bars.map((b) => b.contentAnimDuration);
  const inlineVars = on.bars.map((b) => b.inlineAnimVar);
  const durOk = on.bars.every((b) => b.contentAnimDuration === '0.3s');
  const inlineOk = on.bars.every((b) => b.inlineAnimVar === '300ms');
  record(
    'anim-duration-300ms',
    on.bars.length && (durOk || inlineOk) ? 'PASS' : 'FAIL',
    `computed animation-duration=[${animDurations.join(',')}] (expect 0.3s); inline --tw-animation-duration=[${inlineVars.join(',')}] (expect 300ms); animName=[${on.bars.map((b) => b.contentAnimName).join(',')}]`,
  );

  // --- Check 3: indeterminate motion (transform changes over ~1s) ---
  const samples = [];
  for (let i = 0; i < 6; i++) {
    samples.push(await indicatorTransform());
    await page.waitForTimeout(180);
  }
  const computedVals = samples.filter(Boolean).map((s) => s.computed);
  const distinct = new Set(computedVals);
  record(
    'indeterminate-motion',
    distinct.size > 1 ? 'PASS' : 'FAIL',
    `indicator transform distinct samples over ~1s: ${distinct.size} (samples=${samples.length}); e.g. ${[...distinct].slice(0, 4).join(' / ')}`,
  );

  // --- Check 4: toggle OFF → bar unmounts ---
  await progressCheckbox.click();
  await page.waitForTimeout(600); // let collapse-up animation + unmount finish
  const off = await progressInfo();
  const stillVisible = off.bars.filter((b) => b.progressVisible);
  record(
    'toggle-off-unmounts',
    stillVisible.length === 0 ? 'PASS' : 'FAIL',
    `progress bars still visible after OFF: ${stillVisible.length} (expected 0); collapsibles-with-progress=${off.count}, states=${off.bars.map((b) => b.contentState).join(',')}`,
  );
  await shot('progress-collapse-off.png', SECTION);

  // --- Check 5: console clean ---
  record(
    'console-clean',
    msgs.length === 0 ? 'PASS' : 'FAIL',
    msgs.length === 0
      ? 'no console errors/warnings'
      : `${msgs.length} msg(s): ${msgs.slice(0, 8).join(' || ')}`,
  );
} catch (err) {
  record('exception', 'FAIL', String(err?.stack || err));
} finally {
  const pass = results.filter((r) => r.status === 'PASS').length;
  const fail = results.filter((r) => r.status === 'FAIL').length;
  const warn = results.filter((r) => r.status === 'WARN').length;
  console.log(`\n=== SUMMARY: ${pass} PASS, ${fail} FAIL, ${warn} WARN ===`);
  console.log(`console messages captured: ${msgs.length}`);
  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}
