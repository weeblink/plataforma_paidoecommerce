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
import { useState } from 'react'
import { DeleteModal } from './delete-modal'
import { UpdateModal } from './update-modal'
import { HandleMentoringGroupsModal } from './handle-mentoring-groups-modal'
import type { MentoringManagement } from '@/types/mentoring-management'

interface DataTableRowActionsProps {
  row: Row<MentoringManagement>
  onRefresh: () => void
}

export function DataTableRowActions({
  row,
  onRefresh,
}: DataTableRowActionsProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isHandleModulesModalOpen, setIsHandleModulesModalOpen] =
    useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

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
          <DropdownMenuItem onClick={() => setIsHandleModulesModalOpen(true)}>
            Gerenciar grupos
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-red-600"
          >
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateModal
        open={isUpdateModalOpen}
        setOpen={setIsUpdateModalOpen}
        mentoring={row.original}
        onUpdate={onRefresh}
      />

      <HandleMentoringGroupsModal
        open={isHandleModulesModalOpen}
        setOpen={setIsHandleModulesModalOpen}
        mentoring={row.original}
      />

      <DeleteModal
        open={isDeleteModalOpen}
        setOpen={setIsDeleteModalOpen}
        mentoring={row.original}
        onDelete={onRefresh}
      />
    </>
  )
}
