import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { ChevronDownIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import AccessibleButton from '@/components/AccessibleButton'
import AccessibleSelect from '@/components/AccessibleSelect'
import { withPerformanceOptimization, useStableDimensions } from '@/hooks/usePerformanceOptimization';

const FilterSection = memo(({ onFiltersChange }) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(undefined);
  const [selectedType, setSelectedType] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const lastFiltersRef = useRef({});
  
  // Hook para dimensões estáveis e prevenção de layout shift
  const { dimensions, elementRef } = useStableDimensions({
    minHeight: '120px' // Altura mínima para evitar layout shift
  });

  // Memoização dos tipos de meta
  const typeItems = useMemo(() => [
    { value: "All", label: "Todos os tipos" },
    { value: "income", label: "Receita" },
    { value: "expense", label: "Despesa" }
  ], []);

  useEffect(() => {
    const filters = {
      transaction_type: selectedType !== "All" ? selectedType : undefined,
      month: date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : undefined
    };
    
    // Debounce para evitar muitas chamadas
    const timeoutId = setTimeout(() => {
      if (JSON.stringify(filters) !== JSON.stringify(lastFiltersRef.current)) {
        lastFiltersRef.current = filters;
        if (onFiltersChange) {
          onFiltersChange(filters);
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedType, date, onFiltersChange]);

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    setOpen(false);
  };

  const handleCreateModalOpen = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <div 
      ref={elementRef}
      className="px-20 mt-10 flex flex-row justify-between"
      style={{ minHeight: dimensions.minHeight }}
    >
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col">
          <Label 
            htmlFor="month-picker" 
            className="mb-2 text-base font-medium text-gray-700"
          >
            Mês das metas
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <AccessibleButton
                variant="outline"
                id="month-picker"
                className="w-56 h-10 border-2 border-neutral-300 rounded-sm justify-between"
                ariaLabel={date ? `Mês selecionado: ${date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })}` : "Selecionar mês das metas"}
                ariaDescribedBy="month-help"
              >
                {date ? date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' }) : "Selecionar mês"}
                <ChevronDownIcon aria-hidden="true" />
              </AccessibleButton>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto overflow-hidden p-0" 
              align="start"
              role="dialog"
              aria-label="Seletor de mês"
            >
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={handleDateSelect}
                aria-label="Selecionar mês das metas"
              />
            </PopoverContent>
          </Popover>
          <div id="month-help" className="sr-only">
            Selecione um mês para filtrar as metas por período específico
          </div>
        </div>

        <AccessibleSelect
          value={selectedType}
          onValueChange={setSelectedType}
          label="Tipo de meta"
          ariaLabel="Selecionar tipo de meta"
          items={typeItems}
          loading={false}
          error={null}
          groupLabel="Tipos de meta"
          id="type-select"
        />
      </div>
      
      <div className="mt-6">
        <AccessibleButton
          className="w-[160px] h-[40px] border-2 border-neutral-300 rounded-sm bg-white text-black hover:cursor-pointer hover:text-white hover:shadow-md hover:bg-brown"
          ariaLabel="Abrir formulário para criar nova meta"
          onClick={handleCreateModalOpen}
        >
          Criar meta
        </AccessibleButton>
      </div>

      {/* TODO: Implementar modal de criação de meta */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Criar Meta</h2>
            <p className="text-gray-600 mb-4">Modal de criação de meta em desenvolvimento...</p>
            <AccessibleButton
              onClick={handleCreateModalClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Fechar
            </AccessibleButton>
          </div>
        </div>
      )}
    </div>
  )
});

FilterSection.displayName = 'FilterSection';

export default withPerformanceOptimization(FilterSection);
