import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email deve ter um formato válido"),
  password: z.string().min(1, "Senha é obrigatória"),
});
