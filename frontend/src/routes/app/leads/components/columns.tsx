'use client'

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { ColumnDef } from '@tanstack/react-table'
import type { Lead, TagLead } from '@/types/leads'
import { DataTableRowActions } from './data-table-row-actions'

interface ColumnsProps {
  onRefresh: () => void
}

export function columns({
  onRefresh,
}: ColumnsProps): ColumnDef<Lead>[] {

  return [
    {
      id: 'actions',
      header: () => <div className="text-center">Ações</div>,
      cell: ({row}) => (
        <div className="flex justify-center">
          <DataTableRowActions row={row} onRefresh={onRefresh} />
        </div>
      )
    },
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
    {
      id: 'Tags',
      accessorKey: 'tags',
      header: ({column}) => (
        <DataTableColumnHeader column={column} title="Tags" />
      ),
      cell: ({row}) => {
        const tags: TagLead[] = row.getValue('Tags');
        
        return (
          <div className='flex flex-wrap'>
            {tags.map((tag: TagLead) => (
              <span className='bg-primary p-1 m-1 text-white rounded-lg text-xs'>{tag.title}</span>
            ))}
          </div>
        )
      }
    }
  ]
}
