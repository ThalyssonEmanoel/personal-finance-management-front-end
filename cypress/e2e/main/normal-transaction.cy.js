describe('Fluxo de Transação Normal', () => {
  const transactionName = `Teste Normal ${Date.now()}`
  
  beforeEach(() => {
    // Login antes de cada teste
    cy.login()
    cy.wait(2000) // Aguardar a página home carregar completamente
  })

  it('deve completar o fluxo: criar -> visualizar -> editar -> excluir transação de despesa', () => {
    // Passo 1: Criar transação de despesa
    cy.log('Criando transação de despesa')
    cy.createTransaction({
      type: 'expense',
      name: transactionName,
      category: 'Alimentação',
      value: 150.50,
      date: new Date().toLocaleDateString('pt-BR'),
      description: 'Teste de transação de despesa',
      account: 'Caixa Econômica',
      paymentMethod: 'Dinheiro'
    })

    // Passo 2: Verificar se a transação apareceu na tabela
    cy.log('Verificando se a transação aparece na tabela')
    cy.contains('[data-cy=transaction-row]', transactionName, { timeout: 10000 }).should('be.visible')
    
    // Verificar que o valor está em vermelho (despesa)
    cy.contains('[data-cy=transaction-row]', transactionName)
      .should('contain', '- R$')
      .and('contain', '150,50')

    // Passo 3: Visualizar a transação
    cy.log('Visualizando a transação')
    cy.contains('[data-cy=transaction-row]', transactionName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-view-action]').click()
    
    // Verificar dados no modal de visualização
    cy.get('[data-cy=view-transaction-modal]', { timeout: 5000 }).should('be.visible')
    cy.get('[data-cy=view-transaction-modal]').should('contain', transactionName)
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Alimentação')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Despesa')
    
    // Fechar modal de visualização
    cy.get('[data-cy=view-transaction-modal]').type('{esc}')
    cy.wait(500)

    // Passo 4: Editar a transação
    cy.log('Editando a transação')
    cy.contains('[data-cy=transaction-row]', transactionName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-edit-action]').click()
    
    // Verificar que o modal de edição abriu
    cy.get('[data-cy=update-transaction-modal]', { timeout: 5000 }).should('be.visible')
    
    // Alterar o nome e o valor
    const newName = `${transactionName} - Editado`
    cy.get('[data-cy=update-transaction-name-input]').clear().type(newName)
    cy.get('[data-cy=update-transaction-value-input]').clear().type('20000') // R$ 200,00
    
    // Submeter edição
    cy.get('[data-cy=update-transaction-submit-button]').click()
    
    // Aguardar modal fechar
    cy.get('[data-cy=update-transaction-modal]', { timeout: 10000 }).should('not.exist')
    cy.wait(1000)
    
    // Verificar que a transação foi atualizada na tabela
    cy.contains('[data-cy=transaction-row]', newName, { timeout: 10000 }).should('be.visible')
    cy.contains('[data-cy=transaction-row]', newName).should('contain', '200,00')

    // Passo 5: Excluir a transação
    cy.log('Excluindo a transação')
    cy.contains('[data-cy=transaction-row]', newName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-delete-action]').click()
    
    // Confirmar exclusão
    cy.contains('button', 'Excluir').click()
    cy.wait(2000)
    
    // Verificar que a transação foi removida
    cy.contains('[data-cy=transaction-row]', newName).should('not.exist')
  })

  it('deve completar o fluxo: criar -> visualizar -> editar -> excluir transação de receita', () => {
    const incomeName = `Receita ${Date.now()}`
    
    // Passo 1: Criar transação de receita
    cy.log('Criando transação de receita')
    cy.createTransaction({
      type: 'income',
      name: incomeName,
      category: 'Salário',
      value: 5000.00,
      date: new Date().toLocaleDateString('pt-BR'),
      description: 'Teste de transação de receita',
      account: 'Caixa Econômica',
      paymentMethod: 'PIX'
    })

    // Passo 2: Verificar se a transação apareceu na tabela
    cy.log('Verificando se a transação aparece na tabela')
    cy.contains('[data-cy=transaction-row]', incomeName, { timeout: 10000 }).should('be.visible')
    
    // Verificar que o valor está em verde (receita)
    cy.contains('[data-cy=transaction-row]', incomeName)
      .should('contain', '+ R$')
      .and('contain', '5.000,00')

    // Passo 3: Visualizar a transação
    cy.log('Visualizando a transação')
    cy.contains('[data-cy=transaction-row]', incomeName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-view-action]').click()
    
    // Verificar dados no modal de visualização
    cy.get('[data-cy=view-transaction-modal]', { timeout: 5000 }).should('be.visible')
    cy.get('[data-cy=view-transaction-modal]').should('contain', incomeName)
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Salário')
    cy.get('[data-cy=view-transaction-modal]').should('contain', 'Receita')
    
    // Fechar modal de visualização
    cy.get('[data-cy=view-transaction-modal]').type('{esc}')
    cy.wait(500)

    // Passo 4: Editar a transação
    cy.log('Editando a transação')
    cy.contains('[data-cy=transaction-row]', incomeName)
      .find('[data-cy=transaction-actions-button]')
      .click()
    
    cy.get('[data-cy=transaction-edit-action]').click()
    
    // Verificar que o modal de edição abriu
    cy.get('[data-cy=update-transaction-modal]', { timeout: 5000 }).should('be.visible')
    
    // Alterar o valor
    cy.get('[data-cy=update-transaction-value-input]').clear().type('550000') // R$ 5.500,00
    
    // Submeter edição
    cy.get('[data-cy=update-transaction-submit-button]').click()
    
    // Aguardar modal fechar
    cy.get('[data-cy=update-transaction-modal]', { timeout: 10000 }).should('not.exist')
    cy.wait(1000)
    
    // Verificar que a transação foi atualizada na tabela
    cy.contains('[data-cy=transaction-row]', incomeName).should('contain', '5.500,00')

    // Passo 5: Excluir a transação
    cy.log('Excluindo a transação')
    cy.deleteTransaction(incomeName)
    
    // Verificar que a transação foi removida
    cy.contains('[data-cy=transaction-row]', incomeName).should('not.exist')
  })

  it('deve filtrar transações por tipo', () => {
    // Criar uma despesa e uma receita
    const expenseName = `Despesa ${Date.now()}`
    const incomeName = `Receita ${Date.now()}`
    
    cy.createTransaction({
      type: 'expense',
      name: expenseName,
      category: 'Transporte',
      value: 50.00,
      date: new Date().toLocaleDateString('pt-BR'),
      account: 'Caixa Econômica',
      paymentMethod: 'PIX'

    })
    
    cy.wait(1000)
    
    cy.createTransaction({
      type: 'income',
      name: incomeName,
      category: 'Freelance',
      value: 500.00,
      date: new Date().toLocaleDateString('pt-BR'),
      account: 'Caixa Econômica',
      paymentMethod: 'PIX'
    })
    
    cy.wait(1000)
    
    // Garantir que não há modais ou popovers abertos
    cy.get('body').should('not.have.attr', 'data-scroll-locked')
    
    // Filtrar apenas despesas
    cy.get('[data-cy=filter-transaction-type-select]').click()
    cy.wait(300)
    cy.contains('[role="option"]', 'Despesa').click({ force: true })
    cy.wait(500)
    
    cy.contains('[data-cy=transaction-row]', expenseName).should('be.visible')
    cy.contains('[data-cy=transaction-row]', incomeName).should('not.exist')
    
    // Filtrar apenas receitas
    cy.get('[data-cy=filter-transaction-type-select]').click()
    cy.wait(300)
    cy.contains('[role="option"]', 'Receita').click({ force: true })
    cy.wait(500)
    
    cy.contains('[data-cy=transaction-row]', incomeName).should('be.visible')
    cy.contains('[data-cy=transaction-row]', expenseName).should('not.exist')
    
    // Mostrar todas
    cy.get('[data-cy=filter-transaction-type-select]').click()
    cy.wait(300)
    cy.contains('[role="option"]', 'Todas as transações').click({ force: true })
    cy.wait(500)
    
    cy.contains('[data-cy=transaction-row]', expenseName).should('be.visible')
    cy.contains('[data-cy=transaction-row]', incomeName).should('be.visible')
    
    // Limpar os dados de teste
    cy.deleteTransaction(expenseName)
    cy.deleteTransaction(incomeName)
  })

  it('deve buscar transações pelo campo de pesquisa', () => {
    const searchName = `Busca ${Date.now()}`
    
    cy.createTransaction({
      type: 'expense',
      name: searchName,
      category: 'Teste',
      value: 100.00,
      date: new Date().toLocaleDateString('pt-BR'),
      account: 'Caixa Econômica',
      paymentMethod: 'Dinheiro'

    })
    
    cy.wait(1000)
    
    // Buscar pela transação
    cy.get('[data-cy=search-transactions-input]').type(searchName)
    cy.wait(500)
    
    // Verificar que apenas a transação buscada aparece
    cy.contains('[data-cy=transaction-row]', searchName).should('be.visible')
    
    // Limpar busca
    cy.get('[data-cy=search-transactions-input]').clear()
    cy.wait(500)
    
    // Limpar dados de teste
    cy.deleteTransaction(searchName)
  })
})

