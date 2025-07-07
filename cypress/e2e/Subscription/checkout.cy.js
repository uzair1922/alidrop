/// <reference types="cypress" />

describe('Checkout', () => {

  it('Verify Signup URL', () => {
    cy.visit('https://staging.alidrop.co/register');
    cy.contains('h1', 'Welcome to AliDrop');
  });

  it('Checkout Plan', () => {
    cy.checkoutSignup();
    cy.visit('https://staging.alidrop.co/checkout');
    cy.get('button[data-heap="onboarding-new-shopify-store-modal-reject-link"]').should('be.visible').click();
    cy.contains('button', 'Skip').click();
    cy.contains('button', 'Skip').click();
    cy.get('input[id="Field-numberInput"]').should('be.visible');
    cy.get('input[id="Field-numberInput"]').type('4242424242424242');
    cy.get('input[id="Field-expiryInput"]').should('be.visible');
    cy.get('input[id="Field-expiryInput"]').type('12/34');
    cy.get('input[id="Field-cvcInput"]').should('be.visible');
    cy.get('input[id="Field-cvcInput"]').type('123');
    cy.contains('button', 'Claim Your Trial').click();
  });

});
