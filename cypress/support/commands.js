// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', () => {
  cy.session('login', () => {
    cy.visit('/login');
    cy.contains('h1', 'Login');
    cy.get('input[type="email"]').type(Cypress.env('email'));
    cy.get('input[type="password"]').type(Cypress.env('password'));
    cy.get('button[type="submit"]').click();
    cy.contains('h3', 'Welcome');
  });
})

Cypress.Commands.add('checkoutSignup', () => {
  const generateRandomEmail = () => {
    const timestamp = Date.now();
    return `qa+auto${timestamp}@spocket.com`;
  };
  cy.visit('https://staging.alidrop.co/register');
  cy.contains('h1', 'Welcome to AliDrop');
  cy.get('input[type="email"]').type(generateRandomEmail());
  cy.get('input[type="string"]').type("AliDrop QA");
  cy.get('button[type="submit"]').click();
})

Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('Script error')) {
    return false; // Prevent Cypress from failing the test
  }

  if (err.message.includes('401') || err.message.includes('Request failed')) {
    return false; // prevent test from failing
  }
});

//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })