```md
# 🧪 Cypress E2E Test Suite

This repository contains end-to-end tests for the web application using [Cypress](https://www.cypress.io/), a modern JavaScript-based testing framework built for fast, reliable testing of anything that runs in the browser.

---

## 🚀 Project Overview

This test suite verifies key user flows and UI interactions across the app, including:

- User login
- Product listing on `/aliexpress-products` page
- Hover-based interaction with product cards
- Import-to-list button click behavior

---

## 📁 Folder Structure

```

cypress/
├── e2e/                # Test specs
│   └── aliexpress.cy.js
├── fixtures/           # Mock data (if any)
├── support/            # Reusable commands and config
│   ├── commands.js
│   └── e2e.js
cypress.config.js       # Cypress config file

````

---

## 🛠️ Setup & Installation

### 1. Clone the repo
```bash

````

### 2. Install dependencies

```bash
npm install
```

### 3. Start your app (in a separate terminal)

```bash
npm run dev
# or however you start your app
```

### 4. Run Cypress

#### Open Cypress Test Runner

```bash
npx cypress open
```

#### Or run headless (CLI)

```bash
npx cypress run
```

---

## 🧪 Example Test Case: Product Import

```js
it('adds a product to the import list', () => {
  cy.login();
  cy.visit('/aliexpress-products');

  cy.get('[data-testid^="product-card"]').first().as('firstProduct');
  cy.get('@firstProduct').trigger('mouseover');

  cy.get('@firstProduct').within(() => {
    cy.contains(/add to import list/i, { timeout: 5000 })
      .then($btn => {
        cy.wrap($btn).click({ force: true });
        cy.contains(/added to import list/i, { timeout: 5000 }).should('be.visible');
      })
      .catch(() => {
        cy.contains(/added to import list/i, { timeout: 5000 }).should('be.visible');
      });
  });
});
```

---

## 🔐 Authentication

This repo uses a custom Cypress command for login located in:

```js
// cypress/support/commands.js
Cypress.Commands.add('login', () => {
  // your login logic here
});
```

Update this to suit your app’s auth strategy (JWT, session, cookies, etc.).

---

## 📦 Dependencies

* [Cypress](https://www.npmjs.com/package/cypress)

Install via:

```bash
npm install --save-dev cypress
```

---

## ✅ Best Practices

* Use `data-testid` attributes for stable selectors
* Avoid relying on text-only selectors (`cy.contains`) when possible
* Always hover first before checking hover-only UI

---

## 🧪 Continuous Integration (CI)

You can run Cypress tests in CI using GitHub Actions or tools like CircleCI, GitLab CI, etc. Example GitHub Actions file:

```yaml
name: Run Cypress Tests

on: [push, pull_request]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build
      - run: npx cypress run
```

---

## 📄 License

[MIT](./LICENSE)

---

> Want to customize this README with badges, coverage reports, or CI links? Just ask!
