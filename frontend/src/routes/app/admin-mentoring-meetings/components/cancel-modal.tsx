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
import type { Meeting } from '@/types/meeting'
import { AxiosError } from 'axios'
import { LoaderCircle } from 'lucide-react'
import moment from 'moment'
import { useState, type Dispatch, type SetStateAction } from 'react'
import { toast } from 'sonner'

interface Props {
  meeting: Meeting
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onCancel: () => void
}

export function CancelModal({ meeting, open, setOpen, onCancel }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  async function deleteSchedule() {
    setIsLoading(true)

    try {
      await api.delete(`/mentoring/schedule/${meeting.id}`)

      onCancel()
      setOpen(false)
      toast.success('Horários cancelados com sucesso')
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao deletar os horários'

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
            Tem certeza que deseja cancelar os horários?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a cancelar os seguintes horários do dia{' '}
            {moment(meeting.date).format('DD/MM/YYYY')}:
          </AlertDialogDescription>
          <span className="font-semibold">
            {meeting.times.map((times, index) => (
              <span key={index} className="block">
                {times.start_time} - {times.end_time}
              </span>
            ))}
          </span>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Fechar</AlertDialogCancel>
          <Button onClick={deleteSchedule} disabled={isLoading}>
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
