'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, ChevronsUpDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useAccounts, useTransactionCategories } from '@/utils/apiClient'
import { useAuth } from '@/hooks/useAuth'
import ButtonC from '../Custom-Button'
import { se } from 'date-fns/locale'

const RegisterTransactionModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dateOpen, setDateOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [localCategories, setLocalCategories] = useState([])
  const [isInstallment, setIsInstallment] = useState(false)

  const { accounts, loading: accountsLoading } = useAccounts()
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useTransactionCategories()
  const { getUserInfo, authenticatedFetch } = useAuth()

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

  useEffect(() => {
    setLocalCategories(categories)
  }, [categories])

  useEffect(() => {
    if (watchedAccountId && accounts.length > 0) {
      const account = accounts.find(acc => acc.id === parseInt(watchedAccountId))
      if (account && account.accountPaymentMethods) {
        setPaymentMethods(account.accountPaymentMethods.map(apm => apm.paymentMethod))
        setSelectedAccount(account)
        form.setValue('paymentMethodId', undefined)
      }
    }
  }, [watchedAccountId, accounts, form])

  const handleCreateNewCategory = (newCategory) => {
    const trimmedCategory = newCategory.trim()

    if (trimmedCategory) {
      const newCategoryItem = {
        value: trimmedCategory,
        label: trimmedCategory
      }

      const categoryExists = localCategories.some(cat =>
        cat.value.toLowerCase() === trimmedCategory.toLowerCase()
      )
      if (!categoryExists) {
        setLocalCategories(prev => [...prev, newCategoryItem])
      }
      form.setValue('category', trimmedCategory)
      // console.log('Nova categoria criada:', trimmedCategory)
    }
  }

  const handleSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const userInfo = getUserInfo()
      const requestData = {
        type: data.type,
        name: data.name,
        category: data.category,
        value: parseFloat(data.value),
        release_date: data.release_date,
        description: data.description || '',
        recurring: data.recurring,
        accountId: parseInt(data.accountId),
        paymentMethodId: parseInt(data.paymentMethodId)
      }

      if (data.number_installments && data.number_installments > 1) {
        requestData.number_installments = parseInt(data.number_installments)
      }

      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions?userId=${userInfo.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao cadastrar transação')
      }

      setSuccess('Transação cadastrada com sucesso!')
      form.reset()
      setIsInstallment(false)
      setLocalCategories(categories)
      refetchCategories()

      if (onSuccess) {
        onSuccess()
      }

      setTimeout(() => {
        onClose()
        setSuccess('')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar transação')
    } finally {
      setIsLoading(false)
    }
  }

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
            <DialogTitle className="text-xl font-semibold">Nova Transação</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Transação</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                            ? localCategories.find((item) => item.value === field.value)?.label || field.value
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0,00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
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
                        <SelectTrigger>
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
              {selectedAccount && (
                <FormField
                  control={form.control}
                  name="paymentMethodId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                        disabled={!selectedAccount}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              !selectedAccount ? "Selecione uma conta primeiro" : "Selecione a forma de pagamento"
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="space-y-3">
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
                        <FormLabel>Recorrente</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex flex-row items-start space-x-3 space-y-0">
                  <Checkbox
                    checked={isInstallment}
                    onCheckedChange={(checked) => {
                      setIsInstallment(checked)
                      if (!checked) {
                        form.setValue('number_installments', undefined)
                      } else {
                        form.setValue('number_installments', 2)
                      }
                    }}
                  />
                  <div className="space-y-1 leading-none">
                    <Label>Parcelado</Label>
                  </div>
                </div>
              </div>

              {/*Usar o componente toast do shadcn mais para frente*/}
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md border border-green-200">
                  {success}
                </div>
              )}

              <div className="flex pt-4 flex-row justify-between">
                <ButtonC
                  texto={isLoading ? "Carregando..." : "Cancelar"}
                  largura="200px"
                  altura="40px"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancelar
                </ButtonC>
                <ButtonC
                  texto={isLoading ? "Cadastrando..." : "Lançar"}
                  largura="200px"
                  altura="40px"
                  type="submit"
                  disabled={isLoading}
                >
                </ButtonC>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RegisterTransactionModal
