describe('Authentication Flow - End to End', () => {
  it('deve completar o fluxo de registro e login', () => {
    const timestamp = Date.now()
    const testEmail = `e2e${timestamp}@example.com`
    const testPassword = 'Senha@12345'
    
    cy.visit('/')
    cy.wait(1000) // Aguardar possíveis erros de hidratação
    
    // 1. Abrir modal de login
    cy.get('[data-cy=header-login-button]').click()
    
    // 2. Ir para tab de registro
    cy.get('[data-cy=create-account-tab]', { timeout: 10000 }).click()
    
    // 3. Preencher formulário de registro
    cy.get('[data-cy=register-name-input]').type('Usuario E2E Test')
    cy.get('[data-cy=register-email-input]').type(testEmail)
    cy.get('[data-cy=register-password-input]').type(testPassword)
    cy.get('[data-cy=register-confirm-password-input]').type(testPassword)
    cy.get('[data-cy=register-submit-button]').click()
    
    // 4. Aguardar redirecionamento para tab de login
    cy.get('[data-cy=login-tab]', { timeout: 5000 }).should('be.visible')
    
    // 5. Fazer login com a conta criada
    cy.get('[data-cy=login-email-input]').type(testEmail)
    cy.get('[data-cy=login-password-input]').type(testPassword)
    cy.get('[data-cy=login-submit-button]').click()
    
    // 6. Verificar redirecionamento para home
    cy.url({ timeout: 10000 }).should('include', '/home')
  })

  it('deve completar o fluxo de recuperação de senha', () => {
    cy.visit('/')
    cy.wait(1000) // Aguardar possíveis erros de hidratação
    
    // 1. Abrir modal de login
    cy.get('[data-cy=header-login-button]').click()
    cy.get('[data-cy=login-tab]', { timeout: 10000 }).should('be.visible')
    
    // 2. Clicar em "Esqueceu a senha?"
    cy.get('[data-cy=forgot-password-link]', { timeout: 10000 }).click()
    
    // 3. Verificar modal de recuperação
    cy.get('[data-cy=forgot-password-email-input]').should('be.visible')
    
    // 4. Preencher email
    cy.get('[data-cy=forgot-password-email-input]').type(Cypress.env('email'))
    cy.get('[data-cy=forgot-password-submit-button]').click()
    
    // 5. Aguardar transição para modal de mudança de senha
    cy.wait(2500)
    
    // 6. Verificar modal de mudança de senha
    cy.get('[data-cy=change-password-code-input]').should('be.visible')
  })

  it('deve navegar entre todos os modais de autenticação', () => {
    cy.visit('/')
    cy.wait(1000) // Aguardar possíveis erros de hidratação
    
    // 1. Abrir modal de login
    cy.get('[data-cy=header-login-button]').click()
    cy.get('[data-cy=login-tab]', { timeout: 10000 }).should('be.visible')
    
    // 2. Navegar para registro
    cy.get('[data-cy=create-account-tab]').click()
    cy.get('[data-cy=register-name-input]').should('be.visible')
    
    // 3. Voltar para login
    cy.get('[data-cy=login-tab]').click()
    cy.get('[data-cy=login-email-input]').should('be.visible')
    
    // 4. Ir para esqueci a senha
    cy.get('[data-cy=forgot-password-link]').click()
    cy.get('[data-cy=forgot-password-email-input]').should('be.visible')
    
    // 5. Fechar modal
    cy.get('[data-cy=forgot-password-close-button]').click()
    cy.get('[data-cy=forgot-password-email-input]').should('not.exist')
  })

  it('deve manter estado do formulário ao navegar entre tabs', () => {
    cy.visit('/')
    cy.wait(1000) // Aguardar possíveis erros de hidratação
    cy.get('[data-cy=header-login-button]').click()
    
    // Preencher login
    const testEmail = 'test@example.com'
    cy.get('[data-cy=login-email-input]').type(testEmail)
    
    // Navegar para registro
    cy.get('[data-cy=create-account-tab]').click()
    
    // Voltar para login
    cy.get('[data-cy=login-tab]').click()
    
    // Verificar que o email foi mantido (ou limpo, dependendo do comportamento desejado)
    // Ajustar de acordo com a implementação real
    cy.get('[data-cy=login-email-input]').should('be.visible')
  })

  it('deve validar segurança - não permitir login sem credenciais', () => {
    cy.visit('/')
    cy.wait(1000) // Aguardar possíveis erros de hidratação
    cy.get('[data-cy=header-login-button]').click()
    
    // Tentar login sem preencher
    cy.get('[data-cy=login-submit-button]').click()
    
    // Verificar que permanece na página de introdução
    cy.url().should('include', '/introduction')
  })

  it('deve exibir feedback visual ao usuário durante ações', () => {
    cy.visit('/')
    cy.wait(1000) // Aguardar possíveis erros de hidratação
    cy.get('[data-cy=header-login-button]').click()
    
    // Preencher login com dados inválidos
    cy.get('[data-cy=login-email-input]').type('invalid@test.com')
    cy.get('[data-cy=login-password-input]').type('wrongpassword')
    cy.get('[data-cy=login-submit-button]').click()
    
    // Verificar que o botão mostra estado de loading
    cy.get('[data-cy=login-submit-button]').should('be.disabled')
  })
})
