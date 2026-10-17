// Smoke every story in the Storybook index against the agent-owned Storybook (6306).
// Usage: node check-all-stories.mjs [concurrency]
// Prints only failures (page error, console.error, empty root) plus a summary. Exit 1 on any failure.
import { chromium } from 'playwright';

const BASE = process.env.SB_BASE ?? 'http://localhost:6306';
const CONCURRENCY = Number(process.argv[2] ?? 4);

const index = await (await fetch(`${BASE}/index.json`)).json();
const stories = Object.values(index.entries).filter((e) => e.type === 'story');
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const failures = [];
let done = 0;

async function check(s) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text().slice(0, 160)}`);
  });
  try {
    await page.goto(`${BASE}/iframe.html?id=${s.id}&viewMode=story`, { waitUntil: 'load' });
    await page
      .locator('#storybook-root table tbody tr:visible')
      .first()
      .waitFor({ state: 'visible', timeout: 15000 })
      .catch(() => {});
    await page.waitForTimeout(300);
    const rows = await page.locator('#storybook-root table tbody tr:visible').count();
    const text = (await page.locator('#storybook-root').innerText().catch(() => '')).trim();
    if (errors.length || text.length === 0) {
      failures.push(`${s.id} rows=${rows}${text.length === 0 ? ' EMPTY ROOT' : ''} ${JSON.stringify(errors.slice(0, 2))}`);
    }
  } catch (e) {
    failures.push(`${s.id} EXCEPTION ${e.message.split('\n')[0]}`);
  } finally {
    await page.close();
    done++;
  }
}

const queue = [...stories];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await check(queue.shift());
  }),
);
await browser.close();
for (const f of failures) console.log('FAIL', f);
console.log(`${done} stories checked, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
