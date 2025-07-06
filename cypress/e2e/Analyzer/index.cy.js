/// <reference types="cypress" />

import { addProductsToImportList, searchProducts } from "../../support/utils"

describe('product analyzer', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/product-analyzer')
  })

  it('verify url', () => {
    cy.url().should('include', '/product-analyzer')
  })

  it('analyze product with no results', () => {
    searchProducts('https://www.aliexpress.com/item/1234567890.html')
    cy.contains('No products found').should('be.visible')
  })

  it('search product', () => {
    searchProducts(Cypress.env('productUrl'))
    cy.get('[data-testid^="product-card"]').should('have.length.greaterThan', 0)
  })

  it('add products to import list', () => {
    searchProducts(Cypress.env('productUrl'));
    addProductsToImportList(1);
    cy.get('.fa-xmark').click({ force: true });
  })

  it('analyze product', () => {
    searchProducts(Cypress.env('productUrl'));
    cy.get('[data-testid^="product-card"]')
      .should('have.length.greaterThan', 0)
      .then(card => {
        cy.wrap(card)
          .eq(0)
          .as('productCard');
        cy.get('@productCard').trigger('mouseover');
        cy.get('@productCard').within(() => {
          cy.get('.fa-wand-magic-sparkles').click({ force: true });
        })
      })
      cy.get('[data-testid^="product-card"]').should('have.length.greaterThan', 0)
    })

})