import { test, expect } from '@playwright/test';
import { login } from '../../utils/index';

test.use({ baseURL: 'https://app.alidrop.co' });
test('Help Center link opens Notion page', async ({ page, context }) => {
  await login(page);
  await page.goto('/', { timeout: 60_000 });

  // Scroll to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  // Get the last Help Center button (usually the one in footer)
  const helpCenterBtn = page.getByRole('button', { name: /^Help Center$/i }).last();
  
  await helpCenterBtn.scrollIntoViewIfNeeded();
  await expect(helpCenterBtn).toBeVisible({ timeout: 15_000 });

  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    helpCenterBtn.click(),
  ]);

  await newPage.waitForLoadState('domcontentloaded');
  await expect(newPage).toHaveURL(
    /https:\/\/(www\.notion\.so|.+\.notion\.site)\/AliDrop-20a0c13273a280619329ddb6b9101156/i
  );
});
