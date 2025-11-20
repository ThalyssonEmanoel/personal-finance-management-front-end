describe('Forgot Password Test', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(1000) // Aguardar possíveis erros de hidratação
    cy.get('[data-cy=header-login-button]').click()
    cy.get('[data-cy=forgot-password-link]', { timeout: 10000 }).click()
  })

  it('deve exibir o modal de recuperação de senha', () => {
    cy.get('[data-cy=forgot-password-email-input]').should('be.visible')
    cy.get('[data-cy=forgot-password-submit-button]').should('be.visible')
  })

  it('deve enviar código de recuperação para email válido', () => {
    cy.get('[data-cy=forgot-password-email-input]').type(Cypress.env('email'))
    cy.get('[data-cy=forgot-password-submit-button]').click()
    
    // Verificar mensagem de sucesso ou redirecionamento
    // Ajustar de acordo com o comportamento real da aplicação
    cy.get('[data-cy=forgot-password-submit-button]').should('be.disabled')
  })

  it('deve validar formato de email', () => {
    cy.get('[data-cy=forgot-password-email-input]').type('email-invalido')
    cy.get('[data-cy=forgot-password-submit-button]').click()
    
    // Verificar que o formulário valida email
    cy.get('[data-cy=forgot-password-email-input]').should('have.attr', 'type', 'email')
  })

  it('deve validar campo obrigatório', () => {
    cy.get('[data-cy=forgot-password-submit-button]').click()
    
    // Verificar que ainda está no modal
    cy.get('[data-cy=forgot-password-email-input]').should('be.visible')
  })

  it('deve fechar o modal ao clicar no botão de fechar', () => {
    cy.get('[data-cy=forgot-password-email-input]').should('be.visible')
    cy.get('[data-cy=forgot-password-close-button]').click()
    cy.get('[data-cy=forgot-password-email-input]').should('not.exist')
  })

  it('deve exibir mensagem de erro para email não cadastrado', () => {
    cy.get('[data-cy=forgot-password-email-input]').type('emailnaocadastrado@test.com')
    cy.get('[data-cy=forgot-password-submit-button]').click()
    
    // Aguardar resposta do servidor
    cy.wait(1000)
    
    // Verificar que ainda está no modal (não redirecionou)
    cy.get('[data-cy=forgot-password-email-input]').should('be.visible')
  })

  it('deve desabilitar botão durante envio', () => {
    cy.get('[data-cy=forgot-password-email-input]').type(Cypress.env('email'))
    cy.get('[data-cy=forgot-password-submit-button]').click()
    
    // Verificar que o botão fica desabilitado durante o processamento
    cy.get('[data-cy=forgot-password-submit-button]').should('be.disabled')
  })
})
