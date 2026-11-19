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
  console.log('phone typed:', await phone.inputValue());

  // agreement checkbox (custom element near text 已阅读并同意)
  const cb = page.locator('input[type="checkbox"]').first();
  if (await cb.count()) { await cb.check({ force: true }).catch(()=>{}); }
  else {
    await page.getByText('已阅读并同意').click({ force: true }).catch(e => console.log('cb err', e.message));
  }
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/workspace/.browser/before-next.png' });

  await page.getByRole('button', { name: '下一步' }).click().catch(async () => {
    await page.getByText('下一步', { exact: true }).click();
  });
  await page.waitForTimeout(6000);
  console.log('URL:', page.url());
  console.log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 2000));
  await page.screenshot({ path: '/workspace/.browser/after-next.png' });
  await ctx.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
