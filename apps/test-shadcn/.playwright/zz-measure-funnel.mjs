import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
const scope = '#srt-inputs-menus-layout';
const input = page.locator(`${scope} th:has-text("Last Name") input`).first();
await input.waitFor({ timeout: 20000 });
await input.fill('zz');
await page.waitForTimeout(800);
const th = page.locator(`${scope} th`, { hasText: 'Last Name' }).first();
const data = await th.evaluate((el) => {
  const r = (e) => { const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2), cy: +(b.y + b.height / 2).toFixed(2) }; };
  const funnel = el.querySelector('svg.lucide-funnel');
  const sort = el.querySelector('svg.lucide-arrow-left-right');
  const btn = funnel?.closest('button');
  return {
    funnel: funnel && r(funnel),
    sort: sort && r(sort),
    button: btn && { ...r(btn), verticalAlign: getComputedStyle(btn).verticalAlign, cls: btn.className },
    span: btn && { cls: btn.parentElement?.parentElement?.className || btn.parentElement?.className, anim: getComputedStyle(btn.closest('span.flex-none')).animationName },
  };
});
console.log(JSON.stringify(data, null, 1));
if (data.funnel && data.sort) console.log('centre delta', (data.funnel.cy - data.sort.cy).toFixed(2));
await browser.close();
