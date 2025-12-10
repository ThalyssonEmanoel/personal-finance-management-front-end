'use client'
import { useState, useEffect, lazy, Suspense } from 'react';
import Header from "@/components/nav-menu";
import OptimizedImage from "@/components/OptimizedImage";
import { ChevronUp } from "lucide-react";

// Lazy loading dos modais para reduzir JavaScript inicial
const ModalLogin = lazy(() => import("@/components/Auth/ModalLogin").then(module => ({ default: module.ModalLogin })));
const ModalForgotPassword = lazy(() => import("@/components/Auth/ModalForgotPassword").then(module => ({ default: module.ModalForgotPassword })));
const ModalChangePassword = lazy(() => import("@/components/Auth/ModalChangePassword").then(module => ({ default: module.ModalChangePassword })));

export default function IntroductionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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
      <div className="w-full">
        {/* Hero Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              <div className="w-full lg:w-1/2 order-2 lg:order-1">
                <div className="space-y-6 text-center lg:text-left">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                    Financial Record
                  </h1>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-700">
                    Organize sua vida financeira de forma prática e segura
                  </h2>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Mantenha o controle completo das suas despesas, receitas e contas em um só lugar.
                    O Financial Record foi desenvolvido para ajudar você a registrar cada transação,
                    acompanhar o fluxo do seu dinheiro e visualizar relatórios detalhados.
                  </p>
                  <div className="pt-4">
                    <button 
                      onClick={handleLoginClick}
                      className="px-6 py-3 bg-brown text-white rounded-lg font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Começar Agora
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-1/2 order-1 lg:order-2">
                <OptimizedImage 
                  src="/Imagem1Introdução.jpg" 
                  alt="Financial Record" 
                  width={640}
                  height={480}
                  priority={true}
                  className="rounded-lg shadow-lg w-full h-auto"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Como Funciona Section */}
        <section className="w-full bg-gray-50 px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-12">
              <div className="w-full lg:w-1/2">
                <OptimizedImage 
                  src="/AnotandoGastos.jpg" 
                  alt="Como funciona" 
                  width={640}
                  height={382}
                  priority={false}
                  className="rounded-lg shadow-lg w-full h-auto"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
                />
              </div>
              <div className="w-full lg:w-1/2 space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Como funciona</h2>
                <h3 className="text-lg sm:text-xl font-medium text-gray-700">
                  Registre, acompanhe e visualize
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Cadastre suas despesas e receitas rapidamente, escolha as categorias e formas de pagamento,
                  e deixe que o sistema faça o resto. O Financial Record gera gráficos e relatórios automáticos
                  para você entender como está gastando e economizando.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Transações Automáticas Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Transações Automáticas
              </h2>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                Economize tempo com o registro automático de transações
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {/* Transações Recorrentes */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Transações Recorrentes
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Para despesas ou receitas que se repetem regularmente:
                </p>
                <ul className="space-y-2 mb-5 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-brown mt-0.5">•</span>
                    <span className="text-gray-700">Assinaturas (Netflix, Spotify)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brown mt-0.5">•</span>
                    <span className="text-gray-700">Salário mensal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brown mt-0.5">•</span>
                    <span className="text-gray-700">Contas fixas (aluguel, internet)</span>
                  </li>
                </ul>
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-brown">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Como funciona:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Defina a frequência (diária, semanal, mensal, anual) e o sistema registra 
                    automaticamente nos períodos especificados.
                  </p>
                </div>
              </div>

              {/* Transações Parceladas */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Transações Parceladas
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Para compras divididas em múltiplas parcelas:
                </p>
                <ul className="space-y-2 mb-5 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-brown mt-0.5">•</span>
                    <span className="text-gray-700">Compras no cartão parceladas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brown mt-0.5">•</span>
                    <span className="text-gray-700">Financiamentos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brown mt-0.5">•</span>
                    <span className="text-gray-700">Compras a prazo</span>
                  </li>
                </ul>
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-brown">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Como funciona:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Informe o valor total e número de parcelas. O sistema divide automaticamente 
                    e cria registros mensais para cada parcela.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full bg-gray-50 px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 text-center">
              O que você pode fazer
            </h2>
            <p className="text-base text-gray-600 text-center mb-10 max-w-2xl mx-auto">
              Ferramentas completas para gerenciar suas finanças
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Cadastrar despesas e receitas
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Registre suas movimentações financeiras de forma rápida e simples.
                </p>
              </div>

              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Gerenciar contas bancárias
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Centralize todas as suas contas e acompanhe seus saldos.
                </p>
              </div>

              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Gerar relatórios
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Acesse relatórios e gráficos automáticos do seu fluxo de dinheiro.
                </p>
              </div>

              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Acompanhar gastos recorrentes
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Monitore assinaturas, parcelas e despesas fixas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {/* Lazy loading dos modais com Suspense */}
      <Suspense fallback={null}>
        {isModalOpen && (
          <ModalLogin
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onForgotPassword={handleForgotPassword}
          />
        )}
      </Suspense>
      
      <Suspense fallback={null}>
        {isForgotPasswordOpen && (
          <ModalForgotPassword
            isOpen={isForgotPasswordOpen}
            onClose={handleCloseForgotPassword}
            onSendCode={handleSendCode}
          />
        )}
      </Suspense>
      
      <Suspense fallback={null}>
        {isChangePasswordOpen && (
          <ModalChangePassword
            isOpen={isChangePasswordOpen}
            onClose={handleCloseChangePassword}
            email={userEmail}
          />
        )}
      </Suspense>

      {/* Botão de Voltar ao Topo */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-brown cursor-pointer text-white p-3 rounded-full shadow-lg hover:opacity-90 transition-all duration-300 z-50 animate-in fade-in slide-in-from-bottom-4"
          aria-label="Voltar ao topo"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
}