import { test, expect } from '@playwright/test';

function generateRandomEmail() {
  return `testuser_${Date.now()}@example.com`;
}

test.describe('signup page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
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

  test('existing user submit', async ({ page }) => {
    await page.fill('input[type="email"]', 'qa+auto123@spocket.co');
    await page.fill('input[type="string"]', 'Test User');
    await page.click('button[type="submit"]');
    await expect(page.getByText('Email already exists')).toBeVisible();
  });

  test('valid credentials submit', async ({ page }) => {
    await page.fill('input[type="email"]', generateRandomEmail());
    await page.fill('input[type="string"]', 'Test User');
    await page.click('button[type="submit"]');
    // You might want to add an assertion here to check successful registration
  });
});
