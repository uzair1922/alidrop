```md
# 🎭 Playwright E2E Test Suite

This repository contains end-to-end tests using [Playwright](https://playwright.dev/), a powerful framework for reliable and fast browser automation.

Playwright tests ensure critical user flows work as expected across major browsers (Chromium, Firefox, and WebKit).

---

## 🚀 Features Tested

- Authentication with custom login logic
- Product listing on `/aliexpress-products`
- Hover interaction on product cards
- Import-to-list functionality
- Validation for already-added products

---

## 🧱 Project Structure

```

tests/
├── aliexpress.spec.js        # AliExpress product tests
├── utils.js                  # Reusable helper functions
playwright.config.js          # Global config for Playwright

````

---

### 2. Install dependencies

```bash
npm install
```

### 3. Install Playwright browsers

```bash
npx playwright install
```

---

## ▶️ Running Tests

### Headed (UI mode)

```bash
npx playwright test --headed
```

### Headless (CI mode)

```bash
npx playwright test
```

### Run a specific file

```bash
npx playwright test tests/aliexpress.spec.js
```

---

## 🧪 Example Test: Add to Import List

```ts
import { test, expect } from '@playwright/test';

test('Add first product to import list', async ({ page }) => {
  // Login with a custom function
  await login(page);

  await page.goto('/aliexpress-products');

  const firstProduct = page.locator('[data-testid^="product-card"]').first();
  await firstProduct.hover();

  const addButton = firstProduct.getByText('Add to Import List', { exact: true });
  const addedLabel = firstProduct.getByText('Added to import list', { exact: true });

  if (await addButton.isVisible()) {
    await addButton.click();
    await expect(addedLabel).toBeVisible();
    console.log('✅ Product successfully added to import list');
  } else {
    await expect(addedLabel).toBeVisible();
    console.log('ℹ️ Product is already in import list');
  }
});
```

---

## 🔐 Authentication

You can define a reusable login function in `tests/utils.ts`:

```ts
export async function login(page: Page) {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'your-email@example.com');
  await page.fill('[data-testid="password"]', 'your-password');
  await page.click('[data-testid="login-button"]');
}
```

Then import it in your test:

```ts
import { login } from './utils';
```

---

## 🧪 Run in UI Debug Mode

```bash
npx playwright test --debug
```

---

## 🌐 Cross-Browser Testing

To run tests in **all 3 browsers** (Chromium, Firefox, WebKit):

```bash
npx playwright test --project=all
```

---

## 📦 Dependencies

* [Playwright](https://playwright.dev/)
* TypeScript (optional)

Install via:

```bash
npm install --save-dev @playwright/test
```

---

## 🛡 License

[MIT](./LICENSE)
