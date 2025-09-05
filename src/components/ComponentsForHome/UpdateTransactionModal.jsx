'use client'

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxCreateNew,
} from '@/components/ui/shadcn-io/combobox';
import { updateTransactionSchema } from '@/schemas/TransactionSchemas';
import { useAccountsQuery, useTransactionCategoriesQuery, useUpdateTransactionMutation } from '@/utils/apiClient';
import ButtonC from '../Custom-Button';
import Decimal from "decimal.js";

const UpdateTransactionModal = ({ isOpen, onClose, transaction }) => {
  const [dateOpen, setDateOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [localCategories, setLocalCategories] = useState([]);
  const { data: accountsData, isLoading: accountsLoading } = useAccountsQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useTransactionCategoriesQuery();
  const { mutate: updateTransaction, isPending, isError, error, isSuccess } = useUpdateTransactionMutation();
  const accounts = accountsData?.accounts ?? [];
  const categories = categoriesData ?? [];

  const form = useForm({
    resolver: zodResolver(updateTransactionSchema),
    mode: 'onSubmit',
    defaultValues: {
      type: '',
      name: '',
      category: '',
      value: 0,
      release_date: '',
      description: '',
      recurring: false,
      number_installments: undefined,
      current_installment: undefined,
      accountId: undefined,
      paymentMethodId: undefined,
    },
  });

  useEffect(() => {
    if (transaction) {
      console.log('Setting form data from transaction:', transaction);
      const formData = {
        ...transaction,
        value: new Decimal(transaction.value).toNumber(),
        accountId: transaction.accountId,
        paymentMethodId: transaction.paymentMethodId,
        release_date: new Date(transaction.release_date).toISOString().split('T')[0],
        description: transaction.description || '', 
        // Convert null values to undefined for optional fields
        number_installments: transaction.number_installments ?? undefined,
        current_installment: transaction.current_installment ?? undefined,
      };
      console.log('Form data to set:', formData);
      form.reset(formData);
    }
  }, [transaction, form]);


  const watchedAccountId = form.watch('accountId');
  const currentSelectedAccount = accounts.find(acc => acc.id === parseInt(watchedAccountId));

  useEffect(() => {
    if (currentSelectedAccount && currentSelectedAccount.accountPaymentMethods) {
      setPaymentMethods(currentSelectedAccount.accountPaymentMethods.map(apm => apm.paymentMethod));
    } else {
      setPaymentMethods([]);
    }
  }, [currentSelectedAccount]);

  useEffect(() => {
    if (Array.isArray(categoriesData)) {
      setLocalCategories(categoriesData);
    } else {
      setLocalCategories([]);
    }
  }, [categoriesData]);

  const handleCreateNewCategory = (newCategory) => {
    const trimmedCategory = newCategory.trim();
    if (trimmedCategory) {
      const normalizedValue = trimmedCategory.toLowerCase().replace(/\s+/g, '_');
      const newCategoryItem = {
        value: normalizedValue,
        label: trimmedCategory
      };
      const categoryExists = localCategories.some(cat =>
        cat.value.toLowerCase() === normalizedValue
      );
      if (!categoryExists) {
        setLocalCategories(prev => [...prev, newCategoryItem]);
      }
      form.setValue('category', normalizedValue);
    }
  };

  const handleSubmit = async (data) => {
    console.log('handleSubmit called with data:', data);
    console.log('Form errors:', form.formState.errors);
    console.log('Form is valid:', form.formState.isValid);
    console.log('transaction:', transaction);
    
    if (!transaction) {
      console.error('No transaction provided');
      toast.error("Erro interno", {
        description: "Transação não encontrada"
      });
      return;
    }

    try {
      const requestData = {
        type: data.type,
        name: data.name,
        category: data.category,
        value: parseFloat(data.value),
        release_date: data.release_date,
        description: data.description && data.description.trim() !== '' ? data.description.trim() : undefined,
        recurring: Boolean(data.recurring),
        accountId: parseInt(data.accountId),
        paymentMethodId: data.paymentMethodId ? parseInt(data.paymentMethodId) : undefined,
      };

      // Adicionar campos de parcelas se existirem
      if (data.number_installments && data.number_installments > 0) {
        requestData.number_installments = parseInt(data.number_installments);
      }
      
      if (data.current_installment && data.current_installment > 0) {
        requestData.current_installment = parseInt(data.current_installment);
      }

      console.log('Sending update request with data:', requestData);

      updateTransaction({ transactionId: transaction.id, transactionData: requestData }, {
        onSuccess: (response) => {
          console.log('Update successful:', response);
          
          // Mostra toast de sucesso
          toast.success("Transação atualizada com sucesso!", {
            description: `${data.type === 'income' ? 'Receita' : 'Despesa'} de ${new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(data.value)} atualizada`
          });
          
          setTimeout(() => {
            onClose();
          }, 1000);
        },
        onError: (error) => {
          console.error('Update failed:', error);
          
          // Mostra toast de erro
          toast.error("Erro ao atualizar transação", {
            description: error.message || "Ocorreu um erro inesperado. Tente novamente."
          });
        }
      });
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error("Erro ao atualizar transação", {
        description: "Ocorreu um erro inesperado. Tente novamente."
      });
    }
  };

  const handleInvalidSubmit = (errors) => {
    console.log('Form validation errors:', errors);
    toast.error("Erro de validação", {
      description: "Verifique os campos obrigatórios"
    });
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
          <DialogHeader >
            <DialogTitle className="text-xl font-semibold">Atualizar Transação</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, handleInvalidSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Transação</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={"w-full"}>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Transação</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Supermercado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Combobox
                      data={localCategories}
                      onValueChange={field.onChange}
                      value={field.value}
                      type="category"
                    >
                      <ComboboxTrigger className="w-full">
                        <span className="flex w-full items-center justify-between gap-2">
                          {field.value
                            ? (localCategories.find((item) => item.value === field.value)?.label || field.value)
                            : "Selecione uma categoria"}
                          <ChevronsUpDown className="shrink-0 text-muted-foreground" size={16} />
                        </span>
                      </ComboboxTrigger>
                      <ComboboxContent>
                        <ComboboxInput placeholder="Buscar ou criar categoria..." />
                        <ComboboxEmpty>
                        </ComboboxEmpty>
                        <ComboboxList>
                          <ComboboxGroup>
                            {categoriesLoading ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                Carregando categorias...
                              </div>
                            ) : (
                              localCategories.map((category) => (
                                <ComboboxItem key={category.value} value={category.value}>
                                  {category.label}
                                </ComboboxItem>
                              ))
                            )}
                          </ComboboxGroup>
                          <ComboboxCreateNew onCreateNew={handleCreateNewCategory}>
                            {(inputValue) => (
                              <div className="flex items-center gap-2 border-t pt-2 mt-2 w-full">
                                <span>+ Criar nova categoria: "{inputValue}"</span>
                              </div>
                            )}
                          </ComboboxCreateNew>
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => {
                  const [displayValue, setDisplayValue] = React.useState("")

                  useEffect(() => {
                    if (field.value) {
                      const formatted = new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(field.value)
                      setDisplayValue(formatted)
                    }
                  }, [field.value])

                  const formatCurrency = (rawValue) => {
                    const numericValue = rawValue.replace(/\D/g, "")
                    const valueInReais = (parseInt(numericValue || "0", 10) / 100).toFixed(2)
                    return new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(valueInReais)
                  }
                  const handleChange = (e) => {
                    const rawValue = e.target.value
                    const formatted = formatCurrency(rawValue)
                    setDisplayValue(formatted)
                    const numericValue = Number(
                      formatted.replace(/\D/g, "")
                    ) / 100

                    field.onChange(numericValue)
                  }

                  return (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="R$ 0,00"
                          value={displayValue}
                          onChange={handleChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={form.control}
                name="release_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Transação</FormLabel>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                          >
                            {field.value ? new Date(field.value + 'T00:00:00').toLocaleDateString('pt-BR') : "Selecionar data"}
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                              field.onChange(localDate.toISOString().split('T')[0])
                              setDateOpen(false)
                            }
                          }}
                          captionLayout="dropdown"
                          defaultMonth={new Date()}
                          locale="pt-BR"
                        />
                      </PopoverContent>
                    </Popover>
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
                      <Input placeholder="Ex: Compra parcelada" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              

              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className={"w-full"}>
                          <SelectValue placeholder="Selecione a conta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accountsLoading && (
                          <SelectItem value="loading" disabled>
                            Carregando contas...
                          </SelectItem>
                        )}
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.name || account.nome || `Conta ${account.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {currentSelectedAccount && (
                <FormField
                  control={form.control}
                  name="paymentMethodId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                        disabled={!currentSelectedAccount}
                      >
                        <FormControl>
                          <SelectTrigger className={"w-full"}>
                            <SelectValue placeholder={
                              !currentSelectedAccount ? "Selecione uma conta primeiro" : "Selecione a forma de pagamento"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
              )}

              {transaction?.number_installments && (
                <>
                  <FormField
                    control={form.control}
                    name="number_installments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Parcelas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 12"
                            min="1"
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseInt(value));
                            }}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="current_installment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parcela Atual</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max={transaction.number_installments}
                            placeholder="Ex: 1"
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseInt(value));
                            }}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="recurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Transação Recorrente
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {transaction?.recurring ? "Desmarque para tornar esta transação não recorrente" : "Marque para tornar esta transação recorrente"}
                      </p>
                    </div>
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
}

export default UpdateTransactionModal;