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

  test('Change password', async ({ page }) => {
    const password = "Spocket@2025";

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(password);
    await passwordInputs.nth(1).fill(password);
    await passwordInputs.nth(2).fill(password);

    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Save")').last().click({ force: true });
  });
});
