'use client'
import React, { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, ChevronUp, ChevronDown, Search, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useAccountsQuery, useDeleteAccountMutation } from '@/utils/apiClient';
import { ViewAccount, UpdateAccount } from '@/components/ComponentsForAccounts';

const AccountsTable = ({ onAccountChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToView, setAccountToView] = useState(null);
  const [accountToEdit, setAccountToEdit] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const { data, isLoading, isError, error } = useAccountsQuery();
  const accountsData = data?.accounts ?? [];

  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccountMutation();

  const handleViewClick = (account) => {
    setAccountToView(account);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (account) => {
    setAccountToEdit(account);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setIsDeleteModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setAccountToView(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setAccountToEdit(null);
  };

  const handleConfirmDelete = () => {
    if (!accountToDelete) return;

    console.log('Deleting account with ID:', accountToDelete.id);
    
    deleteAccount(accountToDelete.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setAccountToDelete(null);
        if (onAccountChange) {
          onAccountChange();
        }
      },
      onError: (error) => {
        console.error('Erro ao excluir conta:', error);
      }
    });
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setAccountToDelete(null);
  };

  const getDeleteMessage = (account) => {
    return `Tem certeza que deseja excluir a conta "${account.name}"? Esta ação é irreversível e todos os dados associados a esta conta serão permanentemente removidos.`;
  };

  const filteredAccounts = useMemo(() => {
    if (!searchTerm) return accountsData;
    
    return accountsData.filter(account =>
      account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accountsData, searchTerm]);

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
    if (numBalance > 0) return 'text-green-600 font-bold';
    if (numBalance < 0) return 'text-red-600 font-bold';
    return 'text-gray-600 font-bold';
  };

  const columns = [
    {
      id: "icon",
      header: "",
      cell: ({ row }) => {
        const account = row.original;
        const fileName = account.icon ? account.icon.replace(/src[\\/]uploads[\\/]|src[\\/]seed[\\/]images[\\/]|uploads[\\/]/g, '') : 'avatar1.jpeg';
        const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/${fileName}`;

        return React.createElement("div", { className: "flex items-center justify-center w-16" },
          React.createElement("img", {
            src: imageUrl,
            alt: account.name,
            className: "w-12 h-12 rounded-full object-cover border-2 border-solid border-tertiary",
            onError: (e) => {
              e.target.src = `${process.env.NEXT_PUBLIC_API_URL}/uploads/avatar1.jpeg`;
            }
          })
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return React.createElement("div", { 
          className: "flex items-center cursor-pointer hover:text-gray-600",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
        },
          "Nome",
          React.createElement("div", { className: "ml-1 flex flex-col" },
            React.createElement(ChevronUp, { 
              className: `h-3 w-3 ${column.getIsSorted() === "asc" ? "text-gray-900" : "text-gray-300"}`
            }),
            React.createElement(ChevronDown, { 
              className: `h-3 w-3 ${column.getIsSorted() === "desc" ? "text-gray-900" : "text-gray-300"}`
            })
          )
        );
      },
      cell: ({ row }) => {
        const name = row.getValue("name");
        return React.createElement("div", { 
          className: "font-medium",
          title: name // Tooltip para textos longos
        }, name);
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return React.createElement("div", { 
          className: "flex items-center cursor-pointer hover:text-gray-600",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
        },
          "Tipo",
          React.createElement("div", { className: "ml-1 flex flex-col" },
            React.createElement(ChevronUp, { 
              className: `h-3 w-3 ${column.getIsSorted() === "asc" ? "text-gray-900" : "text-gray-300"}`
            }),
            React.createElement(ChevronDown, { 
              className: `h-3 w-3 ${column.getIsSorted() === "desc" ? "text-gray-900" : "text-gray-300"}`
            })
          )
        );
      },
      cell: ({ row }) => {
        const typeDisplay = getAccountTypeDisplay(row.getValue("type"));
        return React.createElement("div", { 
          className: "capitalize",
          title: typeDisplay // Tooltip para o tipo
        }, typeDisplay);
      },
    },
    {
      accessorKey: "paymentMethods",
      header: ({ column }) => {
        return React.createElement("div", { 
          className: "flex items-center cursor-pointer hover:text-gray-600",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
        },
          "Métodos de Pagamento",
          React.createElement("div", { className: "ml-1 flex flex-col" },
            React.createElement(ChevronUp, { 
              className: `h-3 w-3 ${column.getIsSorted() === "asc" ? "text-gray-900" : "text-gray-300"}`
            }),
            React.createElement(ChevronDown, { 
              className: `h-3 w-3 ${column.getIsSorted() === "desc" ? "text-gray-900" : "text-gray-300"}`
            })
          )
        );
      },
      cell: ({ row }) => {
        const account = row.original;
        const paymentMethodsCount = account.accountPaymentMethods ? account.accountPaymentMethods.length : 0;
        return React.createElement("div", { className: "font-medium" }, paymentMethodsCount);
      },
      sortingFn: (rowA, rowB) => {
        const countA = rowA.original.accountPaymentMethods ? rowA.original.accountPaymentMethods.length : 0;
        const countB = rowB.original.accountPaymentMethods ? rowB.original.accountPaymentMethods.length : 0;
        return countA - countB;
      },
    },
    {
      accessorKey: "balance",
      header: ({ column }) => {
        return React.createElement("div", { 
          className: "flex items-center cursor-pointer hover:text-gray-600",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
        },
          "Saldo",
          React.createElement("div", { className: "ml-1 flex flex-col" },
            React.createElement(ChevronUp, { 
              className: `h-3 w-3 ${column.getIsSorted() === "asc" ? "text-gray-900" : "text-gray-300"}`
            }),
            React.createElement(ChevronDown, { 
              className: `h-3 w-3 ${column.getIsSorted() === "desc" ? "text-gray-900" : "text-gray-300"}`
            })
          )
        );
      },
      cell: ({ row }) => {
        const balance = row.getValue("balance");
        const numBalance = parseFloat(balance) || 0;
        const isNegative = numBalance < 0;
        const formatted = formatCurrency(Math.abs(numBalance));
        
        return React.createElement("div", { 
          className: getBalanceColor(balance) 
        }, isNegative ? `- ${formatted}` : `+ ${formatted}`);
      },
      sortingFn: (rowA, rowB) => {
        const balanceA = parseFloat(rowA.getValue("balance")) || 0;
        const balanceB = parseFloat(rowB.getValue("balance")) || 0;
        return balanceA - balanceB;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const account = row.original;

        return React.createElement(DropdownMenu, null,
          React.createElement(DropdownMenuTrigger, { asChild: true },
            React.createElement(Button, { variant: "ghost", className: "h-8 w-8 p-0" },
              React.createElement("span", { className: "sr-only" }, "Abrir menu"),
              React.createElement(MoreHorizontal, { className: "h-4 w-4" })
            )
          ),
          React.createElement(DropdownMenuContent, { align: "end" },
            React.createElement(DropdownMenuLabel, null, "Ações"),
            React.createElement(DropdownMenuSeparator),
            React.createElement(DropdownMenuItem, {
              onClick: () => handleViewClick(account)
            }, "Visualizar"),
            React.createElement(DropdownMenuItem, {
              onClick: () => handleEditClick(account)
            }, "Editar"),
            React.createElement(DropdownMenuItem, {
              onClick: () => handleDeleteClick(account),
              className: "text-red-600 focus:text-red-600"
            }, "Excluir")
          )
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredAccounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Carregando contas...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-red-600">
          Erro ao carregar contas: {error?.message || 'Erro desconhecido'}
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-neutral-300 rounded-md min-h-[400px] overflow-y-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Contas existentes</h2>
            <p className="text-sm text-muted-foreground">
              Você possui um total de {accountsData.length} contas cadastradas.
            </p>
          </div>
          <div className="relative w-full sm:w-56">
            <Input
              type="text"
              placeholder="Ex: Caixa Econômica"
              className="border-2 border-neutral-300 rounded-md w-full sm:w-56 h-10 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-5 -translate-y-1/2 text-gray-300 w-5 h-5 pointer-events-none" />
          </div>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-hidden rounded-md">
          <Table className="fixed-table-layout accounts-table">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="max-h-96">
              {filteredAccounts.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} style={{ backgroundColor: "rgb(250, 249, 244)" }}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Nenhuma conta encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filteredAccounts.length > 0 ? (
            filteredAccounts.map((account) => {
              const fileName = account.icon ? account.icon.replace(/src[\\\\/]uploads[\\\\/]|src[\\\\/]seed[\\\\/]images[\\\\/]|uploads[\\\\/]/g, '') : 'avatar1.jpeg';
              const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/${fileName}`;
              const balance = parseFloat(account.balance) || 0;
              const isNegative = balance < 0;
              const formatted = formatCurrency(Math.abs(balance));

              return (
                <div 
                  key={account.id} 
                  className="bg-[#FAF9F4] rounded-lg border-2 border-neutral-300 p-4"
                >
                  {/* Header do card */}
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                    <img
                      src={imageUrl}
                      alt={account.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-solid border-tertiary"
                      onError={(e) => {
                        e.target.src = `${process.env.NEXT_PUBLIC_API_URL}/uploads/avatar1.jpeg`;
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">{account.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {getAccountTypeDisplay(account.type)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewClick(account)}>
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(account)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(account)}
                          className="text-red-600 focus:text-red-600"
                        >
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Informações */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Métodos de Pagamento:</span>
                      <span className="font-medium">
                        {account.accountPaymentMethods ? account.accountPaymentMethods.length : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-gray-600 text-sm">Saldo:</span>
                      <span className={`font-bold text-lg ${getBalanceColor(account.balance)}`}>
                        {isNegative ? `- ${formatted}` : `+ ${formatted}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              Nenhuma conta encontrada.
            </div>
          )}
        </div>
      </div>

      <ViewAccount
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        account={accountToView}
      />

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelDelete}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="mt-4 mb-6">
              <Trash2 className="h-16 w-16 text-neutral-300 mx-auto" />
            </div>
            
            <DialogHeader className="mb-6">
              <DialogTitle className="text-lg font-semibold">
                Excluir Conta
              </DialogTitle>
            </DialogHeader>

            <p className="mb-6 text-sm leading-relaxed">
              {accountToDelete && getDeleteMessage(accountToDelete)}
            </p>

            <DialogFooter className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="flex-1"
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                className="flex-1"
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <UpdateAccount
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        account={accountToEdit}
      />
    </div>
  );
};

export default AccountsTable;