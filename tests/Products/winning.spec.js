import { test, expect } from '@playwright/test';
import { addProductsToImportList, login } from '../../utils';

test.describe('Find Products on Winning Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/winning-products', { timeout: 60000 });
  });

  test('Verify url', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/winning-products/);
  });

  test('Add multiple products to import list', async ({ page }) => {
    await addProductsToImportList(page, 4);
  });
});

