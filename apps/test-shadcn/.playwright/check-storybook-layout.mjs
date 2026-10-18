import { chromium } from 'playwright';

const BASE = process.env.SB_BASE ?? 'http://localhost:6306';
const SHOT =
  process.argv[2] ??
  '/private/tmp/claude-501/-Users-anindosarker-Work-Personal-React-table/bd763016-aa0c-4346-b545-5a8aebd1b349/scratchpad/storybook-layout.png';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1400, height: 900 },
});
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));

let fail = 0;
const expect = (cond, msg) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${msg}`);
  if (!cond) fail++;
};

await page.goto(`${BASE}/?path=/story/basic--default`, { waitUntil: 'load' });
const frame = page.frameLocator('#storybook-preview-iframe');
await frame
  .locator('#storybook-root table')
  .first()
  .waitFor({ timeout: 60000 });

// 1. sidebar: no "Docs" node
const sidebarTexts = await page
  .locator('#storybook-explorer-tree [data-nodetype]')
  .allInnerTexts();
console.log(`sidebar nodes: ${sidebarTexts.length}`);
expect(
  !sidebarTexts.some((t) => t.trim() === 'Docs'),
  'sidebar has no node named "Docs"',
);

// 2. toolbar buttons (title/aria-label of every button in the toolbar)
const toolbarButtons = await page
  .locator('[data-testid="sb-preview-toolbar"], .sb-bar, [role="toolbar"]')
  .first()
  .locator('button')
  .evaluateAll((els) =>
    els.map(
      (b) =>
        b.getAttribute('title') ||
        b.getAttribute('aria-label') ||
        b.textContent.trim(),
    ),
  );
console.log('toolbar buttons:', JSON.stringify(toolbarButtons));
const has = (re) => toolbarButtons.some((t) => re.test(t));
// SB 10 folds zoom in/out/reset into one "Change zoom level" dropdown.
expect(has(/zoom/i), 'toolbar: zoom');
expect(has(/background/i), 'toolbar: backgrounds');
expect(has(/grid/i), 'toolbar: grid');
expect(has(/viewport/i), 'toolbar: viewport');
expect(has(/measure/i), 'toolbar: measure');
expect(has(/outline/i), 'toolbar: outline');
expect(has(/accessibility|a11y|vision/i), 'toolbar: accessibility');
expect(has(/dark mode|light mode|change theme/i), 'toolbar: dark mode toggle');

// 3. addon panel tabs + Code panel content
const tabs = await page
  .locator('#storybook-panel-root [role="tab"]')
  .evaluateAll((els) => els.map((b) => b.textContent.trim()).filter(Boolean));
console.log('panel tabs:', JSON.stringify(tabs));
for (const t of ['Controls', 'Actions', 'Accessibility', 'Code']) {
  expect(
    tabs.some((x) => x.includes(t)),
    `bottom panel has tab "${t}"`,
  );
}
const codeTab = page
  .locator('#storybook-panel-root [role="tab"]', { hasText: 'Code' })
  .first();
await codeTab.click();
await page.waitForTimeout(1500);
const panelText = await page.locator('#storybook-panel-root').innerText();
expect(
  panelText.includes('ShadcnReactTable'),
  'Code panel shows ShadcnReactTable in source',
);

// 4. placeholder lines inside the preview iframe
const links = await frame.locator('p a').evaluateAll((as) =>
  as.map((a) => ({
    href: a.href,
    target: a.target,
    rel: a.rel,
    text: a.textContent.trim(),
    parent: a.parentElement.textContent.trim(),
  })),
);
console.log('placeholder links:', JSON.stringify(links, null, 1));
expect(
  links.some(
    (l) =>
      l.href.startsWith('https://shadcn-table.com') &&
      l.target === '_blank' &&
      l.parent.startsWith('Looking for the main docs site? Click here.'),
  ),
  'placeholder line 1 with docs link',
);
expect(
  links.some(
    (l) =>
      l.href ===
        'https://github.com/anindosarker/shadcn-react-table/tree/main/packages/shadcn-react-table/stories/features' &&
      l.target === '_blank' &&
      l.parent.startsWith(
        'View Source code for these examples in the code tab below or here on GitHub.',
      ),
  ),
  'placeholder line 2 with GitHub link',
);

// 5. dark by default
const htmlDark = await frame
  .locator('html')
  .evaluate((h) => h.classList.contains('dark'));
expect(htmlDark, 'preview html.dark is true');

await page.screenshot({ path: SHOT, fullPage: false });
console.log(`screenshot: ${SHOT}`);
await browser.close();
console.log(fail ? `FAILED (${fail})` : 'ALL PASS');
process.exit(fail ? 1 : 0);
