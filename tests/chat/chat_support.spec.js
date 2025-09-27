import { test, expect } from '@playwright/test';
import { login } from '../../utils/index';

test.use({ baseURL: 'https://app.alidrop.co' });
test.setTimeout(60_000);

const MESSENGER_IFRAME = 'iframe[name="intercom-messenger-frame"]';
const LAUNCHER_IFRAME  = 'iframe[name="intercom-launcher-frame"]';

async function openIntercom(page) {
  // Try launcher in main DOM first
  const domLauncher = page.locator(
    '[data-testid="launcher-with-badge-cutout-active"], [data-testid="launcher"], [aria-label="Open Intercom Messenger"]'
  ).first();

  if (await domLauncher.isVisible().catch(() => false)) {
    await domLauncher.click();
  } else {
    // Fallback: launcher inside its own iframe
    const launcherFrame = page.frameLocator(LAUNCHER_IFRAME);
    const buttonInFrame = launcherFrame.locator(
      '[data-testid="launcher"], [aria-label*="Open"], [role="button"], button'
    ).first();
    await expect(buttonInFrame).toBeVisible({ timeout: 20_000 });
    await buttonInFrame.click();
  }

  await expect(page.locator(MESSENGER_IFRAME)).toBeVisible({ timeout: 20_000 });
  return page.frameLocator(MESSENGER_IFRAME);
}

async function closeIntercom(page) {
  const messenger = page.frameLocator(MESSENGER_IFRAME);

  // 1) Close from messenger header
  const closeInMessenger = messenger.locator(
    '[data-testid="close-button"], [aria-label="Close"]'
  ).first();
  if (await closeInMessenger.isVisible().catch(() => false)) {
    await closeInMessenger.click();
    await expect(page.locator(MESSENGER_IFRAME)).toBeHidden();
    return;
  }

  // 2) Fallback: minimize in main DOM
  const minimizeDom = page.locator('[data-testid="launcher-minimize-icon"]').first();
  if (await minimizeDom.isVisible().catch(() => false)) {
    await minimizeDom.click();
    await expect(page.locator(MESSENGER_IFRAME)).toBeHidden();
    return;
  }

  // 3) Fallback: minimize in launcher iframe
  const launcherFrame = page.frameLocator(LAUNCHER_IFRAME);
  const minimizeInLauncher = launcherFrame.locator('[data-testid="launcher-minimize-icon"]').first();
  if (await minimizeInLauncher.isVisible().catch(() => false)) {
    await minimizeInLauncher.click();
    await expect(page.locator(MESSENGER_IFRAME)).toBeHidden();
    return;
  }

  throw new Error('Could not find Intercom close/minimize control.');
}

test('Intercom full flow: Recent → Send msg → Back → Messages → Close', async ({ page }) => {
  // STEP 1: Login
  await login(page);
  await page.goto('/', { timeout: 60_000 });

  // STEP 2: Open Intercom
  const messenger = await openIntercom(page);

  // STEP 3: Click "Recent message"
  await messenger.getByText('Recent message', { exact: true }).click();

  // STEP 4 (optional UI step): Click "Send us a message" if shown
  const sendUs = messenger.getByText('Send us a message', { exact: true });
  if (await sendUs.isVisible().catch(() => false)) {
    await sendUs.click();
  }

  // STEP 5: Type random words in the message box and press Enter
  const textarea = messenger.locator('textarea[aria-label^="Message"]'); // avoids special ellipsis char
  await expect(textarea).toBeVisible();
  await textarea.fill('This is an automated test message ' + Date.now());
  await textarea.press('Enter');

  // STEP 6: Click on back button
  await messenger.locator('[data-testid="go-back"]').click();

  // STEP 7: Wait 5 seconds, then click Messages tab
  await page.waitForTimeout(5000);
  await messenger.locator('[data-testid="messages"]').click();

  // STEP 8: Close Intercom (from within iframe, with fallbacks)
  await closeIntercom(page);

  // Validate messenger is closed
  await expect(page.locator(MESSENGER_IFRAME)).toBeHidden();
});
