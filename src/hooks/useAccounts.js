'use client'
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

export function useAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { getUserInfo, isAuthenticated, authenticatedFetch } = useAuth()

  const fetchAccounts = async () => {
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
      console.log('Fazendo requisição para:', `${process.env.NEXT_PUBLIC_API_URL}/account/${userInfo.id}?userId=${userInfo.id}`)

      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/account/${userInfo.id}?userId=${userInfo.id}`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro na resposta da API' }))
        throw new Error(errorData.message || `Erro HTTP ${response.status}`)
      }

      const data = await response.json()
      
      // Verifica se a resposta contém os dados das contas
      let accountsData = []
      if (data.data && Array.isArray(data.data)) {
        accountsData = data.data
      } else if (Array.isArray(data)) {
        accountsData = data
      } else if (data.accounts && Array.isArray(data.accounts)) {
        accountsData = data.accounts
      }
      
      console.log('Contas recebidas da API:', accountsData)
      setAccounts(accountsData)
    } catch (err) {
      console.error('Erro ao buscar contas:', err)
      setError(err.message || 'Erro ao buscar contas')
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated()) {
      fetchAccounts()
    }
  }, [])

  return {
    accounts,
    loading,
    error,
    refetch: fetchAccounts,
  }
}
