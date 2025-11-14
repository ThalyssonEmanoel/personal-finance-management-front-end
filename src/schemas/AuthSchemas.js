import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email deve ter um formato válido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email deve ter um formato válido"),
});

export const resetPasswordSchema = z.object({
  code: z.string().min(6, "Código deve ter exatamente 6 caracteres").max(6, "Código deve ter exatamente 6 caracteres"),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial"),
  confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});
