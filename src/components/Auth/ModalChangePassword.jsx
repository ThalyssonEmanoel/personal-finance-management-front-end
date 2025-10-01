import ButtonC from '../Custom-Button';
import {
  Card,
  CardContent,
  CardFooter,
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
import { useState } from 'react';
import { Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema } from "@/schemas/AuthSchemas"
import { resetPassword } from "@/utils/apiService"

export function ModalChangePassword({ isOpen, onClose, email }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      password: '',
      confirmPassword: '',
    },
  });

  if (!isOpen) return null;

  const handleChangePassword = async (data) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await resetPassword(email, data.code, data.password);

      setSuccess('Senha alterada com sucesso!');
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setError(error.message || 'Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="relative mb-4">
          <h2 className="text-xl font-semibold text-center w-full">
            Alterar Senha
          </h2>
          <button
            onClick={onClose}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="flex w-full max-w-md flex-col gap-6">
          <Card>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleChangePassword)}>
                <CardContent className="grid gap-">
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
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Digite o código"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="relative mt-6">
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="pr-10 "
                            placeholder="Mínimo 8 caracteres com maiúscula, minúscula, número e caractere especial"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="relative mt-4">
                        <FormLabel>Repetir senha</FormLabel>
                        <FormControl>
                          <Input
                            type={showPasswordConfirm ? "text" : "password"}
                            className="pr-10 mb-6"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                          className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                          disabled={isLoading}
                        >
                          {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <FormMessage className="mb-6 -mt-4" />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <ButtonC
                    texto={isLoading ? "Alterando..." : "Alterar"}
                    largura="100%"
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
