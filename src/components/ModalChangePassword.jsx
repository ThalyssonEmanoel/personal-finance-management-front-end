import Button from './Custom-Button';
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from 'react';
import { Eye, EyeOff } from "lucide-react"

export function ModalChangePassword({ isOpen, onClose, email }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleChangePassword = () => {
    if (password && confirmPassword && password === confirmPassword) {
      console.log('Alterando senha para:', email);
      onClose();
    } else {
      alert('As senhas não coincidem ou estão vazias');//Mensagem temporária, para debugg
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
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="code">Código</Label>
                <Input 
                  id="code" 
                  type="text"
                  placeholder="Digite o código"
                />
              </div>
              <div className="grid gap-3 relative">
                <Label htmlFor="change-password">Nova Senha</Label>
                <Input
                  id="change-password"
                  type={showPassword ? "text" : "password"}
                  className="pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                <Label htmlFor="change-confirm-password">Repetir senha</Label>
                <Input
                  id="change-confirm-password"
                  type={showPasswordConfirm ? "text" : "password"}
                  className="pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                >
                  {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                texto="Alterar" 
                largura="334.4px" 
                altura="34px"
                onClick={handleChangePassword}
              />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
