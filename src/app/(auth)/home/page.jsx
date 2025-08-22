'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from "@/hooks/useAuth"
import { Progress } from "@/components/ui/progress"
import { InfoCard, TransactionsTable, FiltersSection } from '@/components/ComponentsForHome'

export default function HomePage() {
  const { getUserInfo, isLoading, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState(0);
  const [filters, setFilters] = useState({});

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
    console.log('HomePage - Filtros recebidos:', newFilters);
    setFilters(newFilters);
  }, []);

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

  if (!isAuthenticated()) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem'
      }}>
        Acesso não autorizado
      </div>
    );
  }

  return (
    <>
      <FiltersSection onFiltersChange={handleFiltersChange} />
      <div className="mt-6 px-20 grid md:grid-cols-3 gap-6">
        <InfoCard
          title="Saldo total"
          value="R$ 5.000,00"
          isPositive={true}
        />
        <InfoCard
          title="Receitas de julho"
          value="R$ 2.500,00"
          isPositive={true}
          top3={["Salário", "Investimentos", "Apostas"]}
        />
        <InfoCard
          title="Despesas de julho"
          value="R$ 1.500,00"
          isPositive={false}
          top3={["Contas", "Mercado", "Lazer"]}
        />
      </div>
      <div className="px-20 mt-10 mb-40">
        <TransactionsTable filters={filters} />
      </div>
    </>
  );
}