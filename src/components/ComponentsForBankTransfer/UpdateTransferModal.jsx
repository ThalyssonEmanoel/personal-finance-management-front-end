'use client'
import React, { useState, useEffect, memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
      console.log('Dados para atualização:', data);

      const updateData = {
        amount: data.amount,
        transfer_date: data.transfer_date,
        description: data.description || undefined,
        sourceAccountId: data.sourceAccountId,
        destinationAccountId: data.destinationAccountId,
        paymentMethodId: data.paymentMethodId || undefined,
      };

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
            toast.error('Erro ao atualizar transferência. Tente novamente.');
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
        className="!fixed !right-0 !top-0 !left-auto !bottom-0 !h-screen !w-[500px] !max-w-none !rounded-none !border-l
        !border-r-0 !overflow-y-auto !m-0 !p-6 !translate-x-0 !translate-y-0 !z-50 !bg-background !shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out
        data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
        showCloseButton={true}
      >
        <div className="space-y-10">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Editar transferência</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, handleInvalidSubmit)} className="space-y-6">
              {/* Valor */}
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

              {/* Data */}
              <FormField
                control={form.control}
                name="transfer_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da Transferência</FormLabel>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                            type="button"
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(date.toISOString().split('T')[0]);
                              setDateOpen(false);
                            }
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                        <SelectTrigger>
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
                        <SelectTrigger>
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
                        <SelectTrigger>
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

              <div className="flex pt-4 flex-row justify-between">
                <ButtonC
                  texto={"Cancelar"}
                  largura="200px"
                  altura="40px"
                  onClick={onClose}
                  disabled={isPending}
                />
                <ButtonC
                  texto={isPending ? "Atualizando..." : "Atualizar"}
                  largura="200px"
                  altura="40px"
                  type="submit"
                  disabled={isPending}
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