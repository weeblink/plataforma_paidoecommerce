import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {useEffect, useState} from "react";
import {CampaignsChart} from "@/routes/app/whatsapp-connections/components/graphs/capaigns-chart.tsx";
import {CreateCampaignModal} from "@/routes/app/whatsapp-connections/components/modal/CreateCampaignModal.tsx";
import {DataTable} from "@/routes/app/whatsapp-connections/components/tables/DataTable.tsx";
import {Campaign} from "@/types/campaign";
import {columns} from "@/routes/app/whatsapp-connections/components/tables/campaigns/columns/columns.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Settings} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/services/api";


export default function WhatsappConnections(  ){

    const [countGroups, setCountGroups] = useState<number>(0);
    const [countParticipants, setCountParticipants] = useState<number>(0);

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    async function fetchData(){
        setIsLoading(true);

        try{

            const [dataGroups, dataParticipants, {data: dataCampaigns}] = await Promise.all([
                api.get('/whatsapp-groups/count'),
                api.get('/participants/count'),
                api.get('/whatsapp-campaigns/')
            ]);

            setCountGroups(dataGroups.data.qnt_groups);
            setCountParticipants(dataParticipants.data.qnt_participants);
            setCampaigns(dataCampaigns.data);

        }catch(error){
            setIsError(true);
            toast.error('Ocorreu um erro ao carregar os dados do Whatsapp');
            console.error(error);
        }finally{
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData()
    }, []);

    if( isError ){
        return (
            <div className={'space-y-4'}>
                <div className={`px-20`}>
                    <p>
                        Um erro inesperado ocorreu
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={'space-y-4'}>
            <div className={`px-20`}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold tracking-tight w-[100%] sm:w-[100%]">Whatsapp</h2>
                    <div className={`text-end`}>
                        <a href={`/whatsapp-connections/manage`}>
                            <Button>
                                <Settings className={`me-2`}/>
                                Gerenciar conexões
                            </Button>
                        </a>
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 ">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total de grupos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Skeleton className="h-[30px]"/>
                            ) : (
                                <div className="text-2xl font-bold">{countGroups}</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Qnt. Participantes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Skeleton className="h-[30px]"/>
                            ) : (
                                <div className="text-2xl font-bold">{countParticipants}</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className={`mt-10`}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Campanhas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Skeleton className="h-[300px]"/>
                            ) : (
                                <CampaignsChart
                                    campaigns={campaigns}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className={'pt-2'}>
                    <div className="flex items-center justify-between mt-10">
                        <h3 className="text-xl font-bold tracking-tight sm:w-[50%]">Campanhas</h3>
                        <div className={`sm:w-[50%`}>
                            <CreateCampaignModal onCreate={fetchData}/>
                        </div>
                    </div>
                    <DataTable columns={columns} data={campaigns} isLoading={isLoading}/>
                </div>
            </div>
        </div>
    )
}