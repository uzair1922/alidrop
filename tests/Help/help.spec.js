import { test, expect } from '@playwright/test';
import { login } from '../../utils/index';

test.use({ baseURL: 'https://app.alidrop.co' });

test('Help Center link opens Notion page', async ({ page, context }) => {
  // STEP 1: Login
  await login(page);
  await page.goto('/', { timeout: 60_000 });

  // STEP 2: Scroll to the footer area where the Help Center button lives
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  // Prefer role+name over CSS classes (classes are obfuscated and can change)
  const helpCenterBtn = page.getByRole('button', { name: /^Help Center$/i });

  // If not in view yet, try to bring it into view
  await helpCenterBtn.scrollIntoViewIfNeeded();
  await expect(helpCenterBtn).toBeVisible({ timeout: 15_000 });

  // STEP 3: Click and capture new tab
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    helpCenterBtn.click(),
  ]);

  // STEP 4: Ensure the new tab loads the expected URL
  await newPage.waitForLoadState('domcontentloaded');

  // Some workspaces redirect to a notion.site domain — accept either the canonical or the redirect
  await expect(newPage).toHaveURL(
    /https:\/\/(www\.notion\.so|.+\.notion\.site)\/AliDrop-20a0c13273a280619329ddb6b9101156/i
  );

  // (Optional) sanity: check that Notion loaded something
  // await expect(newPage).toHaveTitle(/Notion|AliDrop/i);
});
