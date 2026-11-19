const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  const url = process.argv[2] || 'https://www.trae.ai/';
  const out = process.argv[3] || '/workspace/.browser/shot.png';
  const ctx = await chromium.launchPersistentContext('/workspace/.trae-profile', {
    executablePath: '/root/.cache/puppeteer/chrome/linux-155.0.8059.39/chrome-linux64/chrome',
    headless: true,
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  console.log('URL:', page.url());
  console.log('TITLE:', await page.title());
  const text = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 3000) : '');
  console.log('TEXT:\n' + text);
  await page.screenshot({ path: out, fullPage: false });
  console.log('COOKIES:', (await ctx.cookies()).map(c => c.name + '@' + c.domain).join(', '));
  await ctx.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
