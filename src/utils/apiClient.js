'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth.js';
import React from 'react';


// Função auxiliar para evitar repetição
const useApi = () => {
  const { getUserInfo, isAuthenticated, authenticatedFetch, status } = useAuth();
  const enabled = status === 'authenticated' && !!getUserInfo()?.id;
  return { getUserInfo, isAuthenticated, authenticatedFetch, enabled };
};

/**
 * @hook useAccounts
 * Busca as contas do usuário usando TanStack Query.
 */
export function useAccountsQuery() {
  const { authenticatedFetch, getUserInfo, enabled } = useApi();

  return useQuery({
    // 1. queryKey: Chave única para esta busca.
    queryKey: ['accounts'],
    // 2. queryFn: A função que busca os dados.
    queryFn: async () => {
      const userInfo = getUserInfo();
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/account/${userInfo.id}?userId=${userInfo.id}`
      );
      if (!response.ok) throw new Error('Erro ao buscar contas');
      const data = await response.json();
      // Retornamos apenas os dados que o componente precisa
      return {
        accounts: data.data?.contas || [],
        totalBalance: data.data?.totalBalance || 0,
      };
    },
    // 3. enabled: A query só será executada se o usuário estiver autenticado.
    enabled,
  });
}


/**
 * @hook useTransactions
 * Busca transações paginadas e filtradas.
 */
export function useTransactionsQuery(filters) {
  const { authenticatedFetch, getUserInfo, enabled } = useApi();

  return useQuery({
    // A queryKey agora inclui os filtros. Se os filtros mudarem,
    // o TanStack Query automaticamente fará uma nova busca.
    queryKey: ['transactions', filters],
    queryFn: async ({ queryKey }) => {
      const [_key, currentFilters] = queryKey;
      const userInfo = getUserInfo();
      const queryParams = new URLSearchParams({ userId: userInfo.id.toString() });

      if (currentFilters.type && currentFilters.type !== 'All') queryParams.append('type', currentFilters.type);
      if (currentFilters.limit) queryParams.append('limit', currentFilters.limit.toString());
      if (currentFilters.page) queryParams.append('page', currentFilters.page.toString());
      // Adicione outros filtros aqui (accountId, release_date, etc.)

      const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParams.toString()}`;
      const response = await authenticatedFetch(url);
      if (!response.ok) throw new Error('Erro ao buscar transações');

      const data = await response.json();
      if (data.error) throw new Error(data.message || 'Erro na resposta da API');

      // Estrutura o retorno para ser fácil de usar no componente
      return {
        transactions: data.data?.transactions || [],
        pagination: {
          page: data.page || currentFilters.page || 1,
          total: data.total || 0,
          limit: data.limite || data.limit || currentFilters.limit || 5,
        },
        totalIncome: data.data?.totalIncome || 0,
        totalExpense: data.data?.totalExpense || 0,
      };
    },
    // Mantém os dados da página anterior visíveis enquanto a nova carrega
    placeholderData: (previousData) => previousData,
    enabled: enabled && !!filters, // Só executa se tiver filtros
  });
}

/**
 * @hook useDeleteTransactionMutation
 * Deleta uma transação usando useMutation.
 */
export function useDeleteTransactionMutation() {
  const { authenticatedFetch, getUserInfo } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId) => {
      const userInfo = getUserInfo();
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/{id}?id=${transactionId}&userId=${userInfo.id}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao deletar transação');
      }
      return response.json();
    },
    // onSuccess é o lugar perfeito para invalidar o cache e forçar um refetch.
    onSuccess: () => {
      // Invalida todas as queries que começam com ['transactions'].
      // Isso fará com que a tabela de transações seja atualizada automaticamente.
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

/**
 * @hook useTransactionCategoriesQuery
 * Busca as categorias de transações do usuário.
 */
export function useTransactionCategoriesQuery() {
  const { authenticatedFetch, getUserInfo, enabled, isAuthenticated } = useApi();
  const defaultCategories = React.useMemo(() => [
    { value: 'transporte', label: 'Transporte' },
    { value: 'moradia', label: 'Moradia' },
    { value: 'saúde', label: 'Saúde' },
    { value: 'educação', label: 'Educação' },
    { value: 'lazer', label: 'Lazer' },
    { value: 'vestuário', label: 'Vestuário' },
    { value: 'investimentos', label: 'Investimentos' },
    { value: 'outros', label: 'Outros' },
  ], []);

  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!isAuthenticated() || !getUserInfo()?.id) {
        // Usuário não autenticado, retorna apenas as categorias padrão
        return defaultCategories;
      }
      const userInfo = getUserInfo();
      const queryParams = new URLSearchParams({ userId: userInfo.id.toString() });
      const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParams.toString()}`;
      const response = await authenticatedFetch(url, { method: 'GET' });
      if (!response.ok) {
        return defaultCategories;
      }
      const data = await response.json();
      const transactionsData = (data.data && data.data.transactions) || [];

      const existingCategories = [...new Set(
        transactionsData
          .map(transaction => transaction.category)
          .filter(category => category && category.trim() !== '')
      )];

      // Combinar categorias existentes com as padrão
      const combinedCategories = new Map();

      // Adicionar categorias padrão
      defaultCategories.forEach(cat => {
        const normalizedValue = cat.value.toLowerCase().replace(/\s+/g, '_');
        combinedCategories.set(normalizedValue, {
          value: normalizedValue,
          label: cat.label
        });
      });

      // Adicionar categorias existentes (sobrescrever se já existir)
      existingCategories.forEach(category => {
        const normalizedValue = category.toLowerCase().replace(/\s+/g, '_');
        combinedCategories.set(normalizedValue, {
          value: normalizedValue,
          label: category
        });
      });

      const finalCategories = Array.from(combinedCategories.values())
        .sort((a, b) => a.label.localeCompare(b.label));

      return finalCategories;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * @hook useCreateTransactionMutation
 * Cria uma nova transação.
 */
export function useCreateTransactionMutation() {
  const { authenticatedFetch, getUserInfo } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionData) => {
      const userInfo = getUserInfo();
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions?userId=${userInfo.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao cadastrar transação');
      }
      return response.json();
    },
    onSuccess: () => {
      // Quando uma transação é criada com sucesso, invalidamos os dados que podem ter mudado:
      // 1. A lista de transações
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // 2. Os saldos das contas
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      // 3. A lista de categorias, caso uma nova tenha sido criada
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDownloadReportMutation() {
  const { authenticatedFetch, getUserInfo } = useApi();

  return useMutation({
    mutationFn: async (reportFilters) => {
      const { startDate, endDate, type, accountId } = reportFilters;
      const userInfo = getUserInfo();

      const queryParams = new URLSearchParams({
        userId: userInfo.id.toString(),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        type,
      });

      if (accountId && accountId !== 'all') {
        queryParams.append('accountId', accountId);
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions/download?${queryParams.toString()}`;
      const response = await authenticatedFetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao gerar relatório');
      }

      return response.blob();
    },
  });
}