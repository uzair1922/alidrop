import { test, expect } from '@playwright/test';


const generateRandomEmail = () => `testuser+${Date.now()}@alidrop.com`;
const generateRandomName = () => `Test User ${Date.now().toString().slice(-5)}`;


// Utility functions
const login = async (page, email, password) => {
  await page.goto('https://staging.alidrop.co/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]', { force: true });
  await page.waitForURL((url) => !url.pathname.includes('/login'));
};

const waitAndClick = async (locator, options = {}) => {
  await locator.waitFor({ state: 'visible', timeout: 10000 });
  await locator.click(options);
};

const clickButton = async (page, name, nth = null, options = {}) => {
  let btn = page.getByRole('button', { name });
  if (nth !== null) btn = btn.nth(nth);
  await waitAndClick(btn, options);
};

const clickLink = async (page, name) => {
  const link = page.getByRole('link', { name });
  await waitAndClick(link);
};

const clickText = async (page, text) => {
  const txt = page.getByText(text, { exact: true });
  await waitAndClick(txt);
};

test.describe.serial('AliDrop Subscription Flow', () => {
  let email;
  let name;
  const password = 'Test@1234';

  // Generate email and name once for all tests in this describe
  test.beforeAll(() => {
    email = generateRandomEmail();
    name = generateRandomName();
  });

  test('AliDrop Stripe payment', async ({ page }) => {
    test.setTimeout(120000);


    // Signup flow
    await page.goto('https://staging.alidrop.co/register');
    await page.getByRole('textbox', { name: 'yourname@domain.com' }).fill(email);
    await page.getByRole('textbox', { name: 'Yourname', exact: true }).fill(name);
    await clickButton(page, 'Get Started');
    await clickButton(page, 'No, continue without it');
    await clickButton(page, 'Skip');
    await clickButton(page, 'Skip');

    // Stripe payment
    const stripeFrame = page.frameLocator('iframe[title="Secure payment input frame"]:not([aria-hidden="true"])');
    await stripeFrame.locator('#Field-numberInput').waitFor({ state: 'visible', timeout: 10000 });
    await stripeFrame.locator('#Field-numberInput').fill('4242424242424242');
    await stripeFrame.locator('#Field-expiryInput').fill('03 / 29');
    await stripeFrame.locator('#Field-cvcInput').fill('123');

    // Keep clicking "Claim Your Trial" as long as the button is visible
    while (await page.getByRole('button', { name: 'Claim Your Trial' }).isVisible().catch(() => false)) {
      await clickButton(page, 'Claim Your Trial', null, { force: true });
      await page.waitForTimeout(5000);
    }
    expect(page.url()).toMatch(/https:\/\/staging\.alidrop\.co(\/|\/checkout\?plan_id=39(\&.*)?)?\/?$/);
    // wait for the URL to stabilize
    await page.waitForURL('https://staging.alidrop.co/?plan_id=39', { timeout: 20000 });
    await page.goto('https://staging.alidrop.co/settings/account');
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(password);
    await passwordInputs.nth(1).fill(password);

    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Save")').last().click({ force: true });
    await page.getByText('Your account has been saved successfully!').click();
  });

  test('Check Subscription Invoice', async ({ page }) => {
    await login(page, email, password);

    await clickButton(page, 'Settings');
    await clickLink(page, 'Membership');
    await page.getByRole('cell', { name: 'Subscription Charge' }).click();
    await page.getByText('Succeeded').click();
    const page1Promise = page.waitForEvent('popup');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    await page1Promise;
    await downloadPromise;
  });

  test('Upgrade to Unicorn Plan', async ({ page }) => {
    await login(page, email, password);

    await clickButton(page, 'Settings');
    await clickLink(page, 'Membership');
    await expect(page.getByText('Empire', { exact: true })).toBeVisible();
    await clickButton(page, 'Upgrade plan');
    await clickButton(page, 'Try for FREE', 2, { force: true });
    await page.waitForTimeout(5000);
    
    while (await page.getByRole('button', { name: `Upgrade to Unicorn` }).isVisible().catch(() => false)) {
      await clickButton(page, 'Upgrade to Unicorn');
      await page.waitForTimeout(5000);
    }

    await page.waitForURL('https://staging.alidrop.co/?plan_id=41', { timeout: 20000 });  
  })

  test('Downgrade to Pro Plan', async ({ page }) => {
    await login(page, email, password);

    await clickButton(page, 'Settings');
    await clickLink(page, 'Membership');
    await expect(page.getByText('Unicorn', { exact: true })).toBeVisible();
    await clickButton(page, 'Upgrade plan');
    await clickButton(page, 'Try for FREE', 1, { force: true });
    await page.waitForTimeout(5000);
    
    while (await page.getByRole('button', { name: `Downgrade to Pro` }).isVisible().catch(() => false)) {
      await clickButton(page, 'Downgrade to Pro');
      await page.waitForTimeout(5000);
    }

    await page.waitForURL('https://staging.alidrop.co/?plan_id=38', { timeout: 20000 });  
  })
});
