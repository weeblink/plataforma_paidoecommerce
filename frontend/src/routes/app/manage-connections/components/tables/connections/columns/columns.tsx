'use client'

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header.tsx'
import { ColumnDef } from '@tanstack/react-table'
import {Connection} from "@/types/connections";
import {
    DataTableRowActions
} from "../DataTableRowActions.tsx";

interface ColumnsProps {
    onRefresh: () => void
}

export function columns({
    onRefresh
}: ColumnsProps) : ColumnDef<Connection>[]{
    return [
        {
            id: 'actions',
            header: () => <div className="text-center">Ações</div>,
            cell: ({row}) => (
                <div className={`flex justify-center`}>
                    <DataTableRowActions row={row} onRefresh={onRefresh} />
                </div>
            )
        },
        {
            id: 'Nome',
            accessorKey: 'name',
            header: ({column}) => (
                <DataTableColumnHeader column={column} title={`Nome`} />
            )
        },
        {
            id: 'status',
            accessorKey: 'status',
            header: ({column}) => (
                <DataTableColumnHeader column={column} title={`Status`} />
            )
        }
    ]
}