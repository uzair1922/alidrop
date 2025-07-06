/// <reference types="cypress" />

describe('login page', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('empty credentials submit', () => {
    cy.get('button[type="submit"]').click()
    cy.contains('Please provide a valid email address')
    cy.contains('This field is required.')
  })

  it('invalid email format', () => {
    cy.get('input[type="email"]').type('invalid-email')
    cy.get('button[type="submit"]').click()
    cy.contains('Please provide a valid email address')
  })

  it('invalid credentials submit', () => {
    cy.get('input[type="email"]').type('invalid@gmail.com')
    cy.get('input[type="password"]').type('invalidPassword')
    cy.get('button[type="submit"]').click()
    cy.contains('Invalid password/email')
  })

  it('forgot password link', () => {
    cy.get('a[href="/forgot-password"]').should('be.visible').click()
    cy.contains('h1', 'Forgot your password?')
  })

  it('create an account link', () => {
    cy.get('a[href="/register"]').should('be.visible').click()
    cy.contains('h1', 'Welcome to AliDrop')
  })

  it('valid credentials submit', () => {
    cy.login()
  })

})