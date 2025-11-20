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
import RegisterTransactionModal from './registerTransactionModal'
import { useAccountsQuery } from '../../utils/apiClient.js';
import { withPerformanceOptimization, useStableDimensions } from '@/hooks/usePerformanceOptimization';

const FiltersSection = memo(({ onFiltersChange }) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(undefined);
  const [selectedAccount, setSelectedAccount] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: accountsData, isLoading: accountsLoading, isError, error } = useAccountsQuery();
  const lastFiltersRef = useRef({});
  const { dimensions, elementRef } = useStableDimensions({
    minHeight: '120px' 
  });

  const accountItems = useMemo(() => {
    const accounts = accountsData?.accounts ?? [];
    return [
      { value: "All", label: "Todas as contas" },
      ...accounts.map(account => ({
        value: account.id.toString(),
        label: account.name || account.nome || account.accountName || `Conta ${account.id}`
      }))
    ];
  }, [accountsData]);

  useEffect(() => {
    const filters = {
      accountId: selectedAccount !== "All" ? selectedAccount : undefined,
      release_date: date ? date.toISOString().split('T')[0] : undefined
    };
    
    const timeoutId = setTimeout(() => {
      if (JSON.stringify(filters) !== JSON.stringify(lastFiltersRef.current)) {
        lastFiltersRef.current = filters;
        if (onFiltersChange) {
          onFiltersChange(filters);
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedAccount, date, onFiltersChange]);

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    setOpen(false);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div 
      ref={elementRef}
      className="px-20 mt-10 flex flex-row justify-between"
      style={{ minHeight: dimensions.minHeight }}
    >
      <div className="flex flex-wrap gap-6">
        <AccessibleSelect
          value={selectedAccount}
          onValueChange={setSelectedAccount}
          label="Selecione a conta"
          ariaLabel="Selecionar conta para filtrar transações"
          items={accountItems}
          loading={accountsLoading}
          error={isError ? error : null}
          groupLabel="Contas"
          id="account-select"
          dataCy="filter-account-select"
        />
        
        <div className="flex flex-col">
          <Label 
            htmlFor="date-picker" 
            className="mb-2 text-base font-medium text-gray-700"
          >
            Data das transações
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <AccessibleButton
                variant="outline"
                id="date-picker"
                className="w-56 h-10 border-2 border-neutral-300 rounded-sm justify-between"
                ariaLabel={date ? `Data selecionada: ${date.toLocaleDateString()}` : "Selecionar data das transações"}
                ariaDescribedBy="date-help"
                dataCy="filter-date-picker"
              >
                {date ? date.toLocaleDateString() : "Selecionar data"}
                <ChevronDownIcon aria-hidden="true" />
              </AccessibleButton>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto overflow-hidden p-0" 
              align="start"
              role="dialog"
              aria-label="Seletor de data"
            >
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={handleDateSelect}
                aria-label="Selecionar data das transações"
              />
            </PopoverContent>
          </Popover>
          <div id="date-help" className="sr-only">
            Selecione uma data para filtrar as transações por período específico
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <AccessibleButton
          className="w-[160px] h-[40px] border-2 border-neutral-300 rounded-sm bg-white hover:bg-gray-50 text-black hover:cursor-pointer hover:text-white hover:shadow-md hover:bg-brown"
          ariaLabel="Abrir formulário para lançar nova transação"
          onClick={handleModalOpen}
          dataCy="launch-transaction-button"
        >
          Lançar transação
        </AccessibleButton>
      </div>

      <RegisterTransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  )
});

FiltersSection.displayName = 'FiltersSection';

export default withPerformanceOptimization(FiltersSection);
