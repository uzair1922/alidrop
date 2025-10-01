import { expect } from "@playwright/test";

export async function login(page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', "qa+auto123@spocket.co");
  await page.fill('input[type="password"]', 'Spocket@2025');
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'));
}

/**
   * Utility function to add multiple products to the import list
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {number} count - Number of products to add
  */
 export async function addProductsToImportList(page, count = 1) {
  await page.waitForSelector('[data-testid^="product-card"]', { timeout: 60000 });
  const productCards = page.locator('[data-testid^="product-card"]');
  const cardCount = await productCards.count();

  const numToAdd = Math.min(count, cardCount);

  for (let i = 0; i < numToAdd; i++) {
    const card = productCards.nth(i);

    await card.hover();

    const button = card.getByRole('button', { name: /Add(ed)? to import list/i });

    if (await button.isVisible()) {
      const text = (await button.textContent())?.trim();
      if (text === 'Add to Import List') {
        await button.click({ force: true });
        // Optionally wait for confirmation like:
        // await card.getByText('Added to import list').waitFor();
      } else if (text === 'Added to import list') {
        console.log(`ℹ️ Product ${i + 1} already in import list`);
      }
    }
  }
}

/**
 * Searches a product via URL
 * @param {import('@playwright/test').Page} page 
 * @param {string} url 
 */
export async function searchProducts(page, url) {
  await page.setViewportSize({ width: 1536, height: 960 }); // equivalent to macbook-16
  await page.fill('input[type="string"]', url);
  await page.getByRole('button', { name: /search/i }).click();
}

/**
 * Adds products to import list
 * @param {import('@playwright/test').Page} page 
 * @param {number} count 
 */
// export async function addProductsToImportList(page, count = 1) {
//   const productCards = page.locator('[data-testid^="product-card"]');
//   const cardCount = await productCards.count();
//   const numToAdd = Math.min(count, cardCount);

//   for (let i = 0; i < numToAdd; i++) {
//     const card = productCards.nth(i);
//     await card.hover();
//     const button = card.getByRole('button', { name: /Add(ed)? to import list/i });

//     if (await button.isVisible()) {
//       const text = (await button.textContent())?.trim();
//       if (text === 'Add to Import List') {
//         await button.click({ force: true });
//       } else {
//         console.log(`ℹ️ Product ${i + 1} already in import list`);
//       }
//     }
//   }
// }

export async function verifyCount(page, expectedCount = 1, addToList = false) {
  try {
    await page.waitForSelector('[data-testid^="product-card"]', { timeout: 20000 });
    const cards = page.locator('[data-testid^="product-card"]');
    const count = await cards.count();
    try {
      expect(count).toBeGreaterThan(expectedCount);
    } catch (e) {
      expect(page.getByText('No products found')).toBeVisible();
    }
  
    if (addToList) {
      const card = cards.nth(0);
      await card.hover();
      await card.locator('.fa-wand-magic-sparkles').click({ force: true });
    }

    return true
  } catch (e) {
    expect(page.getByText('No products found')).toBeVisible();
    return false
  }

}

export async function verifySampleOrderCount(page, expectedCount = 1) {
  try {
    await expect(page.getByText('No orders found')).toBeVisible({ timeout: 10000 });
    return;
  } catch (e) {
    // no action needed
  }

  await page.waitForSelector('[data-testid^="order-container"]', { timeout: 20000 });
  const cards = page.locator('[data-testid^="order-container"]');
  const count = await cards.count();
  try {
    expect(count).toBeGreaterThan(expectedCount);
  } catch (e) {
    expect(page.getByText('No orders found')).toBeVisible();
  }
}