import React, { useState } from 'react'
import { MoreHorizontal, Search, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import ButtonC from '@/components/Custom-Button'
import { useTransactions, useDeleteTransaction } from '../../utils/apiClient.js'
import ReportDownloadModal from './ReportDonwloadModal'

const TransactionsTable = ({ filters = {}, onTransactionChange }) => {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const lastFiltersRef = React.useRef({})
  const { transactions, loading, error, pagination, refetch } = useTransactions()
  const { deleteTransaction, loading: deleteLoading } = useDeleteTransaction()

  const ITEMS_PER_PAGE = 5

  const getDeleteMessage = (transaction) => {
    if (transaction?.number_installments && transaction.number_installments > 1) {
      return "Atenção! Caso exclua essa transação não haverá o lançamento automatico da próxima parcela."
    }
    if (transaction?.recurring) {
      return "Atenção! Caso exclua essa transação não haverá mais o lançamento recorrente dela."
    }
    return "Você tem certeza que deseja apagar essa transação?"
  }

  // Função para abrir o modal de confirmação
  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction)
    setIsDeleteModalOpen(true)
  }

  // Função para confirmar a exclusão
  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return

    try {
      await deleteTransaction(transactionToDelete.id)
      setIsDeleteModalOpen(false)
      setTransactionToDelete(null)

      // Se estamos na última página e só há 1 item, voltar para a página anterior
      if (transactions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }

      if (onTransactionChange) onTransactionChange();
    } catch (error) {
      console.error('Erro ao deletar transação:', error)
    }
  }

  // Função para cancelar a exclusão
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setTransactionToDelete(null)
  }

  // Definir as colunas dentro do componente para ter acesso às funções
  const columns = [
    {
      accessorKey: "type",
      header: () => React.createElement("div", null, "Tipo"),
      cell: ({ row }) => {
        const type = row.original.type
        const tipoTexto = type === "income" ? "receita" : "despesa"
        return React.createElement("div", { className: "flex items-center relative -ml-4 -mt-3 -mb-3" },
          React.createElement("div", {
            className: `w-3 h-20 rounded-l-md ${type === "income" ? "bg-green-300" : "bg-red-300"}`
          }),
          React.createElement("span", { className: "pl-4 capitalize" }, tipoTexto)
        )
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div
          className="cursor-pointer select-none"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome {column.getIsSorted() === "asc" ? "▲" : column.getIsSorted() === "desc" ? "▼" : ""}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <div
          className="cursor-pointer select-none"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Categoria {column.getIsSorted() === "asc" ? "▲" : column.getIsSorted() === "desc" ? "▼" : ""}
        </div>
      ),
    },
    {
      accessorKey: "account.name",
      header: ({ column }) => (
        <div
          className="cursor-pointer select-none"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Conta {column.getIsSorted() === "asc" ? "▲" : column.getIsSorted() === "desc" ? "▼" : ""}
        </div>
      ),
      cell: ({ row }) => row.original.account?.name || "N/A",
    },
    {
      accessorKey: "release_date",
      header: ({ column }) => (
        <div
          className="cursor-pointer select-none"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data {column.getIsSorted() === "asc" ? "▲" : column.getIsSorted() === "desc" ? "▼" : ""}
        </div>
      ),
      sortingFn: (a, b) =>
        new Date(a.original.release_date) - new Date(b.original.release_date),
      cell: ({ row }) => {
        const date = new Date(row.getValue("release_date"))
        return <div>{date.toLocaleDateString("pt-BR")}</div>
      },
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <div
          className="cursor-pointer select-none"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Valor(R$) {column.getIsSorted() === "asc" ? "▲" : column.getIsSorted() === "desc" ? "▼" : ""}
        </div>
      ),
      sortingFn: (a, b) => {
        const valueA = parseFloat(a.original.value_installment || a.original.value)
        const valueB = parseFloat(b.original.value_installment || b.original.value)
        return valueA - valueB
      },
      cell: ({ row }) => {
        const value = parseFloat(row.original.value_installment || row.original.value)
        const type = row.original.type
        const isNegative = type === "expense"

        const formatted = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Math.abs(value))

        return (
          <div className={isNegative ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
            {isNegative ? `- ${formatted}` : `+ ${formatted}`}
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const transaction = row.original
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
        )
      },
    },
  ]

  // Aplicar filtros quando eles mudarem
  React.useEffect(() => {
    console.log('TransactionsTable - Aplicando filtros:', filters, 'typeFilter:', typeFilter)
    const finalFilters = {
      ...filters,
      type: typeFilter !== 'All' ? typeFilter : undefined,
      limit: ITEMS_PER_PAGE,
      page: currentPage
    }

    // Evita chamadas desnecessárias comparando se realmente mudou algo
    const filtersChanged = JSON.stringify(finalFilters) !== JSON.stringify(lastFiltersRef.current)
    if (filtersChanged) {
      console.log('TransactionsTable - Filtros mudaram, fazendo nova busca com:', finalFilters)
      lastFiltersRef.current = finalFilters
      refetch(finalFilters)
    }
  }, [filters, typeFilter, currentPage])

  // Filtrar transações localmente por nome (busca)
  const filteredTransactions = React.useMemo(() => {
    let filtered = transactions || []

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.account?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.release_date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.value?.toString().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [transactions, searchTerm])

  const table = useReactTable({
    data: filteredTransactions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const handleTypeFilterChange = (value) => {
    setTypeFilter(value)
    setCurrentPage(1) // Reset para primeira página quando mudar o filtro
  }

  const handleSearch = () => {
    console.log('Busca aplicada:', searchTerm)
  }

  // Calcular total de páginas
  const totalPages = Math.ceil(pagination.total / ITEMS_PER_PAGE)

  // Funções de navegação da paginação
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Gerar números das páginas para exibir
  const getVisiblePages = () => {
    const visiblePages = []
    const maxVisiblePages = 3

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i)
      }
    } else {
      if (currentPage <= 2) {
        visiblePages.push(1, 2, 3)
      } else if (currentPage >= totalPages - 1) {
        visiblePages.push(totalPages - 2, totalPages - 1, totalPages)
      } else {
        visiblePages.push(currentPage - 1, currentPage, currentPage + 1)
      }
    }

    return visiblePages
  }

  const success = !error && filteredTransactions.length > 0

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div className="flex gap-6">
          <div>
            <label className="mb-2 text-base font-medium text-gray-700">Tipo de transação</label>
            <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
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
            <ButtonC texto="Buscar" largura="120px" altura="40px" type="button" onClick={handleSearch} />
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
                {table.getHeaderGroups().map((headerGroup) =>
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) =>
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )}
                  </TableRow>
                )}
              </TableHeader>
              <TableBody>
                {success ? (
                  table.getRowModel().rows.map((row, index) =>
                    <TableRow
                      key={row.id}
                      style={{ backgroundColor: "rgb(250, 249, 244)" }}
                    >
                      {row.getVisibleCells().map((cell) =>
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-red-600">
                      Nenhum resultado encontrado.{error}
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Componente de paginação */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={goToPreviousPage}
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
                  onClick={goToNextPage}
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

      {/* Modal de confirmação de exclusão */}
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

            <p className=" mb-6 text-sm leading-relaxed">
              {transactionToDelete && getDeleteMessage(transactionToDelete)}
            </p>

            <DialogFooter className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="flex-1"
                disabled={deleteLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                className="flex-1"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Excluindo...' : 'Excluir'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TransactionsTable;
