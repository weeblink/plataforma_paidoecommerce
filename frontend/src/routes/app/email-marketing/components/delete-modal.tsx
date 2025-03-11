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
import { AxiosError } from 'axios'
import { LoaderCircle } from 'lucide-react'
import { useState, type Dispatch, type SetStateAction } from 'react'
import { toast } from 'sonner'
import { EmailMarketing } from '../../../../types/email-marketing.d';

interface Props {
    emailMarketing: EmailMarketing
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
    onDelete: () => void
}

export function DeleteModal({ emailMarketing, open, setOpen, onDelete } : Props){
    const [isLoading, setIsLoading] = useState(false);

    async function deleteEmail(){

        setIsLoading(true);

        try{
            await api.delete(`/email-marketing/remove/${emailMarketing.id}`);

            onDelete(  );
            setOpen(false);
            toast.success("Email deletado com sucesso");

        }catch(error){
            let errorMessage = 'Ocorreu um erro ao deletar o email'

            if (error instanceof AxiosError) {
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message
                }

                if (!error.response?.data?.message && error.response?.data?.error) {
                    errorMessage = error.response.data.error
                }
            }

            toast.error(errorMessage)
        }finally{
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Tem certeza que deseja remover o email?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Você está prestes a deletar o email <strong>{emailMarketing.subject}</strong>.
                        Essa ação é irreversível.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                    <Button onClick={deleteEmail} disabled={isLoading}>
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