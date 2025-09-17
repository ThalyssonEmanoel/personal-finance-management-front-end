'use client'
import { useAuth } from "@/hooks/useAuth"
import { useState, useCallback } from 'react'
import FilterSection from '@/components/ComponentsForGoals/FilterSection'
import GoalsTable from '@/components/ComponentsForGoals/GoalsTable'
import { Progress } from "@/components/ui/progress"

export default function GoalsPage() {
  const { isLoading } = useAuth();
  const [filters, setFilters] = useState({});

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  if (isLoading()) {
    return (
      <div
        className="flex flex-col items-center justify-center mt-100"
        style={{ minHeight: '400px' }}
      >
        <span className="text-lg mb-4">Carregando gráficos...</span>
        <Progress value={100} className="w-[20%]" />
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
