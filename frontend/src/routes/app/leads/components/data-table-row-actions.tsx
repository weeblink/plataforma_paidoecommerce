import { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Ellipsis } from 'lucide-react'
import { Lead } from '@/types/leads'
import { useState } from 'react'
import { DeleteModal } from './delete-modal'
import AllowAccess from './allow-access'
import RemoveAccess from './remove-access'

interface DataTableRowActionsProps {
  row: Row<Lead>
  onRefresh: () => void
}

export function DataTableRowActions({
  row,
  onRefresh,
}: DataTableRowActionsProps) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAllowingAccess, setIsAllowingAccess] = useState(false);
    const [isRemovingAccess, setIsRemovingAccess] = useState(false);

    return (
    <>
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 focus-visible:ring-0 data-[state=open]:bg-muted"
                >
                    <Ellipsis className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-[160px] dark:bg-background"
            >
                <DropdownMenuItem onClick={() => setIsAllowingAccess(true)}>
                    Liberar acesso
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsRemovingAccess(true)}>
                    Remover acesso
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='text-red-700' onClick={() => setIsDeleteModalOpen(true)}>
                    Excluir
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <AllowAccess
            open={isAllowingAccess}
            setOpen={setIsAllowingAccess}
            userId={row.original.id}
            onCreate={onRefresh}
        />

        <RemoveAccess
            open={isRemovingAccess}
            setOpen={setIsRemovingAccess}
            access={row.original.tags}
            onCreate={onRefresh}
            leadId={row.original.id}
        />

        <DeleteModal
            lead={row.original}
            open={isDeleteModalOpen}
            setOpen={setIsDeleteModalOpen}
            onDelete={onRefresh}
        />
    </>
    )
}