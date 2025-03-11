import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { api } from '@/services/api'
import type { CourseManagementClass } from '@/types/course-management'
import { AxiosError } from 'axios'
import { LoaderCircle, Trash } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
  data: CourseManagementClass
  onDelete: () => void
}

export function DeleteCourseClassModal({ data, onDelete }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function deleteClass() {
    setIsLoading(true)

    try {
      await api.delete(`/classes/${data.id}`)

      onDelete()
      setOpen(false)
      toast.success('Aula deletada com sucesso')
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao deletar a aula'

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

    setOpen(false)
    setIsLoading(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => e.stopPropagation()}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja deletar a aula?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a deletar a aula <strong>{data.title}</strong>.
            Essa ação é irreversível.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <Button onClick={deleteClass} disabled={isLoading}>
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
