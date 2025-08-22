'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from "@/hooks/useAuth"
import { Progress } from "@/components/ui/progress"
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
import { ChevronDownIcon, ChevronDown, MoreHorizontal, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

function DataTableDemo() {
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

  return React.createElement("div", null,
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
    </div>,
    React.createElement("div", { className: "border-2 border-neutral-300 rounded-md" },
      React.createElement("div", { className: "px-8 py-8" },
        React.createElement("div", {className: "flex justify-between"},
          React.createElement("div", null,
            React.createElement("h2", { className: "text-xl font-semibold mb-2" }, "Receitas e despesas recentes"),
            React.createElement("p", { className: "text-sm text-muted-foreground mb-6" },
              `Você possui um total de ${data.length} registros.`
            ),
          ),
          <div className="relative w-56">
            <Input
              type="text"
              placeholder="Ex.: João Silva"
              className={"border-2 border-neutral-300 rounded-md w-56 h-10 pr-10"}
            />
            <Search className="absolute right-3 top-5 -translate-y-1/2 text-gray-300 w-5 h-5 pointer-events-none" />
          </div>
        ),
        React.createElement("div", { className: "overflow-hidden rounded-md" },
          React.createElement(Table, null,
            React.createElement(TableHeader, null,
              table.getHeaderGroups().map((headerGroup) =>
                React.createElement(TableRow, { key: headerGroup.id },
                  headerGroup.headers.map((header) =>
                    React.createElement(TableHead, { key: header.id },
                      header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())
                    )
                  )
                )
              )
            ),
            React.createElement(TableBody, null,
              table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) =>
                  React.createElement(TableRow, {
                    key: row.id,
                    style: { backgroundColor: "rgb(250, 249, 244)" }
                  },
                    row.getVisibleCells().map((cell) =>
                      React.createElement(TableCell, { key: cell.id },
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )
                    )
                  )
                )
              ) : (
                React.createElement(TableRow, null,
                  React.createElement(TableCell, { colSpan: columns.length, className: "h-24 text-center" },
                    "Nenhum resultado encontrado."
                  )
                )
              )
            )
          )
        )
      )
    )
  )
}

export default function HomePage() {
  const { getUserInfo, isLoading, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(undefined)

  useEffect(() => {
    if (isLoading()) {
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 100);
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (isLoading()) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '1rem',
        fontSize: '1.2rem'
      }}>
        <span>Carregando...</span>
        <Progress value={progress} className="w-[20%]" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem'
      }}>
        Acesso não autorizado
      </div>
    );
  }

  const InfoCard = ({ title, value, isPositive, top3 }) => {
    const valueColor = isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <div className="relative hover:shadow-md border-neutral-300 bg-[#FAF9F4] rounded-md shadow-sm pl-10 h-auto min-h-[10rem] flex flex-col justify-center">
        <div className="text-lg font-semibold">{title}</div>
        <div className={`mt-2 text-2xl font-bold ${valueColor}`}>{value}</div>

        {top3 && (
          <ul className="absolute right-6 list-decimal list-inside flex flex-col justify-center text-gray-700 pr-10 leading-relaxed">
            {top3.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="px-20 mt-10 flex flex-row justify-between">
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col">
            <label className="mb-2 text-base font-medium text-gray-700">Selecione a conta</label>
            <Select>
              <SelectTrigger className="w-56 h-10 border-2 border-neutral-300 rounded-sm">
                <SelectValue placeholder="Todas as contas" value="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Contas</SelectLabel>
                  <SelectItem value="All">Todas as contas</SelectItem>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="blueberry">Blueberry</SelectItem>
                  <SelectItem value="grapes">Grapes</SelectItem>
                  <SelectItem value="pineapple">Pineapple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            <Label htmlFor="date" className="mb-2 text-base font-medium text-gray-700">
              Mês das transações
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-56 h-10 border-2 border-neutral-300 rounded-sm justify-between"
                >
                  {date ? date.toLocaleDateString() : "Selecionar data"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setDate(date);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="mt-8">
          <ButtonC texto="Lançar transação" largura="120px" altura="40px" type="submit" />
        </div>
      </div >
      <div className="mt-6 px-20 grid md:grid-cols-3 gap-6">
        <InfoCard
          title="Saldo total"
          value="R$ 5.000,00"
          isPositive={true}
        />
        <InfoCard
          title="Receitas de julho"
          value="R$ 2.500,00"
          isPositive={true}
          top3={["Salário", "Investimentos", "Apostas"]}
        />
        <InfoCard
          title="Despesas de julho"
          value="R$ 1.500,00"
          isPositive={false}
          top3={["Contas", "Mercado", "Lazer"]}
        />
      </div>
      <div className="px-20 mt-10 mb-40">
        <DataTableDemo />
      </div>
    </>
  );
}