'use client'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { createAccountSchema } from '@/schemas/AccountSchemas'
import {
  usePaymentMethodsQuery,
  useCreatePaymentMethodMutation,
  useCreateAccountMutation,
  useAccountTypesQuery
} from '@/utils/apiClient'
import ButtonC from '../Custom-Button'

const RegisterAccountModal = ({ isOpen, onClose }) => {
  const [localPaymentMethods, setLocalPaymentMethods] = useState([])
  const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] = useState([])
  const [localAccountTypes, setLocalAccountTypes] = useState([])
  const [showCreatePaymentMethod, setShowCreatePaymentMethod] = useState(false)
  const [newPaymentMethodName, setNewPaymentMethodName] = useState('')

  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = usePaymentMethodsQuery()
  const { data: accountTypesData, isLoading: accountTypesLoading } = useAccountTypesQuery()
  const { mutate: createPaymentMethod } = useCreatePaymentMethodMutation()
  const { mutate: createAccount, isPending } = useCreateAccountMutation()

  const form = useForm({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: '',
      type: '',
      balance: 0,
      icon: null,
      paymentMethodIds: '',
    },
  })

  useEffect(() => {
    if (Array.isArray(paymentMethodsData)) {
      setLocalPaymentMethods(paymentMethodsData)
    } else {
      setLocalPaymentMethods([])
    }
  }, [paymentMethodsData])

  useEffect(() => {
    if (Array.isArray(accountTypesData)) {
      setLocalAccountTypes(accountTypesData)
    } else {
      setLocalAccountTypes([])
    }
  }, [accountTypesData])

  const handleCreateNewAccountType = (newTypeName) => {
    const trimmedName = newTypeName.trim()
    if (trimmedName) {
      const normalizedValue = trimmedName.toLowerCase().replace(/\s+/g, '_')
      const newTypeItem = {
        value: normalizedValue,
        label: trimmedName
      }

      const typeExists = localAccountTypes.some(type =>
        type.value.toLowerCase() === normalizedValue
      )

      if (!typeExists) {
        setLocalAccountTypes(prev => [...prev, newTypeItem])
      }
      form.setValue('type', normalizedValue)
    }
  }

  const handleCreateNewPaymentMethod = () => {
    const trimmedName = newPaymentMethodName.trim()
    if (trimmedName) {
      createPaymentMethod(
        { name: trimmedName },
        {
          onSuccess: (response) => {
            const newMethod = response.data || response
            if (newMethod && newMethod.id) {
              setLocalPaymentMethods(prev => [...prev, newMethod])
              setNewPaymentMethodName('')
              setShowCreatePaymentMethod(false)
              toast.success('Método de pagamento criado com sucesso!', {
                description: `${trimmedName} foi adicionado aos métodos disponíveis`
              })
            }
          },
          onError: (error) => {
            console.error('Erro ao criar método de pagamento:', error)
            toast.error('Erro ao criar método de pagamento', {
              description: error.message || 'Tente novamente'
            })
          }
        }
      )
    }
  }

  const handlePaymentMethodToggle = (methodId, checked) => {
    setSelectedPaymentMethodIds(prev => {
      const newIds = checked
        ? [...prev, methodId]
        : prev.filter(id => id !== methodId)

      // Atualiza o form com a string de IDs separados por vírgula
      form.setValue('paymentMethodIds', newIds.join(','))
      return newIds
    })
  }

  const handleSubmit = async (data) => {
    console.log('Form data:', data)
    console.log('Selected payment method IDs:', selectedPaymentMethodIds)

    try {
      const accountData = {
        name: data.name,
        type: data.type,
        balance: parseFloat(data.balance),
        icon: data.icon,
        paymentMethodIds: selectedPaymentMethodIds.join(','),
      }

      console.log('Sending account data:', accountData)

      createAccount(accountData, {
        onSuccess: (response) => {
          console.log('Account created successfully:', response)

          toast.success('Conta criada com sucesso!', {
            description: `${data.name} foi adicionada às suas contas`
          })
          form.reset()
          setSelectedPaymentMethodIds([])
          setShowCreatePaymentMethod(false)
          setNewPaymentMethodName('')
          onClose()
        },
        onError: (error) => {
          console.error('Erro ao criar conta:', error)
          toast.error('Erro ao criar conta', {
            description: error.message || 'Tente novamente'
          })
        }
      })
    } catch (error) {
      console.error('Erro no handleSubmit:', error)
      toast.error('Erro interno', {
        description: 'Ocorreu um erro inesperado'
      })
    }
  }

  const handleClose = () => {
    form.reset()
    setSelectedPaymentMethodIds([])
    setShowCreatePaymentMethod(false)
    setNewPaymentMethodName('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="!fixed !right-0 !top-0 !left-auto !bottom-0 !h-screen !w-[500px] !max-w-none !rounded-none !border-l 
        !border-r-0 !overflow-y-auto !m-0 !p-6 !translate-x-0 !translate-y-0 !z-50 !bg-background !shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out 
        data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
        showCloseButton={true}
      >
        <div className="space-y-10">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Cadastrar Nova Conta</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da conta</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Conta Corrente Banco X"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo da conta</FormLabel>
                    <Combobox
                      data={localAccountTypes}
                      type="tipo de conta"
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <ComboboxTrigger className="w-full justify-between">
                        {field.value
                          ? localAccountTypes.find((type) => type.value === field.value)?.label
                          : "Selecione o tipo da conta"}
                      </ComboboxTrigger>
                      <ComboboxContent>
                        <ComboboxInput placeholder="Buscar tipo de conta..." />
                        <ComboboxList>
                          <ComboboxEmpty />
                          <ComboboxGroup>
                            {accountTypesLoading ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                Carregando tipos...
                              </div>
                            ) : (
                              localAccountTypes.map((type) => (
                                <ComboboxItem key={type.value} value={type.value}>
                                  {type.label}
                                </ComboboxItem>
                              ))
                            )}
                          </ComboboxGroup>
                          <ComboboxCreateNew onCreateNew={handleCreateNewAccountType}>
                            {(inputValue) => (
                              <div className="flex items-center gap-2 border-t pt-2 mt-2 w-full">
                                <span>+ Criar novo tipo: "{inputValue}"</span>
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
                name="balance"
                render={({ field }) => {
                  const [displayValue, setDisplayValue] = useState("")

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
                      <FormLabel>Saldo inicial</FormLabel>
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
                name="icon"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Ícone da conta (opcional, máximo 2MB)</FormLabel>
                    <div className="grid gap-3 w-44">
                      <FormControl>
                        <input
                          id="account-icon"
                          type="file"
                          accept="image/*"
                          className="hidden rounded-sm"
                          onChange={(e) => {
                            const file = e.target.files[0]
                            onChange(file)
                            const fileName = file?.name || "Nenhum arquivo escolhido"
                            document.getElementById("icon-file-name").textContent = fileName
                          }}
                        />
                      </FormControl>
                      <label
                        htmlFor="account-icon"
                        className="flex justify-center items-center text-center md:text-center border-2 rounded-sm text-black text-sm hover:text-white hover:shadow-md hover:bg-brown duration-200 cursor-pointer h-8"
                      >
                        Selecionar ícone
                      </label>
                      <span id="icon-file-name" className="text-sm text-gray-600 -mt-2 mb-6 ml-0.5">
                        Nenhum arquivo escolhido
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentMethodIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Métodos de Pagamento</FormLabel>
                    <div className="space-y-3">
                      {localPaymentMethods.length > 0 && (
                        <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                          <p className="text-sm font-medium mb-2">Métodos disponíveis:</p>
                          <div className="space-y-2">
                            {localPaymentMethods.map((method) => (
                              <div key={method.id} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={selectedPaymentMethodIds.includes(method.id)}
                                  onCheckedChange={(checked) => handlePaymentMethodToggle(method.id, checked)}
                                />
                                <span className="text-sm">{method.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {!showCreatePaymentMethod ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreatePaymentMethod(true)}
                          className="w-full"
                        >
                          Criar novo método de pagamento
                        </Button>
                      ) : (
                        <div className="space-y-2 border rounded-md p-3">
                          <Input
                            placeholder="Digite o nome do novo método..."
                            value={newPaymentMethodName}
                            onChange={(e) => setNewPaymentMethodName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleCreateNewPaymentMethod()
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <ButtonC
                              texto={isPending ? "Criando..." : "Criar"}
                              largura="100px"
                              altura="35px"
                              type="button"
                              onClick={handleCreateNewPaymentMethod}
                              disabled={!newPaymentMethodName.trim()}
                            />
                            <ButtonC
                              texto="Cancelar"
                              largura="100px"
                              altura="35px"
                              type="button"
                              onClick={() => {
                                setShowCreatePaymentMethod(false)
                                setNewPaymentMethodName('')
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {selectedPaymentMethodIds.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Métodos selecionados ({selectedPaymentMethodIds.length}):</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedPaymentMethodIds.map(methodId => {
                              const method = localPaymentMethods.find(m => m.id === methodId)
                              return method ? (
                                <span
                                  key={methodId}
                                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {method.name}
                                  <button
                                    type="button"
                                    onClick={() => handlePaymentMethodToggle(methodId, false)}
                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                  >
                                    ×
                                  </button>
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex pt-4 flex-row justify-between">
                <ButtonC
                  texto="Cancelar"
                  largura="200px"
                  altura="40px"
                  type="button"
                  onClick={handleClose}
                  variant="outline"
                />
                <ButtonC
                  texto={isPending ? "Criando..." : "Criar Conta"}
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
  )
}

export default RegisterAccountModal