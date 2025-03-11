import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {LoaderCircle, Plus} from "lucide-react";
import { Label } from '@/components/ui/label'
import {MultiSelect} from "@/components/ui/multi-select.tsx";
import {toast} from "sonner";
import {AxiosError} from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form,FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {api} from "@/services/api.ts";

interface Props {
    onCreate: () => void
}

interface PropsMultiselect{
    value: string,
    label: string,
}

interface GroupData {
    id: string,
    jid: string,
    created_at: string,
    subject: string,
}

const formSchema = z.object({
    "title" : z.string({
        required_error: "O campo de título da campanha é necessário pra seguir"
    }),
    "msg1"  : z.string({
        required_error: "O campo de mensagem 1 é necessária pra seguir"
    }),
    "msg2"  : z.string({
        required_error: "O campo de mensagem 2 é necessária pra seguir"
    }),
    "msg3"  : z.string({
        required_error: "O campo de mensagem 3 é necessária pra seguir"
    }),
    "msg4"  : z.string({
        required_error: "O campo de mensagem 4 é necessária pra seguir"
    }),
    "msg5"  : z.string({
        required_error: "O campo de mensagem 5 é necessária pra seguir"
    }),
    "groups_id" : z.array(z.string()).optional()
})

export function CreateCampaignModal({
    onCreate
}: Props){

    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [groupList, setGroupList] = useState<PropsMultiselect[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema)
    })

    function onOpenChange(value: boolean) {
        if (!value) {
        }

        setOpen(value)
    }

    async function fetchData(){
        setIsLoading(true);

        try{

            const {data} = await api.get("/whatsapp-groups");

            setGroupList(
                data.groups.map((group: GroupData) => {
                    return {
                        label: group.subject,
                        value: group.id
                    }
                })
            );

        }catch(error){
            let errorMessage = 'Ocorreu um erro ao buscar grupos'

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

    async function onSubmit( values: z.infer<typeof formSchema> ){

        setIsLoading(true);

        if( groupList.length === 0 ){
            toast.error("Você precisa selecionar ao menos um grupo de Whatsapp para continuar");
            return;
        }

        values.groups_id = groupList.map((group) => {
            return group.value
        });

        try{

            await api.post("/whatsapp-campaigns/create", values);
            onCreate();
            setOpen(false);

        }catch (error){
            let errorMessage = 'Ocorreu um erro ao criar a aula'

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

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar campanha
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <DialogTitle className="font-poppins">Criar campanha</DialogTitle>
                    <DialogDescription>
                        Essas campanhas são para enviar mensagens diretas aos seus grupos de Whatsapp
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id="createCampaignForm"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <div className={`mt-2`}>
                            <FormField
                                name={'title'}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Nome da campanha</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome da campanha" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className={`mt-2`}>
                            <Label className={`mb-6`}>Selecione os grupos desejados</Label>
                            {isLoading ? (
                                <LoaderCircle className="h-4 w-4 animate-spin"/>
                            ) : (
                                <MultiSelect
                                    modalPopover
                                    options={groupList}
                                    onValueChange={setSelectedGroups}
                                    defaultValue={selectedGroups}
                                    placeholder="Selecione os grupos"
                                    variant="inverted"
                                    maxCount={10}
                                />
                            )}
                            <div className={`mt-6`}>
                                <Tabs defaultValue={`msg1`} className={`space-y-4`}>
                                    <TabsList>
                                        <TabsTrigger value={'msg1'}>Mensagem 1</TabsTrigger>
                                        <TabsTrigger value={'msg2'}>Mensagem 2</TabsTrigger>
                                        <TabsTrigger value={'msg3'}>Mensagem 3</TabsTrigger>
                                        <TabsTrigger value={'msg4'}>Mensagem 4</TabsTrigger>
                                        <TabsTrigger value={'msg5'}>Mensagem 5</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value={`msg1`} className={`space-y-4`}>
                                        <FormField
                                            control={form.control}
                                            name={'msg1'}
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Mensagem 1</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={`Mensagem 1`}
                                                            {...field}
                                                            rows={4} // Define number of visible rows
                                                            className="min-h-[100px] resize-y" // Minimum height and allow vertical resizing
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                    <TabsContent value={`msg2`} className={`space-y-4`}>
                                        <FormField
                                            control={form.control}
                                            name={'msg2'}
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Mensagem 2</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={`Mensagem 2`}
                                                            {...field}
                                                            rows={4} // Define number of visible rows
                                                            className="min-h-[100px] resize-y" // Minimum height and allow vertical resizing
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                    <TabsContent value={`msg3`} className={`space-y-4`}>
                                        <FormField
                                            control={form.control}
                                            name={'msg3'}
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Mensagem 3</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={`Mensagem 3`}
                                                            {...field}
                                                            rows={4} // Define number of visible rows
                                                            className="min-h-[100px] resize-y" // Minimum height and allow vertical resizing
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                    <TabsContent value={`msg4`} className={`space-y-4`}>
                                        <FormField
                                            control={form.control}
                                            name={'msg4'}
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Mensagem 4</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={`Mensagem 4`}
                                                            {...field}
                                                            rows={4} // Define number of visible rows
                                                            className="min-h-[100px] resize-y" // Minimum height and allow vertical resizing
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                    <TabsContent value={`msg5`} className={`space-y-4`}>
                                        <FormField
                                            control={form.control}
                                            name={'msg5'}
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Mensagem 5</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={`Mensagem 5`}
                                                            {...field}
                                                            rows={4} // Define number of visible rows
                                                            className="min-h-[100px] resize-y" // Minimum height and allow vertical resizing
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </form>
                </Form>
                <DialogFooter>
                    <Button
                        form={'createCampaignForm'}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <LoaderCircle className="h-4 w-4 animate-spin text-white" />
                        ) : (
                            'Criar'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}