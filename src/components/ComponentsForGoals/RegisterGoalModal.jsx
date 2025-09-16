'use client'
import React, { useState, useCallback, useMemo, memo } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CalendarIcon } from 'lucide-react'
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import AccessibleSelect from '@/components/AccessibleSelect'
import { Calendar } from "@/components/ui/calendar"
import ButtonC from '../Custom-Button'
import { useCreateGoalMutation } from '@/utils/apiClient'
import { createGoalSchema } from '@/schemas/GoalSchemas'
import { withPerformanceOptimization } from '@/hooks/usePerformanceOptimization'
import { useStableDimensions } from '@/hooks/usePerformanceOptimization'

// Componente de campo de valor otimizado
const CurrencyInput = memo(({ field, ...props }) => {
  const [displayValue, setDisplayValue] = useState("")
  
  const formatCurrency = useCallback((rawValue) => {
    const numericValue = rawValue.replace(/\D/g, '')
    const numberValue = parseInt(numericValue) / 100
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }, []);

  const handleChange = useCallback((e) => {
    const formatted = formatCurrency(e.target.value)
    setDisplayValue(formatted)
    const numericValue = parseFloat(e.target.value.replace(/\D/g, '')) / 100
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
      const formattedDate = date.toISOString().split('T')[0]
      field.onChange(formattedDate)
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
            aria-label={field.value ? `Data selecionada: ${new Date(field.value + 'T00:00:00').toLocaleDateString('pt-BR')}` : "Selecionar data da meta"}
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

const RegisterGoalModal = memo(({ isOpen, onClose }) => {
  const [dateOpen, setDateOpen] = useState(false)
  
  const { dimensions, elementRef } = useStableDimensions({
    minHeight: '600px'
  });

  const { mutate: createGoal, isPending } = useCreateGoalMutation();

  const form = useForm({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      name: '',
      date: '',
      transaction_type: '',
      value: 0,
    },
  })

  const handleSubmit = useCallback(async (data) => {
    createGoal(data, {
      onSuccess: () => {
        toast.success("Meta criada com sucesso!", {
          description: `Meta de ${data.transaction_type === 'income' ? 'receita' : 'despesa'} de ${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(data.value)} criada`
        });
        form.reset();
        setTimeout(() => {
          onClose();
        }, 250);
      },
      onError: (error) => {
        toast.error("Erro ao criar meta", {
          description: error.message || "Ocorreu um erro inesperado. Tente novamente."
        });
      }
    });
  }, [createGoal, form, onClose]);

  // Memoização das opções para selects
  const transactionTypeOptions = useMemo(() => [
    { value: 'income', label: 'Receita' },
    { value: 'expense', label: 'Despesa' }
  ], []);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onClose}
      aria-labelledby="goal-dialog-title"
      aria-describedby="goal-dialog-description"
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
            <DialogTitle id="goal-dialog-title" className="text-xl font-semibold">
              Nova Meta
            </DialogTitle>
            <div id="goal-dialog-description" className="sr-only">
              Formulário para cadastrar uma nova meta financeira
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" noValidate>
              <FormField
                control={form.control}
                name="transaction_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo da Meta</FormLabel>
                    <AccessibleSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      items={transactionTypeOptions}
                      placeholder="Selecione o tipo"
                      ariaLabel="Tipo da meta"
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
                    <FormLabel>Nome da Meta</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Meta de economia mensal" 
                        {...field} 
                        aria-describedby="name-help"
                      />
                    </FormControl>
                    <div id="name-help" className="sr-only">
                      Digite um nome descritivo para identificar esta meta
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Meta</FormLabel>
                    <FormControl>
                      <CurrencyInput field={field} />
                    </FormControl>
                    <div id="value-help" className="sr-only">
                      Digite o valor da meta que deseja alcançar
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Meta</FormLabel>
                    <DatePicker field={field} dateOpen={dateOpen} setDateOpen={setDateOpen} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex pt-4 flex-row justify-between" role="group" aria-label="Ações do formulário">
                <ButtonC
                  texto="Cancelar"
                  largura="200px"
                  altura="40px"
                  onClick={onClose}
                  disabled={isPending}
                  type="button"
                  ariaLabel="Cancelar cadastro da meta"
                />
                <ButtonC
                  texto={isPending ? "Criando..." : "Criar Meta"}
                  largura="200px"
                  altura="40px"
                  type="submit"
                  disabled={isPending}
                  ariaLabel={isPending ? "Criando meta..." : "Confirmar cadastro da meta"}
                />
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
});

RegisterGoalModal.displayName = 'RegisterGoalModal';

export default withPerformanceOptimization(RegisterGoalModal);
