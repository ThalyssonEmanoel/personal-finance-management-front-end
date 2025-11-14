'use client'
import React, { useState, useMemo, useCallback } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useBankTransfersQuery, useDeleteBankTransferMutation } from '@/utils/apiClient';
import ViewTransferModal from './ViewTransferModal';
import UpdateTransferModal from './UpdateTransferModal';
import { toast } from "sonner";

const TransfersTable = ({ onTransferChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState([]);
  const [filters, setFilters] = useState({
    limit: 10,
    page: 1
  });

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  const { data, isLoading, isError, error } = useBankTransfersQuery(filters);
  const { mutate: deleteTransfer, isPending: isDeleting } = useDeleteBankTransferMutation();
  const transfersData = data?.transfers ?? [];

  const filteredTransfers = useMemo(() => {
    if (!searchTerm) return transfersData;

    return transfersData.filter(transfer =>
      transfer.sourceAccount?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.destinationAccount?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transfersData, searchTerm]);

  const formatCurrency = (value) => {
    const numValue = parseFloat(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleViewClick = useCallback((transfer) => {
    setSelectedTransfer(transfer);
    setIsViewModalOpen(true);
  }, []);

  const handleEditClick = useCallback((transfer) => {
    setSelectedTransfer(transfer);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((transfer) => {
    setSelectedTransfer(transfer);
    setIsDeleteModalOpen(true);
  }, []);

  const handleCloseViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedTransfer(null);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedTransfer(null);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSelectedTransfer(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!selectedTransfer) return;

    deleteTransfer(selectedTransfer.id, {
      onSuccess: () => {
        toast.success('Transferência excluída com sucesso!');
        setIsDeleteModalOpen(false);
        setSelectedTransfer(null);
        if (onTransferChange) onTransferChange();
      },
      onError: (err) => {
        console.error('Erro ao excluir transferência:', err);
        toast.error('Erro ao excluir transferência. Tente novamente.');
      }
    });
  }, [selectedTransfer, deleteTransfer, onTransferChange]);

  const columns = [
    {
      id: "icon",
      header: "",
      cell: ({ }) => {
        return(
          <div className="flex items-center relative -ml-4 -mt-3 -mb-3">
            <div
              className={"w-3 h-18 rounded-l-md bg-yellow-200"}
              aria-hidden="true"
            />
          </div>
        );
      },
    },
    {
      accessorKey: "sourceAccount",
      header: ({ column }) => {
        return React.createElement("div", {
          className: "flex items-center cursor-pointer hover:text-gray-600",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
        },
          "Conta de origem",
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
        const transfer = row.original;
        const sourceName = transfer.sourceAccount?.name || 'N/A';
        return React.createElement("div", { 
          className: "font-medium",
          title: sourceName // Tooltip
        }, sourceName);
      },
      sortingFn: (rowA, rowB) => {
        const nameA = rowA.original.sourceAccount?.name || '';
        const nameB = rowB.original.sourceAccount?.name || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      accessorKey: "destinationAccount",
      header: ({ column }) => {
        return React.createElement("div", {
          className: "flex items-center cursor-pointer hover:text-gray-600",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
        },
          "Conta de destino",
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
        const transfer = row.original;
        const destName = transfer.destinationAccount?.name || 'N/A';
        return React.createElement("div", { 
          className: "font-medium",
          title: destName // Tooltip
        }, destName);
      },
      sortingFn: (rowA, rowB) => {
        const nameA = rowA.original.destinationAccount?.name || '';
        const nameB = rowB.original.destinationAccount?.name || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      accessorKey: "transfer_date",
      header: ({ column }) => {
        return React.createElement("div", {
          className: "flex items-center cursor-pointer hover:text-gray-600",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
        },
          "Data da transferência",
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
        const date = row.getValue("transfer_date");
        return React.createElement("div", { className: "font-medium" }, 
          formatDate(date)
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.getValue("transfer_date"));
        const dateB = new Date(rowB.getValue("transfer_date"));
        return dateA - dateB;
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return React.createElement("div", {
          className: "flex items-center cursor-pointer hover:text-gray-600",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
        },
          "Valor(R$)",
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
        const amount = row.getValue("amount");
        const formatted = formatCurrency(amount);

        return React.createElement("div", {
          className: "font-bold text-gray-800"
        }, formatted);
      },
      sortingFn: (rowA, rowB) => {
        const amountA = parseFloat(rowA.getValue("amount")) || 0;
        const amountB = parseFloat(rowB.getValue("amount")) || 0;
        return amountA - amountB;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const transfer = row.original;

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
              onClick: () => handleViewClick(transfer)
            }, "Visualizar"),
            React.createElement(DropdownMenuItem, {
              onClick: () => handleEditClick(transfer)
            }, "Editar"),
            React.createElement(DropdownMenuItem, {
              onClick: () => handleDeleteClick(transfer),
              className: "text-red-600 focus:text-red-600"
            }, "Excluir")
          )
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredTransfers,
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
        <div className="text-lg">Carregando transferências...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-red-600">
          Erro ao carregar transferências: {error?.message || 'Erro desconhecido'}
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-neutral-300 rounded-md h-180 overflow-y-auto">
      <div className="px-8 py-8">
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Transferências realizadas</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Você possui um total de {transfersData.length} transferências realizadas.
            </p>
          </div>
          <div className="relative w-56">
            <Input
              type="text"
              placeholder="Ex: mercado"
              className="border-2 border-neutral-300 rounded-md w-56 h-10 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-5 -translate-y-1/2 text-gray-300 w-5 h-5 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-hidden rounded-md">
          <Table className="fixed-table-layout transfers-table">
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
              {filteredTransfers.length > 0 ? (
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
                    Nenhuma transferência encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Modal */}
      <ViewTransferModal 
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        transfer={selectedTransfer}
      />

      {/* Edit Modal */}
      <UpdateTransferModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        transfer={selectedTransfer}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={handleCloseDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir esta transferência? Esta ação não pode ser desfeita
              e os saldos das contas serão ajustados automaticamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDeleteModal}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir transferência"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransfersTable;