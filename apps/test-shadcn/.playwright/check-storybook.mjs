import { chromium } from 'playwright';

const BASE = 'http://localhost:6306';
const STORY_ID = process.argv[2] ?? 'features-aggregation-examples--aggregation';
const SHOT = process.argv[3] ?? '/private/tmp/claude-501/-Users-anindosarker-Work-Personal-React-table/bd763016-aa0c-4346-b545-5a8aebd1b349/scratchpad/storybook-one-story.png';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

function wire(page, label) {
  page.on('pageerror', (e) => console.log(`[${label}] PAGE ERROR:`, e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') {
      console.log(`[${label}] console.${m.type()}:`, m.text().slice(0, 400));
    }
  });
}

// 1. Story iframe
const story = await ctx.newPage();
wire(story, 'story');
await story.goto(`${BASE}/iframe.html?id=${STORY_ID}&viewMode=story`, { waitUntil: 'load' });
try {
  // Storybook injects a hidden ArgTypes <table> first in DOM order, so wait on a *visible* data row.
  await story.locator('table tbody tr:visible').first().waitFor({ state: 'visible', timeout: 30000 });
  const rows = await story.locator('table tbody tr').count();
  const visibleRows = await story.locator('table tbody tr:visible').count();
  const tables = await story.locator('table').count();
  console.log(`story ${STORY_ID}: tables=${tables} tbody rows=${rows} visible rows=${visibleRows}`);
} catch (e) {
  console.log(`story ${STORY_ID}: NO TABLE ROWS within 30s: ${e.message.split('\n')[0]}`);
  const body = await story.locator('body').innerText().catch(() => '');
  console.log('body text (first 500):', body.slice(0, 500));
}
await story.screenshot({ path: SHOT, fullPage: false });
console.log('screenshot:', SHOT);

// 2. Manager
const mgr = await ctx.newPage();
wire(mgr, 'manager');
await mgr.goto(`${BASE}/`, { waitUntil: 'load' });
try {
  await mgr.waitForSelector('#storybook-explorer-tree, [data-nodetype="component"], nav', { timeout: 30000 });
  const sidebarItems = await mgr.locator('#storybook-explorer-tree [data-nodetype]').count();
  console.log(`manager: sidebar present, tree nodes=${sidebarItems}`);
} catch (e) {
  console.log('manager: sidebar NOT found:', e.message.split('\n')[0]);
}

await browser.close();
