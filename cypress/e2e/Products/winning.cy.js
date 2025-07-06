/// <reference types="cypress" />

const { addProductsToImportList } = require("../../support/utils");

describe('Find Products on Winning Page', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/winning-products', { timeout: 60000 });
  });

  it('Verify url', () => {
    cy.url().should('include', '/winning-products');
  });

  it('Add multiple products to import list', () => {
    addProductsToImportList(4);
  });

});
