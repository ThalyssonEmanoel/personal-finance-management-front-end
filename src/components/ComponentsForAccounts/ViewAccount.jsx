'use client'
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ViewAccount = ({ isOpen, onClose, account }) => {
  if (!isOpen || !account) return null;

  const formatCurrency = (value) => {
    const numValue = parseFloat(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const getAccountTypeDisplay = (type) => {
    const typeMap = {
      'corrente': 'Corrente',
      'poupanca': 'Poupança',
      'carteira': 'Carteira',
      'investimento': 'Investimento'
    };
    return typeMap[type] || type;
  };

  const getBalanceColor = (balance) => {
    const numBalance = parseFloat(balance) || 0;
    if (numBalance > 0) return 'text-green-600';
    if (numBalance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBalancePrefix = (balance) => {
    const numBalance = parseFloat(balance) || 0;
    if (numBalance > 0) return '+ ';
    if (numBalance < 0) return '- ';
    return '';
  };

  const fileName = account.icon ? account.icon.replace(/src[\\/]uploads[\\/]|src[\\/]seed[\\/]images[\\/]|uploads[\\/]/g, '') : 'avatar1.jpeg';
  const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/${fileName}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Detalhes da conta
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="flex items-center bg-[rgb(250,249,244)] rounded-lg p-4">
            <img
              src={imageUrl}
              alt={account.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-solid border-tertiary mr-4"
              onError={(e) => {
                e.target.src = `${process.env.NEXT_PUBLIC_API_URL}/uploads/avatar1.jpeg`;
              }}
            />
            <div className="flex-grow">
              <p className="font-bold text-lg text-gray-900">{account.name}</p>
              <p className="text-sm text-gray-700">{getAccountTypeDisplay(account.type)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div className="font-medium">Nome da conta</div>
            <div className="text-right font-semibold text-gray-800">{account.name}</div>

            <div className="font-medium">Tipo de conta</div>
            <div className="text-right font-semibold text-gray-800">{getAccountTypeDisplay(account.type)}</div>

            <div className="font-medium">Saldo atual</div>
            <div className={`text-right font-semibold ${getBalanceColor(account.balance)}`}>
              {getBalancePrefix(account.balance)}{formatCurrency(Math.abs(parseFloat(account.balance) || 0))}
            </div>

            <div className="font-medium">Métodos de pagamento</div>
            <div className="text-right font-semibold text-gray-800">
              {account.accountPaymentMethods ? account.accountPaymentMethods.length : 0}
            </div>
          </div>
          
          {account.accountPaymentMethods && account.accountPaymentMethods.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Métodos de pagamento associados</h3>
              <div className="space-y-2 overflow-y-auto max-h-25">
                {account.accountPaymentMethods.map((paymentMethod, index) => (
                  <div key={index} className="text-sm text-gray-600 bg-[rgb(250,249,244)] rounded-md p-2">
                    {paymentMethod.paymentMethod?.name || 'Método não identificado'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {account.description && (
            <div>
              <h3 className="font-semibold text-gray-800">Descrição</h3>
              <p className="text-sm text-gray-600 rounded-md">
                {account.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAccount;
