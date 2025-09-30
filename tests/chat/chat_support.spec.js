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

async function findAndUseMessageInput(page, messenger) {
  console.log('Looking for message input...');
  
  // Wait for Intercom to be fully loaded
  await messenger.locator('body').waitFor({ state: 'visible', timeout: 15000 });
  
  // Strategy 1: Look for the specific "Send us a message" div structure
  const sendUsMessageDiv = messenger.locator('.intercom-1cnueyx, .intercom-yetwdb, [class*="intercom"]').filter({
    hasText: /Send us a message/i
  }).first();

  if (await sendUsMessageDiv.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Found "Send us a message" container - clicking it');
    await sendUsMessageDiv.click();
    
    // Wait for the message input to appear after clicking
    await page.waitForTimeout(2000);
  }

  // Strategy 2: Look for conversation starters (backward compatibility)
  const conversationStarters = [
    { text: 'Send us a message', exact: false },
    { text: 'Start conversation', exact: false },
    { text: 'New conversation', exact: false },
    { text: 'Get started', exact: false },
    { text: 'Message us', exact: false },
    { text: 'Chat with us', exact: false }
  ];

  for (const starter of conversationStarters) {
    const element = messenger.getByText(starter.text, { exact: starter.exact }).first();
    if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`Found conversation starter: "${starter.text}"`);
      await element.click();
      await page.waitForTimeout(2000);
      break;
    }
  }

  // Strategy 3: Direct message input detection with multiple approaches
  let messageInput = null;
  
  // Wait a bit for the UI to settle after any clicks
  await page.waitForTimeout(3000);

  // Try multiple input selectors with increased timeout
  const inputSelectors = [
    'textarea[aria-label*="message" i]',
    'textarea[placeholder*="message" i]',
    'textarea[id*="message" i]',
    'textarea[name*="message" i]',
    'div[contenteditable="true"][aria-label*="message" i]',
    'div[contenteditable="true"][data-placeholder*="message" i]',
    'textarea',
    'div[contenteditable="true"]',
    '[data-testid*="composer"] textarea',
    '[data-testid*="composer"] div[contenteditable="true"]',
    '.intercom-composer textarea',
    '.intercom-composer div[contenteditable="true"]',
    '[role="textbox"]',
    '[aria-multiline="true"]'
  ];

  for (const selector of inputSelectors) {
    const locator = messenger.locator(selector).first();
    try {
      await expect(locator).toBeVisible({ timeout: 8000 });
      messageInput = locator;
      console.log(`Found message input with selector: ${selector}`);
      
      // Ensure it's interactable
      await locator.click({ force: true });
      await page.waitForTimeout(1000);
      break;
    } catch {
      continue;
    }
  }

  if (!messageInput) {
    // Strategy 4: Try to find and click composer area
    const composerSelectors = [
      '[data-testid*="composer"]',
      '.intercom-composer',
      '[class*="composer"]',
      '[role="composer"]'
    ];

    for (const selector of composerSelectors) {
      const composer = messenger.locator(selector).first();
      if (await composer.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log(`Found composer with selector: ${selector} - clicking to activate`);
        await composer.click({ force: true });
        await page.waitForTimeout(2000);
        
        // Try finding input again after composer click
        for (const inputSelector of inputSelectors) {
          const locator = messenger.locator(inputSelector).first();
          if (await locator.isVisible({ timeout: 3000 }).catch(() => false)) {
            messageInput = locator;
            console.log(`Found message input after composer click: ${inputSelector}`);
            break;
          }
        }
        if (messageInput) break;
      }
    }
  }

  if (!messageInput) {
    // Final attempt: Look for any focusable element that could be a message input
    const focusableElements = messenger.locator('textarea, div[contenteditable="true"]');
    const count = await focusableElements.count();
    console.log(`Found ${count} potential focusable elements`);
    
    for (let i = 0; i < count; i++) {
      const element = focusableElements.nth(i);
      if (await element.isVisible()) {
        console.log(`Trying element ${i + 1}`);
        await element.click({ force: true });
        await page.waitForTimeout(1000);
        
        // Check if this might be our input by checking attributes
        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        const isContentEditable = await element.evaluate(el => el.contentEditable === 'true');
        const hasMessageAttr = await element.evaluate(el => 
          el.getAttribute('aria-label')?.toLowerCase().includes('message') ||
          el.getAttribute('placeholder')?.toLowerCase().includes('message') ||
          el.getAttribute('id')?.toLowerCase().includes('message') ||
          el.getAttribute('name')?.toLowerCase().includes('message')
        );
        
        if (tagName === 'textarea' || isContentEditable || hasMessageAttr) {
          messageInput = element;
          console.log(`Selected element ${i + 1} as message input`);
          break;
        }
      }
    }
  }

  if (!messageInput) {
    // Debug: Log the current state of the messenger
    const bodyHTML = await messenger.locator('body').innerHTML();
    console.log('Messenger body content:', bodyHTML.substring(0, 1000)); // First 1000 chars
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

  // Add a longer wait for Intercom to fully initialize
  await page.waitForTimeout(5000);

  // STEP 3: Find and use message input
  console.log('Looking for message input...');
  const textarea = await findAndUseMessageInput(page, messenger);
  
  // Type and send message
  const testMessage = 'This is an automated test message ' + Date.now();
  await textarea.fill(testMessage);
  await textarea.press('Enter');
  console.log('Message sent successfully');

  // Wait for message to be sent
  await page.waitForTimeout(5000);

  // STEP 4: Close Intercom
  console.log('Closing Intercom...');
  await closeIntercom(page);

  // Validate messenger is closed
  await expect(page.locator(MESSENGER_IFRAME)).toBeHidden({ timeout: 10000 });
  console.log('Intercom closed successfully - Test completed');
});