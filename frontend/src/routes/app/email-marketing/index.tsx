import { api } from "@/services/api";
import { EmailMarketing } from "@/types/email-marketing";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "../email-marketing/components/data-table";
import { columns } from "./components/columns";
import { CreateModal } from "./components/create-modal";

export default function EmailMarketingPage(){
    const [emailsMarketing,setEmailsMarketing] = useState<EmailMarketing[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    async function fetchData(  ){
        setIsLoading(true);

        try{
            const { data } = await api.get<{data: EmailMarketing[]}>(
                '/email-marketing'
            );

            setEmailsMarketing(data.data);
        }catch{
            setIsError( true );
            toast.error("Ocorreu um erro ao carregar os emails");
        }finally{
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData(  );
    }, []);

    return (
        <div>
            <div className="flex justify-between gap-2">
                <h1 className="font-poppins text-2xl font-medium">Email Marketing</h1>
                <CreateModal onCreate={fetchData}/>
            </div>
            <div className="mt-8">
            {isError ? (
                <p>Ocorreu um erro ao carregar os emails</p>
            ) : (
                <DataTable
                    columns={columns({ onRefresh: fetchData })}
                    data={emailsMarketing}
                    isLoading={isLoading}
                />
            )}
            </div>
        </div>
    );
}