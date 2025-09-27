import { test, expect } from '@playwright/test';
import { login } from '../../utils/index';

test.use({ baseURL: 'https://app.alidrop.co' });
test.setTimeout(60000);

async function openNotificationsPanel(page) {
  // Try to close Intercom if visible (safe no-op if not)
  const intercomClose = page.locator('[data-testid="close-button"]').first();
  if (await intercomClose.isVisible().catch(() => false)) {
    await intercomClose.click().catch(() => {});
  }

  // Your sidebar container
  const sidebar = page.locator('div.sc-dAlyuH.bAoETD').first();
  await sidebar.scrollIntoViewIfNeeded().catch(() => {});
  await expect(sidebar).toBeVisible({ timeout: 15000 });

  // Prefer the <a> link → then <button> → then the label <span>
  const byAnchor = sidebar
    .locator('a[href="/notifications"]:has(span.sidebar-item-label:has-text("Notifications"))')
    .first();
  const byButton = sidebar
    .locator('button:has(span.sidebar-item-label:has-text("Notifications"))')
    .first();
  const byLabel = sidebar
    .locator('span.sidebar-item-label', { hasText: 'Notifications' })
    .first();

  const candidates = [byAnchor, byButton, byLabel];

  let opened = false;
  for (const loc of candidates) {
    if (!(await loc.isVisible().catch(() => false))) continue;

    await loc.scrollIntoViewIfNeeded().catch(() => {});
    await loc.hover().catch(() => {});

    try {
      await loc.click({ timeout: 2000 });
    } catch {
      // Fallback: real mouse click or JS click
      const box = await loc.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.up();
      } else {
        await loc.evaluate(el => el.click());
      }
    }

    // small settle for slide-in animation
    await page.waitForTimeout(300);

    // Did the panel open?
    const panel = page.locator('div.sc-kdBSHD.bjXJKF').first();
    const panelFallback = page
      .locator(
        [
          '[data-testid="notifications-panel"]',
          '[role="dialog"]:has-text("Notifications")',
          '[role="region"]:has-text("Notifications")',
          'aside:has-text("Notifications")'
        ].join(', ')
      )
      .first();

    if (
      (await panel.isVisible().catch(() => false)) ||
      (await panelFallback.isVisible().catch(() => false))
    ) {
      opened = true;
      break;
    }
  }

  if (!opened) throw new Error('Notifications panel did not open after multiple click strategies.');
}

test('Notifications: open right drawer and verify items', async ({ page }) => {
  await login(page);
  await page.goto('/', { timeout: 60000 });

  await openNotificationsPanel(page);

  // Verify panel visible + at least one notification card (generic)
  const panel = page.locator('div.sc-kdBSHD.bjXJKF').first();
  const activePanel = (await panel.isVisible().catch(() => false))
    ? panel
    : page
        .locator(
          '[data-testid="notifications-panel"], [role="dialog"]:has-text("Notifications"), [role="region"]:has-text("Notifications"), aside:has-text("Notifications")'
        )
        .first();

  await expect(activePanel).toBeVisible();

  const item = activePanel.locator('div.sc-tagGq').first();
  await expect(item).toBeVisible({ timeout: 10000 });
});
