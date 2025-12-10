import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string()
    .min(1, "Nome da conta é obrigatório")
    .max(50, "Nome da conta deve ter no máximo 50 caracteres"),
  type: z.string()
    .min(1, "Tipo da conta é obrigatório")
    .max(30, "Tipo da conta deve ter no máximo 30 caracteres"),
  balance: z.coerce.number({ message: "Saldo deve ser um número válido" })
    .refine((val) => !isNaN(val), { message: "Saldo deve ser um número válido" }),
  icon: z.any().optional().nullable(),
  paymentMethodIds: z.string()
    .optional()
    .default(''),
});
