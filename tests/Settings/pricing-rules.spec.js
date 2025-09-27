
import { test, expect } from '@playwright/test';
import { login } from '../../utils';

test.describe('Pricing Rules Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/settings/pricing-rules', { timeout: 60000 });
  });

  test('Verify url', async ({ page }) => {
    await expect(page).toHaveURL(/\/settings\/pricing-rules/);
  });

  test('Check pricing rules page elements', async ({ page }) => {
    try {
      await page.getByRole('button', { name: '%' }).click();
    } catch (error) {
      await page.getByRole('button', { name: '+' }).click();
    }
    try {
      await page.getByRole('button', { name: '%' }).click();
    } catch (error) {
      await page.getByRole('button', { name: '%' }).last().click();
    }
    await page.getByRole('spinbutton').first().click();
    await page.getByRole('spinbutton').first().fill('20');

    await page.getByPlaceholder('e.g. if you want the cost of').click();
    await page.getByPlaceholder('e.g. if you want the cost of').fill('99');

    await page.locator('div').filter({ hasText: /^Do nothingSet as draftSet quantity to zero on store$/ }).locator('div').nth(1).click();
    await page.locator('div').filter({ hasText: /^Do nothingSet as draftSet quantity to zero on store$/ }).locator('div').nth(2).click();

    await page.locator('div').filter({ hasText: /^Do nothingRemove variantSet quantity to zero on store$/ }).locator('div').nth(1).click();
    await page.locator('div').filter({ hasText: /^Do nothingRemove variantSet quantity to zero on store$/ }).locator('div').nth(2).click();

    await page.locator('div').filter({ hasText: /^Do nothingUpdate to store automatically$/ }).locator('div').nth(1).click();

    await page.getByRole('button', { name: 'Save' }).click();
  });


});
