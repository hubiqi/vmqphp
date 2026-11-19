const { chromium } = require('playwright-core');

const AUTH_URL = process.argv[2];

(async () => {
  const ctx = await chromium.launchPersistentContext('/workspace/.trae-profile', {
    executablePath: '/root/.cache/puppeteer/chrome/linux-155.0.8059.39/chrome-linux64/chrome',
    headless: true,
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN', timezoneId: 'Asia/Shanghai',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(AUTH_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  console.log('frames:', page.frames().map(f => f.url().slice(0, 80)));
  const info = await page.evaluate(() => {
    const out = { bodyLen: document.body.innerHTML.length, bodyText: document.body.innerText.slice(0, 200), iframes: [...document.querySelectorAll('iframe')].map(f => f.src), roots: 0 };
    const walk = (root) => {
      for (const el of root.querySelectorAll('*')) {
        if (el.shadowRoot) { out.roots++; walk(el.shadowRoot); }
      }
    };
    walk(document);
    return out;
  });
  console.log(JSON.stringify(info, null, 2));
  const ax = await page.accessibility.snapshot({ interestingOnly: false }).catch(e => ({ err: e.message }));
  console.log('AX:', JSON.stringify(ax).slice(0, 800));
  await ctx.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
