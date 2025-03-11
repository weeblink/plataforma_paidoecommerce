'use client'

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { ColumnDef } from '@tanstack/react-table'
import type { Lead } from '@/types/leads'

export const columns: ColumnDef<Lead>[] = [
  {
    id: 'Nome',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
  },
  {
    id: 'Email',
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    id: 'Telefone',
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Telefone" />
    ),
    cell: ({ row }) => row.original.phone || '-',
  },
  {
    id: 'Criado em',
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Criado em" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.created_at)

      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    },
  },
]
