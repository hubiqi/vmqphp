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
  await page.waitForTimeout(4000);
  await page.getByText('登录', { exact: true }).first().click();
  await page.waitForTimeout(4000);

  const phone = page.locator('input[type="tel"], input[type="text"]').first();
  await phone.click();
  await phone.fill('18698338856');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: '下一步' }).click().catch(async () => {
    await page.getByText('下一步', { exact: true }).click();
  });
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: '同意' }).click().catch(async () => {
    await page.getByText('同意', { exact: true }).click();
  });
  await page.waitForTimeout(7000);
  console.log('URL:', page.url());
  console.log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 2000));
  await page.screenshot({ path: '/workspace/.browser/code-step.png' });
  await ctx.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
