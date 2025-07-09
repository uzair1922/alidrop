import { test, expect } from '@playwright/test';
import { login, searchProducts, addProductsToImportList } from '../../utils';

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
    await expect(page.getByText('No products found')).toBeVisible();
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


async function verifyCount(page, expectedCount, addToList = false) {
  await page.waitForSelector('[data-testid^="product-card"]', { timeout: 60000 });
  const cards = page.locator('[data-testid^="product-card"]');
  const count = await cards.count();
  expect(count).toBeGreaterThan(expectedCount);

  if (addToList) {
    const card = cards.nth(0);
    await card.hover();
    await card.locator('.fa-wand-magic-sparkles').click({ force: true });
  }

}