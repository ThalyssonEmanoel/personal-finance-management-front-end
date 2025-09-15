import { z } from "zod";

export const createBankTransferSchema = z.object({
  amount: z.number({
    required_error: "O valor é obrigatório.",
    invalid_type_error: "O valor precisa ser um número.",
  })
    .min(0.01, "O valor deve ser maior que zero."),
  transfer_date: z.string({ required_error: "A data é obrigatória." })
    .min(1, "A data é obrigatória."),
  description: z.string()
    .max(500, "A descrição deve ter no máximo 500 caracteres.")
    .transform(val => val === "" ? undefined : val)
    .optional(),
  sourceAccountId: z.coerce.number({ message: "A conta de origem é obrigatória." })
    .int({ message: "A conta de origem é obrigatória." })
    .positive({ message: "A conta de origem é obrigatória." }),
  destinationAccountId: z.coerce.number({ message: "A conta de destino é obrigatória." })
    .int({ message: "A conta de destino é obrigatória." })
    .positive({ message: "A conta de destino é obrigatória." }),
  paymentMethodId: z.number()
    .int("A forma de pagamento deve ser um número inteiro.")
    .positive("A forma de pagamento é obrigatória.")
    .optional(),
}).refine((data) => {
  // Verificar se a conta de origem é diferente da conta de destino
  if (data.sourceAccountId === data.destinationAccountId) {
    return false;
  }
  return true;
}, {
  message: "A conta de origem deve ser diferente da conta de destino.",
  path: ["destinationAccountId"],
});

export const updateBankTransferSchema = z.object({
  amount: z.number({
    required_error: "O valor é obrigatório.",
    invalid_type_error: "O valor precisa ser um número.",
  })
    .min(0.01, "O valor deve ser maior que zero."),
  transfer_date: z.string({ required_error: "A data é obrigatória." })
    .min(1, "A data é obrigatória."),
  description: z.string()
    .max(500, "A descrição deve ter no máximo 500 caracteres.")
    .transform(val => val === "" ? undefined : val)
    .optional(),
  sourceAccountId: z.coerce.number({ message: "A conta de origem é obrigatória." })
    .int({ message: "A conta de origem é obrigatória." })
    .positive({ message: "A conta de origem é obrigatória." }),
  destinationAccountId: z.coerce.number({ message: "A conta de destino é obrigatória." })
    .int({ message: "A conta de destino é obrigatória." })
    .positive({ message: "A conta de destino é obrigatória." }),
  paymentMethodId: z.number()
    .int("A forma de pagamento deve ser um número inteiro.")
    .positive("A forma de pagamento é obrigatória.")
    .optional(),
}).refine((data) => {
  // Verificar se a conta de origem é diferente da conta de destino
  if (data.sourceAccountId === data.destinationAccountId) {
    return false;
  }
  return true;
}, {
  message: "A conta de origem deve ser diferente da conta de destino.",
  path: ["destinationAccountId"],
});