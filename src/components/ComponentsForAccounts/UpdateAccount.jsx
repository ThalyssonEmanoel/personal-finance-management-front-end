'use client'
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import ButtonC from "@/components/Custom-Button";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxCreateNew,
} from "@/components/ui/shadcn-io/combobox";
import { 
  usePaymentMethodsQuery, 
  useAccountTypesQuery, 
  useCreatePaymentMethodMutation, 
  useUpdateAccountMutation 
} from '@/utils/apiClient';
import { createAccountSchema } from '@/schemas/AccountSchemas';

const UpdateAccount = ({ isOpen, onClose, account }) => {
  const [localPaymentMethods, setLocalPaymentMethods] = useState([]);
  const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] = useState([]);
  const [localAccountTypes, setLocalAccountTypes] = useState([]);
  const [showCreatePaymentMethod, setShowCreatePaymentMethod] = useState(false);
  const [newPaymentMethodName, setNewPaymentMethodName] = useState('');

  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = usePaymentMethodsQuery();
  const { data: accountTypesData, isLoading: accountTypesLoading } = useAccountTypesQuery();
  const { mutate: createPaymentMethod } = useCreatePaymentMethodMutation();
  const { mutate: updateAccount, isPending } = useUpdateAccountMutation();

  const form = useForm({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: '',
      type: '',
      balance: 0,
      icon: null,
      paymentMethodIds: '',
    },
  });

  // Effect para preencher o formulário com os dados da conta quando abrir o modal
  useEffect(() => {
    if (account && isOpen) {
      form.reset({
        name: account.name || '',
        type: account.type || '',
        balance: parseFloat(account.balance) || 0,
        icon: null, // Não carregamos o ícone existente para edição
        paymentMethodIds: '',
      });
      
      // Atualizar o texto do ícone atual
      const iconFileName = document.getElementById('icon-file-name-edit');
      if (iconFileName) {
        if (account.icon) {
          const fileName = account.icon.replace(/src[\\/]uploads[\\/]|src[\\/]seed[\\/]images[\\/]|uploads[\\/]/g, '');
          iconFileName.textContent = `Ícone atual: ${fileName}`;
        } else {
          iconFileName.textContent = 'Nenhum ícone definido';
        }
      }
    }
  }, [account, isOpen, form]);

  // Effect separado para marcar os métodos de pagamento quando os dados estão disponíveis
  useEffect(() => {
    if (account && isOpen && localPaymentMethods.length > 0) {
      console.log('Account data:', account);
      console.log('Account payment methods:', account.accountPaymentMethods);
      console.log('Local payment methods:', localPaymentMethods);
      
      if (account.accountPaymentMethods && account.accountPaymentMethods.length > 0) {
        const methodIds = account.accountPaymentMethods.map(apm => {
          console.log('Payment method relation:', apm);
          // Tenta diferentes formas de acessar o ID do método de pagamento
          const id = apm.paymentMethodId || apm.id || apm.paymentMethod?.id;
          console.log('Extracted ID:', id);
          return id;
        }).filter(id => id !== undefined && id !== null);
        
        console.log('Method IDs to select:', methodIds);
        console.log('Method IDs types:', methodIds.map(id => typeof id));
        
        const normalizedIds = methodIds.map(id => {
          const localMethod = localPaymentMethods.find(m => m.id == id);
          return localMethod ? localMethod.id : id;
        });
        
        console.log('Normalized Method IDs:', normalizedIds);
        setSelectedPaymentMethodIds(normalizedIds);
      } else {
        console.log('No payment methods found in account');
        setSelectedPaymentMethodIds([]);
      }
    }
  }, [account, isOpen, localPaymentMethods]);

  useEffect(() => {
    if (paymentMethodsData) {
      setLocalPaymentMethods(paymentMethodsData);
    }
  }, [paymentMethodsData]);

  useEffect(() => {
    if (accountTypesData) {
      setLocalAccountTypes(accountTypesData);
    }
  }, [accountTypesData]);

  const handleCreateNewAccountType = (newTypeName) => {
    const capitalizedTypeName = newTypeName.charAt(0).toUpperCase() + newTypeName.slice(1).toLowerCase();
    const newType = { value: newTypeName.toLowerCase(), label: capitalizedTypeName };
    
    setLocalAccountTypes(prev => [...prev, newType]);
    form.setValue('type', newType.value);
  };

  const handleCreateNewPaymentMethod = () => {
    if (!newPaymentMethodName.trim()) return;

    createPaymentMethod(
      { name: newPaymentMethodName.trim() },
      {
        onSuccess: (data) => {
          const newMethod = { 
            id: data.id || Date.now(), 
            name: newPaymentMethodName.trim() 
          };
          setLocalPaymentMethods(prev => [...prev, newMethod]);
          setSelectedPaymentMethodIds(prev => [...prev, newMethod.id]);
          setNewPaymentMethodName('');
          setShowCreatePaymentMethod(false);
        },
        onError: (error) => {
          console.error('Erro ao criar método de pagamento:', error);
        }
      }
    );
  };

  const handlePaymentMethodToggle = (methodId, checked) => {
    setSelectedPaymentMethodIds(prev => {
      if (checked) {
        return [...prev, methodId];
      } else {
        return prev.filter(id => id !== methodId);
      }
    });
  };

  const handleSubmit = async (data) => {
    if (!account) return;

    const accountData = {
      ...data,
      paymentMethodIds: selectedPaymentMethodIds.join(','),
    };

    updateAccount(
      { accountId: account.id, accountData },
      {
        onSuccess: () => {
          handleClose();
        },
        onError: (error) => {
          console.error('Erro ao atualizar conta:', error);
        }
      }
    );
  };

  const handleClose = () => {
    form.reset();
    setSelectedPaymentMethodIds([]);
    setShowCreatePaymentMethod(false);
    setNewPaymentMethodName('');
    onClose();
  };

  if (!isOpen || !account) return null;

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
            <DialogTitle className="text-xl font-semibold">Editar Conta</DialogTitle>
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
                  useEffect(() => {
                    if (account && isOpen && field.value !== undefined) {
                      const initialValue = parseFloat(field.value) || 0;
                      const formatted = new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(initialValue);
                      setDisplayValue(formatted);
                    }
                  }, [account, isOpen, field.value]);

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
                      <FormLabel>Saldo</FormLabel>
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
                          id="account-icon-edit"
                          type="file"
                          accept="image/*"
                          className="hidden rounded-sm"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            const iconFileName = document.getElementById('icon-file-name-edit');
                            if (file) {
                              if (file.size <= 2 * 1024 * 1024) {
                                onChange(file);
                                if (iconFileName) {
                                  iconFileName.textContent = `Novo ícone: ${file.name}`;
                                }
                              } else {
                                alert('O arquivo deve ter no máximo 2MB');
                                e.target.value = '';
                                if (iconFileName) {
                                  if (account.icon) {
                                    const fileName = account.icon.replace(/src[\\/]uploads[\\/]|src[\\/]seed[\\/]images[\\/]|uploads[\\/]/g, '');
                                    iconFileName.textContent = `Ícone atual: ${fileName}`;
                                  } else {
                                    iconFileName.textContent = 'Nenhum ícone definido';
                                  }
                                }
                              }
                            } else {
                              if (iconFileName) {
                                if (account.icon) {
                                  const fileName = account.icon.replace(/src[\\/]uploads[\\/]|src[\\/]seed[\\/]images[\\/]|uploads[\\/]/g, '');
                                  iconFileName.textContent = `Ícone atual: ${fileName}`;
                                } else {
                                  iconFileName.textContent = 'Nenhum ícone definido';
                                }
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <label
                        htmlFor="account-icon-edit"
                        className="flex justify-center items-center text-center md:text-center border-2 rounded-sm text-black text-sm hover:text-white hover:shadow-md hover:bg-brown duration-200 cursor-pointer h-8"
                      >
                        {account.icon ? 'Alterar ícone' : 'Selecionar ícone'}
                      </label>
                      <span id="icon-file-name-edit" className="text-sm text-gray-600 -mt-2 mb-6 ml-0.5">
                        {account.icon 
                          ? `Ícone atual: ${account.icon.replace(/src[\\/]uploads[\\/]|src[\\/]seed[\\/]images[\\/]|uploads[\\/]/g, '')}` 
                          : 'Nenhum ícone definido'
                        }
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
                          <div className="space-y-2">
                            {localPaymentMethods.map((method) => {
                              const isSelected = selectedPaymentMethodIds.includes(method.id);
                              console.log(`Method ${method.name} (ID: ${method.id}, Type: ${typeof method.id}) - Selected: ${isSelected}`);
                              console.log('Current selectedPaymentMethodIds:', selectedPaymentMethodIds);
                              
                              return (
                                <div key={method.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={selectedPaymentMethodIds.includes(method.id)}
                                    onCheckedChange={(checked) => handlePaymentMethodToggle(method.id, checked)}
                                  />
                                  <span className="text-sm">
                                    {method.name}
                                  </span>
                                </div>
                              );
                            })}
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
                                e.preventDefault();
                                handleCreateNewPaymentMethod();
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
                                setShowCreatePaymentMethod(false);
                                setNewPaymentMethodName('');
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
                  texto={isPending ? "Atualizando..." : "Atualizar Conta"}
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

export default UpdateAccount;
