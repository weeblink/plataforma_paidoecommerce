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
import type { Banner } from '@/types/banner'
import { AxiosError } from 'axios'
import { LoaderCircle, Trash } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
  banner: Banner
  onDelete: () => void
}

export function DeleteModal({ banner, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function deleteBanner() {
    setIsLoading(true)

    try {
      await api.delete(`/banners/${banner.id}`)

      onDelete()
      setOpen(false)
      toast.success('Banner deletado com sucesso')
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao deletar o banner'

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
        <Button variant="destructive" size="sm">
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja deletar o banner?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a deletar o banner <strong>{banner.title}</strong>
            . Essa ação é irreversível.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <Button onClick={deleteBanner} disabled={isLoading}>
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
