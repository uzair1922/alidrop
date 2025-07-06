/// <reference types="cypress" />

describe('Account Settings', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/account', { timeout: 60000 });
  });

  it('Verify url', () => {
    cy.url().should('include', '/settings/account');
  });

  it('Change password', () => {
    cy.get('input[type="password"]').first().type(Cypress.env('password'));
    cy.get('input[type="password"]').eq(1).type(Cypress.env('password'));
    cy.get('input[type="password"]').last().type(Cypress.env('password'));
    cy.wait(1000); // Wait for the input to be filled
    cy.contains('button', 'Save').last().click({ force: true });
  });

});
