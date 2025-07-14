import { test, expect, Page, Locator } from '@playwright/test';

const random = () => Date.now().toString();
const email    = `testuser+${random()}@alidrop.com`;
const name     = `Test User ${random().slice(-5)}`;
const password = 'Test@1234';

/* ---------- helpers ---------- */

async function login(page, mail = email, pwd = password) {
  await page.goto('https://staging.alidrop.co/login');
  await page.fill('input[type="email"]', mail);
  await page.fill('input[type="password"]', pwd);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.includes('/login')),
    page.click('button[type="submit"]', { force: true }),
  ]);
}

/** click only when the locator is visible & enabled */
async function safeClick(locator, opts = {}) {
  await expect(locator).toBeVisible({ timeout: 15_000 });
  await expect(locator).toBeEnabled();
  await locator.click(opts);
}

/* ---------- tests ---------- */

test.describe.serial('AliDrop subscription flow', () => {

  test('sign‑up & pay with Stripe (Empire → checkout)', async ({ page }) => {
    test.setTimeout(180_000);
    test.slow();

    /* --- sign‑up funnel --- */
    await page.goto('https://staging.alidrop.co/register');
    await page.getByRole('textbox', { name: /yourname@domain/i }).fill(email);
    await page.getByRole('textbox', { name: /^Yourname$/ }).fill(name);
    await safeClick(page.getByRole('button', { name: 'Get Started' }));
    await safeClick(page.getByRole('button', { name: 'No, continue without it' }));
    await safeClick(page.getByRole('button', { name: 'Skip' }));   // logo step
    await safeClick(page.getByRole('button', { name: 'Skip' }));   // brand step

    /* --- Stripe card details --- */
    // const stripeFrames = page.frameLocator('iframe[title="Secure payment input frame"]');
    // let stripeFrame;
    // for (let i = 0; i < 3; i++) {
    //   const frame = stripeFrames.nth(i);
    //   if (await frame.locator('#Field-numberInput').count() > 0) {
    //     stripeFrame = frame;
    //     break;
    //   }
    // }
    // if (!stripeFrame) throw new Error('Stripe card input frame not found');
    // await expect(stripeFrame.locator('#Field-numberInput')).toBeVisible({ timeout: 15_000 });
    const stripeFrame = page.frameLocator('iframe[title="Secure payment input frame"]:not([aria-hidden="true"])');
    await stripeFrame.locator('#Field-numberInput').waitFor({ state: 'visible', timeout: 10000 });
    await stripeFrame.locator('#Field-numberInput').fill('4242424242424242');
    await stripeFrame.locator('#Field-expiryInput').fill('03 / 29');
    await stripeFrame.locator('#Field-cvcInput').fill('123');

    // Select Pakistan from the country dropdown if present
    if (await stripeFrame.locator('#Field-countryInput').count() > 0) {
      await stripeFrame.locator('#Field-countryInput').selectOption({ label: 'Pakistan' });
    }

    if (await stripeFrame.locator('#Field-postalCodeInput').count() > 0) {
      await stripeFrame.locator('#Field-postalCodeInput').fill('12345');
    }

    if (await stripeFrame.locator('#Field-linkMobilePhoneInput').count() > 0) {
      await stripeFrame.locator('#Field-linkMobilePhoneInput').fill('(201) 555-0123');
    }

    /* --- claim trial loop until button disappears --- */
    // const claimBtn = page.getByRole('button', { name: 'Claim Your Trial' });
    // while (await claimBtn.isVisible().catch(() => false)) {
    //   await safeClick(claimBtn, { force: true });
    //   await expect(claimBtn).toBeHidden({ timeout: 20_000 });
    // }

    const claimBtn = page.getByRole('button', { name: 'Claim Your Trial' });
    while (await claimBtn.isVisible().catch(() => false)) {
      await safeClick(claimBtn, { force: true });
      await page.waitForTimeout(5000);
    }

    /* --- confirm we’re on the post‑checkout URL --- */
    await page.waitForURL(/staging\.alidrop\.co(\/|\/checkout\?plan_id=39).*$/, { timeout: 20_000 });

    /* --- set password in settings --- */
    await page.goto('https://staging.alidrop.co/settings/account');
    const skipBtn = page.getByRole('button', { name: 'Skip' });
    if (await skipBtn.isVisible().catch(() => false)) {
      await safeClick(skipBtn);
    }
    const skipBtn2 = page.getByRole('button', { name: 'Skip' });
    if (await skipBtn2.isVisible().catch(() => false)) {
      await safeClick(skipBtn2);
    }
    await page.waitForSelector('input[type="password"]', { timeout: 60000 });
    const pwdInputs = page.locator('input[type="password"]');
    await pwdInputs.nth(0).fill(password);
    await pwdInputs.nth(1).fill(password);
    await safeClick(page.locator('button:has-text("Save")').last(), { force: true });
    await expect(page.getByText('Your account has been saved successfully!')).toBeVisible();
  });

  test('check subscription invoice PDF downloads', async ({ page }) => {
    await login(page);

    await safeClick(page.getByRole('button', { name: 'Settings' }));
    await safeClick(page.getByRole('link',   { name: 'Membership' }));
    await safeClick(page.getByRole('cell',   { name: 'Subscription Charge' }));
    await safeClick(page.getByText('Succeeded'));

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      safeClick(page.getByRole('button', { name: 'Download' })),
    ]);
    console.log('Invoice saved →', await download.path());
  });

  test('upgrade to Unicorn plan', async ({ page }) => {
    await login(page);

    await safeClick(page.getByRole('button', { name: 'Settings' }));
    await safeClick(page.getByRole('link',   { name: 'Membership' }));
    await expect(page.getByText('Empire', { exact: true })).toBeVisible();

    await safeClick(page.getByRole('button', { name: 'Upgrade plan' }));
    await safeClick(page.getByRole('button', { name: 'Try for FREE' }).nth(2), { force: true });

    const upgradeBtn = page.getByRole('button', { name: 'Upgrade to Unicorn' });
    while (await upgradeBtn.isVisible().catch(() => false)) {
      await safeClick(upgradeBtn);
    }
    await page.waitForURL(/plan_id=41/, { timeout: 20_000 });
  });

  test('downgrade back to Pro plan', async ({ page }) => {
    await login(page);

    await safeClick(page.getByRole('button', { name: 'Settings' }));
    await safeClick(page.getByRole('link',   { name: 'Membership' }));
    await expect(page.getByText('Unicorn', { exact: true })).toBeVisible();

    await safeClick(page.getByRole('button', { name: 'Upgrade plan' }));
    await safeClick(page.getByRole('button', { name: 'Try for FREE' }).nth(1), { force: true });

    const downgradeBtn = page.getByRole('button', { name: 'Downgrade to Pro' });
    while (await downgradeBtn.isVisible().catch(() => false)) {
      await safeClick(downgradeBtn);
    }
    await page.waitForURL(/plan_id=38/, { timeout: 20_000 });
  });
});
