import { login } from '../../utils';
import { test, expect } from '@playwright/test';

test.describe('Sample Order', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/aliexpress-products', { timeout: 60000 });
  });

  test('Verify url', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/aliexpress-products/);
  });

  test('sample order', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Best selling/i })).toBeVisible();
    await page.waitForSelector('[data-testid^="product-card"]', { timeout: 60000 });
    const cards = page.locator('[data-testid^="product-card"]');
    await cards.first().click();
    // await page.locator('.sc-dcjTxL').first().click();
    await page.getByRole('button', { name: 'Order Sample' }).click();
    await page.getByText('Created! Go to Sample Orders').toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: 'Sample Orders' }).click();
    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.getByText('Not placed').click();
    await page.getByRole('cell', { name: 'Checkout' }).getByRole('button').nth(1).click();
    await page.getByRole('button', { name: 'Cancel Order' }).click();
    await page.getByText('Canceled').first().click();
  });
});
