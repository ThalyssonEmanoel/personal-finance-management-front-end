'use client'
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const UpdateAccount = ({ isOpen, onClose, account }) => {
  if (!isOpen || !account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Editar conta
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <p className="text-sm text-gray-600">
            Funcionalidade de edição em desenvolvimento...
          </p>
          <p className="text-sm text-gray-600">
            Conta selecionada: {account.name}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateAccount;
