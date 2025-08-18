'use client'
import { useState } from 'react';
import Header from "@/components/nav-menu";
import { ModalLogin } from "@/components/ModalLogin";
import { ModalForgotPassword } from "@/components/ModalForgotPassword";
import { ModalChangePassword } from "@/components/ModalChangePassword";

export default function IntroductionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleLoginClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleForgotPassword = () => {
    setIsModalOpen(false);
    setIsForgotPasswordOpen(true);
  };

  const handleCloseForgotPassword = () => {
    setIsForgotPasswordOpen(false);
  };

  const handleSendCode = (email) => {
    setUserEmail(email);
    setIsForgotPasswordOpen(false);
    setIsChangePasswordOpen(true);
  };

  const handleCloseChangePassword = () => {
    setIsChangePasswordOpen(false);
    setUserEmail('');
  };

  return (
    <>
      <Header onLoginClick={handleLoginClick} />
      <div className=" ml-20 mt-20 flex flex-col gap-20">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          <div className="flex-shrink-0">
            <img
              src="/Imagem1Introdução.jpg"
              alt="Financial Record"
              width={614}
              height={268}
              className="rounded-lg shadow-lg"
            />
          </div>

          <div className="flex flex-col space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold text-gray-900">Financial Record</h1>
            <h2 className="text-2xl text-gray-700 font-medium">
              Organize sua vida financeira de forma prática e segura.
            </h2>
            <p className="text-sm text-gray-600 leading-8">
              Mantenha o controle completo das suas despesas, receitas e contas em um só lugar.
              O Financial Record foi desenvolvido para ajudar você a registrar cada transação,
              acompanhar o fluxo do seu dinheiro e visualizar relatórios. Assim, você toma
              decisões mais conscientes e conquista seus objetivos financeiros.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-12 mr-20 self-end">
          <div className="flex flex-col space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold text-gray-900">Como funciona</h1>
            <h2 className="text-2xl text-gray-700 font-medium">
              Registre, acompanhe e visualize
            </h2>
            <p className="text-sm text-gray-600 leading-8">
              Cadastre suas despesas e receitas rapidamente, escolha as categorias e formas de pagamento,
              e deixe que o sistema faça o resto. O Financial Record gera gráficos e relatórios automáticos
              para você entender como está gastando e economizando, além de registrar automaticamente
              transações recorrentes ou parceladas. Gerencie suas contas e mantenha seu saldo sempre atualizado.
            </p>
          </div>
          <div className="flex-shrink-0">
            <img
              src="/AnotandoGastos.jpg"
              alt="Como funciona"
              width={614}
              height={268}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 mb-40">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            O que você pode fazer
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition border-2 border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                 Cadastrar despesas e receitas
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Registre suas movimentações financeiras de forma rápida e simples.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl  transition border-2 border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Gerenciar contas bancárias
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Centralize todas as suas contas em um só lugar e acompanhe os seus saldos.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition border-2 border-gray-200 ">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Gerar relatórios
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tenha acesso a relatórios e gráficos automáticos que mostram seu fluxo de dinheiro.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition border-2 border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Acompanhar gastos recorrentes
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Monitore assinaturas, parcelas e despesas fixas.
              </p>
            </div>
          </div>
        </div>

      </div>

      <ModalLogin
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onForgotPassword={handleForgotPassword}
      />
      <ModalForgotPassword
        isOpen={isForgotPasswordOpen}
        onClose={handleCloseForgotPassword}
        onSendCode={handleSendCode}
      />
      <ModalChangePassword
        isOpen={isChangePasswordOpen}
        onClose={handleCloseChangePassword}
        email={userEmail}
      />
    </>
  );
}