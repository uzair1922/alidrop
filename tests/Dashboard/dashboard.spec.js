import { test, expect } from '@playwright/test';
import { login } from '../../utils';

test('Check Video Guides & Help Center', async ({ page }) => {
  await login(page);
  await expect(page.getByRole('heading', { name: 'Your Quick Walkthrough' })).toBeVisible({ timeout: 10000 });
  await page.getByText('Welcome to AliDrop2:').click();
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByText('How to import a product?0:').click();
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByText('How to push product to store?0:').click();
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByText('How to check the orders?0:').click();
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByText('How to place sample orders?0:').click();
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByText('How to get access to Winning').click();
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  
  const page1Promise = page.waitForEvent('popup');
  await page.locator('button').filter({ hasText: /^Help Center$/ }).click();
  const page1 = await page1Promise;
  await page1.getByRole('heading', { name: 'AliDrop', exact: true }).click();
});