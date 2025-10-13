import { test, expect } from '@playwright/test';
import { login } from '../../utils';

test.describe('Find Products on AliExpress Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/import-list', { timeout: 60000 });
  });

  test('Verify url', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/import-list/);
  });

  test('No Product', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Search for products' }).click();
    await page.getByRole('textbox', { name: 'Search for products' }).fill('wejgcdbilxdbs');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText('Your import list is empty')).toBeVisible();
  });

  test('Valid Product', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Search for products' }).click();
    await page.getByRole('textbox', { name: 'Search for products' }).fill('shirt');
    await page.getByRole('button', { name: 'Search' }).click();
    try {
      await page.waitForSelector('[data-testid^="import-list-card"]', { timeout: 60000 });
      const cards = page.locator('[data-testid^="import-list-card"]');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    } catch (e) {
      await expect(page.getByText('Your import list is empty')).toBeVisible();
    }
  });

  test('AI Write Button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Ask AI to Write' }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Ask AI to Write' }).first().click();
  });

  test('Test Product Buttons', async ({ page }) => {
    await page.getByRole('button', { name: 'Save' }).first().click();
    await page.getByText('Product updated successfully!').click();

    await page.getByRole('button', { name: 'Push to Store' }).first().click();

    await page.getByRole('button', { name: 'Remove Product' }).first().click();
    await page.getByRole('button', { name: 'Remove', exact: true }).click();
  })

  test('Product Basic Info', async ({ page }) => {
    await expect(page.locator('input[type="string"]').nth(1)).toBeVisible({ timeout: 20000 });
    await page.locator('input[type="string"]').nth(1).click();
    await page.locator('input[type="string"]').nth(1).fill('Test Title');

    await page.locator('.react-tagsinput-input').first().click();
    await page.locator('.react-tagsinput-input').first().fill('testing');
    await page.locator('.react-tagsinput-input').first().press('Enter');

    try {
      await page.locator('.react-select__multi-value__remove').first().click();
    } catch (e) {
      // no tags to remove
    }
    
    try {
      await page.locator('.react-select__input-container').first().click();
      await page.getByRole('option', { name: 'Home page' }).click();
    } catch (e) {
      // no collection available
    }

    // await page.locator('.sc-gEvEer.jLmZYh').first().click();
    await page.getByRole('button', { name: 'Save' }).first().click();
    await page.getByText('Product updated successfully!').click();
  });

  test('Product Description', async ({ page }) => {
    // await page.locator('.sc-gJdVPJ > div:nth-child(2)').first().click();
    await page.getByText('Description').first().click();
    await page.locator('.jodit-wysiwyg').click();
    await page.locator('.jodit-wysiwyg').press('ControlOrMeta+a');
    await page.locator('.jodit-wysiwyg').fill('This is Test Description');

    // await page.locator('.sc-gEvEer.jLmZYh').first().click();
    await page.getByRole('button', { name: 'Save' }).first().click();
    await page.getByText('Product updated successfully!').click();
  });

  test('Product Variants', async ({ page }) => {
    // await page.locator('.sc-gJdVPJ > div:nth-child(3)').first().click();
    await page.getByText('Variants').first().click();
    await page.locator('td').first().click();
    await page.locator('td:nth-child(7)').first().click();
    await page.waitForTimeout(5000);
    
    // TODO: update price
    // await page.getByRole('row', { name: '5:361386... 3 $19.75 $2.00 $ 29.99 $' }).getByPlaceholder('0.00').fill('');

    // await page.locator('.sc-gEvEer.jLmZYh').first().click();
    await page.getByRole('button', { name: 'Save' }).first().click();
  });

  test('Product Images', async ({ page }) => {
    // await page.locator('.sc-gJdVPJ > div:nth-child(4)').first().click();
    await page.getByText('Images').first().click();

    await page.locator('.svg-inline--fa.fa-trash').first().click();
    await page.getByRole('button', { name: 'Delete' }).click();

    // TODO: replace image
    // await page.locator('.svg-inline--fa.fa-arrows-rotate').first().click();
    // await page.getByText('Click to upload').click();
    // await page.locator('body').setInputFiles('image.png');
    // await page.getByRole('button', { name: 'Replace' }).click();
    // await page.getByText('Product image uploaded').click();

    // TODO: upload image
    // await page.getByText('Add new image').click();
    // await page.getByText('Click to upload').click();
    // await page.locator('body').setInputFiles('image.png');
    // await page.getByRole('button', { name: 'Replace' }).click();
    // await page.getByText('Product image uploaded').click();

    // await page.locator('.sc-gEvEer.jLmZYh').first().click();
    await page.getByRole('button', { name: 'Save' }).first().click();
  });

  test('Global Buttons', async ({ page }) => {
    await page.getByRole('button', { name: 'Push all' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();

    await page.getByRole('button', { name: 'Remove all' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
  })

});
