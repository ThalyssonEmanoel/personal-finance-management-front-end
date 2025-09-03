
'use client'

import React, { useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { InfoCard, TransactionsTable, FiltersSection, ChartsSection } from '@/components/ComponentsForHome';
import { useAccountsQuery, useTransactionsQuery } from '@/utils/apiClient';


export default function HomePage() {
  const { isLoading: isAuthLoading } = useAuth();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 5
  });

  const { data: accountsData, isLoading: isAccountsLoading } = useAccountsQuery();
  const { data: transactionsData, isLoading: isTransactionsLoading } = useTransactionsQuery(filters);

  const totalBalance = accountsData?.totalBalance ?? 0;
  const accounts = accountsData?.accounts ?? [];
  const totalIncome = transactionsData?.totalIncome ?? 0;
  console.log("Total Income:", totalIncome);

  const totalExpense = transactionsData?.totalExpense ?? 0;

  const getCurrentBalance = () => {
    if (filters.accountId && filters.accountId !== "All") {
      const selectedAccount = accounts.find(acc => acc.id.toString() === filters.accountId.toString());
      return selectedAccount?.balance || 0;
    }
    return totalBalance;
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters,
      page: 1
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const isLoading = isAuthLoading() || isAccountsLoading || isTransactionsLoading;

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '1rem',
        fontSize: '1.2rem'
      }}>
        <span>Carregando...</span>
        <Progress value={100} className="w-[20%]" />
      </div>
    );
  }

  return (
    <>
      <FiltersSection onFiltersChange={handleFiltersChange} />
      <div className="mt-6 px-20 grid md:grid-cols-3 gap-6">
        <InfoCard
          title="Saldo total"
          value={formatCurrency(getCurrentBalance())}
          isPositive={getCurrentBalance() >= 0}
        />
        <InfoCard
          title="Receitas"
          value={formatCurrency(totalIncome)}
          isPositive={true}
        />
        <InfoCard
          title="Despesas"
          value={formatCurrency(totalExpense)}
          isPositive={false}
        />
      </div>
      <div className="px-20 mt-10 mb-10">
        <TransactionsTable
          filters={filters}
        />
      </div>
      <div className="mt-10 mb-10">
        <ChartsSection className="px-20 mt-10 pb-10" filters={filters} />
      </div>
    </>
  );
}