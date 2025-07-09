import { test, expect } from '@playwright/test';

const generateRandomEmail = () => {
  const timestamp = Date.now();
  return `testuser+${timestamp}@alidrop.com`;
};

const generateRandomName = () => {
  const timestamp = Date.now().toString().slice(-5);
  return `Test User ${timestamp}`;
};


test('AliDrop signup and Stripe payment', async ({ page }) => {
  test.setTimeout(90000);

  const email = generateRandomEmail();
  const name = generateRandomName();

  // Helper to click a button by role and name, with wait
  const clickButton = async (name, nth = null, options = {}) => {
    let btn = page.getByRole('button', { name });
    if (nth !== null) btn = btn.nth(nth);
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    await btn.click(options);
  };

  // Helper to click a link by role and name, with wait
  const clickLink = async (name) => {
    const link = page.getByRole('link', { name });
    await link.waitFor({ state: 'visible', timeout: 10000 });
    await link.click();
  };

  // Helper to click a text by exact match
  const clickText = async (text) => {
    const txt = page.getByText(text, { exact: true });
    await txt.waitFor({ state: 'visible', timeout: 10000 });
    await txt.click();
  };

  // Helper to switch plan
  const switchPlan = async (planName, tryForFreeIndex = 2) => {
    await clickButton('Settings');
    await clickLink('Membership');
    await clickText(planName);
    await expect(page).toHaveURL(/.*alidrop\.co.*/);
    await clickButton('Upgrade plan');
    await clickButton('Try for FREE', tryForFreeIndex);
    const planLocator = page.locator('.sc-bXWnss > div:nth-child(4)');
    await planLocator.waitFor({ state: 'visible', timeout: 10000 });
    await planLocator.click();
  };

  // Helper to downgrade to Pro
  const downgradeToPro = async () => {
    await clickButton('Settings');
    await clickButton('Try for FREE', 1);
    await clickButton('Downgrade to Pro');
  };

  // Signup flow
  await page.goto('https://staging.alidrop.co/login');
  await clickLink('Create an Account');
  await page.getByRole('textbox', { name: 'yourname@domain.com' }).fill(email);
  await page.getByRole('textbox', { name: 'Yourname', exact: true }).fill(name);
  await clickButton('Get Started');
  await clickButton('No, continue without it');
  await clickButton('Skip');
  await clickButton('Skip');

  // Stripe payment
  const stripeFrame = page.frameLocator('iframe[title="Secure payment input frame"]:not([aria-hidden="true"])');
  await stripeFrame.locator('#Field-numberInput').waitFor({ state: 'visible', timeout: 10000 });
  await stripeFrame.locator('#Field-numberInput').fill('4242424242424242');
  await stripeFrame.locator('#Field-expiryInput').fill('03 / 29');
  await stripeFrame.locator('#Field-cvcInput').fill('123');

  await clickButton('Claim Your Trial', null, { force: true });
  await page.waitForTimeout(5000);
  await expect(page).toHaveURL(/.*alidrop\.co.*/);

  // Downgrade to Pro
  await downgradeToPro();
  await clickButton('Settings');
  await clickLink('Membership');
  await clickText('Pro');
  await expect(page).toHaveURL(/.*alidrop\.co.*/);

  // Downgrade again to Pro (repeat to ensure idempotency)
  await downgradeToPro();
  await clickButton('Settings');
  await clickLink('Membership');
  await clickLink('Pricing Plans');
  await clickLink('Membership');

  // Upgrade to Unicorn
  await switchPlan('Unicorn');

  // Upgrade to Empire
  await switchPlan('Empire');

  // Switch back to Unicorn
  await switchPlan('Unicorn');

  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('link', { name: 'Membership' }).click();
  await page.getByRole('cell', { name: 'Subscription Charge' }).click();
  await page.getByText('Succeeded').click();
  const page1Promise = page.waitForEvent('popup');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download' }).click();
  const page1 = await page1Promise;
  const download = await downloadPromise;
});
