import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx';

import { useState, type Dispatch, type SetStateAction } from 'react'
import {Connection} from "@/types/connections";
import {Button} from "@/components/ui/button.tsx";
import {LoaderCircle} from "lucide-react";
import {AxiosError} from "axios";
import {toast} from "sonner";
import {api} from "@/services/api.ts";

interface Props {
    connection: Connection
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
    onDelete: () => void
}

export function DeleteConnectionModal({
    connection,
    open,
    setOpen,
    onDelete
}: Props) {

    const [isLoading, setIsLoading] = useState(false);

    async function deleteConnection(){
        setIsLoading(true);

        try{

            await api.delete(`/connections/${connection.id}`);

            onDelete();

        }catch(error){
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
        }finally {
            setIsLoading(false);
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Tem certeza que deseja deletar a conexão?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Você está prestes a deletar a conexão <strong>{connection.name}</strong>.
                        Essa ação é irreversível.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                    <Button onClick={deleteConnection} disabled={isLoading}>
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