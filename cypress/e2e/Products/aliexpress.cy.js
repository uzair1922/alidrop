/// <reference types="cypress" />

const { addProductsToImportList } = require("../../support/utils");

describe('Find Products on AliExpress Page', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/aliexpress-products', { timeout: 60000 });
  });

  it('Verify url', () => {
    cy.url().should('include', '/aliexpress-products');
  });

  it('Add multiple products to import list', () => {
    addProductsToImportList(4);
  });

});
