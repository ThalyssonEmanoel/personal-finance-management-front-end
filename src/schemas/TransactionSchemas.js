import { z } from "zod";

export const createTransactionSchema = z.object({
  // Adicionado preprocess para tratar strings vazias
  type: z.enum(["expense", "income"], { message: "O tipo da transação é obrigatório." }),
  name: z.string()
    .min(1, "O nome da transação é obrigatório."),
  category: z.string()
    .min(1, "A categoria é obrigatória."),
  value: z.number({
    required_error: "O valor é obrigatório.",
    invalid_type_error: "O valor precisa ser um número.",
  })
    .min(0.01, "O valor deve ser maior que zero."),
  release_date: z.string({ required_error: "A data é obrigatória." })
    .min(1, "A data é obrigatória."),
  description: z.string()
    .max(500, "A descrição deve ter no máximo 500 caracteres.")
    .transform(val => val === "" ? undefined : val)
    .optional(),
  recurring: z.boolean()
    .default(false),
  recurring_type: z.enum(["daily", "weekly", "monthly", "yearly"], {
    message: "O tipo de recorrência deve ser diário, semanal, mensal ou anual."
  }).optional(),
  number_installments: z.number()
    .int("O número de parcelas deve ser um número inteiro.")
    .min(2, "O número mínimo de parcelas é 2.")
    .max(60, "O número máximo de parcelas é 60.")
    .optional(),
  // Adicionado preprocess para tratar strings vazias e converter para número
  accountId: z.coerce.number({ message: "A conta é obrigatória." })
    .int({ message: "A conta é obrigatória." })
    .positive({ message: "A conta é obrigatória." }),
  paymentMethodId: z.number()
    .int("A forma de pagamento deve ser um número inteiro.")
    .positive("A forma de pagamento é obrigatória.")
    .optional(),
}).refine((data) => {
  // Se recurring for true, recurring_type deve ser obrigatório
  if (data.recurring && !data.recurring_type) {
    return false;
  }
  return true;
}, {
  message: "O tipo de recorrência é obrigatório quando a transação é recorrente.",
  path: ["recurring_type"],
});

export const updateTransactionSchema = z.object({
  type: z.enum(["income", "expense"], {
    required_error: "Tipo é obrigatório",
    invalid_type_error: "Tipo deve ser receita ou despesa"
  }),
  name: z.string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres").optional(),
  category: z.string()
    .min(1, "Categoria é obrigatória").optional(),
  value: z.number()
    .positive("Valor deve ser positivo")
    .min(0.01, "Valor mínimo é R$ 0,01").optional(),
  release_date: z.string()
    .min(1, "Data é obrigatória").optional(),
  description: z.string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .transform(val => val === "" ? undefined : val)
    .optional(),
  recurring: z.boolean()
    .default(false).optional(),
  recurring_type: z.enum(["daily", "weekly", "monthly", "yearly"], {
    message: "O tipo de recorrência deve ser diário, semanal, mensal ou anual."
  }).optional(),
  number_installments: z.number()
    .int("Número de parcelas deve ser um número inteiro")
    .min(2, "Número mínimo de parcelas é 2")
    .max(60, "Número máximo de parcelas é 60")
    .optional(),
  current_installment: z.number()
    .int("Parcela atual deve ser um número inteiro")
    .min(1, "Parcela atual deve ser no mínimo 1")
    .optional(),
  accountId: z.number()
    .int("Conta deve ser um número inteiro")
    .positive("Conta é obrigatória").optional(),
  paymentMethodId: z.number()
    .int("Forma de pagamento deve ser um número inteiro")
    .positive("Forma de pagamento é obrigatória")
    .optional()
}).refine((data) => {
  // Se recurring for true, recurring_type deve ser obrigatório
  if (data.recurring && !data.recurring_type) {
    return false;
  }
  return true;
}, {
  message: "O tipo de recorrência é obrigatório quando a transação é recorrente.",
  path: ["recurring_type"],
});