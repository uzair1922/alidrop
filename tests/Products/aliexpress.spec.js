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
    await expect(page.getByRole('button', { name: 'Push to Store' })).toBeVisible();
    await page.getByRole('button', { name: 'Push to Store' }).first().click();
    await page.getByText('Pushing product to store...').click();
    const successToast = page.getByText('Successfully pushed product', { timeout: 10000 });
    await expect(successToast).toBeVisible();
    await page.getByRole('button', { name: 'Live Products' }).click();
    await page.waitForSelector('[data-testid^="product-card"]', { timeout: 60000 });
    const productCards = page.locator('[data-testid^="product-card"]');
    const cardCount = await productCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });
});
