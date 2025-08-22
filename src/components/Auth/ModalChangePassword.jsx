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
import { resetPassword } from "@/utils/apiClient"

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
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
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

        <div className="flex w-full max-w-sm flex-col gap-6">
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <ButtonC
                    texto={isLoading ? "Alterando..." : "Alterar"}
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
      <div className="mt-16 px-20">
        <h2 className="text-2xl font-semibold mb-4">Receitas e despesas recentes</h2>
        <p className="text-sm text-gray-500 mb-4">Você possui um total de 6 registros.</p>

        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Categoria</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Conta</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Data</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Valor (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { tipo: 'despesa', nome: 'Alface', categoria: 'Mercado', conta: 'Carteira', data: '23/01/2025', valor: -100 },
                { tipo: 'despesa', nome: 'Compras', categoria: 'Mercado', conta: 'Caixa econômica federal', data: '23/01/2025', valor: -300 },
                { tipo: 'despesa', nome: 'Shampoo', categoria: 'Mercado', conta: 'Nubank', data: '22/01/2025', valor: -150 },
                { tipo: 'receita', nome: 'Salário', categoria: 'Salário', conta: 'Caixa econômica', data: '22/01/2025', valor: 1000 },
                { tipo: 'receita', nome: 'Cosméticos', categoria: 'Dinheiro', conta: 'Carteira', data: '16/01/2025', valor: 3000 },
                { tipo: 'receita', nome: 'Cosméticos', categoria: 'Dinheiro', conta: 'Carteira', data: '15/01/2025', valor: 4000 },
              ].map((item, index) => (
                <tr key={index} className={`${item.tipo === 'receita' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nome}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.categoria}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.conta}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.data}</td>
                  <td className={`px-6 py-4 text-sm font-semibold ${item.valor > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.valor > 0 ? `+ R$ ${item.valor.toLocaleString('pt-BR')}` : `- R$ ${Math.abs(item.valor).toLocaleString('pt-BR')}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
