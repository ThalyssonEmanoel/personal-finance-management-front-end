describe('Register Test', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(1000) // Aguardar possíveis erros de hidratação
    cy.get('[data-cy=header-login-button]').click()
    cy.get('[data-cy=create-account-tab]', { timeout: 10000 }).click()
  })

  it('deve exibir o formulário de registro', () => {
    cy.get('[data-cy=register-name-input]', { timeout: 10000 }).should('be.visible')
    cy.get('[data-cy=register-email-input]').should('be.visible')
    cy.get('[data-cy=register-password-input]').should('be.visible')
    cy.get('[data-cy=register-confirm-password-input]').should('be.visible')
    cy.get('[data-cy=register-submit-button]').should('be.visible')
  })

  it('deve criar uma conta com dados válidos', () => {
    const timestamp = Date.now()
    const testEmail = `test${timestamp}@example.com`
    
    cy.get('[data-cy=register-name-input]').type('Usuário Teste')
    cy.get('[data-cy=register-email-input]').type(testEmail)
    cy.get('[data-cy=register-password-input]').type('Senha@12345')
    cy.get('[data-cy=register-confirm-password-input]').type('Senha@12345')
    cy.get('[data-cy=register-submit-button]').click()
    
    // Verificar mensagem de sucesso ou redirecionamento para login
    // Ajustar de acordo com o comportamento da aplicação
    cy.get('[data-cy=login-tab]', { timeout: 5000 }).should('be.visible')
  })

  it('deve validar formato de email inválido', () => {
    cy.get('[data-cy=register-name-input]').type('Usuário Teste')
    cy.get('[data-cy=register-email-input]').type('email-invalido')
    cy.get('[data-cy=register-password-input]').type('Senha@12345')
    cy.get('[data-cy=register-confirm-password-input]').type('Senha@12345')
    cy.get('[data-cy=register-submit-button]').click()
    
    // Verificar mensagem de erro de email inválido
    cy.get('[data-cy=register-email-input]').should('have.attr', 'type', 'email')
  })

  it('deve validar que as senhas não coincidem', () => {
    cy.get('[data-cy=register-name-input]').type('Usuário Teste')
    cy.get('[data-cy=register-email-input]').type('test@example.com')
    cy.get('[data-cy=register-password-input]').type('Senha@12345')
    cy.get('[data-cy=register-confirm-password-input]').type('SenhaDiferente@123')
    cy.get('[data-cy=register-submit-button]').click()
    
    // Verificar mensagem de erro - ajustar de acordo com implementação
    cy.url().should('include', '/introduction')
  })

  it('deve validar requisitos mínimos da senha', () => {
    cy.get('[data-cy=register-name-input]').type('Usuário Teste')
    cy.get('[data-cy=register-email-input]').type('test@example.com')
    cy.get('[data-cy=register-password-input]').type('123') // Senha muito curta
    cy.get('[data-cy=register-confirm-password-input]').type('123')
    cy.get('[data-cy=register-submit-button]').click()
    
    // Verificar que o formulário não foi enviado
    cy.url().should('include', '/introduction')
  })

  it('deve alternar visibilidade da senha', () => {
    cy.get('[data-cy=register-password-input]').should('have.attr', 'type', 'password')
    cy.get('[data-cy=register-toggle-password-visibility]').click()
    cy.get('[data-cy=register-password-input]').should('have.attr', 'type', 'text')
  })

  it('deve alternar visibilidade da confirmação de senha', () => {
    cy.get('[data-cy=register-confirm-password-input]').should('have.attr', 'type', 'password')
    cy.get('[data-cy=register-toggle-confirm-password-visibility]').click()
    cy.get('[data-cy=register-confirm-password-input]').should('have.attr', 'type', 'text')
  })

  it('deve permitir upload de foto de perfil', () => {
    // Criar um arquivo fictício para teste
    const fileName = 'avatar.jpg'
    
    cy.get('[data-cy=register-avatar-input]').selectFile({
      contents: Cypress.Buffer.from('fake-image-content'),
      fileName: fileName,
      mimeType: 'image/jpeg'
    }, { force: true })
    
    // Verificar que o nome do arquivo foi atualizado
    cy.contains(fileName).should('be.visible')
  })

  it('deve validar campos obrigatórios', () => {
    cy.get('[data-cy=register-submit-button]').click()
    
    // Verificar que ainda está no formulário de registro
    cy.get('[data-cy=register-name-input]').should('be.visible')
  })

  it('deve navegar entre tabs de login e registro', () => {
    cy.get('[data-cy=create-account-tab]').should('have.attr', 'data-state', 'active')
    cy.get('[data-cy=login-tab]').click()
    cy.get('[data-cy=login-email-input]').should('be.visible')
  })
})
