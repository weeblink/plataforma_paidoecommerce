import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { api } from '@/services/api'
import type { MeetingCalendar } from '@/types/meeting'
import { AxiosError } from 'axios'
import { GraduationCap, LoaderCircle, School, Users } from 'lucide-react'
import moment from 'moment'
import { useState, type Dispatch, type SetStateAction } from 'react'
import { toast } from 'sonner'

interface Props {
  meeting: MeetingCalendar
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onCancel: () => void
}

export function CancelCalendarMeetingModal({
  meeting,
  open,
  setOpen,
  onCancel,
}: Props) {
  const [isLoading, setIsLoading] = useState(false)

  async function deleteMeeting() {
    setIsLoading(true)

    try {
      await api.delete(`/meet/schedule/${meeting.id}`)

      onCancel()
      setOpen(false)
      toast.success('Reunião cancelada com sucesso')
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao deletar a reunião'

      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }

        if (!error.response?.data?.message && error.response?.data?.error) {
          errorMessage = error.response.data.error
        }
      }

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja cancelar a reunião?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a cancelar a seguinte reunião do dia{' '}
            {moment(meeting.date).format('DD/MM/YYYY')}:
          </AlertDialogDescription>

          <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
                <Users className="size-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold leading-none text-primary">
                Qtd. participantes:
              </span>
            </div>
            <span className="truncate text-sm">{meeting.students.length}</span>
          </div>

          <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
                <School className="size-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold leading-none text-primary">
                Mentoria:
              </span>
            </div>
            <span className="truncate text-sm">{meeting.mentoring_title}</span>
          </div>

          <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
                <GraduationCap className="size-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold leading-none text-primary">
                Turma:
              </span>
            </div>
            <span className="truncate text-sm">{meeting.title}</span>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Fechar</AlertDialogCancel>
          <Button onClick={deleteMeeting} disabled={isLoading}>
            {isLoading ? (
              <LoaderCircle className="h-4 animate-spin text-white" />
            ) : (
              'Confirmar'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
