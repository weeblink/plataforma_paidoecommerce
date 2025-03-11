'use cliente'

import { EmailMarketing } from "@/types/email-marketing"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableRowActions } from "../../email-marketing/components/data-table-actions"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

interface ColumnsProps{
    onRefresh: () => void
}

export function columns({
    onRefresh,
} : ColumnsProps ) : ColumnDef<EmailMarketing>[] {
    return [
        {
            id: 'actions',
            header: () => <div className="text-center">Ações</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <DataTableRowActions row={row} onRefresh={onRefresh} />
                </div>
            )
        },
        {
            id: 'ID',
            accessorKey: 'id',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="ID" />
            ),
        },
        {
            id: 'Assunto',
            accessorKey: 'subject',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Assunto" />
            ),
        },
        {
            id: 'Envio em massa',
            accessorKey: 'broadcast',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Envio em massa?" />
            ),
        },
        {
            id: 'Contatos',
            accessorKey: 'contacts_count',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Contatos" />
            )
        },
        {
            id: 'Agendado',
            accessorKey: 'scheduled',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Agendado" />
            ),
        },
        {
            id: 'Data agendada',
            accessorKey: 'schedule_time',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Data agendada" />
            )
        }
    ]
} 