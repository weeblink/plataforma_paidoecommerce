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
import type { CourseManagement } from '@/types/course-management'
import { AxiosError } from 'axios'
import { LoaderCircle } from 'lucide-react'
import { useState, type Dispatch, type SetStateAction } from 'react'
import { toast } from 'sonner'

interface Props {
  course: CourseManagement
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onDelete: () => void
}

export function DeleteModal({ course, open, setOpen, onDelete }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  async function deleteCourse() {
    setIsLoading(true)

    try {
      await api.delete(`/courses-management/${course.id}`)

      onDelete()
      setOpen(false)
      toast.success('Curso deletado com sucesso')
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao deletar o curso'

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
            Tem certeza que deseja deletar o curso?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a deletar o curso <strong>{course.title}</strong>.
            Essa ação é irreversível.
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
