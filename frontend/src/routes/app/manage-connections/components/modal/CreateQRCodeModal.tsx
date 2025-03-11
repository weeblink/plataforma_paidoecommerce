import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx'
import {type Dispatch, type SetStateAction, useState} from "react";
import {Connection} from "@/types/connections";
import {LoaderCircle, QrCodeIcon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {AxiosError} from "axios";
import {toast} from "sonner";
import {api} from "@/services/api.ts";

interface Props {
    connection: Connection
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
    onConnect: () => void
}

export function CreateQRCodeModal({
  connection,
  open,
  setOpen,
} : Props){

    const [isLoading, setIsLoading] = useState(false);
    const [qrCode, setQrCode] = useState<string|undefined>();

    function onOpenChange(value:boolean) {
        setOpen(value);
    }

    async function handleGetQrCode(){
        setIsLoading(true);

        try{

            const {data} = await api.post(
                `/connections/${connection.id}/qr-code`,
            );

            console.log(data);

            toast.success(data.message);
            setQrCode(data.qrcode);

        }catch(error){
            let errorMessage = 'Ocorreu um erro ao criar o QR code'

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
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`max-w-lg`}>
                <DialogHeader>
                    <DialogTitle className="font-poppins">Conectar com Whatsapp</DialogTitle>
                    <DialogDescription>
                        Agora basta você acessar o seu aplicativo no seu celular, navegar até configurações {'>'} Dispositivos conectados e conectar um novo dispositivo lendo o QR code abaixo
                    </DialogDescription>
                </DialogHeader>
                <div className={'mt-5'}>
                    {isLoading ? (
                        <LoaderCircle className="h-12 w-12 animate-spin" />
                    ) : (
                        qrCode == undefined ? (
                            <div className={`flex items-center justify-center w-full py-10`}>
                                <Button onClick={handleGetQrCode}>
                                    <QrCodeIcon className={`pe-2`} />
                                    Gerar Qr Code
                                </Button>
                            </div>
                        ) : (
                            <div className={'text-center'}>
                                <img className={'mx-auto'} src={qrCode} />
                            </div>
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}