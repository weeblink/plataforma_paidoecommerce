import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableRowActions } from './data-table-actions'
import type { Meeting } from '@/types/meeting'

interface ColumnsProps {
  onRefresh: () => void
}

export function columns({ onRefresh }: ColumnsProps): ColumnDef<Meeting>[] {
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
      id: 'Data',
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Data início" />
      ),
    },
    {
      id: 'Horários',
      accessorKey: 'times',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Horários" />
      ),
      cell: ({ row }) => (
        <div className="">
          {row.original.times
            .map((time) => `${time.start_time} - ${time.end_time}`)
            .join(', ')}
        </div>
      ),
    },
    {
      id: 'Mentor',
      accessorKey: 'user',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mentor" />
      ),
      cell: ({ row }) => <div>{row.original.user.username}</div>,
    },
  ]
}
