'use client'

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableRowActions } from './data-table-actions'
import type { MentoringManagement } from '@/types/mentoring-management'
import moment from 'moment'

interface ColumnsProps {
  onRefresh: () => void
}

export function columns({
  onRefresh,
}: ColumnsProps): ColumnDef<MentoringManagement>[] {
  return [
    {
      id: 'actions',
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DataTableRowActions row={row} onRefresh={onRefresh} />
        </div>
      ),
    },
    {
      id: 'ID',
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
    },
    {
      id: 'Nome',
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nome" />
      ),
    },
    {
      id: 'Data de criação',
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Data de criação" />
      ),
      cell: ({ row }) => (
        <div>{moment(row.original.created_at).format('DD/MM/YYYY')}</div>
      ),
    },
    {
      id: 'Data de atualização',
      accessorKey: 'updated_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Data de atualização" />
      ),
      cell: ({ row }) => (
        <div>{moment(row.original.updated_at).format('DD/MM/YYYY')}</div>
      ),
    },
  ]
}
