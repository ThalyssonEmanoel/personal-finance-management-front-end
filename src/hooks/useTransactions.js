'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    limit: 10
  })
  
  const { getUserInfo, isAuthenticated, authenticatedFetch } = useAuth()

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
      // Construir os parâmetros da query
      const queryParams = new URLSearchParams({
        userId: userInfo.id.toString()
      })

      // Adicionar filtros opcionais se fornecidos
      if (filters.type && filters.type !== 'All') {
        queryParams.append('type', filters.type)
      }

      if (filters.accountId && filters.accountId !== 'All') {
        queryParams.append('accountId', filters.accountId)
      }

      if (filters.release_date) {
        queryParams.append('release_date', filters.release_date)
      }

      console.log('Fazendo requisição para:', `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParams.toString()}`)

      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParams.toString()}`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro na resposta da API' }))
        throw new Error(errorData.message || `Erro HTTP ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.message || 'Erro na resposta da API')
      }

      console.log('Dados recebidos da API:', data)
      
      setTransactions(data.data || [])
      setPagination({
        page: data.page || 1,
        total: data.total || 0,
        limit: data.limite || 10
      })
      
    } catch (err) {
      console.error('Erro ao buscar transações:', err)
      setError(err.message || 'Erro ao buscar transações')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, getUserInfo, authenticatedFetch])

  useEffect(() => {
    if (isAuthenticated()) {
      fetchTransactions()
    }
  }, [])

  return {
    transactions,
    loading,
    error,
    pagination,
    refetch: fetchTransactions,
  }
}