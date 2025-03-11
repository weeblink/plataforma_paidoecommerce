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
import type { MentoringManagement } from '@/types/mentoring-management'
import { AxiosError } from 'axios'
import { LoaderCircle } from 'lucide-react'
import { useState, type Dispatch, type SetStateAction } from 'react'
import { toast } from 'sonner'

interface Props {
  mentoring: MentoringManagement
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onDelete: () => void
}

export function DeleteModal({ mentoring, open, setOpen, onDelete }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  async function deleteCourse() {
    setIsLoading(true)

    try {
      await api.delete(`/mentoring-management/${mentoring.id}`)

      onDelete()
      setOpen(false)
      toast.success('Mentoria deletada com sucesso')
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao deletar a mentoria'

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
            Tem certeza que deseja deletar a mentoria?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a deletar a mentoria{' '}
            <strong>{mentoring.title}</strong>. Essa ação é irreversível.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <Button onClick={deleteCourse} disabled={isLoading}>
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
