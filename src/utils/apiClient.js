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
      if (currentFilters.category) queryParams.append('category', currentFilters.category);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParams.toString()}`;
      const response = await authenticatedFetch(url);
      if (!response.ok) throw new Error('Erro ao buscar transações');

      const data = await response.json();
      if (data.error) throw new Error(data.message || 'Erro na resposta da API');

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
    onSuccess: () => {
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
        return defaultCategories;
      }
      const userInfo = getUserInfo();
      const queryParams = new URLSearchParams({ userId: userInfo.id.toString() });
      const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParams.toString()}`;
      const PreResponse = await authenticatedFetch(url, { method: 'GET' });
      const data = await PreResponse.json();

      const queryParamsFinal = new URLSearchParams({ userId: userInfo.id.toString(), limit: data.total, page: 1 });
      const urlFinal = `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParamsFinal.toString()}`;

      const response = await authenticatedFetch(urlFinal, { method: 'GET' });
      const dataFinal = await response.json();

      const transactionsData = (dataFinal.data && dataFinal.data.transactions) || [];

      if (!response.ok) {
        return defaultCategories;
      }

      const existingCategories = [...new Set(
        transactionsData
          .map(transaction => transaction.category)
          .filter(category => category && category.trim() !== '')
      )];

      const combinedCategories = new Map();

      defaultCategories.forEach(cat => {
        const normalizedValue = cat.value.replace(/\s+/g, '_');
        combinedCategories.set(normalizedValue, {
          value: normalizedValue,
          label: cat.label
        });
      });

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
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
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
      const userInfo = getUserInfo();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions/{id}?id=${transactionId}&userId=${userInfo.id}`;

      const response = await authenticatedFetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.message || `Erro ao atualizar transação (HTTP ${response.status})`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useTransactionsChartQuery(filters) {
  const { authenticatedFetch, getUserInfo, enabled } = useApi();

  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async ({ queryKey }) => {
      const [_key, currentFilters] = queryKey;
      const userInfo = getUserInfo();

      const queryParams = new URLSearchParams({ userId: userInfo.id.toString() });
      const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParams.toString()}`;
      const PreResponse = await authenticatedFetch(url, { method: 'GET' });
      const data = await PreResponse.json();

      const queryParamsFinal = new URLSearchParams({ userId: userInfo.id.toString(), limit: data.total, page: 1 });

      if (currentFilters.type && currentFilters.type !== 'All') queryParamsFinal.append('type', currentFilters.type);
      if (currentFilters.accountId && currentFilters.accountId !== 'All') queryParamsFinal.append('accountId', currentFilters.accountId);
      if (currentFilters.release_date) queryParamsFinal.append('release_date', currentFilters.release_date);

      const urlFinal = `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParamsFinal.toString()}`;
      const responseFinal = await authenticatedFetch(urlFinal);
      if (!responseFinal.ok) throw new Error('Erro ao buscar transações');
      const dataFinal = await responseFinal.json();
      if (dataFinal.error) throw new Error(dataFinal.message || 'Erro na resposta da API');

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