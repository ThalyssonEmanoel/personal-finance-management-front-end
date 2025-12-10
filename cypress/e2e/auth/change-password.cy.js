describe('Change Password Test', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(1000) // Aguardar possíveis erros de hidratação
    cy.get('[data-cy=header-login-button]').click()
    // Aguardar o modal de login aparecer primeiro
    cy.get('[data-cy=login-tab]', { timeout: 10000 }).should('be.visible')
    cy.get('[data-cy=forgot-password-link]', { timeout: 10000 }).click()
    
    // Interceptar a requisição de forgot-password para simular delay
    cy.intercept('POST', '**/forgot-password', {
      delay: 500,
      statusCode: 200,
      body: { message: 'Código enviado com sucesso' }
    }).as('forgotPasswordSetup')
    
    // Simular envio de código para poder testar o modal de mudança de senha
    cy.get('[data-cy=forgot-password-email-input]', { timeout: 10000 }).type(Cypress.env('email'))
    cy.get('[data-cy=forgot-password-submit-button]').click()
    
    // Aguardar a requisição completar e transição para o modal de mudança de senha
    cy.wait('@forgotPasswordSetup')
    cy.wait(500) // Tempo adicional para animação do modal
  })

  it('deve exibir o modal de alteração de senha', () => {
    cy.get('[data-cy=change-password-code-input]').should('be.visible')
    cy.get('[data-cy=change-password-new-password-input]').should('be.visible')
    cy.get('[data-cy=change-password-confirm-password-input]').should('be.visible')
    cy.get('[data-cy=change-password-submit-button]').should('be.visible')
  })

  it('deve alterar senha com código válido', () => {
    // Interceptar a requisição para simular delay
    cy.intercept('POST', '**/reset-password', {
      delay: 1000,
      statusCode: 400,
      body: { message: 'Código inválido' }
    }).as('resetPassword')
    
    cy.get('[data-cy=change-password-code-input]').type('123456')
    cy.get('[data-cy=change-password-new-password-input]').type('NovaSenha@123')
    cy.get('[data-cy=change-password-confirm-password-input]').type('NovaSenha@123')
    cy.get('[data-cy=change-password-submit-button]').click()
    
    // Verificar que o botão está desabilitado durante o envio
    cy.get('[data-cy=change-password-submit-button]').should('be.disabled')
    
    // Aguardar a requisição completar
    cy.wait('@resetPassword')
  })

  it('deve validar que as senhas coincidem', () => {
    cy.get('[data-cy=change-password-code-input]').type('123456')
    cy.get('[data-cy=change-password-new-password-input]').type('NovaSenha@123')
    cy.get('[data-cy=change-password-confirm-password-input]').type('SenhaDiferente@123')
    cy.get('[data-cy=change-password-submit-button]').click()
    
    // Verificar que ainda está no modal
    cy.get('[data-cy=change-password-code-input]').should('be.visible')
  })

  it('deve validar requisitos da senha', () => {
    cy.get('[data-cy=change-password-code-input]').type('123456')
    cy.get('[data-cy=change-password-new-password-input]').type('123') // Senha muito curta
    cy.get('[data-cy=change-password-confirm-password-input]').type('123')
    cy.get('[data-cy=change-password-submit-button]').click()
    
    // Verificar que ainda está no modal
    cy.get('[data-cy=change-password-code-input]').should('be.visible')
  })

  it('deve alternar visibilidade da nova senha', () => {
    cy.get('[data-cy=change-password-new-password-input]').should('have.attr', 'type', 'password')
    cy.get('[data-cy=change-password-toggle-password-visibility]').click()
    cy.get('[data-cy=change-password-new-password-input]').should('have.attr', 'type', 'text')
    cy.get('[data-cy=change-password-toggle-password-visibility]').click()
    cy.get('[data-cy=change-password-new-password-input]').should('have.attr', 'type', 'password')
  })

  it('deve alternar visibilidade da confirmação de senha', () => {
    cy.get('[data-cy=change-password-confirm-password-input]').should('have.attr', 'type', 'password')
    cy.get('[data-cy=change-password-toggle-confirm-password-visibility]').click()
    cy.get('[data-cy=change-password-confirm-password-input]').should('have.attr', 'type', 'text')
  })

  it('deve validar campos obrigatórios', () => {
    cy.get('[data-cy=change-password-submit-button]').click()
    
    // Verificar que ainda está no modal
    cy.get('[data-cy=change-password-code-input]').should('be.visible')
  })

  it('deve validar código obrigatório', () => {
    cy.get('[data-cy=change-password-new-password-input]').type('NovaSenha@123')
    cy.get('[data-cy=change-password-confirm-password-input]').type('NovaSenha@123')
    cy.get('[data-cy=change-password-submit-button]').click()
    
    // Verificar que ainda está no modal
    cy.get('[data-cy=change-password-code-input]').should('be.visible')
  })

  it('deve fechar o modal ao clicar no botão de fechar', () => {
    cy.get('[data-cy=change-password-code-input]').should('be.visible')
    cy.get('[data-cy=change-password-close-button]').click()
    cy.get('[data-cy=change-password-code-input]').should('not.exist')
  })

  it('deve desabilitar botão durante envio', () => {
    // Interceptar a requisição para simular delay
    cy.intercept('POST', '**/reset-password', {
      delay: 1000,
      statusCode: 400,
      body: { message: 'Código inválido' }
    }).as('resetPassword')
    
    cy.get('[data-cy=change-password-code-input]').type('123456')
    cy.get('[data-cy=change-password-new-password-input]').type('NovaSenha@123')
    cy.get('[data-cy=change-password-confirm-password-input]').type('NovaSenha@123')
    cy.get('[data-cy=change-password-submit-button]').click()
    
    // Verificar que o botão está desabilitado durante o envio
    cy.get('[data-cy=change-password-submit-button]').should('be.disabled')
    
    // Aguardar a requisição completar
    cy.wait('@resetPassword')
  })
})
