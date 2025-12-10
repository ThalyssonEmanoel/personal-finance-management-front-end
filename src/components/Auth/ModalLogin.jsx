import ButtonC from '../Custom-Button';
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useState } from 'react';
import { Checkbox } from "../ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { createUser } from "@/utils/apiService"
import { loginSchema } from "@/schemas/AuthSchemas"
import { createUserSchema } from "@/schemas/UserSchemas"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

export function ModalLogin({ isOpen, onClose, onForgotPassword }) {
  const [tab, setTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const router = useRouter();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      avatar: null,
    },
  });

  if (!isOpen) return null;

  const handleForgotPassword = () => {
    onForgotPassword();
  };

  const handleLoginSubmit = async (data) => {
    setIsLoading(true);
    setLoginError('');

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Erro ao fazer login", {
          description: "Email ou senha incorretos"
        });
      } else {
        toast.success("Login realizado com sucesso!", {
          description: "Bem-vindo de volta!"
        });
        onClose();
        router.push('/home');
      }
    } catch (error) {
      toast.error("Erro ao fazer login", {
        description: "Ocorreu um erro inesperado. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (data) => {
    setIsLoading(true);
    setRegisterSuccess('');

    try {
      if (data.avatar && data.avatar.size > 2 * 1024 * 1024) {
        registerForm.setError('avatar', {
          type: 'manual',
          message: 'O arquivo de imagem deve ter no máximo 2MB.',
        });
        return;
      }

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);

      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      const response = await createUser(formData);

      if (response && !response.error) {
        toast.success("Conta criada com sucesso!", {
          description: "Agora você pode fazer login com suas credenciais"
        });

        registerForm.reset();
        document.getElementById("file-name").textContent = "Nenhum arquivo escolhido";

        setTimeout(() => {
          setTab('login');
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast.error("Erro ao criar conta", {
        description: error.message || "Ocorreu um erro inesperado. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center"
    >
      <div
        className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
      >
        <div className="relative mb-4">
          <h2 className="text-xl font-semibold text-center w-full">
            {tab === 'login' ? 'Login' : 'Criar conta'}
          </h2>
          <button
            onClick={onClose}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
            aria-label="Fechar"
            data-cy="modal-close-button"
          >
            ×
          </button>
        </div>

        <div className="flex w-full max-w-md flex-col gap-6">
          <Tabs value={tab} onValueChange={setTab} defaultValue="login">
            <TabsList>
              <TabsTrigger value="login" data-cy="login-tab">Login</TabsTrigger>
              <TabsTrigger value="CreateAccount" data-cy="create-account-tab">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Card>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)}>
                    <CardContent className="grid gap-6">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Ex.: example@gmail.com"
                                data-cy="login-email-input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                              <Input
                                type={showPassword ? "text" : "password"}
                                className="pr-10"
                                data-cy="login-password-input"
                                {...field}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                              data-cy="login-toggle-password-visibility"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-between ">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="terms" className={"mb-6"} data-cy="login-remember-me-checkbox" />
                          <Label htmlFor="terms" className={"mt-0.5 mb-6"}>Lembre-me</Label>
                        </div>
                        <div className="text-sm underline text-blue-400 hover:text-blue-600 duration-200 mb-6">
                          <button type="button" onClick={handleForgotPassword} data-cy="forgot-password-link">Esqueceu a senha?</button>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                      <ButtonC
                        texto={isLoading ? "Entrando..." : "Entrar"}
                        largura="100%"
                        altura="40px"
                        type="submit"
                        disabled={isLoading}
                        data-cy="login-submit-button"
                      />
                      <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-muted-foreground">Ou continue com</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          setIsLoading(true);
                          try {
                            await signIn('google', { callbackUrl: '/home' });
                          } catch (error) {
                            toast.error("Erro ao fazer login com Google", {
                              description: "Ocorreu um erro. Tente novamente."
                            });
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 h-10 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        data-cy="google-login-button"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="text-sm font-medium">Google</span>
                      </button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>
            <TabsContent value="CreateAccount">
              <Card>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}>
                    <CardContent className="grid gap-6">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome *</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Ex.: João Silva"
                                data-cy="register-name-input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Ex.: example@gmail.com"
                                data-cy="register-email-input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel>Senha *</FormLabel>
                            <FormControl>
                              <Input
                                type={showPassword ? "text" : "password"}
                                className="pr-10"
                                placeholder="Mínimo 8 caracteres com maiúscula, minúscula, número e caractere especial"
                                data-cy="register-password-input"
                                {...field}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                              data-cy="register-toggle-password-visibility"
                            >
                              {showPassword ? <EyeOff size={18} className='mt-1' /> : <Eye size={18} className='mt-1' />}
                            </button>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel>Repita sua senha *</FormLabel>
                            <FormControl>
                              <Input
                                type={showPasswordConfirm ? "text" : "password"}
                                className="pr-10"
                                data-cy="register-confirm-password-input"
                                {...field}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                              data-cy="register-toggle-confirm-password-visibility"
                            >
                              {showPasswordConfirm ? <EyeOff size={18} className='mt-1' /> : <Eye size={18} className='mt-1' />}
                            </button>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="avatar"
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>Foto de perfil (opcional, máximo 2MB)</FormLabel>
                            <div className="grid gap-3 w-44">
                              <FormControl>
                                <input
                                  id="user-image"
                                  type="file"
                                  accept="image/*"
                                  className="hidden rounded-sm"
                                  data-cy="register-avatar-input"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    onChange(file);
                                    const fileName = file?.name || "Nenhum arquivo escolhido";
                                    document.getElementById("file-name").textContent = fileName;
                                  }}
                                />
                              </FormControl>
                              <label
                                htmlFor="user-image"
                                className="flex justify-center items-center text-center md:text-center border-2 rounded-sm text-black text-sm hover:text-white hover:shadow-md hover:bg-brown duration-200 cursor-pointer h-8"
                                data-cy="register-avatar-label"
                              >
                                Selecionar imagem
                              </label>
                              <span id="file-name" className="text-sm text-gray-600 -mt-2 mb-6 ml-0.5">
                                Nenhum arquivo escolhido
                              </span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <ButtonC
                        texto={isLoading ? "Criando conta..." : "Criar conta"}
                        largura="100%"
                        altura="34px"
                        type="submit"
                        disabled={isLoading}
                        data-cy="register-submit-button"
                      />
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
