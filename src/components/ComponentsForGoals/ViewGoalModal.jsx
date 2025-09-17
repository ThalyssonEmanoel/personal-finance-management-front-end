// src/components/ComponentsForGoals/ViewGoalModal.jsx

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Decimal from "decimal.js";

const ViewGoalModal = ({ isOpen, onClose, goal }) => {
  if (!isOpen || !goal) return null;

  const formatCurrency = (value) => {
    const numericValue = new Decimal(value);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numericValue.toNumber());
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const getTransactionTypeLabel = (type) => {
    const labels = {
      'income': 'Receita',
      'expense': 'Despesa'
    };
    return labels[type] || type;
  };

  const isExpense = goal.transaction_type === 'expense';
  const typeText = getTransactionTypeLabel(goal.transaction_type);
  const blue = 'bg-blue-300';
  const valueColor = isExpense ? 'text-red-600' : 'text-green-600';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Detalhes da Meta
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="flex items-center bg-[rgb(250,249,244)] rounded-lg p-4 relative overflow-hidden">
            <div className={`absolute left-0 top-0 h-full w-3 ${blue}`} />
            <div className="ml-4 flex-grow">
              <p className="font-bold text-lg text-gray-900">{goal.name}</p>
              <p className="text-sm text-gray-700">Meta para {typeText}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div className="font-medium">Valor da Meta</div>
            <div className={`text-right font-semibold`}>
              {formatCurrency(goal.value)}
            </div>

            <div className="font-medium">Data da Meta</div>
            <div className="text-right font-semibold text-gray-800">
              {formatDate(goal.date)}
            </div>

            <div className="font-medium">Tipo de Transação</div>
            <div className={`text-right font-semibold ${valueColor}`}>
              {typeText}
            </div>

            {goal.created_at && (
              <>
                <div className="font-medium">Data de Criação</div>
                <div className="text-right font-semibold text-gray-800">
                  {formatDate(goal.created_at)}
                </div>
              </>
            )}

            {goal.updated_at && goal.updated_at !== goal.created_at && (
              <>
                <div className="font-medium">Última Atualização</div>
                <div className="text-right font-semibold text-gray-800">
                  {formatDate(goal.updated_at)}
                </div>
              </>
            )}
          </div>
          
          {goal.description && (
            <div>
              <h3 className="font-semibold text-gray-800">Descrição</h3>
              <p className="text-sm text-gray-600 rounded-md">
                {goal.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewGoalModal;