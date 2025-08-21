import Button from './Custom-Button';
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
import { Checkbox } from "./ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { createUser } from "@/utils/apiClient"
import { loginSchema } from "@/schemas/AuthSchemas"
import { createUserSchema } from "@/schemas/UserSchemas"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

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
        setLoginError('Email ou senha incorretos.');
      } else {
        onClose();
        router.push('/home');
      }
    } catch (error) {
      setLoginError('Erro ao fazer login. Tente novamente.');
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
        setRegisterSuccess('Conta criada com sucesso! Você pode fazer login agora.');
        registerForm.reset();
        document.getElementById("file-name").textContent = "Nenhum arquivo escolhido";
        
        setTimeout(() => {
          setTab('login');
          setRegisterSuccess('');
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      registerForm.setError('root', {
        type: 'manual',
        message: error.message || 'Erro ao criar conta. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
      >
        <div className="relative mb-4">
          <h2 className="text-xl font-semibold text-center w-full">
            {tab === 'login' ? 'Login' : 'Criar conta'}
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
          <Tabs value={tab} onValueChange={setTab} defaultValue="login">
            <TabsList>
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="CreateAccount">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Card>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)}>
                    <CardContent className="grid gap-6">
                      {loginError && (
                        <div className="text-red-500 text-sm text-center">
                          {loginError}
                        </div>
                      )}
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
                                {...field}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-between ">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="terms" className={"mb-6"}/>
                          <Label htmlFor="terms" className={"mt-0.5 mb-6"}>Lembre-me</Label>
                        </div>
                        <div className="text-sm underline text-blue-400 hover:text-blue-600 duration-200 mb-6">
                          <button type="button" onClick={handleForgotPassword}>Esqueceu a senha?</button>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        texto={isLoading ? "Entrando..." : "Entrar"} 
                        largura="334.4px" 
                        altura="40px" 
                        type="submit"
                        disabled={isLoading}
                      />
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
                      {registerForm.formState.errors.root && (
                        <div className="text-red-500 text-sm text-center">
                          {registerForm.formState.errors.root.message}
                        </div>
                      )}
                      {registerSuccess && (
                        <div className="text-green-500 text-sm text-center">
                          {registerSuccess}
                        </div>
                      )}
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
                                {...field}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? <EyeOff size={18} className='mt-1'/> : <Eye size={18} className='mt-1'/>}
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
                                {...field}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                            >
                              {showPasswordConfirm ? <EyeOff size={18} className='mt-1' /> : <Eye size={18} className='mt-1'/>}
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
                                className="text-center px-4 py border-2 rounded-sm text-black text-sm hover:text-white hover:shadow-md hover:bg-brown duration-200 cursor-pointer"
                              >
                                Selecionar imagem
                              </label>
                              <span id="file-name" className="text-sm text-gray-600">
                                Nenhum arquivo escolhido
                              </span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button 
                        texto={isLoading ? "Criando conta..." : "Criar conta"} 
                        largura="334.4px" 
                        altura="34px" 
                        type="submit"
                        disabled={isLoading}
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
