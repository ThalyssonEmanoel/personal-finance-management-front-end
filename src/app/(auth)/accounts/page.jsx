'use client'
import { useAuth } from "@/hooks/useAuth"
import { useState } from "react"
import { AccountsTable } from "@/components/ComponentsForAccounts"
import { Progress } from "@/components/ui/progress"
import ButtonC from "@/components/Custom-Button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AccountsPage() {
  const { isLoading: isAuthLoading } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("Contas");

  const handleAccountChange = () => {
    // Callback para quando uma conta for alterada
    console.log("Account changed");
  };

  const handleCreateAccount = () => {
    console.log("Create account clicked");
  };

  const isLoading = isAuthLoading();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '1rem',
        fontSize: '1.2rem'
      }}>
        <span>Carregando...</span>
        <Progress value={100} className="w-[20%]" />
      </div>
    );
  }

  return (
    <div className="px-20 mt-10 mb-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <label className="mb-2 text-base font-medium text-gray-700">Listar</label>
          <Select>
            <SelectTrigger className="w-56 h-10 border-2 border-neutral-300 rounded-sm">
              <SelectValue placeholder="Todas as contas" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                  <SelectItem value="contas">Contas</SelectItem>
                  <SelectItem value="transferencias">Transferências entre contas</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <ButtonC
            texto="Cadastrar conta"
            largura="120px"
            altura="40px"
            type="button"
            // onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>
        <AccountsTable onAccountChange={handleAccountChange} />
    </div>
  );
}
