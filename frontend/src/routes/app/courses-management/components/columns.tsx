'use client'

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableRowActions } from './data-table-actions'
import type { CourseManagement } from '@/types/course-management'

interface ColumnsProps {
  onRefresh: () => void
}

export function columns({
  onRefresh,
}: ColumnsProps): ColumnDef<CourseManagement>[] {
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
      id: 'Qtd. de aulas',
      accessorKey: 'qnt_classes',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qtd. de aulas" />
      ),
    },
    {
      id: 'Qtd. de alunos',
      accessorKey: 'qnt_students',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qtd. de alunos" />
      ),
    },
    {
      id: 'Preço',
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Preço" />
      ),
      cell: ({ getValue }) => {
        const value = getValue() as number

        return <div>R$ {value}</div>
      },
    },
    {
      id: 'Preço promocional',
      accessorKey: 'promotional_price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Preço promocional" />
      ),
      cell: ({ getValue }) => {
        const value = getValue() as number

        return <div>R$ {value}</div>
      },
    },
  ]
}
