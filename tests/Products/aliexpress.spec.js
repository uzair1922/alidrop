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
});
