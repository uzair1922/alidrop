/// <reference types="cypress" />

const { generateRandomEmail } = require("../../support/utils")

describe('signup page', () => {
  beforeEach(() => {
    cy.visit('/register')
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

  it('existing user submit', () => {
    cy.get('input[type="email"]').type(Cypress.env('email'))
    cy.get('input[type="string"]').type('Test User')
    cy.get('button[type="submit"]').click()
    cy.contains('Email already exists')
  })
  
  it('valid credentials submit', () => {
    cy.get('input[type="email"]').type(generateRandomEmail())
    cy.get('input[type="string"]').type('Test User')
    cy.get('button[type="submit"]').click()
  })

})