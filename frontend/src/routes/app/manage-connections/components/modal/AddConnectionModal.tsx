import {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { z } from 'zod'
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {LoaderCircle, Plus} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form.tsx'
import {Input} from "@/components/ui/input.tsx";
import { api } from '@/services/api.ts'
import {AxiosError} from "axios";
import {toast} from "sonner";

interface Props {
    onCreate: () => void
}

const formSchema = z.object({
    name: z.string({
        required_error: "O nome da conexão é obrigatório"
    }),
});

export function AddConnectionModal({
    onCreate,
}: Props) {

    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    function onOpenChange(value:boolean) {
        if(!value){
            form.reset();
        }

        setOpen(value);
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        try{
            const formData = new FormData();
            formData.append("name", values.name);

            await api.post('/connections', formData);

            onCreate();
            toast.success("Cadastrado com sucesso!");
            setOpen(false);
        } catch (error) {
            let errorMessage = 'Ocorreu um erro ao criar os banners'

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className={`mr-2 h-4 w-4`} />
                    Adicionar nova
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-poppins">Adicionar conexão</DialogTitle>
                    <DialogDescription>
                        Preencha os campos abaixo para criar uma conexão.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id="createConnectionForm"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name={`name`}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input placeholder={`Nome da conexão`} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <Button
                        form={`createConnectionForm`}
                        type={`submit`}
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
    )
}