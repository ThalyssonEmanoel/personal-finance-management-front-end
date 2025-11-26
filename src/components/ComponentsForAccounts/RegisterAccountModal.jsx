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

  // Effect para atualizar o form quando os IDs selecionados mudarem
  useEffect(() => {
    form.setValue('paymentMethodIds', selectedPaymentMethodIds.join(','))
  }, [selectedPaymentMethodIds, form])

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
      return checked
        ? [...prev, methodId]
        : prev.filter(id => id !== methodId)
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
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex pt-4 flex-col sm:flex-row gap-3 sm:justify-between">
                <ButtonC
                  texto="Cancelar"
                  type="button"
                  onClick={handleClose}
                  variant="outline"
                  className="w-full sm:w-[160px] h-[40px] border-2 border-neutral-300 rounded-sm bg-white text-black hover:cursor-pointer hover:text-white hover:shadow-md hover:bg-brown"
                />
                <ButtonC
                  texto={isPending ? "Criando..." : "Criar Conta"}
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
  )
}

export default RegisterAccountModal