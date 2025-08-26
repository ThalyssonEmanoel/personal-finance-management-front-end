'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from "@/hooks/useAuth"
import { Progress } from "@/components/ui/progress"
import { InfoCard, TransactionsTable, FiltersSection } from '@/components/ComponentsForHome'
import { useAccounts, useTransactions } from '@/utils/apiClient'

export default function HomePage() {
  const { isLoading } = useAuth();
  const [progress, setProgress] = useState(0);
  const [filters, setFilters] = useState({});
  const [forceUpdate, setForceUpdate] = useState(0);
  const { totalBalance, accounts, refetch: refetchAccounts } = useAccounts()
  const { totalIncome, totalExpense, topIncomes, topExpenses, refetch: refetchTransactions } = useTransactions()
  const handleTransactionSuccess = React.useCallback(() => {
    refetchAccounts()
    refetchTransactions(filters)
    setForceUpdate(prev => prev + 1)
  }, [refetchAccounts, refetchTransactions, filters])
  const getCurrentBalance = () => {
    if (filters.accountId && filters.accountId !== "All") {
      const selectedAccount = accounts.find(account => account.id.toString() === filters.accountId.toString())
      return selectedAccount?.balance || 0
    }
    return totalBalance
  }

  useEffect(() => {
    if (isLoading()) {
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 100);
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleFiltersChange = React.useCallback((newFilters) => {
    // console.log('HomePage - Filtros recebidos:', newFilters);
    setFilters(newFilters);
  }, []);

  useEffect(() => {
    const hasValidFilters = filters.accountId || filters.release_date
    if (hasValidFilters) {
      // console.log('HomePage - Atualizando cards com filtros:', filters)
      refetchTransactions(filters);
    } else {
      // console.log('HomePage - Removendo filtros, atualizando cards com todos os dados')
      refetchTransactions({});
    }
  }, [filters]); 

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0)
  }

  if (isLoading()) {
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
        <Progress value={progress} className="w-[20%]" />
      </div>
    );
  }

  return (
    <>
      <FiltersSection
        onFiltersChange={handleFiltersChange}
        onTransactionSuccess={handleTransactionSuccess}
      />
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
          top3={topIncomes.length > 0 ? topIncomes : ["Nenhuma receita"]}
        />
        <InfoCard
          title="Despesas"
          value={formatCurrency(totalExpense)}
          isPositive={false}
          top3={topExpenses.length > 0 ? topExpenses : ["Nenhuma despesa"]}
        />
      </div>
      <div className="px-20 mt-10 mb-40">
        <TransactionsTable
          filters={filters}
          key={forceUpdate}
          onTransactionChange={handleTransactionSuccess} 
        />
      </div>
    </>
  );
}