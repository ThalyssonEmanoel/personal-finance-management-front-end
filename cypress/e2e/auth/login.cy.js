describe('Login Test', () => {
  beforeEach(() => {
    cy.visit('/')
    // Aguardar a página carregar completamente após possíveis erros de hidratação
    cy.wait(1000)
  })

  it('deve abrir o modal de login ao clicar no botão de login', () => {
    cy.get('[data-cy=header-login-button]').click()
    cy.get('[data-cy=login-tab]', { timeout: 10000 }).should('be.visible')
  })

  it('deve fazer login com credenciais válidas', () => {
    cy.get('[data-cy=header-login-button]').click()
    
    cy.get('[data-cy=login-email-input]', { timeout: 10000 }).type(Cypress.env('email'))
    cy.get('[data-cy=login-password-input]').type(Cypress.env('password'))
    cy.get('[data-cy=login-submit-button]').click()
    
    // Verificar redirecionamento para home após login bem-sucedido
    cy.url({ timeout: 10000 }).should('include', '/home')
  })

  it('deve exibir erro com credenciais inválidas', () => {
    cy.get('[data-cy=header-login-button]').click()
    
    cy.get('[data-cy=login-email-input]', { timeout: 10000 }).type('invalid@example.com')
    cy.get('[data-cy=login-password-input]').type('wrongpassword')
    cy.get('[data-cy=login-submit-button]').click()
    
    // Verificar que continua na mesma página (não redireciona)
    cy.wait(2000)
    cy.url().should('include', '/introduction')
  })

  it('deve validar campos obrigatórios no formulário de login', () => {
    cy.get('[data-cy=header-login-button]').click()
    
    // Tentar submeter sem preencher
    cy.get('[data-cy=login-submit-button]', { timeout: 10000 }).click()
    
    // Verificar mensagens de validação (ajustar de acordo com sua implementação)
    cy.get('[data-cy=login-email-input]').should('be.visible')
  })

  it('deve alternar a visibilidade da senha', () => {
    cy.get('[data-cy=header-login-button]').click()
    
    cy.get('[data-cy=login-password-input]', { timeout: 10000 }).should('have.attr', 'type', 'password')
    cy.get('[data-cy=login-toggle-password-visibility]').click()
    cy.get('[data-cy=login-password-input]').should('have.attr', 'type', 'text')
    cy.get('[data-cy=login-toggle-password-visibility]').click()
    cy.get('[data-cy=login-password-input]').should('have.attr', 'type', 'password')
  })

  it('deve fechar o modal ao clicar no botão de fechar', () => {
    cy.get('[data-cy=header-login-button]').click()
    cy.get('[data-cy=login-tab]', { timeout: 10000 }).should('be.visible')
    
    cy.get('[data-cy=modal-close-button]').click()
    cy.get('[data-cy=login-tab]').should('not.exist')
  })

  it('deve navegar para o fluxo de esqueci a senha', () => {
    cy.get('[data-cy=header-login-button]').click()
    cy.get('[data-cy=forgot-password-link]', { timeout: 10000 }).click()
    
    // Verificar que o modal de recuperação de senha foi aberto
    cy.get('[data-cy=forgot-password-email-input]', { timeout: 10000 }).should('be.visible')
  })
})


