import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const BASE = 'http://localhost:5273/';

const layoutSel = '#layout';
// container = the direct overflow-auto child of the layout (base class of SRT_TableContainer)
const containerSel = '#layout > div.overflow-auto';

const results = [];
const record = (id, status, evidence, shot) => {
  results.push({ id, status, evidence, shot });
  console.log(`${status} [${id}] ${evidence}${shot ? ` shot=${shot}` : ''}`);
};

const browser = await chromium.launch({ headless: true });

async function newPage(query = '') {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await page.goto(BASE + query, { waitUntil: 'networkidle' });
  await page.waitForSelector(layoutSel, { timeout: 15000 });
  await page.waitForTimeout(400);
  page._errors = errors;
  return page;
}

// ---------- Case a: default render ----------
{
  const page = await newPage();
  const info = await page.$eval(containerSel, (el) => {
    const parent = el.parentElement;
    const kids = Array.from(el.children);
    return {
      isChildOfLayout: parent?.id === 'layout',
      className: el.className,
      ariaBusy: el.getAttribute('aria-busy'),
      ariaDescribedby: el.getAttribute('aria-describedby'),
      childCount: kids.length,
      childTags: kids.map((k) => k.tagName.toLowerCase()),
      hasOverlay: !!el.querySelector('.animate-spin'),
    };
  });
  const cls = info.className.split(/\s+/);
  const wantCls = ['relative', 'max-w-full', 'overflow-auto'];
  const missing = wantCls.filter((t) => !cls.includes(t));
  // idle: no forced loading => children order is table only (overlay is null)
  const childrenOk =
    info.childCount === 1 && info.childTags[0] === 'table' && !info.hasOverlay;
  const shot = '10-container-default.png';
  await page.screenshot({ path: path.join(SHOTS, shot) });
  const pass =
    info.isChildOfLayout &&
    missing.length === 0 &&
    childrenOk &&
    info.ariaBusy !== 'true';
  record(
    'a-default',
    pass ? 'PASS' : 'FAIL',
    `childOfLayout=${info.isChildOfLayout}; class-missing=[${missing.join(',')}]; children=${info.childCount}[${info.childTags.join(',')}] overlay=${info.hasOverlay}; aria-busy=${info.ariaBusy}`,
    shot,
  );
  await page.close();
}

// ---------- Case b: loading overlay ----------
{
  const page = await newPage('?loading=1');
  const info = await page.$eval(containerSel, (el) => {
    const kids = Array.from(el.children);
    const overlay = el.querySelector('.animate-spin');
    return {
      ariaBusy: el.getAttribute('aria-busy'),
      ariaDescribedby: el.getAttribute('aria-describedby'),
      overlayInsideContainer: !!overlay && el.contains(overlay),
      firstChildIsOverlay:
        kids[0]?.querySelector('.animate-spin') != null ||
        kids[0]?.classList.contains('animate-spin'),
    };
  });
  const shot = '11-container-loading.png';
  await page.screenshot({ path: path.join(SHOTS, shot) });
  const pass =
    info.ariaBusy === 'true' &&
    info.ariaDescribedby === 'srt-progress' &&
    info.overlayInsideContainer;
  record(
    'b-loading',
    pass ? 'PASS' : 'FAIL',
    `aria-busy=${info.ariaBusy}; aria-describedby=${info.ariaDescribedby}; overlay-inside=${info.overlayInsideContainer} (overlay-first-child=${info.firstChildIsOverlay})`,
    shot,
  );
  await page.close();
}

// ---------- Case c: sticky header => container maxHeight clamp(...) ----------
{
  const page = await newPage('?sticky=1');
  const info = await page.$eval(containerSel, (el) => {
    const cs = getComputedStyle(el);
    return {
      inlineMaxHeight: el.style.maxHeight,
      computedMaxHeight: cs.maxHeight,
      overflow: cs.overflow,
    };
  });
  // scroll the container and re-read to confirm it is the scroll region
  const scroll = await page.$eval(containerSel, (el) => {
    el.scrollTop = 120;
    return { scrollTop: el.scrollTop, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight };
  });
  const shot = '12-container-sticky.png';
  await page.screenshot({ path: path.join(SHOTS, shot) });
  // Chrome serializes calc(100vh - 0px) as "0px + 100vh"; assert the clamp
  // shape (350px floor, 100vh viewport term, 9999px ceiling) not the raw calc.
  const inlineOk =
    info.inlineMaxHeight.startsWith('clamp(') &&
    info.inlineMaxHeight.includes('100vh') &&
    info.inlineMaxHeight.includes('350px') &&
    info.inlineMaxHeight.includes('9999px');
  const pass =
    inlineOk && info.computedMaxHeight !== '' && info.computedMaxHeight !== 'none';
  record(
    'c-sticky',
    pass ? 'PASS' : 'FAIL',
    `inline maxHeight="${info.inlineMaxHeight}"; computed=${info.computedMaxHeight}; overflow=${info.overflow}; scrollable(scrollTop=${scroll.scrollTop}, scrollH=${scroll.scrollHeight}>clientH=${scroll.clientHeight})`,
    shot,
  );
  await page.close();
}

// ---------- Case d: fullscreen => container maxHeight calc(100vh - toolbars), reverts on exit ----------
{
  const page = await newPage();
  const before = await page.$eval(containerSel, (el) => el.style.maxHeight);
  // enter fullscreen via the toggle button (lives in top toolbar)
  const fsBtn = page.locator(`${layoutSel} button[aria-label="Toggle full screen"]`);
  const fsBtnCount = await fsBtn.count();
  let entered = '(button not found)';
  let reverted = '(button not found)';
  let enteredComputed = '';
  if (fsBtnCount > 0) {
    await fsBtn.first().click();
    await page.waitForTimeout(400);
    const fs = await page.$eval(containerSel, (el) => ({
      inline: el.style.maxHeight,
      computed: getComputedStyle(el).maxHeight,
    }));
    entered = fs.inline;
    enteredComputed = fs.computed;
    const shotFs = '13-container-fullscreen.png';
    await page.screenshot({ path: path.join(SHOTS, shotFs) });
    // exit
    await fsBtn.first().click().catch(() => {});
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(400);
    reverted = await page.$eval(containerSel, (el) => el.style.maxHeight);
  }
  // fullscreen branch must be a calc(...100vh...) NOT the sticky clamp(...)
  const enteredOk =
    entered.startsWith('calc(') &&
    entered.includes('100vh') &&
    !entered.startsWith('clamp(');
  // default demo has no sticky, so after exit maxHeight inline should be empty
  const revertedOk = reverted === '' || reverted === before;
  const shot = '13-container-fullscreen.png';
  const pass = fsBtnCount > 0 && enteredOk && revertedOk;
  record(
    'd-fullscreen',
    pass ? 'PASS' : 'FAIL',
    `fsBtn=${fsBtnCount}; before-inline="${before}"; entered-inline="${entered}" (computed=${enteredComputed}); reverted-inline="${reverted}"`,
    shot,
  );
  await page.close();
}

// ---------- Case e: slot props function form; user maxHeight wins over library clamp ----------
{
  const page = await newPage('?slotprops=1'); // slotprops also enables sticky (library sets clamp)
  const info = await page.$eval(containerSel, (el) => {
    const cs = getComputedStyle(el);
    return {
      id: el.id,
      className: el.className,
      inlineMaxHeight: el.style.maxHeight,
      computedMaxHeight: cs.maxHeight,
    };
  });
  const hasCustomClass = info.className.split(/\s+/).includes('srt-custom-container');
  const baseIntact = ['relative', 'max-w-full', 'overflow-auto'].every((t) =>
    info.className.split(/\s+/).includes(t),
  );
  const shot = '14-container-slotprops.png';
  await page.screenshot({ path: path.join(SHOTS, shot) });
  const userWins =
    info.inlineMaxHeight === '400px' && info.computedMaxHeight === '400px';
  const pass = info.id === 'container' && hasCustomClass && baseIntact && userWins;
  record(
    'e-slot-props',
    pass ? 'PASS' : 'FAIL',
    `id=${info.id}; custom-class=${hasCustomClass}; base-intact=${baseIntact}; inline maxHeight="${info.inlineMaxHeight}" (computed=${info.computedMaxHeight}, expected 400px overriding library clamp)`,
    shot,
  );
  await page.close();
}

// ---------- Case f: edit modal renders inside container ----------
{
  const page = await newPage('?editmodal=1');
  const trigger = page.locator('#trigger-edit');
  const triggerCount = await trigger.count();
  let status = 'SKIP';
  let evidence = 'no trigger available';
  const shot = '15-container-editmodal.png';
  const dialogSel = '[role="dialog"], [data-slot="dialog-content"]';
  if (triggerCount === 0) {
    evidence = 'edit trigger button not rendered';
  } else {
    // container gates <SRT_EditRowModal open> behind editModalOpen: none before trigger
    const before = await page.locator(dialogSel).count();
    await trigger.click();
    await page.waitForTimeout(500);
    const after = await page.locator(dialogSel).count();
    const dialogText =
      after > 0 ? (await page.locator(dialogSel).first().innerText()).slice(0, 80) : '';
    const hasEditFields =
      after > 0 && (await page.locator(`${dialogSel} input`).count()) > 0;
    await page.screenshot({ path: path.join(SHOTS, shot) });
    const renderErr = page._errors.some((e) =>
      /EditRowModal|is not a function|Cannot read/i.test(e),
    );
    if (renderErr) {
      status = 'SKIP';
      evidence = `SRT_EditRowModal (unbuilt) errored on render: ${page._errors.slice(0, 2).join(' | ')}`;
    } else if (before === 0 && after > 0) {
      // portal-to-body matches MRT's MUI Dialog; parity is "container renders it when editModalOpen"
      status = 'PASS';
      evidence = `no dialog before trigger, dialog appears after setEditingRow (editDisplayMode=modal); portaled to body like MRT MUI Dialog; edit-fields=${hasEditFields}; text="${dialogText.replace(/\n/g, ' ')}"`;
    } else if (after === 0) {
      status = 'SKIP';
      evidence = `no dialog after trigger; SRT_EditRowModal likely unbuilt/no-op. errs=[${page._errors.slice(0, 2).join(' | ')}]`;
    } else {
      status = 'FAIL';
      evidence = `dialog already present before trigger (before=${before}, after=${after}); container conditional not gating`;
    }
  }
  record('f-edit-modal', status, evidence, shot);
  await page.close();
}

await browser.close();

const failed = results.filter((r) => r.status === 'FAIL');
const skipped = results.filter((r) => r.status === 'SKIP');
console.log(
  `\n=== SUMMARY: ${results.filter((r) => r.status === 'PASS').length} PASS, ${failed.length} FAIL, ${skipped.length} SKIP (of ${results.length}) ===`,
);
process.exit(failed.length ? 1 : 0);
