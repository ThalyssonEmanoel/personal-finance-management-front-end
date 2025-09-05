// src/components/ComponentsForHome/ViewTransactionModal.jsx

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Decimal from "decimal.js";

const ViewTransactionModal = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const formatCurrency = (value, type) => {
    const numericValue = new Decimal(value);
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numericValue.abs().toNumber());

    return type === 'expense' ? `- ${formatted}` : `+ ${formatted}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString("pt-BR");
  };

  const isExpense = transaction.type === 'expense';
  const typeText = isExpense ? "Despesa" : "Receita";
  const typeColor = isExpense ? 'bg-red-300' : 'bg-green-300';
  const valueColor = isExpense ? 'text-red-600' : 'text-green-600';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Detalhes da transação
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="flex items-center bg-gray-50 rounded-lg p-4 relative overflow-hidden">
            <div className={`absolute left-0 top-0 h-full w-3 ${typeColor}`} />
            <div className="ml-4 flex-grow">
              <p className="font-bold text-lg text-gray-900">{transaction.name}</p>
              <p className="text-sm text-gray-700">{typeText}</p>
            </div>
            <p className={`text-lg font-bold ${valueColor}`}>
              {formatCurrency(transaction.value_installment || transaction.value, transaction.type)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div className="font-medium ">Data da transação</div>
            <div className="text-right font-semibold text-gray-800">{formatDate(transaction.release_date)}</div>

            <div className="font-medium ">Conta</div>
            <div className="text-right font-semibold text-gray-800">{transaction.account?.name || 'N/A'}</div>

            <div className="font-medium ">Forma de pagamento</div>
            <div className="text-right font-semibold text-gray-800">{transaction.paymentMethod?.name || 'N/A'}</div>

            <div className="font-medium ">Categoria</div>
            <div className="text-right font-semibold text-gray-800">{transaction.category}</div>

            {transaction.number_installments && transaction.number_installments > 1 && (
              <>

                <div className="font-medium ">Valor total</div>
                <div className="text-right font-semibold text-gray-800">{formatCurrency(transaction.value)}</div>

                <div className="font-medium ">Total de parcelas</div>
                <div className="text-right font-semibold text-gray-800">{transaction.number_installments}</div>

                <div className="font-medium ">Parcela atual</div>
                <div className="text-right font-semibold text-gray-800">{transaction.current_installment || 1}</div>
              </>
            )}
          </div>
          
          {transaction.description && (
            <div>
              <h3 className="font-semibold text-gray-800">Descrição</h3>
              <p className="text-sm text-gray-600 rounded-md">
                {transaction.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTransactionModal;