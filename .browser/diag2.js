const { chromium } = require('playwright-core');

(async () => {
  const AUTH = require('fs').readFileSync('/workspace/.browser/status.json', 'utf8');
  const url = JSON.parse(AUTH).url;
  const ctx = await chromium.launchPersistentContext('/workspace/.trae-profile', {
    executablePath: '/root/.cache/puppeteer/chrome/linux-155.0.8059.39/chrome-linux64/chrome',
    headless: true,
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN', timezoneId: 'Asia/Shanghai',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://www.trae.cn/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  await page.getByText('登录', { exact: true }).first().click();
  await page.waitForTimeout(6000);
  for (const f of page.frames()) {
    const data = await f.evaluate(() => {
      const els = [...document.querySelectorAll('input, textarea, [contenteditable="true"]')];
      return {
        bodyLen: document.body.innerHTML.length,
        text: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 120),
        inputs: els.map(e => {
          const r = e.getBoundingClientRect();
          const cs = getComputedStyle(e);
          return { tag: e.tagName, type: e.type, ph: e.placeholder, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y), vis: cs.visibility, disp: cs.display, op: cs.opacity };
        }),
      };
    }).catch(e => ({ err: e.message }));
    console.log('FRAME', f.url().slice(0, 60), JSON.stringify(data).slice(0, 700));
  }
  await page.screenshot({ path: '/workspace/.browser/diag2.png' });
  await ctx.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
