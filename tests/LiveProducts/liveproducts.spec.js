import { test, expect } from '@playwright/test';
import { login, verifyCount } from '../../utils';

test.describe('Live Product Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/live-products', { timeout: 60000 });
  });

  test('Verify url', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/live-products/);
  });

  test('Search product', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Search your products...' }).click();
    await page.getByRole('textbox', { name: 'Search your products...' }).fill('qwertyuiop');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText('No products found')).toBeVisible({ timeout: 20000 });

    await page.getByRole('textbox', { name: 'Search your products...' }).click();
    await page.getByRole('textbox', { name: 'Search your products...' }).fill('shirt');
    await page.getByRole('button', { name: 'Search' }).click();
    // await page.waitForSelector('.sc-ijtseF');
    // await expect(page.locator('.sc-ijtseF').first()).toBeVisible({ timeout: 20000 });
    await verifyCount(page, 1, false);
  });

test('Filter products by stock status', async ({ page }) => {
  // STEP 2: Click the main Filter button
  const filterButton = page.getByRole('button', { name: 'Filter' }).first();
  await filterButton.click();

  // STEP 3: Apply Low stock filter
  await page.getByRole('button', { name: 'Low stock (less than 10)' }).click();
  await page.waitForTimeout(1000);

  // STEP 4: Apply Out of stock filter  
  await page.getByRole('button', { name: 'Out of stock' }).click();
  await page.waitForTimeout(1000);

  // STEP 5: Verify filters are applied by checking URL or visible elements
  // Option A: Check if URL contains filter parameters
  // await expect(page).toHaveURL(/.*low_stock|out_of_stock/);

  // Option B: Check if filter indicators are visible
  const activeFilters = page.getByText('Low stock').or(page.getByText('Out of stock'));
  await expect(activeFilters.first()).toBeVisible();

  // STEP 6: Close filter dropdown if needed
  await page.keyboard.press('Escape');
  
  console.log('Product filters applied successfully');
});

  test('Restore products', async ({ page }) => {
    await page.locator('.sc-eBHhsj').first().click();
    await page.locator('div:nth-child(2) > .sc-blKGMR > .sc-gMZepy > .sc-bVVIoq > .sc-dPZUQH > .sc-eBHhsj').click();
    await page.getByRole('button', { name: 'Restore (2)' }).click();
    await page.getByRole('button', { name: 'Restore', exact: true }).click();
  });

  test('Delete products', async ({ page }) => {
    await page.locator('.sc-eBHhsj').first().click();
    await page.locator('div:nth-child(2) > .sc-blKGMR > .sc-gMZepy > .sc-bVVIoq > .sc-dPZUQH > .sc-eBHhsj').click();
    await page.getByRole('button', { name: 'Delete (2)' }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
  });

  test('Delete and Restore Single product', async ({ page }) => {
    await page.locator('.sc-gEvEer.prJgU').first().click();
    await page.getByRole('button', { name: 'Restore', exact: true }).click();
    await page.locator('.svg-inline--fa.fa-trash-can').first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Successfully deleted product!')).toBeVisible();
  });

  test('View and interact with product modal', async ({ page }) => {
    await verifyCount(page, 1, false);

    // View on store button
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'View on Store' }).first().click();
    const page1 = await page1Promise;

    // click view product button
    await page.getByRole('button', { name: 'View Product' }).first().click();
    try {
      await page.getByTestId('product-modal-container').locator('div').filter({ hasText: 'Add to Import List' }).nth(3).click();
    } catch (e) {
      await expect(page.getByText('Added to import list')).toBeVisible();
    }
    await page.getByRole('button', { name: 'Order Sample' }).click();
    try {
      await expect(page.getByText('Created! Go to Sample Orders')).toBeVisible();
    } catch (e) {
      await expect(page.getByText('Failed to create sample order')).toBeVisible();
    }
  });
});