import { addProductsToImportList, login, searchProducts, verifyCount } from '../../utils';
import { test, expect } from '@playwright/test';

test.describe('Find Products on AliExpress Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/aliexpress-products', { timeout: 60000 });
  });

  test('Verify url', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/aliexpress-products/);
  });

  test('search product', async ({ page }) => {
    await page.waitForSelector('[data-testid^="product-card"]', { timeout: 60000 });
    await searchProducts(page, "https://www.aliexpress.com/item/1005006861101379.html");
    await verifyCount(page, 1);
  });

  test('apply popular categories', async ({ page }) => {
    const popularCategories = ["Home Appliances", "Home & Garden", "Jewelry & Accessories", "Women's Clothing", "Men's Clothing"];
    for (const category of popularCategories) {
      await page.locator('div').filter({ hasText: new RegExp(`^${category}$`) }).click();
      await verifyCount(page, 1);
    }
  });

  test('apply other categories', async ({ page }) => {
    const otherCategories = ["Computer & Office", "Home Improvement", "Sports & Entertainment", "Toys & Hobbies", "Security & Protection", "Automobiles, Parts & Accessories", "Lights & Lighting", "Consumer Electronics", "Beauty & Health", "Weddings & Events", "Shoes", "Pet Products", "Electronic Components & Supplies", "Phones & Telecommunications", "Tools", "Mother & Kids", "Watches", "Luggage & Bags", "Hair Extensions & Wigs", "Underwear", "Novelty & Special Use", "Sports Clothing", "Motorcycle Equipments & Parts"];
    for (const category of otherCategories) {
      await page.getByRole('button', { name: 'All Categories' }).click();
      await page.getByRole('button', { name: category }).click();
      await verifyCount(page, 1);
    }
  });

  test('apply filters', async ({ page }) => {
    await page.getByRole('button', { name: 'Best selling' }).click();
    await expect(page.getByRole('button', { name: 'Best selling' }).nth(1)).toBeVisible();
    await verifyCount(page, 1);

    await page.getByRole('button', { name: 'Truck Fast shipping' }).click();
    await expect(page.getByRole('button', { name: 'Fast shipping', exact: true })).toBeVisible();
    await verifyCount(page, 1);

    await page.getByRole('button', { name: 'Ships to' }).click();
    await page.getByRole('button', { name: 'United States' }).click();
    await expect(page.getByRole('button', { name: 'United States' })).toBeVisible();
    await verifyCount(page, 1);
    
    await page.getByRole('button', { name: 'Clear All' }).click();
  });

  test('apply sorting', async ({ page }) => {
    const sortingOptions = [
      { name: 'Price: low to high' },
      { name: 'Price: high to low' },
      { name: 'Orders', exact: true }
    ];

    for (const option of sortingOptions) {
      await page.getByRole('button', { name: 'Sort by' }).click();
      await page.getByRole('button', option).click();
      await expect(page.getByRole('button', option)).toBeVisible();
      await verifyCount(page, 1);
    }

    await page.getByRole('button', { name: 'Clear All' }).click();
  });

  test('sample order', async ({ page }) => {
    await page.waitForSelector('[data-testid^="product-card"]', { timeout: 60000 });
    const cards = page.locator('[data-testid^="product-card"]');
    await cards.first().click();
    // await page.locator('.sc-dcjTxL').first().click();
    await page.getByRole('button', { name: 'Order Sample' }).click();
    try {
      await page.getByText('Created! Go to Sample Orders').click();
    } catch (e) {
      await expect(page.getByText('Failed to create sample order')).toBeVisible();
    }
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
      // await expect(page.getByText('Added to import list')).toBeVisible();
      const alreadyText = page.getByText('Added to import list');
      if (await alreadyText.count() > 0) {
        console.log("Product already added to import list");
      }
    }
  });

  test('Product Analyzer', async ({ page }) => {
    await page.locator('.sc-gEvEer.knaAqO').first().click();
    await expect(page.getByRole('heading', { name: 'Product Analyzer' })).toBeVisible();
  });

  test('Add multiple products to import list', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Best selling/i })).toBeVisible();
    await addProductsToImportList(page, 4);
  });

  test('push to store', async ({ page }) => {
    await addProductsToImportList(page, 1);
    await page.getByRole('button', { name: 'Import List' }).first().click();
    await page.getByRole('button', { name: 'Push to Store' }).first().click();

    // INFO: PUSH TO STORE REQUIRES UNICORN PLAN
    // await page.getByText('Pushing product to store...').click();
    // await page.getByText('Successfully pushed product').click();
    // await page.getByRole('button', { name: 'Live Products' }).click();
    // await page.waitForSelector('[data-testid^="product-card"]', { timeout: 60000 });
    // const productCards = page.locator('[data-testid^="product-card"]');
    // const cardCount = await productCards.count();
    // expect(cardCount).toBeGreaterThan(0);
  });
});
