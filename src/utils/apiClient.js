'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth.js';
import React from 'react';


const useApi = () => {
  const { getUserInfo, isAuthenticated, authenticatedFetch, status } = useAuth();
  const enabled = status === 'authenticated' && !!getUserInfo()?.id;
  return { getUserInfo, isAuthenticated, authenticatedFetch, enabled };
};

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

export function useTransactionsQuery(filters) {
  const { authenticatedFetch, getUserInfo, enabled } = useApi();

  return useQuery({
    // o TanStack Query automaticamente fará uma nova busca.
    queryKey: ['transactions', filters],
    queryFn: async ({ queryKey }) => {
      const [_key, currentFilters] = queryKey;
      const userInfo = getUserInfo();
      const queryParams = new URLSearchParams({ userId: userInfo.id.toString() });

      if (currentFilters.type && currentFilters.type !== 'All') queryParams.append('type', currentFilters.type);
      if (currentFilters.limit) queryParams.append('limit', currentFilters.limit.toString());
      if (currentFilters.page) queryParams.append('page', currentFilters.page.toString());
      if (currentFilters.accountId && currentFilters.accountId !== 'All') queryParams.append('accountId', currentFilters.accountId);
      if (currentFilters.release_date) queryParams.append('release_date', currentFilters.release_date);

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
    placeholderData: (previousData) => previousData,
    enabled: enabled,
  });
}

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

export function useTransactionCategoriesQuery() {
  const { authenticatedFetch, getUserInfo, enabled, isAuthenticated } = useApi();
  const defaultCategories = React.useMemo(() => [
    { value: 'Transporte', label: 'Transporte' },
    { value: 'Moradia', label: 'Moradia' },
    { value: 'Saúde', label: 'Saúde' },
    { value: 'Educação', label: 'Educação' },
    { value: 'Lazer', label: 'Lazer' },
    { value: 'Vestuário', label: 'Vestuário' },
    { value: 'Investimentos', label: 'Investimentos' },
    { value: 'Outros', label: 'Outros' },
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
      const PreResponse = await authenticatedFetch(url, { method: 'GET' });
      const data = await PreResponse.json();
      console.log("Total e limite", data.total, data.limite);

      const queryParamsFinal = new URLSearchParams({ userId: userInfo.id.toString(), limit: data.total, page: 1 });
      const urlFinal = `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParamsFinal.toString()}`;
      console.log("URL Final", urlFinal);

      const response = await authenticatedFetch(urlFinal, { method: 'GET' });
      const dataFinal = await response.json();

      const transactionsData = (dataFinal.data && dataFinal.data.transactions) || [];

      console.log("Transações", transactionsData);
      if (!response.ok) {
        return defaultCategories;
      }

      const existingCategories = [...new Set(
        transactionsData
          .map(transaction => transaction.category)
          .filter(category => category && category.trim() !== '')
      )];

      // Combinar categorias existentes com as padrão
      const combinedCategories = new Map();

      // Adicionar categorias padrão
      defaultCategories.forEach(cat => {
        const normalizedValue = cat.value.replace(/\s+/g, '_');
        combinedCategories.set(normalizedValue, {
          value: normalizedValue,
          label: cat.label
        });
      });

      // Adicionar categorias existentes (sobrescrever se já existir)
      existingCategories.forEach(category => {
        const normalizedValue = category.replace(/\s+/g, '_');
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

export function useUpdateTransactionMutation() {
  const { authenticatedFetch, getUserInfo } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, transactionData }) => {
      console.log('Update mutation called with:', { transactionId, transactionData });

      const userInfo = getUserInfo();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions/{id}?id=${transactionId}&userId=${userInfo.id}`;

      console.log('Making PATCH request to:', url);
      console.log('Request body:', JSON.stringify(transactionData));

      const response = await authenticatedFetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        console.error('Response not ok. Status:', response.status, 'StatusText:', response.statusText);
        const responseText = await response.text();
        console.error('Response text:', responseText);

        let errorData = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse error response as JSON:', e);
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }

        console.error('Update failed:', errorData);
        throw new Error(errorData.message || `Erro ao atualizar transação (HTTP ${response.status})`);
      }

      const result = await response.json();
      console.log('Update successful:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Mutation onSuccess called with:', data);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error) => {
      console.error('Mutation onError called with:', error);
    }
  });
}

export function useTransactionsChartQuery(filters) {
  const { authenticatedFetch, getUserInfo, enabled } = useApi();

  return useQuery({
    // o TanStack Query automaticamente fará uma nova busca.
    queryKey: ['transactions', filters],
    queryFn: async ({ queryKey }) => {
      const [_key, currentFilters] = queryKey;
      const userInfo = getUserInfo();

      const queryParams = new URLSearchParams({ userId: userInfo.id.toString() });
      const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParams.toString()}`;
      const PreResponse = await authenticatedFetch(url, { method: 'GET' });
      const data = await PreResponse.json();
      console.log("Total e limite", data.total, data.limite);

      const queryParamsFinal = new URLSearchParams({ userId: userInfo.id.toString(), limit: data.total, page: 1 });

      console.log("Query params finais:", queryParamsFinal.toString());

      if (currentFilters.type && currentFilters.type !== 'All') queryParamsFinal.append('type', currentFilters.type);
      if (currentFilters.accountId && currentFilters.accountId !== 'All') queryParamsFinal.append('accountId', currentFilters.accountId);
      if (currentFilters.release_date) queryParamsFinal.append('release_date', currentFilters.release_date);

      const urlFinal = `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParamsFinal.toString()}`;
      console.log("URL Final charts", urlFinal);
      const responseFinal = await authenticatedFetch(urlFinal);
      if (!responseFinal.ok) throw new Error('Erro ao buscar transações');
      const dataFinal = await responseFinal.json();
      if (dataFinal.error) throw new Error(dataFinal.message || 'Erro na resposta da API');


      // Estrutura o retorno para ser fácil de usar no componente
      return {
        transactions: dataFinal.data?.transactions || [],
        pagination: {
          page: dataFinal.page || currentFilters.page || 1,
          total: dataFinal.total || 0,
          limit: dataFinal.limite || dataFinal.limit || currentFilters.limit || 5,
        },
        totalIncome: dataFinal.data?.totalIncome || 0,
        totalExpense: dataFinal.data?.totalExpense || 0,
      };
    },
    placeholderData: (previousData) => previousData,
    enabled: enabled,
  });
}