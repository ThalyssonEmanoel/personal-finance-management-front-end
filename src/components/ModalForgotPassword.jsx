import Button from './Custom-Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from 'react';
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema } from "@/schemas/AuthSchemas"
import { forgotUserPassword } from "@/utils/apiClient"

export function ModalForgotPassword({ isOpen, onClose, onSendCode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  if (!isOpen) return null;

  const handleSendCode = async (data) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await forgotUserPassword(data.email);
      
      setSuccess('Código enviado com sucesso! Verifique seu email.');
      setTimeout(() => {
        onSendCode(data.email);
      }, 2000);

    } catch (error) {
      console.error('Erro ao enviar código:', error);
      setError(error.message || 'Erro ao enviar código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="relative mb-4">
          <h2 className="text-xl font-semibold text-center w-full">
            Recuperar senha
          </h2>
          <button
            onClick={onClose}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-6">
          <Card>
            <CardHeader>
              <CardDescription>
                Enviaremos um código ao seu email, por favor coloque-o abaixo
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSendCode)}>
                <CardContent className="grid gap-6">
                  {error && (
                    <div className="text-red-500 text-sm text-center">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="text-green-500 text-sm text-center">
                      {success}
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Ex.: example@gmail.com"
                            disabled={isLoading}
                            {...field}
                            className={`mb-8`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    texto={isLoading ? "Enviando..." : "Enviar código"}
                    largura="334.4px"
                    altura="40px"
                    type="submit"
                    disabled={isLoading}
                  />
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  )
}
