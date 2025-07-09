import { test, expect } from '@playwright/test';

test.describe('login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('empty credentials submit', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.getByText('Please provide a valid email address')).toBeVisible();
    await expect(page.getByText('This field is required.')).toBeVisible();
  });

  test('invalid email format', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.getByText('Please provide a valid email address')).toBeVisible();
  });

  test('invalid credentials submit', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@gmail.com');
    await page.fill('input[type="password"]', 'invalidPassword');
    await page.click('button[type="submit"]');
    await expect(page.getByText('Invalid password/email')).toBeVisible();
  });

  test('forgot password link', async ({ page }) => {
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
    await page.click('a[href="/forgot-password"]');
    await expect(page.locator('h1')).toHaveText(/Forgot your password?/i);
  });

  test('create an account link', async ({ page }) => {
    await expect(page.locator('a[href="/register"]')).toBeVisible();
    await page.click('a[href="/register"]');
    await expect(page.locator('h1')).toHaveText(/Welcome to AliDrop/i);
  });

  test('valid credentials submit', async ({ page }) => {
    await login(page); // custom helper
  });
});

// ------------------
// Helper
// ------------------

async function login(page) {
  await page.fill('input[type="email"]', "qa+auto123@spocket.co");
  await page.fill('input[type="password"]', 'Spocket@2025');
  await page.click('button[type="submit"]');
  await expect(page).not.toHaveURL(/\/login/);
}
