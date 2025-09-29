import { test, expect } from '@playwright/test';
import { login } from '../../utils/index';

test.use({ baseURL: 'https://app.alidrop.co' });
test.setTimeout(120000); // Increased timeout

const MESSENGER_IFRAME = 'iframe[name="intercom-messenger-frame"]';
const LAUNCHER_IFRAME  = 'iframe[name="intercom-launcher-frame"]';

async function openIntercom(page) {
    
  // Try launcher in main DOM first
  const domLauncher = page.locator(
    '[data-testid="launcher-with-badge-cutout-active"], [data-testid="launcher"], [aria-label="Open Intercom Messenger"], .intercom-launcher'
  ).first();

  if (await domLauncher.isVisible({ timeout: 10000 }).catch(() => false)) {
    await domLauncher.click();
  } else {
    // Fallback: launcher inside its own iframe
    const launcherFrame = page.frameLocator(LAUNCHER_IFRAME);
    const buttonInFrame = launcherFrame.locator(
      '[data-testid="launcher"], [aria-label*="Open"], [role="button"], button, .intercom-launcher'
    ).first();
    await expect(buttonInFrame).toBeVisible({ timeout: 20000 });
    await buttonInFrame.click();
  }

  await expect(page.locator(MESSENGER_IFRAME)).toBeVisible({ timeout: 30000 });
  
  // Wait for iframe to be fully loaded
  const frameElement = await page.$(MESSENGER_IFRAME);
  const frame = await frameElement.contentFrame();
  await frame.waitForLoadState('domcontentloaded');
  
  return page.frameLocator(MESSENGER_IFRAME);
}

async function closeIntercom(page) {
  const messenger = page.frameLocator(MESSENGER_IFRAME);

  // 1) Close from messenger header
  const closeInMessenger = messenger.locator(
    '[data-testid="close-button"], [aria-label="Close"], .intercom-close-button'
  ).first();
  if (await closeInMessenger.isVisible({ timeout: 5000 }).catch(() => false)) {
    await closeInMessenger.click();
    await expect(page.locator(MESSENGER_IFRAME)).toBeHidden({ timeout: 10000 });
    return;
  }

  // 2) Fallback: minimize in main DOM
  const minimizeDom = page.locator('[data-testid="launcher-minimize-icon"], .intercom-launcher').first();
  if (await minimizeDom.isVisible({ timeout: 5000 }).catch(() => false)) {
    await minimizeDom.click();
    await expect(page.locator(MESSENGER_IFRAME)).toBeHidden({ timeout: 10000 });
    return;
  }

  // 3) Fallback: minimize in launcher iframe
  const launcherFrame = page.frameLocator(LAUNCHER_IFRAME);
  const minimizeInLauncher = launcherFrame.locator('[data-testid="launcher-minimize-icon"]').first();
  if (await minimizeInLauncher.isVisible({ timeout: 5000 }).catch(() => false)) {
    await minimizeInLauncher.click();
    await expect(page.locator(MESSENGER_IFRAME)).toBeHidden({ timeout: 10000 });
    return;
  }

  console.log('Could not find Intercom close/minimize control - messenger might already be closed');
}

async function findAndUseMessageInput(messenger) {
  console.log('Looking for message input...');
  
  // Wait for Intercom to be fully loaded
  await messenger.locator('body').waitFor({ state: 'visible', timeout: 15000 });
  
  // Strategy 1: Look for common conversation starters
  const conversationStarters = [
    { text: 'Send us a message', exact: false },
    { text: 'Start conversation', exact: false },
    { text: 'New conversation', exact: false },
    { text: 'Get started', exact: false },
    { text: 'Message us', exact: false },
    { text: 'Chat with us', exact: false }
  ];

  for (const starter of conversationStarters) {
    const button = messenger.getByText(starter.text, { exact: starter.exact }).first();
    if (await button.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log(`Found conversation starter: "${starter.text}"`);
      await button.click();
      await messenger.locator('body').waitFor({ state: 'visible' });
      break;
    }
  }

  // Strategy 2: Look for message input with multiple selectors and approaches
  const inputSelectors = [
    'textarea[aria-label*="Message"]',
    'textarea[aria-label*="message"]',
    'textarea[placeholder*="Message"]',
    'textarea[placeholder*="message"]',
    'textarea[id*="message"]',
    'textarea[name*="message"]',
    'textarea',
    'div[contenteditable="true"]',
    '[data-testid*="composer"] textarea',
    '[data-testid*="composer"] div[contenteditable="true"]',
    '.intercom-composer textarea',
    '.intercom-composer div[contenteditable="true"]'
  ];

  let messageInput = null;
  
  for (const selector of inputSelectors) {
    const locator = messenger.locator(selector).first();
    try {
      await expect(locator).toBeVisible({ timeout: 5000 });
      messageInput = locator;
      console.log(`Found message input with selector: ${selector}`);
      break;
    } catch {
      continue;
    }
  }

  if (!messageInput) {
    // Strategy 3: Try to click on the composer area
    const composerArea = messenger.locator('[data-testid*="composer"], .intercom-composer, [class*="composer"]').first();
    if (await composerArea.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Clicking on composer area to activate input');
      await composerArea.click();
      
      // Try finding input again after click
      for (const selector of inputSelectors) {
        const locator = messenger.locator(selector).first();
        if (await locator.isVisible({ timeout: 3000 }).catch(() => false)) {
          messageInput = locator;
          console.log(`Found message input after composer click: ${selector}`);
          break;
        }
      }
    }
  }

  if (!messageInput) {
    throw new Error('Could not find message input in Intercom messenger');
  }

  return messageInput;
}

test('Intercom full flow: Recent → Send msg → Back → Messages → Close', async ({ page }) => {
  // STEP 1: Login
  await login(page);
  await page.goto('/', { timeout: 60000 });

  // STEP 2: Open Intercom
  console.log('Opening Intercom...');
  const messenger = await openIntercom(page);
  console.log('Intercom opened successfully');

  // STEP 3: Check if "Recent message" exists and handle both scenarios
  const recentMessageButton = messenger.getByText('Recent message', { exact: true });
  
  if (await recentMessageButton.isVisible({ timeout: 10000 }).catch(() => false)) {
    // Scenario 1: Recent messages exist
    console.log('Recent messages found - proceeding with full flow');
    
    // Click "Recent message"
    await recentMessageButton.click();

    // Optional: Click "Send us a message" if shown
    const sendUs = messenger.getByText('Send us a message', { exact: true });
    if (await sendUs.isVisible({ timeout: 5000 }).catch(() => false)) {
      await sendUs.click();
    }

    // Find and use message input
    const textarea = await findAndUseMessageInput(messenger);
    
    // Type and send message
    const testMessage = 'This is an automated test message ' + Date.now();
    await textarea.fill(testMessage);
    await textarea.press('Enter');
    console.log('Message sent successfully');

    // Navigate back and to messages
    await messenger.locator('[data-testid="go-back"], [aria-label*="back"], button:has-text("Back")').first().click();
    await page.waitForTimeout(3000);
    await messenger.locator('[data-testid="messages"], [aria-label*="messages"], button:has-text("Messages")').first().click();

  } else {
    // Scenario 2: No recent messages
    console.log('No recent messages found - proceeding with direct message flow');
    
    // Find and use message input directly
    const textarea = await findAndUseMessageInput(messenger);
    
    // Type and send message
    const testMessage = 'This is an automated test message ' + Date.now();
    await textarea.fill(testMessage);
    await textarea.press('Enter');
    console.log('Message sent successfully');

    // Wait a moment for the message to be sent
    await page.waitForTimeout(3000);
  }

  // STEP 4: Close Intercom
  console.log('Closing Intercom...');
  await closeIntercom(page);

  // Validate messenger is closed
  await expect(page.locator(MESSENGER_IFRAME)).toBeHidden({ timeout: 10000 });
  console.log('Intercom closed successfully - Test completed');
});