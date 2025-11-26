'use client'
import React, { useState, useEffect, memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { updateBankTransferSchema } from "@/schemas/BankTransferSchemas";
import {
  useAccountsQuery,
  usePaymentMethodsQuery,
  useUpdateBankTransferMutation
} from "@/utils/apiClient";
import ButtonC from "../Custom-Button";

const CurrencyInput = memo(({ field, ...props }) => {
  const [displayValue, setDisplayValue] = useState("")

  const formatCurrency = useCallback((rawValue) => {
    const numericValue = rawValue.replace(/\D/g, "")
    const valueInReais = (parseInt(numericValue || "0", 10) / 100).toFixed(2)
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valueInReais)
  }, []);

  const formatNumberToCurrency = useCallback((value) => {
    if (!value || value === 0) return ""
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }, []);

  useEffect(() => {
    if (field.value && field.value !== 0) {
      setDisplayValue(formatNumberToCurrency(field.value))
    } else {
      setDisplayValue("")
    }
  }, [field.value, formatNumberToCurrency]);

  const handleChange = useCallback((e) => {
    const rawValue = e.target.value
    const formatted = formatCurrency(rawValue)
    setDisplayValue(formatted)
    const numericValue = Number(formatted.replace(/\D/g, "")) / 100
    field.onChange(numericValue)
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

const DatePicker = memo(({ field, dateOpen, setDateOpen }) => {
  const handleDateSelect = useCallback((date) => {
    if (date) {
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      field.onChange(localDate.toISOString().split('T')[0])
      setDateOpen(false)
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

const UpdateTransferModal = ({ isOpen, onClose, transfer }) => {
  const [dateOpen, setDateOpen] = useState(false);
  const { data: accountsData, isLoading: accountsLoading } = useAccountsQuery();
  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = usePaymentMethodsQuery();
  const { mutate: updateTransfer, isPending, isError, error, isSuccess } = useUpdateBankTransferMutation();

  const accounts = accountsData?.accounts ?? [];
  const paymentMethods = paymentMethodsData ?? [];

  const form = useForm({
    resolver: zodResolver(updateBankTransferSchema),
    mode: 'onSubmit',
    defaultValues: {
      amount: 0,
      transfer_date: '',
      description: '',
      sourceAccountId: undefined,
      destinationAccountId: undefined,
      paymentMethodId: undefined,
    },
  });

  useEffect(() => {
    if (transfer && isOpen) {
      const transferDate = new Date(transfer.transfer_date);
      transferDate.setDate(transferDate.getDate() + 1);

      form.reset({
        amount: parseFloat(transfer.amount) || 0,
        transfer_date: transferDate.toISOString().split('T')[0],
        description: transfer.description || '',
        sourceAccountId: transfer.sourceAccountId || transfer.sourceAccount?.id,
        destinationAccountId: transfer.destinationAccountId || transfer.destinationAccount?.id,
        paymentMethodId: transfer.paymentMethodId || transfer.paymentMethod?.id,
      });
    }
  }, [transfer, form, isOpen]);

  const handleSubmit = async (data) => {
    try {
      console.log('Dados do formulário:', data);
      console.log('Transfer ID:', transfer?.id);

      // Validação adicional dos dados antes do envio
      if (!transfer?.id) {
        console.error('ID da transferência não encontrado');
        toast.error('Erro: ID da transferência não encontrado');
        return;
      }

      if (!data.sourceAccountId || !data.destinationAccountId) {
        console.error('Contas de origem ou destino não selecionadas');
        toast.error('Erro: Selecione as contas de origem e destino');
        return;
      }

      if (data.sourceAccountId === data.destinationAccountId) {
        console.error('Conta de origem igual à conta de destino');
        toast.error('Erro: A conta de origem deve ser diferente da conta de destino');
        return;
      }

      if (!data.amount || data.amount <= 0) {
        console.error('Valor inválido:', data.amount);
        toast.error('Erro: O valor deve ser maior que zero');
        return;
      }

      if (!data.transfer_date) {
        console.error('Data da transferência não informada');
        toast.error('Erro: Informe a data da transferência');
        return;
      }

      const updateData = {
        amount: Number(data.amount),
        transfer_date: data.transfer_date,
        description: data.description || undefined,
        sourceAccountId: Number(data.sourceAccountId),
        destinationAccountId: Number(data.destinationAccountId),
        paymentMethodId: data.paymentMethodId ? Number(data.paymentMethodId) : undefined,
      };

      console.log('Dados para atualização:', updateData);
      console.log('URL será construída com transferId:', transfer.id);

      updateTransfer(
        { transferId: transfer.id, transferData: updateData },
        {
          onSuccess: (response) => {
            console.log('Transferência atualizada com sucesso:', response);
            toast.success('Transferência atualizada com sucesso!');
            onClose();
          },
          onError: (err) => {
            console.error('Erro ao atualizar transferência:', err);
            console.error('Mensagem do erro:', err.message);
            toast.error(`Erro ao atualizar transferência: ${err.message}`);
          }
        }
      );
    } catch (err) {
      console.error('Erro no submit:', err);
      toast.error('Erro ao atualizar transferência. Tente novamente.');
    }
  };

  const handleInvalidSubmit = (errors) => {
    console.log('Erros de validação:', errors);
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[100vh] overflow-y-auto w-[95vw] max-w-[500px]
          md:!fixed md:!right-0 md:!top-0 md:!left-auto md:!bottom-0 md:!h-screen md:!w-[500px] md:!max-w-none md:!rounded-none md:!border-l 
          md:!border-r-0 md:!overflow-y-auto md:!m-0 md:!p-6 md:!translate-x-0 md:!translate-y-0 md:!z-50 md:!bg-background md:!shadow-lg 
          md:data-[state=open]:animate-in md:data-[state=closed]:animate-out 
          md:data-[state=closed]:fade-out-0 md:data-[state=open]:fade-in-0 
          md:data-[state=closed]:slide-out-to-right md:data-[state=open]:slide-in-from-right"
        showCloseButton={true}
      >
        <div className="space-y-10">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Editar transferência</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, handleInvalidSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <CurrencyInput field={field} />
                    </FormControl>
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

              {/* Conta de origem */}
              <FormField
                control={form.control}
                name="sourceAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta de Origem</FormLabel>
                    <Select
                      value={field.value ? field.value.toString() : ""}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={accountsLoading}
                    >
                      <FormControl>
                        <SelectTrigger className={"w-full"}>
                          <SelectValue placeholder="Selecione a conta de origem" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conta de destino */}
              <FormField
                control={form.control}
                name="destinationAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta de Destino</FormLabel>
                    <Select
                      value={field.value ? field.value.toString() : ""}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={accountsLoading}
                    >
                      <FormControl>
                        <SelectTrigger className={"w-full"}>
                          <SelectValue placeholder="Selecione a conta de destino" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Forma de pagamento */}
              <FormField
                control={form.control}
                name="paymentMethodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select
                      value={field.value ? field.value.toString() : "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))}
                      disabled={paymentMethodsLoading}
                    >
                      <FormControl>
                        <SelectTrigger className={"w-full"}>
                          <SelectValue placeholder="Selecione a forma de pagamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id.toString()}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="Descrição da transferência (opcional)"
                        maxLength={500}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex pt-4 flex-col sm:flex-row gap-3 sm:justify-between">
                <ButtonC
                  texto={"Cancelar"}
                  largura="200px"
                  altura="40px"
                  onClick={onClose}
                  disabled={isPending}
                  className="w-full sm:w-[160px] h-[40px] border-2 border-neutral-300 rounded-sm bg-white text-black hover:cursor-pointer hover:text-white hover:shadow-md hover:bg-brown"
                />
                <ButtonC
                  texto={isPending ? "Atualizando..." : "Atualizar"}
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-[160px] h-[40px] border-2 border-neutral-300 rounded-sm bg-white text-black hover:cursor-pointer hover:text-white hover:shadow-md hover:bg-brown"
                />
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTransferModal;