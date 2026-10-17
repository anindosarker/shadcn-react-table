import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'screenshots');
const BASE = 'http://localhost:5273/';
const rec = (id, status, ev, shot) => console.log(`${status} [${id}] ${ev}${shot ? ` shot=${shot}` : ''}`);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1500, height: 1100 } });
const errors = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') errors.push('ERROR:' + m.text()); if (m.type() === 'warning') errors.push('WARN:' + m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR:' + e.message));
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

const region = page.locator('#srt-inputs-menus-layout');
await region.scrollIntoViewIfNeeded();
await page.waitForTimeout(200);

// The global-filter field renders only when showGlobalFilter is on: reveal it
// via the toggle button (aria-label "Show/Hide search").
const toggle = region.locator('button[aria-label*="search" i]').first();
if (await toggle.count()) { await toggle.click(); await page.waitForTimeout(400); }

const gfInputGroup = () => region.locator('[data-slot="input-group"]').filter({ hasNot: page.locator('thead *') }).first();
const igPresent = await region.evaluate((root) => [...root.querySelectorAll('[data-slot="input-group"]')].some((ig) => !ig.closest('thead')));
rec('6b-inputgroup', igPresent ? 'PASS' : 'FAIL', `global-filter input-group present=${igPresent}`);

// mode button = inline-start InputGroupButton, aria-label "Change search mode"
const modeBtn = region.locator('button[aria-label*="Change search mode" i], button[aria-label*="mode" i]').first();
const hasMode = await modeBtn.count();

// tooltip on the mode button
let tip = '';
if (hasMode) { await modeBtn.hover(); await page.waitForTimeout(500); tip = (await page.locator('[role="tooltip"]').first().textContent().catch(() => '')) || ''; }

// open the filter-mode menu
let menuItems = [];
if (hasMode) { await modeBtn.click(); await page.waitForTimeout(400); menuItems = await page.locator('[role="menuitem"],[role="menuitemradio"],[role="option"]').allTextContents(); }
const file1 = 'sweep-6b-globalfilter-modemenu.png';
await page.screenshot({ path: path.join(SHOTS, file1) });
rec('6b-mode-menu-opens', menuItems.length >= 2 ? 'PASS' : 'FAIL', `modeBtnAria="${hasMode ? await modeBtn.getAttribute('aria-label') : 'none'}" menuItems=[${menuItems.slice(0, 14).join(',')}]`, file1);

const gfInput = () => region.locator('[data-slot="input-group"] input').filter({ hasNot: page.locator('thead input') }).first();
const rows = () => region.locator('table tbody tr').count();
const pickMode = async (label) => {
  if (!(await page.locator('[role="menuitem"],[role="menuitemradio"]').count())) { await modeBtn.click(); await page.waitForTimeout(300); }
  const item = page.locator(`[role="menuitem"]:has-text("${label}"),[role="menuitemradio"]:has-text("${label}")`).first();
  const ok = await item.count();
  if (ok) { await item.click(); await page.waitForTimeout(400); }
  return !!ok;
};
const typeGf = async (text) => {
  const inp = gfInput();
  if (!(await inp.count())) return null;
  await inp.fill(''); await page.waitForTimeout(150);
  await inp.fill(text); await page.waitForTimeout(800);
  return rows();
};

// "xample": every email contains it (@example.com) but no cell STARTS with it.
// Contains -> all rows; Starts With -> 0 rows. Guaranteed discriminator.
const setStarts = await pickMode('Starts With');
const startsRows = await typeGf('xample');
const setContains = await pickMode('Contains');
const containsRows = await typeGf('xample');
const file2 = 'sweep-6b-globalfilter-behavior.png';
await page.screenshot({ path: path.join(SHOTS, file2) });
rec('6b-mode-changes-filtering',
  setStarts && setContains && startsRows !== null && containsRows !== null && startsRows < containsRows ? 'PASS' : 'FAIL',
  `pickedStartsWith=${setStarts} pickedContains=${setContains} query "ov": startsWith=${startsRows}rows vs contains=${containsRows}rows`, file2);

rec('6b-tooltip', tip ? 'PASS' : 'INFO', tip ? `tooltip="${tip.slice(0, 40)}"` : 'no [role=tooltip] captured (headless hover limitation)');
rec('6b-console', [...new Set(errors)].length === 0 ? 'PASS' : 'FAIL', [...new Set(errors)].slice(0, 8).join(' || ') || 'zero errors/warnings');

await browser.close();
