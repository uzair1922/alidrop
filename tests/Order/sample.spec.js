import { login, verifySampleOrderCount } from '../../utils';
import { test, expect } from '@playwright/test';

test.describe('Sample Order', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/sample-orders', { timeout: 60000 });
  });

  test('Verify url', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/sample-orders/);
  });

  test('Verify sample order count', async ({ page }) => {
    await verifySampleOrderCount(page, 1);
  });

  test('Check Order Status', async ({ page }) => {
    const statuses = ['Not placed', 'Processing', 'Shipped', 'Canceled'];
    for (const status of statuses) {
      await page.reload();
      await page.getByRole('button', { name: 'Order Status' }).click();
      // Remove preview checked status if present
      const checkedButtons = await page.locator('[aria-checked="true"]').elementHandles();
      for (const btn of checkedButtons) {
        await btn.click();
      }
      await page.getByRole('button', { name: status }).click();
      await verifySampleOrderCount(page, 1);
    }
  });

  test('Edit Order', async ({ page }) => {
    await page.getByRole('button', { name: 'Order Status' }).click();
    await page.getByRole('button', { name: 'Not placed' }).click();
    await page.getByRole('button', { name: 'Order Status' }).click();
    await verifySampleOrderCount(page, 1);

    await page.getByRole('button', { name: 'Add shipping information' }).first().click();

  });

  test('Sample Order', async ({ page }) => {
    await page.goto('/aliexpress-products')
    await page.waitForSelector('[data-testid^="product-card"]', { timeout: 60000 });
    const cards = page.locator('[data-testid^="product-card"]');
    await cards.first().click();
    // await page.locator('.sc-dcjTxL').first().click();
    await page.getByRole('button', { name: 'Order Sample' }).click();
    await page.getByText('Created! Go to Sample Orders').click();
    await page.getByRole('button', { name: 'Sample Orders' }).click();
    const checkoutButtons = await page.getByRole('button', { name: 'Checkout' }).elementHandles();
    if (checkoutButtons.length > 1) {
      await checkoutButtons[0].click();
    } else if (checkoutButtons.length === 1) {
      await checkoutButtons[0].click();
    }

    const orderStatus = await page.getByText('Not placed').elementHandles();
    if (orderStatus.length > 1) {
      await orderStatus[0].click();
    } else if (orderStatus.length === 1) {
      await orderStatus[0].click();
    }

    await page.getByRole('cell', { name: 'Checkout' }).getByRole('button').nth(1).click();
    await page.getByRole('button', { name: 'Cancel Order' }).click();
    await page.getByText('Canceled').first().click();
  });
});
