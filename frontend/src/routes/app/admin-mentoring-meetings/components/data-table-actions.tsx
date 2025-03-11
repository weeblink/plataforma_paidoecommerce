import { Row } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Ellipsis } from 'lucide-react'
import { useState } from 'react'
import { CancelModal } from './cancel-modal'
import type { Meeting } from '@/types/meeting'
import { UpdateScheduleModal } from './update-schedule-modal'

interface DataTableRowActionsProps {
  row: Row<Meeting>
  onRefresh: () => void
}

export function DataTableRowActions({
  row,
  onRefresh,
}: DataTableRowActionsProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

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
          <DropdownMenuItem onClick={() => setIsUpdateModalOpen(true)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsCancelModalOpen(true)}
            className="text-red-600"
          >
            Cancelar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateScheduleModal
        open={isUpdateModalOpen}
        setOpen={setIsUpdateModalOpen}
        meeting={row.original}
        onUpdate={onRefresh}
      />

      <CancelModal
        open={isCancelModalOpen}
        setOpen={setIsCancelModalOpen}
        meeting={row.original}
        onCancel={onRefresh}
      />
    </>
  )
}
