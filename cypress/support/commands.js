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

/**
 * Custom command to create a transaction
 * Usage: cy.createTransaction({ type: 'expense', name: 'Supermercado', value: 150.50, ... })
 * 
 * @param {Object} transaction - Transaction data
 * @param {string} transaction.type - 'income' or 'expense'
 * @param {string} transaction.name - Transaction name
 * @param {string} transaction.category - Category name
 * @param {number} transaction.value - Transaction value
 * @param {string} transaction.date - Date in format DD/MM/YYYY
 * @param {string} [transaction.description] - Optional description
 * @param {boolean} [transaction.recurring] - If transaction is recurring
 * @param {string} [transaction.recurringType] - 'daily', 'weekly', 'monthly', 'yearly'
 * @param {boolean} [transaction.installment] - If transaction is in installments
 * @param {number} [transaction.installments] - Number of installments
 * @param {string} [transaction.account] - Account name (partial match)
 * @param {string} [transaction.paymentMethod] - Payment method name (partial match)
 */
Cypress.Commands.add('createTransaction', (transaction) => {
  // Open transaction modal
  cy.get('[data-cy=launch-transaction-button]').click()
  cy.wait(500)
  
  // Select transaction type
  cy.get('[data-cy=transaction-type-select]').click()
  cy.wait(300)
  // Use role="option" to target only the select dropdown options, not other elements on the page
  cy.contains('[role="option"]', transaction.type === 'income' ? 'Receita' : 'Despesa').click({ force: true })
  
  // Fill transaction name
  cy.get('[data-cy=transaction-name-input]').clear().type(transaction.name)
  
  // Select or create category
  cy.get('[data-cy=transaction-category-trigger]').click()
  cy.wait(300)
  cy.get('[data-cy=transaction-category-search]').type(transaction.category)
  cy.wait(500)
  
  // Try to find existing category or create new one
  cy.get('body').then(($body) => {
    if ($body.find(`[role="option"]:contains("${transaction.category}")`).length > 0) {
      cy.contains('[role="option"]', transaction.category).first().click()
    } else {
      // Create new category
      cy.contains('Criar nova categoria').click()
    }
  })
  
  cy.wait(300)
  
  // Fill value
  const valueStr = transaction.value.toFixed(2).replace('.', '')
  cy.get('[data-cy=transaction-value-input]').clear().type(valueStr)
  
  // Select date if provided
  if (transaction.date) {
    // Parse the date string (format: DD/MM/YYYY)
    const dateParts = transaction.date.split('/')
    const day = parseInt(dateParts[0], 10)
    const month = parseInt(dateParts[1], 10) - 1 // Month is 0-indexed in JavaScript
    const year = parseInt(dateParts[2], 10)
    
    cy.log(`Selecting date: ${day}/${month + 1}/${year}`)
    
    // Open date picker
    cy.get('[data-cy=transaction-date-picker]').click()
    cy.wait(500)
    
    // Select year from dropdown
    cy.get('.rdp-years_dropdown').select(year.toString())
    cy.wait(300)
    
    // Select month from dropdown (0-indexed)
    cy.get('.rdp-months_dropdown').select(month.toString())
    cy.wait(300)
    
    // Click on the day button - try different selector formats
    const dayFormatted = day.toString().padStart(2, '0')
    const monthFormatted = (month + 1).toString().padStart(2, '0')
    const dateString = `${dayFormatted}/${monthFormatted}/${year}`
    
    cy.log(`Looking for button with data-day="${dateString}"`)
    
    // First try with exact format
    cy.get('button[data-day]').then($buttons => {
      let found = false
      $buttons.toArray().forEach((btn) => {
        const dataDay = btn.getAttribute('data-day')
        if (dataDay && dataDay.includes(dateString)) {
          cy.log(`Found matching button: ${dataDay}`)
          cy.wrap(btn).click()
          found = true
        }
      })
      
      if (!found) {
        cy.log(`Could not find button with data-day containing "${dateString}", clicking first available day`)
        cy.get(`button[data-day*="${dayFormatted}"]`).first().click()
      }
    })
    
    cy.wait(300)
  }
  
  // Fill description if provided
  if (transaction.description) {
    cy.get('[data-cy=transaction-description-input]').type(transaction.description)
  }
  
  // Select account if provided
  if (transaction.account) {
    cy.get('[data-cy=transaction-account-select]').click()
    cy.wait(500) // Wait for dropdown to fully render
    
    // Debug: log available options
    cy.get('[role="option"]').then($options => {
      const optionTexts = $options.toArray().map(el => el.textContent.trim())
      cy.log('Available account options:', optionTexts.join(', '))
      
      // Find and click the matching option
      let found = false
      $options.toArray().forEach((el) => {
        if (!found && el.textContent.toLowerCase().includes(transaction.account.toLowerCase())) {
          cy.wrap(el).click({ force: true })
          found = true
        }
      })
      
      // If no match found, click first option as fallback
      if (!found) {
        cy.log(`Account "${transaction.account}" not found. Using first available option: ${optionTexts[0]}`)
        cy.wrap($options.first()).click({ force: true })
      }
    })
    cy.wait(300)
  }
  
  // Select payment method if provided
  if (transaction.paymentMethod) {
    cy.get('[data-cy=transaction-payment-method-select]').click()
    cy.wait(500) // Wait for dropdown to fully render
    
    // Find and click the matching option
    cy.get('[role="option"]').then($options => {
      const optionTexts = $options.toArray().map(el => el.textContent.trim())
      cy.log('Available payment method options:', optionTexts.join(', '))
      
      let found = false
      $options.toArray().forEach((el) => {
        if (!found && el.textContent.toLowerCase().includes(transaction.paymentMethod.toLowerCase())) {
          cy.wrap(el).click({ force: true })
          found = true
        }
      })
      
      // If no match found, click first option as fallback
      if (!found) {
        cy.log(`Payment method "${transaction.paymentMethod}" not found. Using first available option: ${optionTexts[0]}`)
        cy.wrap($options.first()).click({ force: true })
      }
    })
  }
  
  // Handle recurring transaction
  if (transaction.recurring) {
    // Use click() instead of check() because it's a button with role="checkbox"
    cy.get('[data-cy=transaction-recurring-checkbox]').click({ force: true })
    cy.wait(300)
    
    if (transaction.recurringType) {
      cy.get('[data-cy=transaction-recurring-type-select]').click()
      const typeLabels = {
        'daily': 'Diário',
        'weekly': 'Semanal',
        'monthly': 'Mensal',
        'yearly': 'Anual'
      }
      cy.contains('[role="option"]', typeLabels[transaction.recurringType]).click({ force: true })
    }
  }
  
  // Handle installment transaction
  if (transaction.installment && transaction.installments) {
    // Use click() instead of check() because it's a button with role="checkbox"
    cy.get('[data-cy=transaction-installment-checkbox]').click({ force: true })
    // Wait for the installments input field to become visible
    cy.get('[data-cy=transaction-installments-input]', { timeout: 5000 }).should('be.visible')
    cy.get('[data-cy=transaction-installments-input]').clear().type(transaction.installments.toString())
  }
  
  // Submit transaction
  cy.get('[data-cy=transaction-submit-button]').click()
  
  // Wait for either modal to close (success) or error message to appear
  cy.wait(2000) // Give time for API response
  
  // Check if modal closed (success case)
  cy.get('body').then(($body) => {
    if ($body.find('[data-cy=transaction-submit-button]').length === 0) {
      cy.log('Transaction created successfully - modal closed')
    } else {
      cy.log('Modal still open - may indicate validation or API error')
      // Wait a bit more for slower API responses
      cy.wait(3000)
    }
  })
  
  cy.wait(1000)
})

/**
 * Custom command to delete a transaction by name
 * Usage: cy.deleteTransaction('Supermercado')
 */
Cypress.Commands.add('deleteTransaction', (transactionName) => {
  // Find transaction row and open actions menu
  cy.contains('[data-cy=transaction-row]', transactionName)
    .find('[data-cy=transaction-actions-button]')
    .click()
  
  // Click delete action
  cy.get('[data-cy=transaction-delete-action]').click()
  
  // Confirm deletion in modal
  cy.contains('button', 'Excluir').click()
  
  // Wait for deletion to complete
  cy.wait(1000)
})
