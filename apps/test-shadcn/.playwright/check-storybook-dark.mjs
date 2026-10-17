import { chromium } from 'playwright';

const BASE = process.env.SB_BASE ?? 'http://localhost:6306';
const SHOT =
  process.argv[2] ??
  '/private/tmp/claude-501/-Users-anindosarker-Work-Personal-React-table/bd763016-aa0c-4346-b545-5a8aebd1b349/scratchpad/storybook-dark-docs.png';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
});
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));

const luminance = (rgb) => {
  // Tailwind v4 surfaces come back as oklch(L C H); L is already perceptual lightness.
  const ok = rgb.match(/^oklch\(\s*([\d.]+)/);
  if (ok) return Number(ok[1]);
  const m = rgb.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  if (m.length < 3 || m[3] === 0) return null;
  return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
};
const isDark = (rgb) => luminance(rgb) !== null && luminance(rgb) < 0.25;
const isLight = (rgb) => luminance(rgb) !== null && luminance(rgb) > 0.75;

async function measure(label) {
  const frame = page.frameLocator('#storybook-preview-iframe');
  await frame.locator('body').waitFor({ timeout: 30000 });
  const managerBody = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  const managerHtmlClass = await page.evaluate(
    () => document.documentElement.className,
  );
  const inner = await frame.locator('html').evaluate((html) => {
    const docsRoot = document.querySelector('.sbdocs-wrapper');
    return {
      htmlDark: html.classList.contains('dark'),
      htmlLight: html.classList.contains('light'),
      body: getComputedStyle(document.body).backgroundColor,
      docs: docsRoot ? getComputedStyle(docsRoot).backgroundColor : null,
    };
  });
  console.log(
    `[${label}] manager body=${managerBody} html.class="${managerHtmlClass}"`,
  );
  console.log(
    `[${label}] iframe html.dark=${inner.htmlDark} html.light=${inner.htmlLight} body=${inner.body} docs=${inner.docs}`,
  );
  return { managerBody, ...inner };
}

let fail = 0;
const expect = (cond, msg) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${msg}`);
  if (!cond) fail++;
};

// (a) docs page, default dark
await page.goto(`${BASE}/?path=/docs/basic--docs`, { waitUntil: 'load' });
await page
  .frameLocator('#storybook-preview-iframe')
  .locator('.sbdocs-wrapper')
  .first()
  .waitFor({ timeout: 60000 });
await page.waitForTimeout(1500);
const a = await measure('a docs');
expect(isDark(a.managerBody), 'a: manager body dark');
expect(a.htmlDark, 'a: iframe html.dark');
expect(isDark(a.docs ?? ''), 'a: docs root dark');
await page.screenshot({ path: SHOT });
console.log('screenshot:', SHOT);

// (b) story page, default dark
await page.goto(`${BASE}/?path=/story/basic--default`, { waitUntil: 'load' });
await page
  .frameLocator('#storybook-preview-iframe')
  .locator('table tbody tr:visible')
  .first()
  .waitFor({ timeout: 60000 });
await page.waitForTimeout(1000);
const b = await measure('b story');
expect(isDark(b.managerBody), 'b: manager body dark');
expect(b.htmlDark, 'b: iframe html.dark');
expect(isDark(b.body), 'b: iframe body dark');

// (c) toggle to light, then back
const toggle = page.getByRole('button', { name: /Change theme to/ });
await toggle.first().waitFor({ timeout: 30000 });
await toggle.first().click();
await page.waitForTimeout(1200);
const c1 = await measure('c light');
expect(isLight(c1.managerBody), 'c: manager body light after toggle');
expect(!c1.htmlDark && c1.htmlLight, 'c: iframe html.light after toggle');
expect(isLight(c1.body), 'c: iframe body light after toggle');

// docs page should follow too while light
await page.goto(`${BASE}/?path=/docs/basic--docs`, { waitUntil: 'load' });
await page
  .frameLocator('#storybook-preview-iframe')
  .locator('.sbdocs-wrapper')
  .first()
  .waitFor({ timeout: 60000 });
await page.waitForTimeout(1500);
const c2 = await measure('c light docs');
expect(isLight(c2.managerBody), 'c: docs manager light');
expect(!c2.htmlDark, 'c: docs iframe not dark');
expect(isLight(c2.docs ?? ''), 'c: docs root light');

await page
  .getByRole('button', { name: /Change theme to/ })
  .first()
  .click();
await page.waitForTimeout(1500);
const c3 = await measure('c back dark');
expect(isDark(c3.managerBody), 'c: manager body dark after toggle back');
expect(c3.htmlDark, 'c: iframe html.dark after toggle back');
expect(isDark(c3.docs ?? ''), 'c: docs root dark after toggle back');

await browser.close();
console.log(fail ? `${fail} check(s) FAILED` : 'ALL CHECKS PASSED');
process.exit(fail ? 1 : 0);
