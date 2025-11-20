describe('Fluxo de Transações Parceladas', () => {
  
  beforeEach(() => {
    // Login antes de cada teste
    cy.login()
    cy.wait(2000) // Aguardar a página home carregar completamente
  })

  it('deve criar transação parcelada em 3x', () => {
    const transactionName = `Parcelado 3x ${Date.now()}`
    
    cy.log('Criando transação parcelada em 3 vezes')
    cy.createTransaction({
      type: 'expense',
      name: transactionName,
      category: 'Compras',
      value: 300.00,
      date: new Date().toLocaleDateString('pt-BR'),
      description: 'Compra parcelada em 3x',
      account: 'Caixa Econômica',
      paymentMethod: 'Cartão de Crédito',
      installment: true,
      installments: 3
    })

    // Verificar se a transação foi criada
    cy.contains('[data-cy=transaction-row]', transactionName, { timeout: 10000 }).should('be.visible')
    
    // Visualizar para confirmar informações de parcelamento
    cy.contains('[data-cy=transaction-row]', transactionName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-view-action]').click()
    
    // Verificar informações de parcelamento no modal
    cy.get('[data-cy=view-transaction-modal]', { timeout: 5000 }).should('be.visible')
    cy.get('[data-cy=view-transaction-modal]').should('contain', transactionName)
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Total de parcelas')
    cy.get('[data-cy=view-transaction-modal]').should('contain', '3')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Valor da parcela atual')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Valor total')
    cy.get('[data-cy=view-transaction-modal]').should('contain', '300,00')
    
    // Fechar modal
    cy.get('[data-cy=view-transaction-modal]').type('{esc}')
    cy.wait(500)
    
    // Limpar dados de teste
    cy.deleteTransaction(transactionName)
  })

  it('deve criar transação parcelada em 6x e editar', () => {
    const transactionName = `Parcelado 6x ${Date.now()}`
    
    // Criar transação parcelada
    cy.createTransaction({
      type: 'expense',
      name: transactionName,
      category: 'Vestuário',
      value: 600.00,
      date: new Date().toLocaleDateString('pt-BR'),
      description: 'Roupas parceladas',
      account: 'Caixa Econômica',
      paymentMethod: 'Cartão de Crédito',
      installment: true,
      installments: 6
    })

    cy.wait(1000)
    
    // Editar a transação
    cy.contains('[data-cy=transaction-row]', transactionName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-edit-action]').click()
    
    cy.get('[data-cy=update-transaction-modal]', { timeout: 5000 }).should('be.visible')
    
    // Alterar o nome
    const newName = `${transactionName} - Editado`
    cy.get('[data-cy=update-transaction-name-input]').clear().type(newName)
    
    // Submeter edição
    cy.get('[data-cy=update-transaction-submit-button]').click()
    
    cy.get('[data-cy=update-transaction-modal]', { timeout: 10000 }).should('not.exist')
    cy.wait(1000)
    
    // Verificar que foi atualizada
    cy.contains('[data-cy=transaction-row]', newName, { timeout: 10000 }).should('be.visible')
    
    // Visualizar para confirmar que ainda está parcelada
    cy.contains('[data-cy=transaction-row]', newName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-view-action]').click()
    
    cy.get('[data-cy=view-transaction-modal]', { timeout: 5000 }).should('be.visible')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Total de parcelas')
    cy.get('[data-cy=view-transaction-modal]').should('contain', '6')
    
    cy.get('[data-cy=view-transaction-modal]').type('{esc}')
    cy.wait(500)
    
    // Limpar dados de teste
    cy.deleteTransaction(newName)
  })

  it('deve visualizar informações completas de transação parcelada', () => {
    const transactionName = `Parcelado Completo ${Date.now()}`
    
    cy.createTransaction({
      type: 'expense',
      name: transactionName,
      category: 'Educação',
      value: 3000.00,
      date: new Date().toLocaleDateString('pt-BR'),
      description: 'Curso parcelado em 10x',
      account: 'Caixa Econômica',
      paymentMethod: 'Cartão de Crédito',
      installment: true,
      installments: 10
    })

    cy.wait(1000)
    
    // Visualizar detalhes completos
    cy.contains('[data-cy=transaction-row]', transactionName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-view-action]').click()
    
    // Verificar todos os campos no modal
    cy.get('[data-cy=view-transaction-modal]', { timeout: 5000 }).should('be.visible')
    
    // Informações básicas
    cy.get('[data-cy=view-transaction-modal]').should('contain', transactionName)
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Educação')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Despesa')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Curso parcelado em 10x')
    
    // Informações de parcelamento
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Valor da parcela atual')
    cy.get('[data-cy=view-transaction-modal]').should('contain', '300,00')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Valor total')
    cy.get('[data-cy=view-transaction-modal]').should('contain', '3.000,00')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Total de parcelas')
    cy.get('[data-cy=view-transaction-modal]').should('contain', '10')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Parcela atual')
    
    // Informações de conta e pagamento
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Conta')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Cartão de Crédito')
    
    cy.get('[data-cy=view-transaction-modal]').type('{esc}')
    cy.wait(500)
    
    // Limpar dados de teste
    cy.deleteTransaction(transactionName)
  })

  it('deve verificar cálculo correto de parcelas com valores decimais', () => {
    const transactionName = `Parcelado Decimal ${Date.now()}`
    
    cy.createTransaction({
      type: 'expense',
      name: transactionName,
      category: 'Serviços',
      value: 1000.00,
      date: new Date().toLocaleDateString('pt-BR'),
      account: 'Caixa Econômica',
      paymentMethod: 'Cartão de Crédito',
      installment: true,
      installments: 7 // Vai gerar R$ 142,86 por parcela
    })

    cy.wait(1000)
    
    cy.contains('[data-cy=transaction-row]', transactionName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-view-action]').click()
    
    cy.get('[data-cy=view-transaction-modal]', { timeout: 5000 }).should('be.visible')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Total de parcelas')
    cy.get('[data-cy=view-transaction-modal]').should('contain', '7')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Valor total')
    cy.get('[data-cy=view-transaction-modal]').should('contain', '1.000,00')
    
    cy.get('[data-cy=view-transaction-modal]').type('{esc}')
    cy.wait(500)
    
    cy.deleteTransaction(transactionName)
  })
})

