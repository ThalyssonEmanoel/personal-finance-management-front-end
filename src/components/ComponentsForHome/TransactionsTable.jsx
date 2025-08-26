import React, { useState } from 'react'
import { MoreHorizontal, Search, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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
  const lastFiltersRef = React.useRef({})
  const { transactions, loading, error, pagination, refetch } = useTransactions()
  const { deleteTransaction, loading: deleteLoading } = useDeleteTransaction()

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
        const date = new Date(row.getValue("release_date"))
        const formatted = date.toLocaleDateString("pt-BR")
        return React.createElement("div", null, formatted)
      },
    },
    {
      accessorKey: "value",
      header: "Valor(R$)",
      cell: ({ row }) => {
        const value = parseFloat(row.original.value_installment || row.original.value)
        const type = row.original.type
        const isNegative = type === "expense"

        const formatted = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Math.abs(value))

        return React.createElement("div", {
          className: isNegative ? "text-red-600 font-bold" : "text-green-600 font-bold"
        }, isNegative ? `- ${formatted}` : `+ ${formatted}`)
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
      type: typeFilter !== 'All' ? typeFilter : undefined
    }

    // Evita chamadas desnecessárias comparando se realmente mudou algo
    const filtersChanged = JSON.stringify(finalFilters) !== JSON.stringify(lastFiltersRef.current)
    if (filtersChanged) {
      console.log('TransactionsTable - Filtros mudaram, fazendo nova busca com:', finalFilters)
      lastFiltersRef.current = finalFilters
      refetch(finalFilters)
    }
  }, [filters, typeFilter]) 

  // Filtrar transações localmente por nome (busca)
  const filteredTransactions = React.useMemo(() => {
    let filtered = transactions || []

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
    getPaginationRowModel: getPaginationRowModel(),
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
  }

  const handleSearch = () => {
    console.log('Busca aplicada:', searchTerm)
  }

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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Carregando transações...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-red-600">
                       Nenhum resultado encontrado.
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
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
