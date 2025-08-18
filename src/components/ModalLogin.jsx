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

export function ModalLogin({ isOpen, onClose, onForgotPassword }) {
  const [tab, setTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  if (!isOpen) return null;

  const handleForgotPassword = () => {
    onForgotPassword();
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
                <CardContent className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="tabs-demo-name">Email</Label>
                    <Input id="tabs-demo-name" placeholder="Ex.: example@gmail.com" />
                  </div>
                  <div className="grid gap-3 relative">
                    <Label htmlFor="tabs-demo-new">Senha</Label>
                    <Input
                      id="tabs-demo-new"
                      type={showPassword ? "text" : "password"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="flex justify-between ">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" />
                      <Label htmlFor="terms" className={"mt-0.5"}>Lembre-me</Label>
                    </div>
                    <div className="text-sm underline text-blue-400 hover:text-blue-600 duration-200">
                      <button onClick={handleForgotPassword}>Esqueceu a senha?</button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button texto="Entrar" largura="334.4px" altura="34px" />
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="CreateAccount">
              <Card>
                <CardContent className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="tabs-demo-current">Nome</Label>
                    <Input id="tabs-demo-current" type="text" placeholder="Ex.: João Silva" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="tabs-demo-new">Email</Label>
                    <Input id="tabs-demo-new" type="text" placeholder="Ex.: example@gmail.com" />
                  </div>
                  <div className="grid gap-3 relative">
                    <Label htmlFor="tabs-demo-new">Senha</Label>
                    <Input
                      id="tabs-demo-new"
                      type={showPassword ? "text" : "password"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="grid gap-3 relative">
                    <Label htmlFor="tabs-demo-confirm">Repita sua senha</Label>
                    <Input
                      id="tabs-demo-confirm"
                      type={showPasswordConfirm ? "text" : "password"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
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
                        const fileName = e.target.files[0]?.name || "Nenhum arquivo escolhido";
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
