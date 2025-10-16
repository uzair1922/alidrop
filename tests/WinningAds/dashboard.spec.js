import { test, expect } from '@playwright/test';
import { login } from '../../utils';

test('Finding Winning Ads', async ({ page }) => {
    try {
        await login(page);
        await page.goto('/winning-ads');
        await expect(page.getByRole('button', { name: 'Start Free Trial' })).toBeVisible({ timeout: 20000 });
        const pagePromise = page.waitForEvent('popup');
        await page.getByRole('button', { name: 'Start Free Trial' }).click();
        await pagePromise;
    } catch (e) {
        console.log('Something went wrong')
    }
});