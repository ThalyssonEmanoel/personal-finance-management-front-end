'use client'

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, ChevronsUpDown } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
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
} from '@/components/ui/shadcn-io/combobox'
import { createTransactionSchema } from '@/schemas/TransactionSchemas'
import { useAccountsQuery, useTransactionCategoriesQuery, useCreateTransactionMutation } from '@/utils/apiClient';
import ButtonC from '../Custom-Button'
import AccessibleSelect from '@/components/AccessibleSelect';
import { withPerformanceOptimization, useStableDimensions } from '@/hooks/usePerformanceOptimization';
import Decimal from "decimal.js";

// Componente de campo de valor otimizado
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

// Componente de seletor de data otimizado
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
            aria-label={field.value ? `Data selecionada: ${new Date(field.value + 'T00:00:00').toLocaleDateString('pt-BR')}` : "Selecionar data da transação"}
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

const RegisterTransactionModal = memo(({ isOpen, onClose }) => {
  const [dateOpen, setDateOpen] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [localCategories, setLocalCategories] = useState([]);
  const [isInstallment, setIsInstallment] = useState(false);
  
  const { dimensions, elementRef } = useStableDimensions({
    minHeight: '600px'
  });

  const { data: accountsData, isLoading: accountsLoading } = useAccountsQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useTransactionCategoriesQuery();
  const { mutate: createTransaction, isPending } = useCreateTransactionMutation();

  // Memoização dos dados
  const accounts = useMemo(() => accountsData?.accounts ?? [], [accountsData]);
  const categories = useMemo(() => categoriesData ?? [], [categoriesData]);

  const form = useForm({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: '',
      name: '',
      category: '',
      value: 0,
      release_date: '',
      description: '',
      recurring: false,
      number_installments: undefined,
      accountId: undefined,
      paymentMethodId: undefined,
    },
  })
  
  const watchedAccountId = form.watch('accountId')
  const currentSelectedAccount = useMemo(() => 
    accounts.find(acc => acc.id === parseInt(watchedAccountId)),
    [accounts, watchedAccountId]
  );

  // Atualiza métodos de pagamento ao trocar de conta
  useEffect(() => {
    if (currentSelectedAccount && currentSelectedAccount.accountPaymentMethods) {
      setPaymentMethods(currentSelectedAccount.accountPaymentMethods.map(apm => apm.paymentMethod));
      form.setValue('paymentMethodId', undefined);
    } else {
      setPaymentMethods([]);
    }
  }, [currentSelectedAccount, form]);

  // Sempre que categoriesData mudar, atualiza localCategories
  useEffect(() => {
    if (Array.isArray(categoriesData)) {
      setLocalCategories(categoriesData);
    } else {
      setLocalCategories([]);
    }
  }, [categoriesData]);

  // Callbacks otimizados
  const handleCreateNewCategory = useCallback((newCategory) => {
    const trimmedCategory = newCategory.trim();
    if (trimmedCategory) {
      const normalizedValue = trimmedCategory.replace(/\s+/g, '_');
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
  }, [localCategories, form]);

  const handleSubmit = useCallback(async (data) => {
    const requestData = {
      type: data.type,
      name: data.name,
      category: data.category,
      value: new Decimal(data.value).toNumber(),
      release_date: data.release_date,
      description: data.description || '',
      recurring: data.recurring,
      accountId: parseInt(data.accountId),
      paymentMethodId: data.paymentMethodId ? parseInt(data.paymentMethodId) : undefined,
    }

    if (data.number_installments && data.number_installments > 1) {
      requestData.number_installments = parseInt(data.number_installments)
    }
    
    createTransaction(requestData, {
      onSuccess: () => {
        toast.success("Transação cadastrada com sucesso!", {
          description: `${data.type === 'income' ? 'Receita' : 'Despesa'} de ${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(data.value)} adicionada`
        });
        form.reset();
        setTimeout(() => {
          onClose();
        }, 250);
      },
      onError: (error) => {
        toast.error("Erro ao cadastrar transação", {
          description: error.message || "Ocorreu um erro inesperado. Tente novamente."
        });
      }
    });
  }, [createTransaction, form, onClose]);

  const handleInstallmentChange = useCallback((checked) => {
    setIsInstallment(checked)
    if (!checked) {
      form.setValue('number_installments', undefined)
    } else {
      form.setValue('number_installments', 2)
    }
  }, [form]);

  // Memoização das opções para selects
  const transactionTypeOptions = useMemo(() => [
    { value: 'income', label: 'Receita' },
    { value: 'expense', label: 'Despesa' }
  ], []);

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

  const selectedAccount = useMemo(() => 
    accounts.find(acc => acc.id === parseInt(watchedAccountId)),
    [accounts, watchedAccountId]
  );

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onClose}
      aria-labelledby="transaction-dialog-title"
      aria-describedby="transaction-dialog-description"
    >
      <DialogContent
        ref={elementRef}
        className="!fixed !right-0 !top-0 !left-auto !bottom-0 !h-screen !w-[500px] !max-w-none !rounded-none !border-l 
        !border-r-0 !overflow-y-auto !m-0 !p-6 !translate-x-0 !translate-y-0 !z-50 !bg-background !shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out 
        data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
        showCloseButton={true}
        style={{ minHeight: dimensions.minHeight }}
      >
        <div className="space-y-10" role="main">
          <DialogHeader>
            <DialogTitle id="transaction-dialog-title" className="text-xl font-semibold">
              Nova Transação
            </DialogTitle>
            <div id="transaction-dialog-description" className="sr-only">
              Formulário para cadastrar uma nova transação financeira
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" noValidate>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Transação</FormLabel>
                    <AccessibleSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      items={transactionTypeOptions}
                      placeholder="Selecione o tipo"
                      ariaLabel="Tipo de transação"
                      className="w-full"
                    />
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
                      <Input 
                        placeholder="Ex: Supermercado" 
                        {...field} 
                        aria-describedby="name-help"
                      />
                    </FormControl>
                    <div id="name-help" className="sr-only">
                      Digite um nome descritivo para identificar esta transação
                    </div>
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
                      <ComboboxTrigger 
                        className="w-full"
                        aria-label="Selecionar categoria"
                        aria-expanded="false"
                      >
                        <span className="flex w-full items-center justify-between gap-2">
                          {field.value
                            ? (localCategories.find((item) => item.value === field.value)?.label || field.value)
                            : "Selecione uma categoria"}
                          <ChevronsUpDown className="shrink-0 text-muted-foreground" size={16} aria-hidden="true" />
                        </span>
                      </ComboboxTrigger>
                      <ComboboxContent role="listbox" aria-label="Lista de categorias">
                        <ComboboxInput 
                          placeholder="Buscar ou criar categoria..." 
                          aria-label="Buscar categoria"
                        />
                        <ComboboxEmpty>
                        </ComboboxEmpty>
                        <ComboboxList>
                          <ComboboxGroup>
                            {categoriesLoading ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground" role="status">
                                Carregando categorias...
                              </div>
                            ) : (
                              localCategories.map((category) => (
                                <ComboboxItem 
                                  key={category.value} 
                                  value={category.value}
                                  role="option"
                                >
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <CurrencyInput field={field} />
                    </FormControl>
                    <div id="value-help" className="sr-only">
                      Digite o valor da transação em reais
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="release_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Transação</FormLabel>
                    <DatePicker field={field} dateOpen={dateOpen} setDateOpen={setDateOpen} />
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
                        placeholder="Ex: Compra parcelada" 
                        {...field} 
                        aria-describedby="description-help"
                      />
                    </FormControl>
                    <div id="description-help" className="sr-only">
                      Informações adicionais sobre a transação (opcional)
                    </div>
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
                    <AccessibleSelect
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      items={accountOptions}
                      placeholder={accountsLoading ? "Carregando contas..." : "Selecione a conta"}
                      ariaLabel="Conta para a transação"
                      className="w-full"
                      disabled={accountsLoading}
                      loading={accountsLoading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedAccount && (
                <FormField
                  control={form.control}
                  name="paymentMethodId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento</FormLabel>
                      <AccessibleSelect
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        items={paymentMethodOptions}
                        placeholder={!selectedAccount ? "Selecione uma conta primeiro" : "Selecione a forma de pagamento"}
                        ariaLabel="Forma de pagamento"
                        className="w-full"
                        disabled={!selectedAccount}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isInstallment && (
                <FormField
                  control={form.control}
                  name="number_installments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Parcelas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="2"
                          max="60"
                          placeholder="Ex: 12"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          aria-describedby="installments-help"
                        />
                      </FormControl>
                      <div id="installments-help" className="sr-only">
                        Número de parcelas entre 2 e 60
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <fieldset className="space-y-3">
                <legend className="sr-only">Opções adicionais da transação</legend>
                
                <FormField
                  control={form.control}
                  name="recurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-describedby="recurring-help"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Recorrente</FormLabel>
                        <div id="recurring-help" className="sr-only">
                          Marque se esta transação se repete mensalmente
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex flex-row items-start space-x-3 space-y-0">
                  <Checkbox
                    checked={isInstallment}
                    onCheckedChange={handleInstallmentChange}
                    aria-describedby="installment-help"
                  />
                  <div className="space-y-1 leading-none">
                    <Label>Parcelado</Label>
                    <div id="installment-help" className="sr-only">
                      Marque se esta transação será dividida em parcelas
                    </div>
                  </div>
                </div>
              </fieldset>

              <div className="flex pt-4 flex-row justify-between" role="group" aria-label="Ações do formulário">
                <ButtonC
                  texto="Cancelar"
                  largura="200px"
                  altura="40px"
                  onClick={onClose}
                  disabled={isPending}
                  type="button"
                  ariaLabel="Cancelar cadastro da transação"
                />
                <ButtonC
                  texto={isPending ? "Cadastrando..." : "Lançar"}
                  largura="200px"
                  altura="40px"
                  type="submit"
                  disabled={isPending}
                  ariaLabel={isPending ? "Cadastrando transação..." : "Confirmar cadastro da transação"}
                />
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
});

RegisterTransactionModal.displayName = 'RegisterTransactionModal';

export default withPerformanceOptimization(RegisterTransactionModal);
