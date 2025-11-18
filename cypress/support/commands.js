// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Custom command to login to the application
 * Usage: cy.login()
 * Or with custom credentials: cy.login('custom@email.com', 'CustomPassword123')
 */
Cypress.Commands.add('login', (email, password) => {
  const userEmail = email || Cypress.env('email')
  const userPassword = password || Cypress.env('password')

  cy.visit('/')
  cy.wait(1000) // Aguardar possíveis erros de hidratação
  
  // Open login modal
  cy.get('[data-cy=header-login-button]').click()
  
  // Fill login form
  cy.get('[data-cy=login-email-input]', { timeout: 10000 }).type(userEmail)
  cy.get('[data-cy=login-password-input]').type(userPassword)
  cy.get('[data-cy=login-submit-button]').click()
  
  // Wait for successful login (redirects to /home)
  cy.url({ timeout: 10000 }).should('include', '/home')
})

/**
 * Custom command to logout from the application
 * Usage: cy.logout()
 */
Cypress.Commands.add('logout', () => {
  // Adjust based on your logout implementation
  cy.get('[data-cy=logout-button]').click()
})

/**
 * Custom command to register a new user
 * Usage: cy.register('Nome', 'email@test.com', 'Senha@123')
 */
Cypress.Commands.add('register', (name, email, password) => {
  cy.visit('/')
  cy.wait(1000) // Aguardar possíveis erros de hidratação
  
  // Open login modal and go to register tab
  cy.get('[data-cy=header-login-button]').click()
  cy.get('[data-cy=create-account-tab]', { timeout: 10000 }).click()
  
  // Fill registration form
  cy.get('[data-cy=register-name-input]').type(name)
  cy.get('[data-cy=register-email-input]').type(email)
  cy.get('[data-cy=register-password-input]').type(password)
  cy.get('[data-cy=register-confirm-password-input]').type(password)
  cy.get('[data-cy=register-submit-button]').click()
  
  // Wait for successful registration
  cy.get('[data-cy=login-tab]', { timeout: 5000 }).should('be.visible')
})

/**
 * Custom command to open the login modal
 * Usage: cy.openLoginModal()
 */
Cypress.Commands.add('openLoginModal', () => {
  cy.visit('/')
  cy.wait(1000) // Aguardar possíveis erros de hidratação
  cy.get('[data-cy=header-login-button]').click()
  cy.get('[data-cy=login-tab]', { timeout: 10000 }).should('be.visible')
})

/**
 * Custom command to initiate password recovery
 * Usage: cy.forgotPassword('email@test.com')
 */
Cypress.Commands.add('forgotPassword', (email) => {
  const userEmail = email || Cypress.env('email')
  
  cy.visit('/')
  cy.wait(1000) // Aguardar possíveis erros de hidratação
  cy.get('[data-cy=header-login-button]').click()
  cy.get('[data-cy=forgot-password-link]', { timeout: 10000 }).click()
  cy.get('[data-cy=forgot-password-email-input]', { timeout: 10000 }).type(userEmail)
  cy.get('[data-cy=forgot-password-submit-button]').click()
})
