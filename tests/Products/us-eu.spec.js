import { test, expect } from '@playwright/test';
import { login } from '../../utils';

test('US/EU Products', async ({ page }) => {
  await login(page);
  await page.goto('/us-eu-products');
  await expect(page.getByRole('button', { name: 'Install Spocket for FREE' })).toBeVisible({ timeout: 20000 });
  const page2Promise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Install Spocket for FREE' }).click();
  const page2 = await page2Promise;
  await page.locator('.svg-inline--fa.fa-chevron-right').first().click();
  await page.locator('.svg-inline--fa.fa-chevron-left').first().click();
  const page3Promise = page.waitForEvent('popup');
  await page.locator('.sc-gEvEer.bJAjrT').first().click();
  const page3 = await page3Promise;
});
