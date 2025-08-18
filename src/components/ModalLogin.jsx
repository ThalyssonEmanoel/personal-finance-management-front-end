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
import { useState } from 'react';
import { Checkbox } from "./ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export function ModalLogin({ isOpen, onClose, onForgotPassword }) {
  const [tab, setTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    avatar: null 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const router = useRouter();
  
  if (!isOpen) return null;

  const handleForgotPassword = () => {
    onForgotPassword();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const result = await signIn('credentials', {
        email: loginData.email,
        password: loginData.password,
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

  const handleLoginInputChange = (field, value) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    setLoginError('');
  };

  const handleRegisterInputChange = (field, value) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
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
                <form onSubmit={handleLoginSubmit}>
                  <CardContent className="grid gap-6">
                    {loginError && (
                      <div className="text-red-500 text-sm text-center">
                        {loginError}
                      </div>
                    )}
                    <div className="grid gap-3">
                      <Label htmlFor="login-email">Email</Label>
                      <Input 
                        id="login-email" 
                        type="email"
                        placeholder="Ex.: example@gmail.com" 
                        value={loginData.email}
                        onChange={(e) => handleLoginInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-3 relative">
                      <Label htmlFor="login-password">Senha</Label>
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        className="pr-10"
                        value={loginData.password}
                        onChange={(e) => handleLoginInputChange('password', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={18} className='mt-1' /> : <Eye size={18} className='mt-1' />}
                      </button>
                    </div>
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
                      altura="34px" 
                      type="submit"
                      disabled={isLoading}
                    />
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="CreateAccount">
              <Card>
                <CardContent className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="register-name">Nome</Label>
                    <Input 
                      id="register-name" 
                      type="text" 
                      placeholder="Ex.: João Silva" 
                      value={registerData.name}
                      onChange={(e) => handleRegisterInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="register-email">Email</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="Ex.: example@gmail.com" 
                      value={registerData.email}
                      onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3 relative">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      className="pr-10"
                      value={registerData.password}
                      onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={18} className='mt-1'/> : <Eye size={18} className='mt-1'/>}
                    </button>
                  </div>
                  <div className="grid gap-3 relative">
                    <Label htmlFor="register-confirm">Repita sua senha</Label>
                    <Input
                      id="register-confirm"
                      type={showPasswordConfirm ? "text" : "password"}
                      className="pr-10"
                      value={registerData.confirmPassword}
                      onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswordConfirm ? <EyeOff size={18} className='mt-1' /> : <Eye size={18} className='mt-1'/>}
                    </button>
                  </div>

                  <div className="grid gap-3 w-44">
                    <Label htmlFor="user-image">Foto de perfil</Label>

                    {/* Input escondido */}
                    <input
                      id="user-image"
                      type="file"
                      accept="image/*"
                      className="hidden rounded-sm"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        handleRegisterInputChange('avatar', file);
                        const fileName = file?.name || "Nenhum arquivo escolhido";
                        document.getElementById("file-name").textContent = fileName;
                      }}
                    />

                    <label
                      htmlFor="user-image"
                      className="text-center px-4 py border-2 rounded-sm text-black text-sm hover:text-white hover:shadow-md hover:bg-brown duration-200 cursor-pointer"
                    >
                      Selecionar imagem
                    </label>

                    {/* Texto com nome do arquivo */}
                    <span id="file-name" className="text-sm text-gray-600">
                      Nenhum arquivo escolhido
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button texto="Criar conta" largura="334.4px" altura="34px" />
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
