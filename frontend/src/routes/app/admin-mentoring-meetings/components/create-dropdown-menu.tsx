import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus } from 'lucide-react'
import { CreateMentoringModal } from './create-mentoring-modal'
import { CreateScheduleModal } from './create-schedule-modal'
import { useState } from 'react'

interface Props {
  onCreate: () => void
}

export default function CreateDropdownMenu({ onCreate }: Props) {
  const [isCreateMentoringModalOpen, setIsCreateMentoringModalOpen] =
    useState(false)
  const [isCreateScheduleModalOpen, setIsCreateScheduleModalOpen] =
    useState(false)

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button size="sm">
            Criar <Plus className="ml-2 size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setIsCreateMentoringModalOpen(true)}>
            Reunião em grupo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsCreateScheduleModalOpen(true)}>
            Adicionar horário
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateMentoringModal
        onCreate={onCreate}
        open={isCreateMentoringModalOpen}
        setOpen={() => setIsCreateMentoringModalOpen(false)}
      />
      <CreateScheduleModal
        onCreate={onCreate}
        open={isCreateScheduleModalOpen}
        setOpen={() => setIsCreateScheduleModalOpen(false)}
      />
    </>
  )
}
