import React, { useState, useMemo, useCallback, memo } from 'react';
import { MoreHorizontal, Search, Trash2, X, ChevronUp, ChevronDown } from "lucide-react";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import ButtonC from '@/components/Custom-Button';
import AccessibleButton from '@/components/AccessibleButton';
import AccessibleSelect from '@/components/AccessibleSelect';
import { useTransactionsQuery, useDeleteTransactionMutation } from '../../utils/apiClient.js';
import ReportDownloadModal from './ReportDonwloadModal';
import UpdateTransactionModal from './UpdateTransactionModal';
import ViewTransactionModal from './ViewTransactionModal';
import { withPerformanceOptimization, useStableDimensions } from '@/hooks/usePerformanceOptimization';
import Decimal from 'decimal.js';

const ITEMS_PER_PAGE = 5;
const ActionCell = memo(({ transaction, onView, onEdit, onDelete }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <AccessibleButton 
        variant="ghost" 
        className="h-8 w-8 p-0"
        ariaLabel={`Ações para transação ${transaction.name}`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </AccessibleButton>
    </DropdownMenuTrigger>
    <DropdownMenuContent 
      align="end"
      role="menu"
      aria-label="Menu de ações da transação"
    >
      <DropdownMenuLabel>Ações</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => onView(transaction)}
        role="menuitem"
      >
        Visualizar
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => onEdit(transaction)}
        role="menuitem"
      >
        Editar
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => onDelete(transaction)}
        className="text-red-600 focus:text-red-600"
        role="menuitem"
      >
        Excluir
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
));

ActionCell.displayName = 'ActionCell';

const SortableHeader = memo(({ children, column, className = "" }) => (
  <div 
    className={`flex items-center cursor-pointer hover:text-gray-600 ${className}`}
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    role="button"
    tabIndex={0}
    aria-label={`Ordenar por ${children} ${
      column.getIsSorted() === "asc" ? "(crescente)" : 
      column.getIsSorted() === "desc" ? "(decrescente)" : ""
    }`}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        column.toggleSorting(column.getIsSorted() === "asc");
      }
    }}
  >
    {children}
    <div className="ml-1 flex flex-col">
      <ChevronUp 
        className={`h-3 w-3 ${column.getIsSorted() === "asc" ? "text-gray-900" : "text-gray-300"}`}
        aria-hidden="true"
      />
      <ChevronDown 
        className={`h-3 w-3 ${column.getIsSorted() === "desc" ? "text-gray-900" : "text-gray-300"}`}
        aria-hidden="true"
      />
    </div>
  </div>
));

SortableHeader.displayName = 'SortableHeader';

const TransactionsTable = memo(({ filters: externalFilters = {}, onTransactionChange }) => {
  const [localFilters, setLocalFilters] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    type: 'All',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [transactionToView, setTransactionToView] = useState(null);

  const { dimensions, elementRef } = useStableDimensions({
    minHeight: '400px'
  });

  const handleViewClick = useCallback((transaction) => {
    setTransactionToView(transaction);
    setIsViewModalOpen(true);
  }, []);

  const handleCloseViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setTransactionToView(null);
  }, []);

  const handleEditClick = useCallback((transaction) => {
    setTransactionToEdit(transaction);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setTransactionToEdit(null);
  }, []);

  const handleDeleteClick = useCallback((transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalOpen(true);
  }, []);

  const queryFilters = useMemo(() => ({
    ...externalFilters,
    ...localFilters,
  }), [externalFilters, localFilters]);

  const { data, isLoading } = useTransactionsQuery(queryFilters);
  const transactionsData = data?.transactions ?? [];
  const pagination = data?.pagination ?? { total: 0, page: 1 };
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransactionMutation();

  const handleTypeFilterChange = useCallback((value) => {
    setLocalFilters(prev => ({ ...prev, type: value, page: 1 }));
  }, []);

  const goToPage = useCallback((page) => {
    setLocalFilters(prev => ({ ...prev, page }));
  }, []);

  const handleConfirmDelete = useCallback(() => {
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
  }, [transactionToDelete, deleteTransaction, onTransactionChange]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setTransactionToDelete(null);
  }, []);

  const getDeleteMessage = useCallback((transaction) => {
    if (transaction?.number_installments && transaction.number_installments > 1) {
      return "Atenção! Caso exclua essa transação não haverá o lançamento automatico da próxima parcela.";
    }
    if (transaction?.recurring) {
      return "Atenção! Caso exclua essa transação não haverá mais o lançamento recorrente dela.";
    }
    return "Você tem certeza que deseja apagar essa transação?";
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactionsData;
    return transactionsData.filter(transaction =>
      Object.values(transaction).some(value =>
        String(value)?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [transactionsData, searchTerm]);

  const columns = useMemo(() => [
    {
      accessorKey: "type",
      header: ({ column }) => (
        <SortableHeader column={column}>Tipo</SortableHeader>
      ),
      cell: ({ row }) => {
        const type = row.original.type;
        const tipoTexto = type === "income" ? "receita" : "despesa";
        return (
          <div className="flex items-center relative -ml-4 -mt-3 -mb-3">
            <div
              className={`w-3 h-20 rounded-l-md ${
                type === "income" ? "bg-green-300" : "bg-red-300"
              }`}
              aria-hidden="true"
            />
            <span className="pl-4 capitalize">{tipoTexto}</span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.type;
        const b = rowB.original.type;
        return a.localeCompare(b);
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column}>Nome</SortableHeader>
      ),
      cell: ({ row }) => {
        const name = row.getValue("name");
        return <div title={name}>{name}</div>;
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <SortableHeader column={column}>Categoria</SortableHeader>
      ),
      cell: ({ row }) => {
        const category = row.getValue("category");
        return <div title={category}>{category}</div>;
      },
    },
    {
      accessorKey: "account",
      header: ({ column }) => (
        <SortableHeader column={column}>Conta</SortableHeader>
      ),
      cell: ({ row }) => {
        const accountName = row.original.account?.name || "N/A";
        return <div title={accountName}>{accountName}</div>;
      },
      accessorFn: (row) => row.account?.name || "N/A",
    },
    {
      accessorKey: "release_date",
      header: ({ column }) => (
        <SortableHeader column={column}>Data</SortableHeader>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("release_date"));
        //Somar 1 dia, pois o componente está puxando um dia anterior
        date.setDate(date.getDate() + 1);
        const formatted = date.toLocaleDateString("pt-BR");
        return <div>{formatted}</div>;
      },
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.release_date);
        const dateB = new Date(rowB.original.release_date);
        return dateB.getTime() - dateA.getTime(); 
      },
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <SortableHeader column={column}>Valor(R$)</SortableHeader>
      ),
      cell: ({ row }) => {
        const value = new Decimal(row.original.value_installment || row.original.value).toNumber();
        const type = row.original.type;
        const isNegative = type === "expense";

        const formatted = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Math.abs(value));

        return (
          <div className={isNegative ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
            {isNegative ? `- ${formatted}` : `+ ${formatted}`}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const valueA = new Decimal(rowA.original.value_installment || rowA.original.value).toNumber();
        const valueB = new Decimal(rowB.original.value_installment || rowB.original.value).toNumber();
        const typeA = rowA.original.type;
        const typeB = rowB.original.type;
        
        // Converter despesas para valores negativos para ordenação correta
        const finalValueA = typeA === "expense" ? -valueA : valueA;
        const finalValueB = typeB === "expense" ? -valueB : valueB;
        
        return finalValueA - finalValueB; 
      },
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => (
        <ActionCell
          transaction={row.original}
          onView={handleViewClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      ),
    },
  ], [handleViewClick, handleEditClick, handleDeleteClick]);

  const table = useReactTable({
    data: filteredTransactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    manualPagination: true,
    pageCount: pagination.total_pages,
    state: {
      sorting,
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: ITEMS_PER_PAGE,
      },
    },
  });

  const totalPages = Math.ceil(pagination.total / ITEMS_PER_PAGE);
  const currentPage = localFilters.page;

  // Memoização das páginas visíveis
  const visiblePages = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 3;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, 3);
      } else if (currentPage >= totalPages - 1) {
        pages.push(totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 1, currentPage, currentPage + 1);
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  const typeOptions = [
    { value: 'All', label: 'Todas as transações' },
    { value: 'income', label: 'Receita' },
    { value: 'expense', label: 'Despesa' }
  ];

  return (
    <div 
      ref={elementRef}
      style={{ minHeight: dimensions.minHeight }}
      role="region"
      aria-label="Tabela de transações"
    >
      <div className="flex items-end justify-between mb-6">
        <div className="flex gap-6">
          <div>
            <AccessibleSelect
              value={localFilters.type}
              onValueChange={handleTypeFilterChange}
              label="Tipo de transação"
              ariaLabel="Filtrar por tipo de transação"
              items={typeOptions}
              className="w-56 h-10 border-2 border-neutral-300 rounded-sm"
            />
          </div>
        </div>
        <div className='mt-6'>
          <ButtonC 
            texto="Baixar extrato" 
            largura="120px" 
            altura="40px" 
            type="button" 
            onClick={() => setIsReportModalOpen(true)} 
          />
        </div>
      </div>
      
      <div className="border-2 border-neutral-300 rounded-md h-165">
        <div className="px-8 py-8">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Receitas e despesas recentes</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Você possui um total de {pagination.total} registros.
              </p>
            </div>
            <div className="relative w-56">
              <label htmlFor="search-transactions" className="sr-only">
                Buscar transações
              </label>
              <Input
                id="search-transactions"
                type="text"
                placeholder="Ex.: Supermercado"
                className="border-2 border-neutral-300 rounded-md w-56 h-10 pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-describedby="search-help"
              />
              <Search 
                className="absolute right-3 top-5 -translate-y-1/2 text-gray-300 w-5 h-5 pointer-events-none" 
                aria-hidden="true"
              />
              <div id="search-help" className="sr-only">
                Digite para filtrar transações por qualquer campo
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-md">
            <Table 
              className="fixed-table-layout transactions-table"
              role="table" 
              aria-label="Lista de transações"
              aria-rowcount={filteredTransactions.length + 1}
            >
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} role="row">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} role="columnheader">
                        {header.isPlaceholder 
                          ? null 
                          : flexRender(header.column.columnDef.header, header.getContext())
                        }
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length} 
                      className="h-24 text-center"
                      role="status"
                      aria-live="polite"
                    >
                      Carregando transações...
                    </TableCell>
                  </TableRow>
                ) : transactionsData.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow 
                      key={row.id} 
                      style={{ backgroundColor: "rgb(250, 249, 244)" }}
                      role="row"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} role="gridcell">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length} 
                      className="h-24 text-center"
                      role="status"
                      aria-live="polite"
                    >
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
        <nav 
          className="mt-6 flex justify-center"
          aria-label="Navegação de páginas"
        >
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => goToPage(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  aria-disabled={currentPage === 1}
                  aria-label="Página anterior"
                />
              </PaginationItem>
              
              {visiblePages.map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => goToPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                    aria-label={`Página ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              {totalPages > 3 && currentPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationEllipsis aria-label="Mais páginas" />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => goToPage(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  aria-disabled={currentPage === totalPages}
                  aria-label="Próxima página"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </nav>
      )}

      <ReportDownloadModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <ViewTransactionModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        transaction={transactionToView}
      />

      <Dialog 
        open={isDeleteModalOpen} 
        onOpenChange={setIsDeleteModalOpen}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <div className="flex justify-end">
            <AccessibleButton
              variant="ghost"
              size="sm"
              onClick={handleCancelDelete}
              ariaLabel="Fechar modal de exclusão"
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </AccessibleButton>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="mt-4 mb-6">
              <Trash2 className="h-16 w-16 text-neutral-300 mx-auto" aria-hidden="true" />
            </div>
            
            <DialogHeader className="mb-6">
              <DialogTitle id="delete-dialog-title" className="text-lg font-semibold">
                Excluir Transação
              </DialogTitle>
            </DialogHeader>

            <p id="delete-dialog-description" className="mb-6 text-sm leading-relaxed">
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

      <UpdateTransactionModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        transaction={transactionToEdit}
      />
    </div>
  );
});

TransactionsTable.displayName = 'TransactionsTable';

export default withPerformanceOptimization(TransactionsTable);

