import React, { useState } from 'react';
import { ChevronDownIcon } from "lucide-react"
import ButtonC from '../Custom-Button';
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
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
import { useAuth } from "@/hooks/useAuth"
import { useAccountsQuery, useDownloadReportMutation } from '@/utils/apiClient';

export function ReportDownloadModal({ isOpen, onClose }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [type, setType] = useState('all');
  const [accountId, setAccountId] = useState('');
  const { getUserInfo } = useAuth();
  const { data, isLoading: isLoadingAccounts } = useAccountsQuery();
  const { mutate: downloadReport, isPending, isError, error, isSuccess } = useDownloadReportMutation();
  const accounts = data?.accounts ?? [];
  const user = getUserInfo();

  if (!isOpen) return null;

  const validateDates = () => {
    if (!startDate || !endDate) {
      return { isValid: false, message: 'Por favor, selecione as datas de início e fim.' };
    }

    if (startDate > endDate) {
      return { isValid: false, message: 'A data de início deve ser anterior à data de fim.' };
    }
    return { isValid: true };
  };

  const handleDownload = () => {
    const validation = validateDates();
    if (!validation.isValid) {
      // Você pode ter um estado local para erros de formulário se quiser
      alert(validation.message);
      return;
    }

    if (!user?.id) {
      alert('Usuário não encontrado.');
      return;
    }

    downloadReport({ startDate, endDate, type, accountId }, {
      onSuccess: (blob) => {
        // Lógica para criar o link e iniciar o download
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `relatorio.pdf`; // Nome do arquivo
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        setTimeout(() => {
          onClose();
        }, 2000);
      }
    });
  };

  const handleClose = () => {
    setStartDate(null);
    setEndDate(null);
    setType('all');
    setAccountId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="relative mb-4">
          <h2 className="text-xl font-semibold text-center w-full">
            Baixar Extrato
          </h2>
          <button
            onClick={handleClose}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-6">
          <Card>
            <CardContent className="grid gap-6 pt-6">
              {isError && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              {isSuccess && (
                <div className="text-green-500 text-sm text-center bg-green-50 p-2 rounded">
                  Download iniciado com sucesso!
                </div>
              )}
              <div className="grid gap-2">
                <Label className="text-base font-medium text-gray-700">Data de início *</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-10 border-2 border-neutral-300 rounded-sm justify-between"
                    >
                      {startDate ? startDate.toLocaleDateString('pt-BR') : "Selecionar data de início"}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setStartDate(date);
                        setStartDateOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label className="text-base font-medium text-gray-700">Data de fim *</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-10 border-2 border-neutral-300 rounded-sm justify-between"
                    >
                      {endDate ? endDate.toLocaleDateString('pt-BR') : "Selecionar data de fim"}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setEndDate(date);
                        setEndDateOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label className="text-base font-medium text-gray-700">Tipo de transação</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="border-2 border-neutral-300 rounded-sm w-full">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tipo de transação</SelectLabel>
                      <SelectItem value="all">Todas as transações</SelectItem>
                      <SelectItem value="income">Apenas receitas</SelectItem>
                      <SelectItem value="expense">Apenas despesas</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-base font-medium text-gray-700">Conta (opcional)</Label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger className="border-2 border-neutral-300 rounded-sm w-full">
                    <SelectValue placeholder="Todas as contas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Contas</SelectLabel>
                      <SelectItem value="all">Todas as contas</SelectItem>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <ButtonC
                texto="Cancelar"
                largura="50%"
                altura="40px"
                type="button"
                onClick={handleClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700"
              />
              <ButtonC
                texto={isPending ? "Baixando..." : "Baixar Extrato"}
                largura="50%"
                altura="40px"
                type="button"
                onClick={handleDownload}
                disabled={isPending}
              />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ReportDownloadModal;