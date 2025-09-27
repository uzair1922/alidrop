import { test, expect } from '@playwright/test';
import { addProductsToImportList, login, searchProducts, verifyCount } from '../../utils';

test.describe('Find Products on Winning Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/winning-products', { timeout: 60000 });
  });

  test('Verify url', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/winning-products/);
  });

  test('Search product', async ({ page }) => {
    await page.waitForSelector('[data-testid^="product-card"]', { timeout: 60000 });
    await searchProducts(page, "https://www.aliexpress.com/item/1005006861101379.html");
    await verifyCount(page, 1);
  });

  test('Sample order', async ({ page }) => {
    await page.waitForSelector('[data-testid^="product-card"]', { timeout: 60000 });
    const cards = page.locator('[data-testid^="product-card"]');
    await cards.first().click();
    // await page.locator('.sc-dcjTxL').first().click();
    const orderSampleBtn = page.getByRole('button', { name: 'Order Sample' });
    await expect(orderSampleBtn).toBeEnabled();
    await orderSampleBtn.click({ force: true });
    // await page.getByText('Created! Go to Sample Orders').click();
  });

  test('move product image slider', async ({ page }) => {
    await page.locator('.svg-inline--fa.fa-chevron-right').first().click();
    await page.locator('.svg-inline--fa.fa-chevron-left').first().click();

    await page.locator('.sc-gEvEer.frKnKT').first().click();
    await page.getByText('Successfully added product to').click();

    await page.waitForSelector('[data-testid^="product-card"]', { timeout: 60000 });
    const productCards = page.locator('[data-testid^="product-card"]');
    await expect(productCards.nth(2)).toBeVisible();
    await productCards.nth(2).click();

    await page.getByRole('img', { name: 'Slide 0' }).nth(1).click();
    await page.getByRole('img', { name: 'Slide 1' }).nth(1).click();

    try {
      await page.getByTestId('product-modal-container').getByRole('button', { name: 'Add to Import List' }).click();
      await page.getByRole('button', { name: 'Order Sample' }).click();
    } catch (e) {
      // added to import list button
      await expect(page.locator('.sc-jsJBEP.czSWeo > div:nth-child(2)').first()).toBeVisible();
    }
  });

  test('Product Analyzer', async ({ page }) => {
    await page.locator('.sc-gEvEer.knaAqO').first().click();
    await expect(page.getByRole('heading', { name: 'Product Analyzer' })).toBeVisible();
  });

  test('Add multiple products to import list', async ({ page }) => {
    await addProductsToImportList(page, 4);
  });
});

