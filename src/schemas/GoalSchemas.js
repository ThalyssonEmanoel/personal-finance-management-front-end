import { z } from "zod";

export const createGoalSchema = z.object({
  name: z.string()
    .min(1, "O nome da meta é obrigatório.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  date: z.string({ required_error: "A data é obrigatória." })
    .min(1, "A data é obrigatória."),
  transaction_type: z.enum(["income", "expense"], { 
    message: "O tipo da meta é obrigatório." 
  }),
  value: z.number({
    required_error: "O valor é obrigatório.",
    invalid_type_error: "O valor precisa ser um número.",
  })
    .min(0.01, "O valor deve ser maior que zero.")
});

export const updateGoalSchema = z.object({
  name: z.string()
    .min(1, "O nome da meta é obrigatório.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  date: z.string({ required_error: "A data é obrigatória." })
    .min(1, "A data é obrigatória."),
  transaction_type: z.enum(["income", "expense"], { 
    message: "O tipo da meta é obrigatório." 
  }),
  value: z.number({
    required_error: "O valor é obrigatório.",
    invalid_type_error: "O valor precisa ser um número.",
  })
    .min(0.01, "O valor deve ser maior que zero.")
});