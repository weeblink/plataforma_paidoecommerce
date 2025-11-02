import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { api } from '@/services/api'
import { TagLead } from '@/types/leads'
import { AxiosError } from 'axios'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
  tag?: TagLead,
  leadId: string,
  open: boolean
  setOpen: (value: boolean) => void
  onDelete: () => void
}

export default function DeleteAccessConfirmation({ tag, leadId, open, setOpen, onDelete }: Props){
    const [isLoading, setIsLoading] = useState(false);

    async function deleteProduct() {
        if(!tag){
            toast.error("Você precisa selecionar uma tag para remover");
            return;
        }

        setIsLoading(true)

        try {
            await api.delete(`/leads/${leadId}/remove-access/${tag.id}`)

            onDelete()
            setOpen(false)
            toast.success('Lead deletado com sucesso')
        } catch (error) {
            let errorMessage = 'Ocorreu um erro ao deletar o lead'

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
                Tem certeza que deseja deletar o acesso?
            </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                <Button onClick={deleteProduct} disabled={isLoading}>
                    {isLoading ? (
                        <LoaderCircle className="h-4 animate-spin text-white" />
                    ) : (
                        'Confirmar'
                    )}
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    );
}