'use client'

import React, { useState, memo, useMemo, Suspense } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { InfoCard, TransactionsTable, FiltersSection } from '@/components/ComponentsForHome';
import { useAccountsQuery, useTransactionsQuery } from '@/utils/apiClient';
import { useStableDimensions } from '@/hooks/usePerformanceOptimization';

// Lazy load do ChartsSection para reduzir JavaScript inicial
const ChartsSection = React.lazy(() => import('@/components/ComponentsForHome/ChartsSection'));

// Componente de loading otimizado para evitar layout shift
const LoadingFallback = memo(() => (
  <div 
    className="flex flex-col items-center justify-center"
    style={{ minHeight: '400px' }} // Altura fixa para evitar layout shift
  >
    <span className="text-lg mb-4">Carregando gráficos...</span>
    <Progress value={100} className="w-[20%]" />
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

// Componente principal otimizado
const HomePage = memo(() => {
  const { isLoading: isAuthLoading } = useAuth();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 5
  });
  
  const { data: accountsData, isLoading: isAccountsLoading } = useAccountsQuery();
  const { data: transactionsData, isLoading: isTransactionsLoading, isError: isTransactionsError } = useTransactionsQuery(filters);
  
  // Hook para dimensões estáveis
  const { dimensions, elementRef } = useStableDimensions({
    minHeight: '100vh'
  });

  // Memoização dos valores calculados
  const calculatedValues = useMemo(() => {
    const totalBalance = accountsData?.totalBalance ?? 0;
    const accounts = accountsData?.accounts ?? [];
    const totalIncome = transactionsData?.totalIncome ?? 0;
    const totalExpense = transactionsData?.totalExpense ?? 0;
    
    return { totalBalance, accounts, totalIncome, totalExpense };
  }, [accountsData, transactionsData]);

  const { totalBalance, accounts, totalIncome, totalExpense } = calculatedValues;

  const getCurrentBalance = useMemo(() => {
    if (filters.accountId && filters.accountId !== "All") {
      const selectedAccount = accounts.find(acc => acc.id.toString() === filters.accountId.toString());
      return selectedAccount?.balance || 0;
    }
    return totalBalance;
  }, [filters.accountId, accounts, totalBalance]);

  const handleFiltersChange = (newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters,
      page: 1
    }));
  };

  const handleCategoryClick = (category) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      category: category,
      page: 1
    }));
  };

  const formatCurrency = useMemo(() => {
    return (value) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value || 0);
    };
  }, []);

  const isLoading = isAuthLoading() || isAccountsLoading || (isTransactionsLoading && !isTransactionsError);

  if (isLoading) {
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: '1rem',
          fontSize: '1.2rem'
        }}
        aria-live="polite"
        aria-label="Carregando página principal"
      >
        <span>Carregando...</span>
        <Progress value={100} className="w-[20%]" />
      </div>
    );
  }

  return (
    <div 
      ref={elementRef}
      style={{ minHeight: dimensions.minHeight }}
      role="main"
      aria-label="Página principal do sistema financeiro"
    >
      <section aria-label="Filtros de transações">
        <FiltersSection onFiltersChange={handleFiltersChange} />
      </section>
      
      <section 
        className="mt-6 px-20 grid md:grid-cols-3 gap-6"
        aria-label="Resumo financeiro"
        style={{ minHeight: '120px' }} // Altura fixa para evitar layout shift
      >
        <InfoCard
          title="Saldo total"
          value={formatCurrency(getCurrentBalance)}
          isPositive={getCurrentBalance >= 0}
          ariaLabel={`Saldo total atual: ${formatCurrency(getCurrentBalance)}`}
        />
        <InfoCard
          title="Receitas"
          value={formatCurrency(totalIncome)}
          isPositive={true}
          ariaLabel={`Total de receitas: ${formatCurrency(totalIncome)}`}
        />
        <InfoCard
          title="Despesas"
          value={formatCurrency(totalExpense)}
          isPositive={false}
          ariaLabel={`Total de despesas: ${formatCurrency(totalExpense)}`}
        />
      </section>
      
      <section 
        className="px-20 mt-10 mb-10"
        aria-label="Tabela de transações"
        style={{ minHeight: '300px' }} // Altura mínima para evitar layout shift
      >
        <TransactionsTable filters={filters} />
      </section>
      
      <section 
        className="mt-10 mb-10"
        aria-label="Gráficos e análises"
        style={{ minHeight: '400px' }} // Altura mínima para evitar layout shift
      >
        <Suspense fallback={<LoadingFallback />}>
          <ChartsSection
            className="px-20 mt-10 pb-10"
            filters={filters}
            onCategoryClick={handleCategoryClick}
          />
        </Suspense>
      </section>
    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;