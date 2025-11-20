describe('Fluxo de Transações Recorrentes', () => {
  
  beforeEach(() => {
    // Login antes de cada teste
    cy.login()
    cy.wait(2000) // Aguardar a página home carregar completamente
  })

  it('deve criar transação recorrente diária', () => {
    const transactionName = `Recorrente Diária ${Date.now()}`
    
    cy.log('Criando transação recorrente diária')
    cy.createTransaction({
      type: 'expense',
      name: transactionName,
      category: 'Alimentação',
      value: 25.00,
      date: new Date().toLocaleDateString('pt-BR'),
      description: 'Café da manhã diário',
      account: 'Caixa Econômica',
      paymentMethod: 'Dinheiro',
      recurring: true,
      recurringType: 'daily'
    })

    // Verificar se a transação foi criada
    cy.contains('[data-cy=transaction-row]', transactionName, { timeout: 10000 }).should('be.visible')
    
    // Visualizar para confirmar que é recorrente
    cy.contains('[data-cy=transaction-row]', transactionName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-view-action]').click()
    
    // Verificar informações de recorrência
    cy.get('[data-cy=view-transaction-modal]', { timeout: 5000 }).should('be.visible')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Transação Recorrente')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Sim')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Diário')
    
    // Fechar modal
    cy.get('[data-cy=view-transaction-modal]').type('{esc}')
    cy.wait(500)
    
    // Limpar dados de teste
    cy.deleteTransaction(transactionName)
  })

  it('deve criar transação recorrente semanal', () => {
    const transactionName = `Recorrente Semanal ${Date.now()}`
    
    cy.log('Criando transação recorrente semanal')
    cy.createTransaction({
      type: 'expense',
      name: transactionName,
      category: 'Lazer',
      value: 100.00,
      date: new Date().toLocaleDateString('pt-BR'),
      description: 'Academia semanal',
      account: 'Caixa Econômica',
      paymentMethod: 'Cartão de Débito',
      recurring: true,
      recurringType: 'weekly'
    })

    // Verificar se a transação foi criada
    cy.contains('[data-cy=transaction-row]', transactionName, { timeout: 10000 }).should('be.visible')
    
    // Visualizar para confirmar que é recorrente
    cy.contains('[data-cy=transaction-row]', transactionName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-view-action]').click()
    
    // Verificar informações de recorrência
    cy.get('[data-cy=view-transaction-modal]', { timeout: 5000 }).should('be.visible')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Transação Recorrente')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Sim')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Semanal')
    
    // Fechar modal
    cy.get('[data-cy=view-transaction-modal]').type('{esc}')
    cy.wait(500)
    
    // Limpar dados de teste
    cy.deleteTransaction(transactionName)
  })

  it('deve criar transação recorrente mensal', () => {
    const transactionName = `Recorrente Mensal ${Date.now()}`
    
    cy.log('Criando transação recorrente mensal')
    cy.createTransaction({
      type: 'expense',
      name: transactionName,
      category: 'Moradia',
      value: 1500.00,
      date: new Date().toLocaleDateString('pt-BR'),
      description: 'Aluguel mensal',
      account: 'Caixa Econômica',
      paymentMethod: 'Transferência Bancária',
      recurring: true,
      recurringType: 'monthly'
    })

    // Verificar se a transação foi criada
    cy.contains('[data-cy=transaction-row]', transactionName, { timeout: 10000 }).should('be.visible')
    
    // Visualizar para confirmar que é recorrente
    cy.contains('[data-cy=transaction-row]', transactionName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-view-action]').click()
    
    // Verificar informações de recorrência
    cy.get('[data-cy=view-transaction-modal]', { timeout: 5000 }).should('be.visible')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Transação Recorrente')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Sim')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Mensal')
    
    // Fechar modal
    cy.get('[data-cy=view-transaction-modal]').type('{esc}')
    cy.wait(500)
    
    // Limpar dados de teste
    cy.deleteTransaction(transactionName)
  })

  it('deve criar transação recorrente anual', () => {
    const transactionName = `Recorrente Anual ${Date.now()}`
    
    cy.log('Criando transação recorrente anual')
    cy.createTransaction({
      type: 'expense',
      name: transactionName,
      category: 'Impostos',
      value: 5000.00,
      date: new Date().toLocaleDateString('pt-BR'),
      description: 'IPTU anual',
      account: 'Caixa Econômica',
      paymentMethod: 'Boleto',
      recurring: true,
      recurringType: 'yearly'
    })

    // Verificar se a transação foi criada
    cy.contains('[data-cy=transaction-row]', transactionName, { timeout: 10000 }).should('be.visible')
    
    // Visualizar para confirmar que é recorrente
    cy.contains('[data-cy=transaction-row]', transactionName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-view-action]').click()
    
    // Verificar informações de recorrência
    cy.get('[data-cy=view-transaction-modal]', { timeout: 5000 }).should('be.visible')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Transação Recorrente')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Sim')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Anual')
    
    // Fechar modal
    cy.get('[data-cy=view-transaction-modal]').type('{esc}')
    cy.wait(500)
    
    // Limpar dados de teste
    cy.deleteTransaction(transactionName)
  })

  it('deve criar receita recorrente mensal', () => {
    const transactionName = `Salário ${Date.now()}`
    
    cy.log('Criando receita recorrente mensal')
    cy.createTransaction({
      type: 'income',
      name: transactionName,
      category: 'Salário',
      value: 8000.00,
      date: new Date().toLocaleDateString('pt-BR'),
      description: 'Salário mensal',
      account: 'Caixa Econômica',
      paymentMethod: 'Transferência Bancária',
      recurring: true,
      recurringType: 'monthly'
    })

    // Verificar se a transação foi criada
    cy.contains('[data-cy=transaction-row]', transactionName, { timeout: 10000 }).should('be.visible')
    
    // Verificar que é receita (valor positivo em verde)
    cy.contains('[data-cy=transaction-row]', transactionName)
      .should('contain', '+ R$')
      .and('contain', '8.000,00')
    
    // Visualizar para confirmar que é recorrente
    cy.contains('[data-cy=transaction-row]', transactionName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-view-action]').click()
    
    // Verificar informações de recorrência
    cy.get('[data-cy=view-transaction-modal]', { timeout: 5000 }).should('be.visible')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Transação Recorrente')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Sim')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Mensal')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Receita')
    
    // Fechar modal
    cy.get('[data-cy=view-transaction-modal]').type('{esc}')
    cy.wait(500)
    
    // Limpar dados de teste
    cy.deleteTransaction(transactionName)
  })

  it('deve editar nome de transação recorrente', () => {
    const transactionName = `Editar Recorrente ${Date.now()}`
    
    // Criar transação recorrente
    cy.createTransaction({
      type: 'expense',
      name: transactionName,
      category: 'Teste',
      value: 100.00,
      date: new Date().toLocaleDateString('pt-BR'),
      account: 'Caixa Econômica',
      paymentMethod: 'Dinheiro',
      recurring: true,
      recurringType: 'monthly'
    })

    cy.wait(1000)
    
    // Editar apenas o nome da transação
    cy.contains('[data-cy=transaction-row]', transactionName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-edit-action]').click()
    
    cy.get('[data-cy=update-transaction-modal]', { timeout: 5000 }).should('be.visible')
    
    // Alterar o nome
    const newName = `${transactionName} - Editado`
    cy.get('[data-cy=update-transaction-name-input]').clear().type(newName)
    
    cy.get('[data-cy=update-transaction-submit-button]').click()
    
    cy.get('[data-cy=update-transaction-modal]', { timeout: 10000 }).should('not.exist')
    cy.wait(1000)
    
    // Verificar que o nome foi atualizado
    cy.contains('[data-cy=transaction-row]', newName, { timeout: 10000 }).should('be.visible')
    
    // Verificar que ainda é recorrente
    cy.contains('[data-cy=transaction-row]', newName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-view-action]').click()
    
    cy.get('[data-cy=view-transaction-modal]', { timeout: 5000 }).should('be.visible')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Transação Recorrente')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Sim')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Mensal')
    
    cy.get('[data-cy=view-transaction-modal]').type('{esc}')
    cy.wait(500)
    
    // Limpar dados de teste
    cy.deleteTransaction(newName)
  })
})

