import { test, expect } from '@playwright/test';
import { login } from '../../utils';

test.describe('Account Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/settings/account', { timeout: 60000 });
  });

  test('Verify url', async ({ page }) => {
    await expect(page).toHaveURL(/\/settings\/account/);
  });

  test('Check account details', async ({ page }) => {
    await expect(page.getByText('Your store')).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('link', { name: 'qa-spotst.myshopify.com' })).toBeVisible();
    await expect(page.getByText('Account name')).toBeVisible();
    const yourNameInput = page.getByRole('textbox', { name: 'Yourname' });
    await expect(yourNameInput).toBeVisible();
    await expect(yourNameInput).toHaveValue('Prinz');

    const emailInput = page.getByRole('textbox', { name: 'Email address' });
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveValue('qa+auto123@spocket.co');
    await expect(page.getByText('Email address')).toBeVisible();

    await expect(page.getByText('Language Preference')).toBeVisible();
    await expect(page.getByRole('button', { name: 'English' })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
    await page.getByRole('button', { name: 'Sign Out' }).click();
  });

  test('Change password', async ({ page }) => {
    const password = "Spocket@2025";

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(password);
    await passwordInputs.nth(1).fill(password);
    await passwordInputs.nth(2).fill(password);

    await page.locator('.svg-inline--fa.fa-eye').first().click();
    await page.locator('.svg-inline--fa.fa-eye').nth(1).click();
    await page.locator('.svg-inline--fa.fa-eye').last().click();

    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Save")').last().click({ force: true });
  });
});
