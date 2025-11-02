import { Table } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options'
import { CSVLink } from 'react-csv'
import { Button } from '@/components/ui/button'
import AddNewLead from './add-new-lead'
import { useState } from 'react'

interface DataTableToolbarProps<TData> {
  table: Table<TData>,
  onRefresh: () => void
}

export function DataTableToolbar<TData>({
  table,
  onRefresh
}: DataTableToolbarProps<TData>) {
  const rows = table.getRowModel()?.rows?.map((row) => row.original) ?? []

  const [isOpenAddNew, setIsOpenAddNew] = useState(false);

  return (
    <>
      <AddNewLead
        open={isOpenAddNew}
        setOpen={setIsOpenAddNew}
        onCreate={onRefresh}
      />
      <div className="my-4 flex items-center justify-between gap-4">
        <Input
          placeholder="Pesquisa"
          value={(table.getColumn('Nome')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('Nome')?.setFilterValue(event.target.value)
          }
          className="h-8 w-full sm:w-[350px]"
        />

        <DataTableViewOptions table={table} />

        <CSVLink data={rows as never} filename={'leads.csv'}>
          <Button size="sm">Exportar CSV</Button>
        </CSVLink>

        <Button
          onClick={() => setIsOpenAddNew(true)}
        >
          Adicionar novo
        </Button>
      </div>
    </>    
  )
}
