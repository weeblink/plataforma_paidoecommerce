import { Table } from '@tanstack/react-table'

import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="my-4 flex items-center justify-between gap-4">
      <Input
        placeholder="Pesquisa"
        value={(table.getColumn('Data')?.getFilterValue() as string) ?? ''}
        onChange={(event) =>
          table.getColumn('Data')?.setFilterValue(event.target.value)
        }
        className="h-8 w-full sm:w-[350px]"
      />

      <DataTableViewOptions table={table} />
    </div>
  )
}
