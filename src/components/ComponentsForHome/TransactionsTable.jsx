import React, { useState, useMemo } from 'react';
import { MoreHorizontal, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import ButtonC from '@/components/Custom-Button';
import { useTransactionsQuery, useDeleteTransactionMutation } from '../../utils/apiClient.js';
import ReportDownloadModal from './ReportDonwloadModal';

const ITEMS_PER_PAGE = 5;

const TransactionsTable = ({ filters: externalFilters = {}, onTransactionChange }) => {
  const [localFilters, setLocalFilters] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    type: 'All',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const queryFilters = useMemo(() => ({
    ...externalFilters,
    ...localFilters,
  }), [externalFilters, localFilters]);

  const { data, isLoading, isError, error, refetch } = useTransactionsQuery(queryFilters);
  const transactionsData = data?.transactions ?? [];
  const pagination = data?.pagination ?? { total: 0, page: 1 };
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransactionMutation();

  const handleTypeFilterChange = (value) => {
    setLocalFilters(prev => ({ ...prev, type: value, page: 1 }));
  };

  const goToPage = (page) => {
    setLocalFilters(prev => ({ ...prev, page }));
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!transactionToDelete) return;

    deleteTransaction(transactionToDelete.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setTransactionToDelete(null);
        if (onTransactionChange) onTransactionChange();
      },
      onError: (err) => {
        console.error('Erro ao deletar transação:', err);
      }
    });
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setTransactionToDelete(null);
  };

  const getDeleteMessage = (transaction) => {
    if (transaction?.number_installments && transaction.number_installments > 1) {
      return "Atenção! Caso exclua essa transação não haverá o lançamento automatico da próxima parcela.";
    }
    if (transaction?.recurring) {
      return "Atenção! Caso exclua essa transação não haverá mais o lançamento recorrente dela.";
    }
    return "Você tem certeza que deseja apagar essa transação?";
  };

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactionsData;
    return transactionsData.filter(transaction =>
      Object.values(transaction).some(value =>
        String(value)?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [transactionsData, searchTerm]);

  const columns = [
    {
      accessorKey: "type",
      header: () => React.createElement("div", null, "Tipo"),
      cell: ({ row }) => {
        const type = row.original.type;
        const tipoTexto = type === "income" ? "receita" : "despesa";
        return React.createElement("div", { className: "flex items-center relative -ml-4 -mt-3 -mb-3" },
          React.createElement("div", {
            className: `w-3 h-20 rounded-l-md ${type === "income" ? "bg-green-300" : "bg-red-300"}`
          }),
          React.createElement("span", { className: "pl-4 capitalize" }, tipoTexto)
        );
      },
    },
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => React.createElement("div", null, row.getValue("name")),
    },
    {
      accessorKey: "category",
      header: "Categoria",
      cell: ({ row }) => React.createElement("div", null, row.getValue("category")),
    },
    {
      accessorKey: "account",
      header: "Conta",
      cell: ({ row }) => React.createElement("div", null, row.original.account?.name || "N/A"),
    },
    {
      accessorKey: "release_date",
      header: "Data",
      cell: ({ row }) => {
        const date = new Date(row.getValue("release_date"));
        const formatted = date.toLocaleDateString("pt-BR");
        return React.createElement("div", null, formatted);
      },
    },
    {
      accessorKey: "value",
      header: "Valor(R$)",
      cell: ({ row }) => {
        const value = parseFloat(row.original.value_installment || row.original.value);
        const type = row.original.type;
        const isNegative = type === "expense";

        const formatted = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Math.abs(value));

        return React.createElement("div", {
          className: isNegative ? "text-red-600 font-bold" : "text-green-600 font-bold"
        }, isNegative ? `- ${formatted}` : `+ ${formatted}`);
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const transaction = row.original;
        return React.createElement(DropdownMenu, null,
          React.createElement(DropdownMenuTrigger, { asChild: true },
            React.createElement(Button, { variant: "ghost", className: "h-8 w-8 p-0" },
              React.createElement("span", { className: "sr-only" }, "Abrir menu"),
              React.createElement(MoreHorizontal)
            )
          ),
          React.createElement(DropdownMenuContent, { align: "end" },
            React.createElement(DropdownMenuLabel, null, "Ações"),
            React.createElement(DropdownMenuSeparator),
            React.createElement(DropdownMenuItem, null, "Visualizar"),
            React.createElement(DropdownMenuItem, null, "Editar"),
            React.createElement(DropdownMenuItem, {
              onClick: () => handleDeleteClick(transaction),
              className: "text-red-600 focus:text-red-600"
            }, "Excluir")
          )
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredTransactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: pagination.total_pages,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: ITEMS_PER_PAGE,
      },
    },
  });

  const totalPages = Math.ceil(pagination.total / ITEMS_PER_PAGE);
  const currentPage = localFilters.page;

  const getVisiblePages = () => {
    const visiblePages = [];
    const maxVisiblePages = 3;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        visiblePages.push(1, 2, 3);
      } else if (currentPage >= totalPages - 1) {
        visiblePages.push(totalPages - 2, totalPages - 1, totalPages);
      } else {
        visiblePages.push(currentPage - 1, currentPage, currentPage + 1);
      }
    }
    return visiblePages;
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div className="flex gap-6">
          <div>
            <label className="mb-2 text-base font-medium text-gray-700">Tipo de transação</label>
            <Select value={localFilters.type} onValueChange={handleTypeFilterChange}>
              <SelectTrigger className="w-56 h-10 border-2 border-neutral-300 rounded-sm">
                <SelectValue placeholder="Receita e despesa" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tipo de transação</SelectLabel>
                  <SelectItem value="All">Todas as transações</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className='mt-6'>
            <ButtonC texto="Buscar" largura="120px" altura="40px" type="button" onClick={() => refetch()} />
          </div>
        </div>
        <div className='mt-6'>
          <ButtonC texto="Baixar extrato" largura="120px" altura="40px" type="button" onClick={() => setIsReportModalOpen(true)} />
        </div>
      </div>
      <div className="border-2 border-neutral-300 rounded-md">
        <div className="px-8 py-8">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Receitas e despesas recentes</h2>
              <p className="text-sm text-muted-foreground mb-6"> Você possui um total de {pagination.total} registros.</p>
            </div>
            <div className="relative w-56">
              <Input
                type="text"
                placeholder="Ex.: Supermercado"
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
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Carregando transações...
                    </TableCell>
                  </TableRow>
                ) : transactionsData.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} style={{ backgroundColor: "rgb(250, 249, 244)" }}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Nenhum resultado encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => goToPage(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {getVisiblePages().map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => goToPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              {totalPages > 3 && currentPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => goToPage(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <ReportDownloadModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
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
                Excluir Transação
              </DialogTitle>
            </DialogHeader>

            <p className="mb-6 text-sm leading-relaxed">
              {transactionToDelete && getDeleteMessage(transactionToDelete)}
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
    </div>
  );
};

export default TransactionsTable;