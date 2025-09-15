import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useGoalsTableQuery } from '../../utils/apiClient.js';
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
  Search
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

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

const GoalsTable = memo(({ filters: externalFilters = {} }) => {
  const [sorting, setSorting] = useState([]);
  const [page, setPage] = useState(1);
  const [allGoals, setAllGoals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const { dimensions, elementRef } = useStableDimensions({
    minHeight: '400px'
  });

  const { data, isLoading, isError, error } = useGoalsTableQuery({
    ...externalFilters,
    page,
    limit: 20
  });

  useEffect(() => {
    if (data?.data) {
      setAllGoals(data.data);
    }
  }, [data]);

  useEffect(() => {
    setPage(1);
    setAllGoals([]);
  }, [externalFilters]);

  const filteredGoals = useMemo(() => {
    let filtered = allGoals;
    if (typeFilter !== 'All') {
      filtered = filtered.filter(goal => goal.transaction_type === typeFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(goal =>
        Object.values(goal).some(value =>
          String(value)?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return filtered;
  }, [allGoals, typeFilter, searchTerm]);

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
        const colorClass = type === 'income' ? "text-green-500" : "text-red-500";

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
  ], []);

  const table = useReactTable({
    data: filteredGoals,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

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

  const typeOptions = [
    { value: 'All', label: 'Todas as metas' },
    { value: 'income', label: 'Receita' },
    { value: 'expense', label: 'Despesa' }
  ];

  return (
    <div
      ref={elementRef}
      style={{ minHeight: dimensions.minHeight }}
      role="region"
      aria-label="Tabela de metas"
    >
      <div className="border-2 border-neutral-300 rounded-md h-165 overflow-y-auto">
        <div className="px-8 py-8">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Metas recentes</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Você possui um total de {filteredGoals.length} metas.
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
                          : header.column.getCanSort()
                            ? header.column.columnDef.header({ column: header.column })
                            : header.column.columnDef.header
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
                          {cell.column.columnDef.cell({ row, getValue: cell.getValue })}
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
    </div>
  );
});

GoalsTable.displayName = 'GoalsTable';

export default withPerformanceOptimization(GoalsTable);
