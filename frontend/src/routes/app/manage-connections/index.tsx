import {useEffect, useState} from "react";
import {Connection} from "@/types/connections";
import {DataTable} from "@/routes/app/whatsapp-connections/components/tables/DataTable.tsx";
import {columns} from "@/routes/app/manage-connections/components/tables/connections/columns/columns.tsx";
import {AddConnectionModal} from "@/routes/app/manage-connections/components/modal/AddConnectionModal.tsx";
import {api} from "@/services/api.ts";
import {toast} from "sonner";

export function ManageConnections() {

    const [connections, setConnections] = useState<Connection[]>([]);

    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)

    async function fetchData(){
        setIsLoading(true);

        try{
            const {data} = await api.get<{data: Connection[]}>(
                '/connections',
            );

            setConnections(data.data);
        }catch(error){
            setIsError(true);
            toast.error('Ocorreu um erro ao carregar as conexões')
        }finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className={`sm:px-20`}>
            <div className="flex items-center justify-end">
                <AddConnectionModal onCreate={fetchData}/>
            </div>
            <div>
                {isError ? (
                    <p>Ocorreu um erro ao carregar os cursos</p>
                ) : (
                    <DataTable
                        columns={columns({onRefresh: fetchData})}
                        data={connections}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    )
}