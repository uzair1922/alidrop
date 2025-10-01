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

  test('Filter products', async ({ page }) => {
    if (await verifyCount(page, 1, false)){
      return
    }
    await page.getByRole('button', { name: 'Filter' }).click();
    await page.getByRole('button', { name: 'Low stock (less than 10)' }).click();
    await page.getByRole('button', { name: 'Out of stock' }).click();
    await page.getByText('Low stock (less than 10)').nth(1).click();
    await page.locator('.sc-gEvEer.hKZLWd').first().click();
    await page.locator('.sc-gEvEer.hKZLWd').click();
    await page.getByText('2', { exact: true }).click();
    // await page.locator('.sc-eBHhsj').first().click();
    // await page.locator('div:nth-child(2) > .sc-hybRYi > .sc-dxUMQK > .sc-bVVIoq > .sc-dPZUQH > .sc-eBHhsj').click();
  });

  test('Restore products', async ({ page }) => {
    if (await verifyCount(page, 1, false)){
      return
    }
    await page.locator('.sc-eBHhsj').first().click();
    await page.locator('div:nth-child(2) > .sc-blKGMR > .sc-gMZepy > .sc-bVVIoq > .sc-dPZUQH > .sc-eBHhsj').click();
    await page.getByRole('button', { name: 'Restore (2)' }).click();
    await page.getByRole('button', { name: 'Restore', exact: true }).click();
  });

  test('Delete products', async ({ page }) => {
    if (await verifyCount(page, 1, false)){
      return
    }
    await page.locator('.sc-eBHhsj').first().click();
    await page.locator('div:nth-child(2) > .sc-blKGMR > .sc-gMZepy > .sc-bVVIoq > .sc-dPZUQH > .sc-eBHhsj').click();
    await page.getByRole('button', { name: 'Delete (2)' }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
  });

  test('Delete and Restore Single product', async ({ page }) => {
    if (await verifyCount(page, 1, false)){
      return
    }
    await page.locator('.sc-gEvEer.prJgU').first().click();
    await page.getByRole('button', { name: 'Restore', exact: true }).click();
    await page.locator('.svg-inline--fa.fa-trash-can').first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Successfully deleted product!')).toBeVisible();
  });

  test('View and interact with product modal', async ({ page }) => {
    if (await verifyCount(page, 1, false)){
      return
    }

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