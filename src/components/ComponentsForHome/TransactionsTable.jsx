import React, { useState } from 'react'
import { MoreHorizontal, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
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

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {"receita" | "despesa"} tipo
 * @property {string} nome
 * @property {string} categoria
 * @property {string} conta
 * @property {string} data
 * @property {number} valor
 */

const data = [
  { id: "1", tipo: "despesa", nome: "Alface", categoria: "Mercado", conta: "Carteira", data: "23/01/2025", valor: -100 },
  { id: "2", tipo: "despesa", nome: "Compras", categoria: "Mercado", conta: "Caixa econômica federal", data: "23/01/2025", valor: -300 },
  { id: "3", tipo: "despesa", nome: "Shampoo", categoria: "Mercado", conta: "Nubank", data: "22/01/2025", valor: -150 },
  { id: "4", tipo: "receita", nome: "Salário", categoria: "Salário", conta: "Caixa econômica", data: "22/01/2025", valor: 1000 },
  { id: "5", tipo: "receita", nome: "Cosméticos", categoria: "Dinheiro", conta: "Carteira", data: "16/01/2025", valor: 3000 },
  { id: "6", tipo: "receita", nome: "Cosméticos", categoria: "Dinheiro", conta: "Carteira", data: "15/01/2025", valor: 4000 },
]

const columns = [
  {
    accessorKey: "tipo",
    header: () => React.createElement("div", null, "Tipo"),
    cell: ({ row }) => {
      const tipo = row.original.tipo
      return React.createElement("div", { className: "flex items-center relative -ml-4 -mt-3 -mb-3" },
        React.createElement("div", {
          className: `w-3 h-20 rounded-l-md ${tipo === "receita" ? "bg-green-300" : "bg-red-300"}`
        }),
        React.createElement("span", { className: "pl-4 capitalize" }, tipo)
      )
    },
  },
  {
    accessorKey: "nome",
    header: "Nome",
    cell: ({ row }) => React.createElement("div", null, row.getValue("nome")),
  },
  {
    accessorKey: "categoria",
    header: "Categoria",
    cell: ({ row }) => React.createElement("div", null, row.getValue("categoria")),
  },
  {
    accessorKey: "conta",
    header: "Conta",
    cell: ({ row }) => React.createElement("div", null, row.getValue("conta")),
  },
  {
    accessorKey: "data",
    header: "Data",
    cell: ({ row }) => React.createElement("div", null, row.getValue("data")),
  },
  {
    accessorKey: "valor",
    header: "Valor(R$)",
    cell: ({ row }) => {
      const valor = row.original.valor
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor)
      return React.createElement("div", {
        className: valor < 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"
      }, valor < 0 ? `- ${formatted.replace("-", "")}` : `+ ${formatted}`)
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
          React.createElement(DropdownMenuItem, null, "Excluir")
        )
      )
    },
  },
]

const TransactionsTable = () => {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
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

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div className="flex gap-6">
          <div>
            <label className="mb-2 text-base font-medium text-gray-700">Tipo de transação</label>
            <Select>
              <SelectTrigger className="w-56 h-10 border-2 border-neutral-300 rounded-sm">
                <SelectValue placeholder="Receita e despesa" value="All" />
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
            <ButtonC texto="Buscar" largura="120px" altura="40px" type="submit" />
          </div>
        </div>
        <div className='mt-6'>
          <ButtonC texto="Baixar extrato" largura="120px" altura="40px" type="submit" />
        </div>
      </div>
      
      <div className="border-2 border-neutral-300 rounded-md">
        <div className="px-8 py-8">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Receitas e despesas recentes</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {`Você possui um total de ${data.length} registros.`}
              </p>
            </div>
            <div className="relative w-56">
              <Input
                type="text"
                placeholder="Ex.: João Silva"
                className="border-2 border-neutral-300 rounded-md w-56 h-10 pr-10"
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
                {table.getRowModel().rows?.length ? (
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
    </div>
  )
}

export default TransactionsTable;
