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
  test.setTimeout(60000);

  const email = generateRandomEmail();
  const name = generateRandomName();

  await page.goto('https://staging.alidrop.co/login');
  await page.getByRole('link', { name: 'Create an Account' }).click();
  await page.getByRole('textbox', { name: 'yourname@domain.com' }).fill(email);
  await page.getByRole('textbox', { name: 'Yourname', exact: true }).fill(name);
  await page.getByRole('button', { name: 'Get Started' }).click();
  await page.getByRole('button', { name: 'No, continue without it' }).click();
  await page.getByRole('button', { name: 'Skip' }).click();
  await page.getByRole('button', { name: 'Skip' }).click();

  // Stripe iframe (correct field selectors)
  const stripeFrame = page.frameLocator('iframe[title="Secure payment input frame"]');

  await stripeFrame.locator('#Field-numberInput').waitFor({ state: 'visible' });
  await stripeFrame.locator('#Field-numberInput').fill('4242424242424242');

  await stripeFrame.locator('#Field-expiryInput').fill('03 / 29');
  await stripeFrame.locator('#Field-cvcInput').fill('123');

  await page.getByRole('button', { name: 'Claim Your Trial' }).click();

  await page.waitForTimeout(3000);
  await expect(page).toHaveURL(/.*alidrop\.co.*/);
});
