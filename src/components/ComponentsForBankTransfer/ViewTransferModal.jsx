// src/components/ComponentsForBankTransfer/ViewTransferModal.jsx

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Decimal from "decimal.js";

const ViewTransferModal = ({ isOpen, onClose, transfer }) => {
  if (!isOpen || !transfer) return null;

  const formatCurrency = (value) => {
    const numericValue = new Decimal(value);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numericValue.toNumber());
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Detalhes da transferência
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="flex items-center bg-[rgb(250,249,244)] rounded-lg p-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-3 bg-yellow-300" />
            <div className="ml-4 flex-grow">
              <p className="font-bold text-lg text-gray-900">Transferência entre contas</p>
              <p className="text-sm text-gray-700">
                {transfer.sourceAccount?.name} → {transfer.destinationAccount?.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div className="font-medium">Valor</div>
            <div className="text-right font-semibold text-yellow-600">
              {formatCurrency(transfer.amount)}
            </div>

            <div className="font-medium">Data da transferência</div>
            <div className="text-right font-semibold text-gray-800">
              {formatDate(transfer.transfer_date)}
            </div>

            <div className="font-medium">Conta de origem</div>
            <div className="text-right font-semibold text-gray-800">
              {transfer.sourceAccount?.name || 'N/A'}
            </div>

            <div className="font-medium">Conta de destino</div>
            <div className="text-right font-semibold text-gray-800">
              {transfer.destinationAccount?.name || 'N/A'}
            </div>

            <div className="font-medium">Forma de pagamento</div>
            <div className="text-right font-semibold text-gray-800">
              {transfer.paymentMethod?.name || 'N/A'}
            </div>
          </div>
          
          {transfer.description && (
            <div>
              <h3 className="font-semibold text-gray-800">Descrição</h3>
              <p className="text-sm text-gray-600 rounded-md">
                {transfer.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTransferModal;