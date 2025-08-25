'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../hooks/useAuth.js'

export function useAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalBalance, setTotalBalance] = useState(0)
  const { getUserInfo, isAuthenticated, authenticatedFetch, status } = useAuth()
  const initialLoadDone = useRef(false)

  const fetchAccounts = useCallback(async () => {
    if (!isAuthenticated()) {
      setError('Usuário não autenticado')
      return
    }

    const userInfo = getUserInfo()
    if (!userInfo?.id) {
      setError('ID do usuário não encontrado')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/account/${userInfo.id}?userId=${userInfo.id}`,
        { method: 'GET' }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro na resposta da API' }))
        throw new Error(errorData.message || `Erro HTTP ${response.status}`)
      }

      const data = await response.json()
      let accountsData = []

      if (data.data && data.data.contas) accountsData = data.data.contas
      else if (Array.isArray(data)) accountsData = data
      else if (Array.isArray(data.accounts)) accountsData = data.accounts

      setAccounts(accountsData)
      setTotalBalance(data.data?.totalBalance || 0)
    } catch (err) {
      setError(err.message || 'Erro ao buscar contas')
      setAccounts([])
      setTotalBalance(0)
    } finally {
      setLoading(false)
    }
  }, [getUserInfo, isAuthenticated, authenticatedFetch])

  // Carregar apenas uma vez quando autenticado
  useEffect(() => {
    if (status === 'authenticated' && !initialLoadDone.current) {
      initialLoadDone.current = true
      fetchAccounts()
    }
  }, [status, fetchAccounts])

  return { accounts, loading, error, totalBalance, refetch: fetchAccounts }
}

/**
 * Hook para buscar transações do usuário
 */
export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 })
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [topIncomes, setTopIncomes] = useState([])
  const [topExpenses, setTopExpenses] = useState([])
  const { getUserInfo, isAuthenticated, authenticatedFetch, status } = useAuth()
  const initialLoadDone = useRef(false)

  const fetchTransactions = useCallback(async (filters = {}) => {
    if (!isAuthenticated()) {
      setError('Usuário não autenticado')
      return
    }

    const userInfo = getUserInfo()
    if (!userInfo?.id) {
      setError('ID do usuário não encontrado')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams({ userId: userInfo.id.toString() })

      if (filters.type && filters.type !== 'All') queryParams.append('type', filters.type)
      if (filters.accountId && filters.accountId !== 'All') queryParams.append('accountId', filters.accountId)
      if (filters.release_date) queryParams.append('release_date', filters.release_date)

      const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParams.toString()}`
      console.log('Fazendo requisição para:', url)
      console.log('Filtros aplicados:', filters)

      const response = await authenticatedFetch(url, { method: 'GET' })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro na resposta da API' }))
        throw new Error(errorData.message || `Erro HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.error) throw new Error(data.message || 'Erro na resposta da API')

      console.log('Transações recebidas:', data.data ? data.data.transactions : data);

      const transactionsData = (data.data && data.data.transactions) || []
      setTransactions(transactionsData)
      
      // Extrair totais da resposta da API
      setTotalIncome(data.data?.totalIncome || 0)
      setTotalExpense(data.data?.totalExpense || 0)
      
      // Calcular top 3 receitas e despesas mais recentes
      const incomeTransactions = transactionsData
        .filter(t => t.type === 'income')
        .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
        .slice(0, 3)
        .map(t => t.name)
      
      const expenseTransactions = transactionsData
        .filter(t => t.type === 'expense')
        .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
        .slice(0, 3)
        .map(t => t.name)
      
      setTopIncomes(incomeTransactions)
      setTopExpenses(expenseTransactions)
      
      setPagination({
        page: data.page || 1,
        total: data.total || 0,
        limit: data.limite || data.limit || 10
      })
    } catch (err) {
      setError(err.message || 'Erro ao buscar transações')
      setTransactions([])
      setTotalIncome(0)
      setTotalExpense(0)
      setTopIncomes([])
      setTopExpenses([])
    } finally {
      setLoading(false)
    }
  }, [getUserInfo, isAuthenticated, authenticatedFetch])

  // Carregar apenas uma vez quando autenticado
  useEffect(() => {
    if (status === 'authenticated' && !initialLoadDone.current) {
      initialLoadDone.current = true
      fetchTransactions()
    }
  }, [status, fetchTransactions])

  return { 
    transactions, 
    loading, 
    error, 
    pagination, 
    totalIncome, 
    totalExpense, 
    topIncomes, 
    topExpenses, 
    refetch: fetchTransactions 
  }
}