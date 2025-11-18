// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Handle uncaught exceptions from React hydration errors and other Next.js errors
Cypress.on('uncaught:exception', (err, runnable) => {
  // React hydration errors (error #418, #423, and general hydration failures)
  if (err.message.includes('Minified React error #418') || 
      err.message.includes('Minified React error #423') ||
      err.message.includes('Hydration failed') ||
      err.message.includes('hydration') ||
      err.message.includes('server rendered HTML')) {
    // Return false to prevent the error from failing the test
    return false
  }
  
  // Let other errors fail the test
  return true
})

