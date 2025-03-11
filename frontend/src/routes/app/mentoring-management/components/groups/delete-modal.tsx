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
import type { MentoringGroup } from '@/types/mentoring-management'
import { AxiosError } from 'axios'
import { LoaderCircle, Trash } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
  group: MentoringGroup
  onDelete: () => void
}

export function DeleteMentoringGroupModal({ group, onDelete }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function deleteGroup() {
    setIsLoading(true)

    try {
      await api.delete(`/mentoring/group-management/${group.id}`)

      onDelete()
      setOpen(false)
      toast.success('Grupo de mentoria deletado com sucesso')
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao deletar o grupo de mentoria'

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
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          onClick={(e) => e.stopPropagation()}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja deletar grupo de mentoria?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a deletar o grupo de mentoria{' '}
            <strong>{group.title}</strong>. Essa ação é irreversível.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <Button onClick={deleteGroup} disabled={isLoading}>
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
