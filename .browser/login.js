const { chromium } = require('playwright-core');

(async () => {
  const ctx = await chromium.launchPersistentContext('/workspace/.trae-profile', {
    executablePath: '/root/.cache/puppeteer/chrome/linux-155.0.8059.39/chrome-linux64/chrome',
    headless: true,
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://www.trae.cn/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const login = page.getByText('登录', { exact: true }).first();
  console.log('login count:', await page.getByText('登录', { exact: true }).count());
  await login.click({ timeout: 10000 }).catch(e => console.log('click err', e.message));
  await page.waitForTimeout(4000);
  console.log('URL:', page.url());
  console.log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 2500));
  await page.screenshot({ path: '/workspace/.browser/login.png' });
  await ctx.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
