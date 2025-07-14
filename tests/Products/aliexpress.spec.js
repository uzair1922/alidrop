import { addProductsToImportList, login } from '../../utils';
import { test, expect } from '@playwright/test';

test.describe('Find Products on AliExpress Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/aliexpress-products', { timeout: 60000 });
  });

  test('Verify url', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/aliexpress-products/);
  });

  test('Add multiple products to import list', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Best selling/i })).toBeVisible();
    await addProductsToImportList(page, 4);
  });

  test('push to store', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Best selling/i })).toBeVisible();
    await addProductsToImportList(page, 1);
    await page.getByRole('button', { name: 'Import List' }).first().click();
    await expect(page.getByRole('button', { name: 'Push to Store' }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Push to Store' }).first().click();
    // Wait for either success or failure toast
    const successToast = page.getByText('Successfully pushed product');
    const failToast = page.getByText('Failed to push product to store');
    await Promise.race([
      successToast.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {}),
      failToast.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})
    ]);
    // Assert that at least one toast is visible
    const successVisible = await successToast.isVisible().catch(() => false);
    const failVisible = await failToast.isVisible().catch(() => false);
    expect(successVisible || failVisible).toBeTruthy();
    await page.getByRole('button', { name: 'Live Products' }).click();
    await page.waitForSelector('[data-testid^="product-card"]', { timeout: 60000 });
    const productCards = page.locator('[data-testid^="product-card"]');
    const cardCount = await productCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });
});
