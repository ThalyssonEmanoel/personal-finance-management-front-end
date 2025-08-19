import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string({ message: "O nome precisa ser definido como uma string/texto." })
    .refine((val) => !/^\d+$/.test(val), { message: "O nome precisa ser em palavras e não números." }),
  email: z.string({ message: "O email precisa ser definido como uma string/texto." }).email({ message: "Email invalido" }),
  password: z.string({ message: "A senha precisa ser definida como uma string/texto." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[a-zA-Z\d\W_]{8,}$/,
      { message: "A senha deve conter no mínimo 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial." }),
  confirmPassword: z.string({ message: "A confirmação de senha é obrigatória." }),
  avatar: z.any().optional().nullable(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export const updateUserSchema = z.object({
    name: z.string({ message: "O nome precisa ser definido como uma string/texto." })
      .refine((val) => !/^\d+$/.test(val), { message: "O nome precisa ser em palavras e não números." })
      .optional(),
    email: z.string({ message: "O email precisa ser definido como uma string/texto." })
      .email({ message: "Email invalido" })
      .optional()
      .or(z.literal(""))
      .or(z.null()),
    avatar: z.string({ message: "O avatar precisa ser definido como uma string/texto." }).optional().nullable(),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string({ message: "A senha atual precisa ser definida como uma string/texto." })
      .min(1, { message: "A senha atual é obrigatória." }),
    newPassword: z.string({ message: "A nova senha precisa ser definida como uma string/texto." })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[a-zA-Z\d\W_]{8,}$/,
        { message: "A nova senha deve conter no mínimo 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial." }),
    confirmPassword: z.string({ message: "A confirmação de senha precisa ser definida como uma string/texto." })
      .min(1, { message: "A confirmação de senha é obrigatória." }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "A nova senha e a confirmação de senha devem ser iguais.",
    path: ["confirmPassword"],
  });
