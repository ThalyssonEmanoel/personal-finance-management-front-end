import Button from './Custom-Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from 'react';

export function ModalForgotPassword({ isOpen, onClose, onSendCode }) {
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSendCode = () => {
    if (email.trim()) {
      onSendCode(email);
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
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="forgot-email">Email</Label>
                <Input 
                  id="forgot-email" 
                  type="email" 
                  placeholder="Ex.: example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                texto="Enviar código" 
                largura="334.4px" 
                altura="34px"
                onClick={handleSendCode}
              />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
