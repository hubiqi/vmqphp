const { chromium } = require('playwright-core');
const fs = require('fs');

const STATUS = '/workspace/.browser/status.json';
const CODE_FILE = '/workspace/.browser/code.txt';
const DEADLINE = Date.now() + 10 * 60 * 1000;

function setStatus(obj) {
  fs.writeFileSync(STATUS, JSON.stringify({ ...obj, ts: new Date().toISOString() }, null, 2));
}

(async () => {
  if (fs.existsSync(CODE_FILE)) fs.unlinkSync(CODE_FILE);
  setStatus({ state: 'starting' });

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
  await page.waitForTimeout(5000);

  const ph = page.locator('input[placeholder*="手机号"]');
  await ph.waitFor({ state: 'visible', timeout: 20000 });
  await ph.click();
  await ph.fill('18698338856');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: '下一步' }).click();
  await page.waitForTimeout(3000);

  // agreement dialog (checkbox unchecked -> popup)
  if (await page.getByRole('button', { name: '同意' }).count()) {
    await page.getByRole('button', { name: '同意' }).last().click({ force: true }).catch(() => {});
  }
  await page.waitForTimeout(9000);

  await page.screenshot({ path: '/workspace/.browser/final-state.png' });
  const inputs = await page.locator('input').evaluateAll(els => els.map(e => ({
    type: e.type, ph: e.placeholder, w: Math.round(e.getBoundingClientRect().width)
  })));
  const bodyNow = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 200));
  setStatus({ state: 'awaiting_user', url: page.url(), inputs, body: bodyNow });

  let code = null;
  while (Date.now() < DEADLINE) {
    if (fs.existsSync(CODE_FILE)) {
      const raw = (fs.readFileSync(CODE_FILE, 'utf8') || '').trim();
      if (/^\d{6}$/.test(raw)) { code = raw; break; }
      fs.unlinkSync(CODE_FILE);
    }
    await page.waitForTimeout(2000);
  }
  if (!code) {
    setStatus({ state: 'timeout', message: '10 分钟内未收到验证码' });
    await ctx.close();
    process.exit(3);
  }

  setStatus({ state: 'submitting_code' });
  const codeIn = page.locator('input[placeholder*="验证码"]');
  if (await codeIn.count()) {
    await codeIn.first().click();
    await page.keyboard.type(code, { delay: 130 });
  } else {
    await page.mouse.click(400, 309);
    await page.waitForTimeout(300);
    await page.keyboard.type(code, { delay: 130 });
  }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: '/workspace/.browser/after-code.png' });

  const end = Date.now() + 60000;
  let ok = false;
  while (Date.now() < end) {
    const u = page.url();
    if (u.includes('trae.cn') && !u.includes('accounts.doubao.com')) { ok = true; break; }
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/workspace/.browser/post-login.png' });
  const txt = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 400));
  setStatus({ state: ok ? 'logged_in' : 'code_rejected', url: page.url(), text: txt });
  await ctx.storageState({ path: '/workspace/.browser/state.json' }).catch(() => {});
  await ctx.close();
  process.exit(ok ? 0 : 4);
})().catch(e => {
  setStatus({ state: 'fatal', message: e.message });
  console.error('ERR', e.message);
  process.exit(1);
});
