import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ButtonC from '@/components/Custom-Button'
import RegisterTransactionModal from './registerTransactionModal'
import { useAccountsQuery } from '../../utils/apiClient.js';

const FiltersSection = ({ onFiltersChange }) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(undefined);
  const [selectedAccount, setSelectedAccount] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: accountsData, isLoading: accountsLoading, isError, error } = useAccountsQuery();
  const accounts = accountsData?.accounts ?? [];
  const lastFiltersRef = useRef({});

  useEffect(() => {
    const filters = {
      accountId: selectedAccount !== "All" ? selectedAccount : undefined,
      release_date: date ? date.toISOString().split('T')[0] : undefined
    };
    if (JSON.stringify(filters) !== JSON.stringify(lastFiltersRef.current)) {
      lastFiltersRef.current = filters;
      if (onFiltersChange) {
        onFiltersChange(filters);
      }
    }
  }, [selectedAccount, date, onFiltersChange]);

  return (
    <div className="px-20 mt-10 flex flex-row justify-between">
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col">
          <label className="mb-2 text-base font-medium text-gray-700">Selecione a conta</label>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-56 h-10 border-2 border-neutral-300 rounded-sm">
              <SelectValue placeholder="Todas as contas" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Contas</SelectLabel>
                <SelectItem value="All">Todas as contas</SelectItem>
                {accountsLoading && (
                  <SelectItem value="loading" disabled>
                    Carregando contas...
                  </SelectItem>
                )}
                {isError && !accountsLoading && (
                  <SelectItem value="error" disabled>
                    Erro: {error?.message || 'Erro ao carregar contas'}
                  </SelectItem>
                )}
                {accounts && accounts.length > 0 && accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.name || account.nome || account.accountName || `Conta ${account.id}`}
                  </SelectItem>
                ))}
                {accounts && accounts.length === 0 && !accountsLoading && !isError && (
                  <SelectItem value="empty" disabled>
                    Nenhuma conta encontrada
                  </SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col">
          <Label htmlFor="date" className="mb-2 text-base font-medium text-gray-700">
            Data das transações
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="w-56 h-10 border-2 border-neutral-300 rounded-sm justify-between"
              >
                {date ? date.toLocaleDateString() : "Selecionar data"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  setDate(date);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="mt-8">
        <ButtonC
          texto="Lançar transação"
          largura="120px"
          altura="40px"
          type="button"
          onClick={() => setIsModalOpen(true)}
        />
      </div>

      <RegisterTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export default FiltersSection;
