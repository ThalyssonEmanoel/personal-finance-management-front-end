'use client'

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { updateGoalSchema } from '@/schemas/GoalSchemas';
import { useUpdateGoalMutation } from '@/utils/apiClient';
import ButtonC from '../Custom-Button';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const UpdateGoalsModal = ({ isOpen, onClose, goal }) => {
  const [dateOpen, setDateOpen] = useState(false);
  const { mutate: updateGoal, isPending, isError, error, isSuccess } = useUpdateGoalMutation();

  const form = useForm({
    resolver: zodResolver(updateGoalSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      date: '',
      transaction_type: '',
      value: 0,
    },
  });

  useEffect(() => {
    if (goal) {
      form.reset({
        name: goal.name || '',
        date: goal.date || '',
        transaction_type: goal.transaction_type || '',
        value: parseFloat(goal.value) || 0,
      });
    }
  }, [goal, form]);

  const handleSubmit = async (data) => {
    try {
      await updateGoal({
        goalId: goal.id,
        goalData: {
          name: data.name,
          date: data.date,
          transaction_type: data.transaction_type,
          value: data.value,
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
    }
  };

  const handleInvalidSubmit = (errors) => {
    console.error('Erro de validação:', errors);
    const firstErrorField = Object.keys(errors)[0];
    form.setFocus(firstErrorField);
  };

  useEffect(() => {
    if (isSuccess) {
      form.reset();
      onClose();
    }
  }, [isSuccess, form, onClose]);

  const transactionTypeOptions = [
    { value: 'income', label: 'Receita' },
    { value: 'expense', label: 'Despesa' }
  ];

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onClose}
      aria-labelledby="update-goal-dialog-title"
    >
      <DialogContent 
        className="!fixed !right-0 !top-0 !left-auto !bottom-0 !h-screen !w-[500px] !max-w-none !rounded-none !border-l
        !border-r-0 !overflow-y-auto !m-0 !p-6 !translate-x-0 !translate-y-0 !z-50 !bg-background !shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out
        data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
        showCloseButton={true}
      >
        <div className="space-y-10">
          <DialogHeader>
            <DialogTitle id="update-goal-dialog-title" className="text-xl font-semibold">
              Editar Meta
            </DialogTitle>
          </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, handleInvalidSubmit)} className="space-y-6">
            {/* Nome da Meta */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Meta *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Comprar um carro"
                      {...field}
                      className="border-2 border-neutral-300 rounded-md"
                      aria-describedby={form.formState.errors.name ? "name-error" : undefined}
                    />
                  </FormControl>
                  <FormMessage id="name-error" />
                </FormItem>
              )}
            />

            {/* Tipo da Meta */}
            <FormField
              control={form.control}
              name="transaction_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta para *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    aria-describedby={form.formState.errors.transaction_type ? "type-error" : undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="border-2 border-neutral-300 rounded-md">
                        <SelectValue placeholder="Selecione o tipo da meta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {transactionTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage id="type-error" />
                </FormItem>
              )}
            />

            {/* Data */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data da Meta *</FormLabel>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal border-2 border-neutral-300 rounded-md",
                            !field.value && "text-muted-foreground"
                          )}
                          aria-describedby={form.formState.errors.date ? "date-error" : undefined}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
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
                            field.onChange(format(date, 'yyyy-MM-dd'));
                            setDateOpen(false);
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage id="date-error" />
                </FormItem>
              )}
            />

            {/* Valor */}
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0,00"
                      step="0.01"
                      min="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="border-2 border-neutral-300 rounded-md"
                      aria-describedby={form.formState.errors.value ? "value-error" : undefined}
                    />
                  </FormControl>
                  <FormMessage id="value-error" />
                </FormItem>
              )}
            />

            {/* Mensagem de Erro */}
            {isError && (
              <div 
                className="text-red-600 text-sm text-center p-3 bg-red-50 rounded-md"
                role="alert"
                aria-live="polite"
              >
                {error?.message || 'Erro ao atualizar meta. Tente novamente.'}
              </div>
            )}

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

export default UpdateGoalsModal;
