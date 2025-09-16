'use client'
import { useAuth } from "@/hooks/useAuth"
import { useState, useCallback } from 'react'
import FilterSection from '@/components/ComponentsForGoals/FilterSection'
import GoalsTable from '@/components/ComponentsForGoals/GoalsTable'

export default function GoalsPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const [filters, setFilters] = useState({});

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  if (isLoading()) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem'
      }}>
        Carregando...
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
    <div>
      <FilterSection onFiltersChange={handleFiltersChange} />
      
      <section
        className="px-20 mb-10"
        aria-label="Tabela de metas"
        style={{ minHeight: '300px' }}
      >
        <GoalsTable filters={filters} />
      </section>
    </div>
  );
}
