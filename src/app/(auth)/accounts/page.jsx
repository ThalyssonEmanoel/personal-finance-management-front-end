'use client'
import React, { useState, Suspense, memo } from "react"
import { useAuth } from "@/hooks/useAuth"
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

// Lazy loading para reduzir JavaScript inicial
const AccountsTable = React.lazy(() => import("@/components/ComponentsForAccounts/AccountsTable"));
const RegisterAccountModal = React.lazy(() => import("@/components/ComponentsForAccounts/RegisterAccountModal"));
const TransfersTable = React.lazy(() => import("@/components/ComponentsForBankTransfer/TransfersTable"));
const RegisterTransferModal = React.lazy(() => import("@/components/ComponentsForBankTransfer/RegisterTransferModal"));

// Loading fallback otimizado
const LoadingFallback = memo(() => (
  <div
    className="flex flex-col items-center justify-center"
    style={{ minHeight: '400px' }}
  >
    <span className="text-lg mb-4">Carregando...</span>
    <Progress value={100} className="w-[20%]" />
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

export default function AccountsPage() {
  const { isLoading: isAuthLoading } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("contas");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAccountChange = () => {
    // Callback para quando uma conta for alterada
    console.log("Account changed");
  };

  const handleTransferChange = () => {
    // Callback para quando uma transferência for alterada
    console.log("Transfer changed");
  };

  const handleCreateAction = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
    <div className="px-4 sm:px-6 lg:px-20 mt-10 mb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div className="flex flex-col">
          <label htmlFor="account-filter" className="mb-2 text-base font-medium text-gray-700">Listar</label>
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger
              id="account-filter"
              className="w-full sm:w-56 h-10 border-2 border-neutral-300 rounded-sm"
              aria-label="Filtrar por tipo de conta ou transferência"
            >
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
        <div className="w-full sm:w-auto">
          <ButtonC
            texto={selectedFilter === "contas" ? "Cadastrar conta" : "Nova transferência"}
            type="button"
            onClick={handleCreateAction}
            className="w-full sm:w-[160px] h-[40px] border-2 border-neutral-300 rounded-sm bg-white text-black hover:cursor-pointer hover:text-white hover:shadow-md hover:bg-brown"
          />
        </div>
      </div>
      <Suspense fallback={<LoadingFallback />}>
        {selectedFilter === "contas" ? (
          <AccountsTable onAccountChange={handleAccountChange} />
        ) : (
          <TransfersTable onTransferChange={handleTransferChange} />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {selectedFilter === "contas" ? (
          <RegisterAccountModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        ) : (
          <RegisterTransferModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </Suspense>
    </div>
  );
}
