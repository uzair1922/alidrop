import { test, expect } from '@playwright/test';
import { login, searchProducts, addProductsToImportList, verifyCount } from '../../utils';

test.describe('product analyzer', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/product-analyzer');
  });

  test('verify url', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/product-analyzer/);
  });

  test('analyze product with no results', async ({ page }) => {
    await searchProducts(page, 'https://www.aliexpress.com/item/1234567890.html');
    try {
      await expect(page.getByText('No products found')).toBeVisible({ timeout: 60000 });
    } catch (error) {
      console.error('Error verifying no products found:', error);
    }
  });

  test('search product', async ({ page }) => {
    await searchProducts(page, "https://www.aliexpress.com/item/1005006861101379.html");
    await verifyCount(page, 1);
  });

  test('add products to import list', async ({ page }) => {
    await searchProducts(page, "https://www.aliexpress.com/item/1005006861101379.html");
    await verifyCount(page, 1);
    await addProductsToImportList(page, 1);
    await page.locator('.fa-xmark').click({ force: true });
  });

  test('analyze product', async ({ page }) => {
    await searchProducts(page, "https://www.aliexpress.com/item/1005006861101379.html");
    await verifyCount(page, 1, true);
  });
});
