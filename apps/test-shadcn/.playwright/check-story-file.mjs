// Render every story of one story file against the agent-owned Storybook (6306).
// Usage: node check-story-file.mjs <importPath suffix, e.g. features/ColumnHiding.stories.tsx> [screenshot-dir]
// Prints one line per story: id, tables, visible tbody rows, page errors. Exit 1 on any page error or missing story.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.SB_BASE ?? 'http://localhost:6306';
const FILE = process.argv[2];
const SHOT_DIR = process.argv[3];
if (!FILE) {
  console.error('usage: check-story-file.mjs <stories/... suffix> [screenshot-dir]');
  process.exit(2);
}

const index = await (await fetch(`${BASE}/index.json`)).json();
const stories = Object.values(index.entries).filter(
  (e) => e.type === 'story' && e.importPath.endsWith(FILE),
);
if (stories.length === 0) {
  console.log(`no stories found for ${FILE} in ${BASE}/index.json`);
  process.exit(1);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
let failed = 0;
for (const s of stories) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text().slice(0, 200)}`);
  });
  await page.goto(`${BASE}/iframe.html?id=${s.id}&viewMode=story`, { waitUntil: 'load' });
  await page
    .locator('table tbody tr:visible, [data-testid="srt-empty"], #storybook-root :text("No records")')
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
    .catch(() => {});
  await page.waitForTimeout(500);
  const tables = await page.locator('#storybook-root table').count();
  const rows = await page.locator('#storybook-root table tbody tr:visible').count();
  const rootText = (await page.locator('#storybook-root').innerText().catch(() => '')).trim();
  const empty = rootText.length === 0;
  const status = errors.length || empty ? 'FAIL' : 'ok';
  if (status === 'FAIL') failed++;
  console.log(
    `${status} ${s.id} tables=${tables} rows=${rows}${empty ? ' EMPTY ROOT' : ''}${
      errors.length ? ' errors=' + JSON.stringify(errors.slice(0, 3)) : ''
    }`,
  );
  if (SHOT_DIR) {
    fs.mkdirSync(SHOT_DIR, { recursive: true });
    await page.screenshot({ path: path.join(SHOT_DIR, `${s.id}.png`) });
  }
  await page.close();
}
await browser.close();
console.log(`${stories.length} stories, ${failed} failed`);
process.exit(failed ? 1 : 0);
