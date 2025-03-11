import { Button } from '@/components/ui/button'
import { EmailMarketing } from '@/types/email-marketing'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Row } from '@tanstack/react-table'
import { Ellipsis } from 'lucide-react'
import { useState } from 'react'
import { DeleteModal } from './delete-modal'
import { MetricsEmailModal } from './metrics-email-modal'

interface DataTableRowActionsProps {
  row: Row<EmailMarketing>
  onRefresh: () => void
}

export function DataTableRowActions({
  row,
  onRefresh,
}: DataTableRowActionsProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false)

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
          <DropdownMenuItem
            onClick={() => setIsMetricsModalOpen(true)}
            className="p-2"
          >
            Métricas
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 text-red-600"
          >
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteModal
        open={isDeleteModalOpen}
        setOpen={setIsDeleteModalOpen}
        emailMarketing={row.original}
        onDelete={onRefresh}
      />
      <MetricsEmailModal
        open={isMetricsModalOpen}
        setOpen={setIsMetricsModalOpen}
        emailId={row.original.id}
      />
    </>
  )
}
