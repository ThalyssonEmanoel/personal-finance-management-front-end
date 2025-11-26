'use client'

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { useAccountsQuery, usePaymentMethodsQuery, useCreateBankTransferMutation } from '@/utils/apiClient';
import ButtonC from '../Custom-Button'
import AccessibleSelect from '@/components/AccessibleSelect';
import { withPerformanceOptimization, useStableDimensions } from '@/hooks/usePerformanceOptimization';
import Decimal from "decimal.js";
import { z } from 'zod';

// Schema de validação para transferência
const createTransferSchema = z.object({
  sourceAccountId: z.number({ required_error: "Selecione a conta de origem" }),
  destinationAccountId: z.number({ required_error: "Selecione a conta de destino" }),
  amount: z.number().min(0.01, "O valor deve ser maior que zero"),
  transfer_date: z.string().min(1, "Selecione a data da transferência"),
  paymentMethodId: z.number({ required_error: "Selecione o método de pagamento" }),
  description: z.string().optional(),
}).refine((data) => data.sourceAccountId !== data.destinationAccountId, {
  message: "A conta de origem deve ser diferente da conta de destino",
  path: ["destinationAccountId"],
});

// Componente de campo de valor otimizado
const CurrencyInput = memo(({ field, ...props }) => {
  const [displayValue, setDisplayValue] = useState("")
  
  const formatCurrency = useCallback((rawValue) => {
    const cleanValue = rawValue.replace(/\D/g, '');
    const numberValue = parseFloat(cleanValue) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numberValue || 0);
  }, []);

  const handleChange = useCallback((e) => {
    const rawValue = e.target.value;
    const cleanValue = rawValue.replace(/\D/g, '');
    const numberValue = parseFloat(cleanValue) / 100;
    field.onChange(numberValue || 0);
    setDisplayValue(formatCurrency(rawValue));
  }, [formatCurrency, field]);

  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder="R$ 0,00"
      value={displayValue}
      onChange={handleChange}
      onBlur={field.onBlur}
      ref={field.ref}
      aria-describedby="value-help"
      {...props}
    />
  );
});

CurrencyInput.displayName = 'CurrencyInput';

// Componente de seletor de data otimizado
const DatePicker = memo(({ field, dateOpen, setDateOpen }) => {
  const handleDateSelect = useCallback((date) => {
    if (date) {
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      field.onChange(localDate.toISOString().split('T')[0]);
      setDateOpen(false);
    }
  }, [field, setDateOpen]);

  return (
    <Popover open={dateOpen} onOpenChange={setDateOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            className="w-full justify-between"
            aria-label={field.value ? `Data selecionada: ${new Date(field.value + 'T00:00:00').toLocaleDateString('pt-BR')}` : "Selecionar data da transferência"}
            aria-expanded={dateOpen}
            aria-haspopup="dialog"
          >
            {field.value ? new Date(field.value + 'T00:00:00').toLocaleDateString('pt-BR') : "Selecionar data"}
            <CalendarIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" role="dialog" aria-label="Calendário para seleção de data">
        <Calendar
          mode="single"
          selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
          onSelect={handleDateSelect}
          captionLayout="dropdown"
          defaultMonth={new Date()}
          locale="pt-BR"
        />
      </PopoverContent>
    </Popover>
  );
});

DatePicker.displayName = 'DatePicker';

const RegisterTransferModal = memo(({ isOpen, onClose }) => {
  const [dateOpen, setDateOpen] = useState(false)
  
  const { dimensions, elementRef } = useStableDimensions({
    minHeight: '600px'
  });

  const { data: accountsData, isLoading: accountsLoading } = useAccountsQuery();
  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = usePaymentMethodsQuery();
  const { mutate: createTransfer, isPending } = useCreateBankTransferMutation();

  // Memoização dos dados
  const accounts = useMemo(() => accountsData?.accounts ?? [], [accountsData]);
  const paymentMethods = useMemo(() => paymentMethodsData ?? [], [paymentMethodsData]);

  const form = useForm({
    resolver: zodResolver(createTransferSchema),
    defaultValues: {
      sourceAccountId: undefined,
      destinationAccountId: undefined,
      amount: 0,
      transfer_date: '',
      paymentMethodId: undefined,
      description: '',
    },
  })

  // Callbacks otimizados
  const handleSubmit = useCallback(async (data) => {
    try {
      await createTransfer(data, {
        onSuccess: () => {
          toast.success('Transferência criada com sucesso!');
          form.reset();
          onClose();
        },
        onError: (error) => {
          console.error('Erro ao criar transferência:', error);
          toast.error('Erro ao criar transferência. Tente novamente.');
        }
      });
    } catch (error) {
      console.error('Erro no submit:', error);
      toast.error('Erro interno. Tente novamente.');
    }
  }, [createTransfer, form, onClose]);

  // Memoização das opções para selects
  const accountOptions = useMemo(() => 
    accounts.map(account => ({
      value: account.id.toString(),
      label: account.name || account.nome || `Conta ${account.id}`
    })),
    [accounts]
  );

  const paymentMethodOptions = useMemo(() => 
    paymentMethods.map(method => ({
      value: method.id.toString(),
      label: method.name
    })),
    [paymentMethods]
  );

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onClose}
      aria-labelledby="transfer-dialog-title"
      aria-describedby="transfer-dialog-description"
    >
      <DialogContent
        className="max-h-[100vh] overflow-y-auto w-[95vw] max-w-[500px]
          md:!fixed md:!right-0 md:!top-0 md:!left-auto md:!bottom-0 md:!h-screen md:!w-[500px] md:!max-w-none md:!rounded-none md:!border-l 
          md:!border-r-0 md:!overflow-y-auto md:!m-0 md:!p-6 md:!translate-x-0 md:!translate-y-0 md:!z-50 md:!bg-background md:!shadow-lg 
          md:data-[state=open]:animate-in md:data-[state=closed]:animate-out 
          md:data-[state=closed]:fade-out-0 md:data-[state=open]:fade-in-0 
          md:data-[state=closed]:slide-out-to-right md:data-[state=open]:slide-in-from-right"
        showCloseButton={true}
      >
        <div className="space-y-10" role="main">
          <DialogHeader>
            <DialogTitle id="transfer-dialog-title" className="text-xl font-semibold">
              Nova Transferência
            </DialogTitle>
            <div id="transfer-dialog-description" className="sr-only">
              Formulário para cadastrar uma nova transferência entre contas
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" noValidate>
              <FormField
                control={form.control}
                name="sourceAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta de Origem</FormLabel>
                    <AccessibleSelect
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      items={accountOptions}
                      placeholder={accountsLoading ? "Carregando contas..." : "Selecione a conta de origem"}
                      ariaLabel="Conta de origem"
                      className="w-full"
                      disabled={accountsLoading}
                      loading={accountsLoading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destinationAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta de Destino</FormLabel>
                    <AccessibleSelect
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      items={accountOptions}
                      placeholder={accountsLoading ? "Carregando contas..." : "Selecione a conta de destino"}
                      ariaLabel="Conta de destino"
                      className="w-full"
                      disabled={accountsLoading}
                      loading={accountsLoading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <CurrencyInput field={field} />
                    </FormControl>
                    <div id="value-help" className="sr-only">
                      Digite o valor da transferência em reais
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transfer_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Transferência</FormLabel>
                    <DatePicker field={field} dateOpen={dateOpen} setDateOpen={setDateOpen} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <AccessibleSelect
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      items={paymentMethodOptions}
                      placeholder={paymentMethodsLoading ? "Carregando métodos..." : "Selecione o método de pagamento"}
                      ariaLabel="Método de pagamento"
                      className="w-full"
                      disabled={paymentMethodsLoading}
                      loading={paymentMethodsLoading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Transferência para investimento" 
                        {...field} 
                        aria-describedby="description-help"
                      />
                    </FormControl>
                    <div id="description-help" className="sr-only">
                      Informações adicionais sobre a transferência (opcional)
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex pt-4 flex-col sm:flex-row gap-3 sm:justify-between" role="group" aria-label="Ações do formulário">
                <ButtonC
                  texto="Cancelar"
                  onClick={onClose}
                  disabled={isPending}
                  type="button"
                  ariaLabel="Cancelar cadastro da transferência"
                  className="w-full sm:w-[160px] h-[40px] border-2 border-neutral-300 rounded-sm bg-white text-black hover:cursor-pointer hover:text-white hover:shadow-md hover:bg-brown"
                />
                <ButtonC
                  texto={isPending ? "Criando..." : "Criar Transferência"}
                  type="submit"
                  disabled={isPending}
                  ariaLabel={isPending ? "Criando transferência..." : "Confirmar cadastro da transferência"}
                  className="w-full sm:w-[160px] h-[40px] border-2 border-neutral-300 rounded-sm bg-white text-black hover:cursor-pointer hover:text-white hover:shadow-md hover:bg-brown"
                />
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
});

RegisterTransferModal.displayName = 'RegisterTransferModal';

export default withPerformanceOptimization(RegisterTransferModal);