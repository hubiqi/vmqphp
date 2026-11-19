const { chromium } = require('playwright-core');

const AUTH_URL = 'https://accounts.doubao.com/authorize?theme=dark&locale=zh-CN&template_id=7704906913376455930&scope=user_info&callback_info=user_type&redirect_uri=https%3A%2F%2Fwww.trae.cn%2Fsso-callback&client_key=tywuefgcuzyrgjf0&app_id=711126&state=eyJzZWFyY2giOiJsb2dpbl9jaGFubmVsPWlkZV9wbGF0Zm9ybSZsb2dpbl9wbGF0Zm9ybT10cmFlJnV0bV9pbmZvPSU3QiUyMlV0bVNvdXJjZSUyMiUzQSUyMiUyMiUyQyUyMlV0bU1lZGl1bSUyMiUzQSUyMiUyMiUyQyUyMlV0bUNhbXBhaWduJTIyJTNBJTIyJTIyJTJDJTIyVXRtVGVybSUyMiUzQSUyMiUyMiUyQyUyMlV0bUNvbnRlbnQlMjIlM0ElMjIlMjIlMkMlMjJCRFZJRCUyMiUzQSUyMiUyMiUyQyUyMkFjdGl2aXR5TmFtZSUyMiUzQSUyMiUyMiUyQyUyMkxhbmRpbmdQYWdlVXJsJTIyJTNBJTIyJTIyJTJDJTIyZXh0WW91ZGFvJTIyJTNBJTIyJTIyJTdEIiwibW9kZSI6ImF1dGhvcml6ZSIsIm5vbmNlIjoiOTI0MjQwODItYzU4MC00ODRhLWE2M2ItY2UwY2VkYjk5ZGNkIiwiZXhwaXJlcyI6MTc5NTExNTk1Mjg3N30&track_params=%7B%22req_source%22%3A0%2C%22login_channel%22%3A%22ide_platform%22%2C%22login_platform%22%3A%22trae%22%7D&extra_login_methods=%5B%7B%22name%22%3A%22%E4%BD%BF%E7%94%A8+TRAE+%E8%B4%A6%E5%8F%B7%E7%99%BB%E5%BD%95%22%2C%22url%22%3A%22https%3A%2F%2Fconsole.enterprise.trae.cn%2Flogin%22%7D%5D';

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
  await page.waitForTimeout(5000);
  console.log('URL:', page.url());
  console.log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 800));
  await page.screenshot({ path: '/workspace/.browser/resume.png' });
  await ctx.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
