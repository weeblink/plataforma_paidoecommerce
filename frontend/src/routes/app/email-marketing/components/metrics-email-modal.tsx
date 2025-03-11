import { 
    Dialog, 
    DialogContent, 
    DialogTitle,
    DialogDescription,
    DialogHeader
} from '@/components/ui/dialog';
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import SeenEmailMetrics from "./graphics/seen-email";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { EmailMarketingMetrics } from "@/types/email-marketing-metrics";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from '@/services/api';


interface Props {
    emailId: string
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}

export function MetricsEmailModal({
    emailId,
    open,
    setOpen
} : Props){

    const [isLoading, setIsLoading] = useState(true);
    const [emailMetrics, setEmailMetrics] = useState<EmailMarketingMetrics>()

    async function fetchData(){

        try{

            setIsLoading(true);

            const {data: response} = await api.get<{data: EmailMarketingMetrics}>(
                `/email-marketing/metrics/${emailId}`
            );

            console.log(response.data);
            setEmailMetrics(response.data);

        }catch(error){
            let errorMessage = 'Ocorreu um erro ao criar o curso'

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

    useEffect(() => {
        
        if( open )
            fetchData();
        else
            setEmailMetrics(undefined);

    }, [open, emailId])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-5xl overflow-y-auto" style={{maxHeight: '80vh'}}>
                <DialogHeader>
                    <DialogTitle>Métricas do email</DialogTitle>
                    <DialogDescription>Veja as métricas do seu email enviado</DialogDescription>
                </DialogHeader>
                {isLoading || emailMetrics == null ? (
                    <div className="mt-3">
                        <div className="mb-4">
                            <h5 className="text-primary">
                                Assunto:
                            </h5>
                            <Skeleton className="h-[20px] w-full" />
                        </div>    
                        <div className="mb-4">
                            <h5 className="text-primary">
                                Mensagem:
                            </h5>
                            <Skeleton className="h-[100px] w-full" />
                        </div> 
                        <div className="mb-3">
                            <h5 className="text-primary">
                                Dados:
                            </h5>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <div>
                                    <Skeleton className="h-[100px] w-full" />
                                </div>
                                <div>
                                    <Skeleton className="h-[100px] w-full" />
                                </div>
                            </div>                        
                        </div>              
                    </div>
                ) : (
                    <div className="mt-3">
                        <div className="mb-5">
                            <h5 className="text-primary">
                                Assunto:
                            </h5>
                            <p>{emailMetrics.subject}</p>
                        </div>    
                        <div className="mb-5">
                            <h5 className="text-primary">
                                Mensagem:
                            </h5>
                            <p>{emailMetrics.message}</p>
                        </div> 
                        <div className="mb-5">
                            <h5 className="text-primary">
                                Dados:
                            </h5>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3'>
                                <div className='p-3 flex justify-center card rounded-xl border bg-card text-card-foreground shadow dark:bg-background dark:border-white/20'>
                                    <SeenEmailMetrics
                                        seen={emailMetrics.leads_seen.length}
                                        notSeen={ ( emailMetrics.contacts_count - emailMetrics.leads_seen.length )}
                                    />
                                </div>
                                <div className='p-3 flex flex-col justify-center align-middle text-center card rounded-xl border bg-card text-card-foreground shadow dark:bg-background dark:border-white/20'>
                                    <h5>
                                        Enviado em
                                    </h5>
                                    <div className='mt-3 text-primary text-2xl'>
                                        { emailMetrics.scheduled ? emailMetrics.schedule_time : emailMetrics.created_at }
                                    </div>
                                </div>
                            </div>                        
                        </div>   
                        <div className="mb-5">
                            <h5 className="text-primary">
                                Ação:
                            </h5>
                            <div>
                                <a className='underline' href={emailMetrics.type_action === "link" ? emailMetrics.link : emailMetrics.file_url}>
                                    {emailMetrics.type_action === "link" ? emailMetrics.link : emailMetrics.file_url}
                                </a>
                            </div>
                        </div>      
                    </div>
                )}            
            </DialogContent>
        </Dialog>
    );
}