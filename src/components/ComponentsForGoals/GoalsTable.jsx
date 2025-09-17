import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useGoalsTableQuery, useDeleteGoalMutation } from '../../utils/apiClient.js';
import { withPerformanceOptimization, useStableDimensions } from '@/hooks/usePerformanceOptimization';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  ChevronUp,
  ChevronDown,
  Search,
  MoreHorizontal,
  Trash2,
  X
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import AccessibleButton from "@/components/AccessibleButton";
import ViewGoalModal from "./ViewGoalModal";
import UpdateGoalsModal from "./UpdateGoalsModal";

const SortableHeader = memo(({ children, column, className = "" }) => (
  <div
    className={`flex items-center cursor-pointer ${className}`}
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    role="button"
    tabIndex={0}
    aria-label={`Ordenar por ${children} ${column.getIsSorted() === "asc" ? "(crescente)" :
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

const ITEMS_PER_PAGE = 5;

const GoalsTable = memo(({ filters: externalFilters = {} }) => {
  const [sorting, setSorting] = useState([]);
  const [localFilters, setLocalFilters] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
  });
  const [allGoals, setAllGoals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [goalToView, setGoalToView] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState(null);

  const { dimensions, elementRef } = useStableDimensions({
    minHeight: '400px'
  });

  const queryFilters = useMemo(() => ({
    ...externalFilters,
    ...localFilters,
  }), [externalFilters, localFilters]);

  const { data, isLoading, isError, error } = useGoalsTableQuery(queryFilters);

  const { mutate: deleteGoal, isPending: isDeleting } = useDeleteGoalMutation();

  const goalsData = data?.data ?? [];
  const pagination = data?.pagination ?? { total: 0, page: 1 };

  useEffect(() => {
    if (data?.data) {
      setAllGoals(data.data);
    }
  }, [data]);

  const goToPage = useCallback((page) => {
    setLocalFilters(prev => ({ ...prev, page }));
  }, []);

  const filteredGoals = useMemo(() => {
    if (!searchTerm) return goalsData;
    return goalsData.filter(goal =>
      Object.values(goal).some(value =>
        String(value)?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [goalsData, searchTerm]);

  const handleViewClick = useCallback((goal) => {
    setGoalToView(goal);
    setIsViewModalOpen(true);
  }, []);

  const handleCloseViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setGoalToView(null);
  }, []);

  const handleEditClick = useCallback((goal) => {
    setGoalToEdit(goal);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setGoalToEdit(null);
  }, []);

  const handleDeleteClick = useCallback((goal) => {
    setGoalToDelete(goal);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (goalToDelete) {
      deleteGoal(goalToDelete.id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setGoalToDelete(null);
        },
        onError: (error) => {
          console.error('Erro ao deletar meta:', error);
        }
      });
    }
  }, [goalToDelete, deleteGoal]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setGoalToDelete(null);
  }, []);

  const getDeleteMessage = useCallback((goal) => {
    const typeText = goal.transaction_type === 'income' ? 'receita' : 'despesa';
    return `Tem certeza de que deseja excluir a meta "${goal.name}" para ${typeText}? Esta ação não pode ser desfeita.`;
  }, []);

  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column} className="ml-4">Nome</SortableHeader>
      ),
      cell: ({ row }) => {
        const name = row.getValue("name");
        return (
          <div className="flex items-center relative -ml-4 -mt-3 -mb-3">
            <div
              className={`w-3 h-20 rounded-l-md bg-blue-300`}
              aria-hidden="true"
            />
            <span className="pl-4 capitalize">{name}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "transaction_type",
      header: ({ column }) => (
        <SortableHeader column={column}>Meta para</SortableHeader>
      ),
      cell: ({ row }) => {
        const type = row.getValue("transaction_type");
        const typeLabel = type === 'income' ? 'Receita' : type === 'expense' ? 'Despesa' : type;
        const colorClass = type === 'income' ? "text-green-600 font-bold" : "text-red-600 font-bold";

        return (
          <div className="flex items-center relative -ml-4 -mt-3 -mb-3">
            <span className={`pl-4 capitalize ${colorClass}`}>{typeLabel}</span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.getValue("transaction_type");
        const b = rowB.getValue("transaction_type");
        return a.localeCompare(b);
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <SortableHeader column={column}>Data</SortableHeader>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return <div>{date.toLocaleDateString('pt-BR')}</div>;
      },
      sortingFn: (rowA, rowB) => {
        const a = new Date(rowA.getValue("date"));
        const b = new Date(rowB.getValue("date"));
        return a.getTime() - b.getTime();
      },
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <SortableHeader column={column}>Valor(R$)</SortableHeader>
      ),
      cell: ({ row }) => {
        const value = parseFloat(row.getValue("value"));
        const formattedValue = value.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });

        return (
          <div className="font-medium">
            {formattedValue}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = parseFloat(rowA.getValue("value"));
        const b = parseFloat(rowB.getValue("value"));
        return a - b;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const goal = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewClick(goal)}>
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditClick(goal)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(goal)}
                className="text-red-600 focus:text-red-600"
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [handleViewClick, handleEditClick, handleDeleteClick]);

  const table = useReactTable({
    data: filteredGoals,
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

  if (isError) {
    return (
      <div
        className="px-20 mt-8"
        ref={elementRef}
        style={{ minHeight: dimensions.minHeight }}
      >
        <div className="text-center py-8">
          <p className="text-red-600">Erro ao carregar metas: {error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      style={{ minHeight: dimensions.minHeight }}
      role="region"
      aria-label="Tabela de metas"
    >
      <div className="border-2 border-neutral-300 rounded-md h-165">
        <div className="px-8 py-8">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Metas recentes</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Você possui um total de {pagination.total} metas.
              </p>
            </div>
            <div className="relative w-56">
              <label htmlFor="search-goals" className="sr-only">
                Buscar metas
              </label>
              <Input
                id="search-goals"
                type="text"
                placeholder="Ex.: Dezembro"
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
                Digite para filtrar metas por qualquer campo
              </div>
            </div>
          </div>

          <div className="overflow-hidden  rounded-md">
            <Table
              role="table"
              aria-label="Lista de metas"
              aria-rowcount={filteredGoals.length + 1}
            >
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} role="row">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} role="columnheader">
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
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                      role="status"
                      aria-live="polite"
                    >
                      Carregando metas...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      style={{ backgroundColor: "rgb(250, 249, 244)" }}
                      role="row"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} role="gridcell">
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

      <ViewGoalModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        goal={goalToView}
      />

      <UpdateGoalsModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        goal={goalToEdit}
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
                Excluir Meta
              </DialogTitle>
            </DialogHeader>

            <p id="delete-dialog-description" className="mb-6 text-sm leading-relaxed">
              {goalToDelete && getDeleteMessage(goalToDelete)}
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
});

GoalsTable.displayName = 'GoalsTable';

export default withPerformanceOptimization(GoalsTable);
