import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"], {
    required_error: "Tipo é obrigatório",
    invalid_type_error: "Tipo deve ser receita ou despesa"
  }),
  name: z.string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  category: z.string()
    .min(1, "Categoria é obrigatória"),
  value: z.number()
    .positive("Valor deve ser positivo")
    .min(0.01, "Valor mínimo é R$ 0,01"),
  release_date: z.string()
    .min(1, "Data é obrigatória"),
  description: z.string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  recurring: z.boolean()
    .default(false),
  number_installments: z.number()
    .int("Número de parcelas deve ser um número inteiro")
    .min(2, "Número mínimo de parcelas é 2")
    .max(60, "Número máximo de parcelas é 60")
    .optional(),
  accountId: z.number()
    .int("Conta deve ser um número inteiro")
    .positive("Conta é obrigatória"),
  paymentMethodId: z.number()
    .int("Forma de pagamento deve ser um número inteiro")
    .positive("Forma de pagamento é obrigatória")
});
