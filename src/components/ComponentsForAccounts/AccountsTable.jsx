'use client'
import React, { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, ChevronUp, ChevronDown, Search } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useAccountsQuery } from '@/utils/apiClient';

const AccountsTable = ({ onAccountChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState([]);

  const { data, isLoading, isError, error } = useAccountsQuery();
  const accountsData = data?.accounts ?? [];

  const handleViewClick = (account) => {
    console.log('View account:', account);
    // ...
  };

  const handleEditClick = (account) => {
    console.log('Edit account:', account);
    // ...
  };

  const handleDeleteClick = (account) => {
    console.log('Delete account:', account);
    // ...
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
        const fileName = account.icon ? account.icon.replace(/src[\\/]uploads[\\/]|src[\\/]seed[\\/]images[\\/]/g, '') : 'avatar2.jpeg';
        const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/${fileName}`;
        
        return React.createElement("div", { className: "flex items-center justify-center w-16" },
          React.createElement("img", {
            src: imageUrl,
            alt: account.name,
            className: "w-12 h-12 rounded-full object-cover border-2 border-solid border-tertiary",
            onError: (e) => {
              e.target.src = `${process.env.NEXT_PUBLIC_API_URL}/uploads/avatar2.jpeg`;
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
        return React.createElement("div", { className: "font-medium" }, row.getValue("name"));
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
      cell: ({ row }) => React.createElement("div", { className: "capitalize" }, getAccountTypeDisplay(row.getValue("type"))),
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
    <div className="border-2 border-neutral-300 rounded-md h-165">
      <div className="px-8 py-8">
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Contas existentes</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Você possui um total de {accountsData.length} contas cadastradas.
            </p>
          </div>
          <div className="relative w-56">
            <Input
              type="text"
              placeholder="Ex: Caixa Econômica"
              className="border-2 border-neutral-300 rounded-md w-56 h-10 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-5 -translate-y-1/2 text-gray-300 w-5 h-5 pointer-events-none" />
          </div>
        </div>
        
        <div className="overflow-hidden rounded-md">
          <Table>
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
            <TableBody>
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
      </div>
    </div>
  );
};

export default AccountsTable;