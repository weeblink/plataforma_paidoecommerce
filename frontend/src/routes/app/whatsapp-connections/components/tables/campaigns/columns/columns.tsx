'use client'

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header.tsx'
import { ColumnDef } from '@tanstack/react-table'
import {Campaign} from "@/types/campaign";

export const columns: ColumnDef<Campaign>[] = [
    {
        id: 'Nome',
        accessorKey: 'title',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Nome" />
        ),
    },
    {
        id: 'Qnt. Participantes',
        accessorKey: 'participants',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Qnt. Participantes" />
        )
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
    }
]