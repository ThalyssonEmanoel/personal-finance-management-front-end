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
import RegisterGoalModal from './RegisterGoalModal';

const FilterSection = memo(({ onFiltersChange }) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(undefined);
  const [selectedType, setSelectedType] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const lastFiltersRef = useRef({});
  
  const { dimensions, elementRef } = useStableDimensions({
    minHeight: '120px' 
  });


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
    
    // Remove propriedades undefined para evitar problemas
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );
    
    const timeoutId = setTimeout(() => {
      if (JSON.stringify(cleanFilters) !== JSON.stringify(lastFiltersRef.current)) {
        lastFiltersRef.current = cleanFilters;
        if (onFiltersChange) {
          onFiltersChange(cleanFilters);
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

      {/* Modal para criação de nova meta */}
      <RegisterGoalModal 
        isOpen={isCreateModalOpen} 
        onClose={handleCreateModalClose} 
      />
    </div>
  )
});

FilterSection.displayName = 'FilterSection';

export default withPerformanceOptimization(FilterSection);
