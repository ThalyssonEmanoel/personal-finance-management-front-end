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
      if (currentFilters.limit && currentFilters.limit !== undefined) queryParams.append('limit', currentFilters.limit.toString());
      if (currentFilters.page && currentFilters.page !== undefined) queryParams.append('page', currentFilters.page.toString());
      if (currentFilters.accountId && currentFilters.accountId !== 'All') queryParams.append('accountId', currentFilters.accountId);
      if (currentFilters.release_date) queryParams.append('release_date', currentFilters.release_date);
      if (currentFilters.category) queryParams.append('category', currentFilters.category);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParams.toString()}`;
      const response = await authenticatedFetch(url);
      
      if (response.status === 404) {
        return {
          transactions: [],
          pagination: {
            page: currentFilters.page || 1,
            total: 0,
            limit: currentFilters.limit || 5,
          },
          totalIncome: 0,
          totalExpense: 0,
        };
      }
      
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
    retry: (failureCount, error) => {
      // Não tenta novamente para erros 404 (usuário sem transações)
      if (error?.message?.includes('404')) {
        return false;
      }
      return failureCount < 3;
    },
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
      
      try {
        const userInfo = getUserInfo();
        const queryParams = new URLSearchParams({ userId: userInfo.id.toString() });
        const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParams.toString()}`;
        const PreResponse = await authenticatedFetch(url, { method: 'GET' });
        
        // Se 404, usuário não tem transações ainda, retorna categorias padrão
        if (PreResponse.status === 404) {
          return defaultCategories;
        }
        
        if (!PreResponse.ok) {
          return defaultCategories;
        }
        
        const data = await PreResponse.json();

        // Se não há total ou é 0, retorna categorias padrão
        if (!data.total || data.total === 0) {
          return defaultCategories;
        }

        const queryParamsFinal = new URLSearchParams({ 
          userId: userInfo.id.toString(), 
          limit: data.total.toString(), 
          page: '1' 
        });
        const urlFinal = `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParamsFinal.toString()}`;

        const response = await authenticatedFetch(urlFinal, { method: 'GET' });
        
        if (!response.ok) {
          return defaultCategories;
        }
        
        const dataFinal = await response.json();
        const transactionsData = (dataFinal.data && dataFinal.data.transactions) || [];

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
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        return defaultCategories;
      }
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      // Não tenta novamente para erros relacionados a usuários sem transações
      if (error?.message?.includes('404')) {
        return false;
      }
      return failureCount < 2;
    },
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
    queryKey: ['transactions-chart', filters],
    queryFn: async ({ queryKey }) => {
      const [_key, currentFilters] = queryKey;
      const userInfo = getUserInfo();

      try {
        const queryParams = new URLSearchParams({ userId: userInfo.id.toString() });
        const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParams.toString()}`;
        const PreResponse = await authenticatedFetch(url, { method: 'GET' });
        
        // Se 404, usuário não tem transações ainda
        if (PreResponse.status === 404) {
          return {
            transactions: [],
            pagination: {
              page: 1,
              total: 0,
              limit: 5,
            },
            totalIncome: 0,
            totalExpense: 0,
          };
        }
        
        if (!PreResponse.ok) {
          throw new Error('Erro ao buscar dados iniciais das transações');
        }
        
        const data = await PreResponse.json();

        // Se não há total ou é 0, retorna dados vazios
        if (!data.total || data.total === 0) {
          return {
            transactions: [],
            pagination: {
              page: 1,
              total: 0,
              limit: 5,
            },
            totalIncome: 0,
            totalExpense: 0,
          };
        }

        const queryParamsFinal = new URLSearchParams({ 
          userId: userInfo.id.toString(), 
          limit: data.total.toString(), 
          page: '1' 
        });

        if (currentFilters.type && currentFilters.type !== 'All') queryParamsFinal.append('type', currentFilters.type);
        if (currentFilters.accountId && currentFilters.accountId !== 'All') queryParamsFinal.append('accountId', currentFilters.accountId);
        if (currentFilters.release_date) queryParamsFinal.append('release_date', currentFilters.release_date);

        const urlFinal = `${process.env.NEXT_PUBLIC_API_URL}/transactions?${queryParamsFinal.toString()}`;
        const responseFinal = await authenticatedFetch(urlFinal);
        
        if (!responseFinal.ok) throw new Error('Erro ao buscar transações para gráfico');
        
        const dataFinal = await responseFinal.json();
        if (dataFinal.error) throw new Error(dataFinal.message || 'Erro na resposta da API');

        return {
          transactions: dataFinal.data?.transactions || [],
          pagination: {
            page: dataFinal.page || 1,
            total: dataFinal.total || 0,
            limit: dataFinal.limite || dataFinal.limit || 5,
          },
          totalIncome: dataFinal.data?.totalIncome || 0,
          totalExpense: dataFinal.data?.totalExpense || 0,
        };
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error);
        // Retorna dados vazios em caso de erro
        return {
          transactions: [],
          pagination: {
            page: 1,
            total: 0,
            limit: 5,
          },
          totalIncome: 0,
          totalExpense: 0,
        };
      }
    },
    placeholderData: (previousData) => previousData,
    enabled: enabled,
    retry: (failureCount, error) => {
      // Não tenta novamente para erros 404 (usuário sem transações)
      if (error?.message?.includes('404')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useGoalsQuery(filters, transactionType) {
  const { authenticatedFetch, getUserInfo, enabled } = useApi();

  return useQuery({
    queryKey: ['goals', filters, transactionType],
    queryFn: async ({ queryKey }) => {
      const [_key, currentFilters, type] = queryKey;
      const userInfo = getUserInfo();
      const queryParams = new URLSearchParams({ userId: userInfo.id.toString() });

      if (type) {
        queryParams.append('transaction_type', type);
      }

      if (currentFilters.goalsDate) {
        queryParams.append('date', currentFilters.goalsDate);
      } else {
        const currentYear = new Date().getFullYear();
        const firstDayOfYear = new Date(currentYear, 0, 1);
        queryParams.append('date', firstDayOfYear.toISOString().split('T')[0]);
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/goals?${queryParams.toString()}`;
      const response = await authenticatedFetch(url);

      if (!response.ok) throw new Error('Erro ao buscar metas');

      const data = await response.json();
      if (data.error) throw new Error(data.message || 'Erro na resposta da API');

      return {
        goals: data.data || [],
        total: data.total || 0,
      };
    },
    placeholderData: (previousData) => previousData,
    enabled: enabled,
  });
}

export function usePaymentMethodsQuery() {
  const { authenticatedFetch, enabled } = useApi();

  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment-methods`
      );
      if (!response.ok) throw new Error('Erro ao buscar métodos de pagamento');
      const data = await response.json();
      return data.data || data || [];
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreatePaymentMethodMutation() {
  const { authenticatedFetch } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethodData) => {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment-methods`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentMethodData),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao criar método de pagamento');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
}

export function useAccountQuery(accountId) {
  const { authenticatedFetch, getUserInfo, enabled } = useApi();

  return useQuery({
    queryKey: ['account', accountId],
    queryFn: async () => {
      if (!accountId) return null;
      
      const userInfo = getUserInfo();
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/account/${accountId}?userId=${userInfo.id}`,
        { method: 'GET' }
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar conta');
      }
      
      const data = await response.json();
      return data.data;
    },
    enabled: enabled && !!accountId,
  });
}

export function useDeleteAccountMutation() {
  const { authenticatedFetch, getUserInfo } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId) => {
      const userInfo = getUserInfo();
      console.log('Deleting account with ID:', accountId, 'for user ID:', userInfo.id);
      
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/account/{id}?id=${accountId}&userId=${userInfo.id}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        let errorMessage = 'Erro ao excluir conta';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useUpdateAccountMutation() {
  const { authenticatedFetch, getUserInfo } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, accountData }) => {
      const userInfo = getUserInfo();
      const formData = new FormData();
      
      Object.keys(accountData).forEach(key => {
        if (key === 'icon' && accountData[key]) {
          formData.append('icon', accountData.icon);
        } else if (key === 'paymentMethodIds') {
          formData.append('paymentMethodIds', accountData[key]);
        } else if (accountData[key] !== null && accountData[key] !== undefined) {
          formData.append(key, accountData[key]);
        }
      });

      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/account/{id}?id=${accountId}&userId=${userInfo.id}`,
        {
          method: 'PATCH',
          body: formData,
        }
      );
      
      if (!response.ok) {
        let errorMessage = 'Erro ao atualizar conta';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useCreateAccountMutation() {
  const { authenticatedFetch, getUserInfo } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountData) => {
      const userInfo = getUserInfo();
      const formData = new FormData();
      
      // Adiciona cada campo individualmente ao FormData
      Object.keys(accountData).forEach(key => {
        if (key === 'icon' && accountData[key]) {
          formData.append('icon', accountData.icon);
        } else if (key === 'paymentMethodIds') {
          // Envia como string separada por vírgulas
          formData.append('paymentMethodIds', accountData[key]);
        } else if (accountData[key] !== null && accountData[key] !== undefined) {
          formData.append(key, accountData[key]);
        }
      });

      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/account?userId=${userInfo.id}`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        let errorMessage = 'Erro ao criar conta';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useAccountTypesQuery() {
  const { authenticatedFetch, getUserInfo, enabled } = useApi();
  const defaultTypes = React.useMemo(() => [
    { value: 'corrente', label: 'Corrente' },
    { value: 'poupanca', label: 'Poupança' },
    { value: 'carteira', label: 'Carteira' },
    { value: 'investimento', label: 'Investimento' }
  ], []);

  return useQuery({
    queryKey: ['account-types'],
    queryFn: async () => {
      if (!getUserInfo()?.id) {
        return defaultTypes;
      }

      const userInfo = getUserInfo();
      const queryParams = new URLSearchParams({ userId: userInfo.id.toString() });

      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/account/${userInfo.id}?${queryParams.toString()}`;
        const response = await authenticatedFetch(url, { method: 'GET' });
        const data = await response.json();

        const accountsData = data.data?.contas || [];

        if (!response.ok) {
          return defaultTypes;
        }
        const existingTypes = [...new Set(
          accountsData
            .map(account => account.type)
            .filter(type => type && type.trim() !== '')
        )];

        const combinedTypes = new Map();
        defaultTypes.forEach(type => {
          combinedTypes.set(type.value, type);
        });
        existingTypes.forEach(type => {
          if (!combinedTypes.has(type)) {
            const typeMap = {
              'corrente': 'Corrente',
              'poupanca': 'Poupança',
              'carteira': 'Carteira',
              'investimento': 'Investimento'
            };
            combinedTypes.set(type, {
              value: type,
              label: typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1)
            });
          }
        });

        const finalTypes = Array.from(combinedTypes.values())
          .sort((a, b) => a.label.localeCompare(b.label));

        return finalTypes;
      } catch (error) {
        console.error('Erro ao buscar tipos de conta:', error);
        return defaultTypes;
      }
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}