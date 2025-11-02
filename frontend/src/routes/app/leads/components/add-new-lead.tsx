import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { api } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useHookFormMask } from "use-mask-input";
import { z } from 'zod'

interface Props {
    open: boolean,
    setOpen: (value:boolean) => void,
    onCreate: () => void;
}

const formSchema = z
  .object({
    name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
    cpf: z.string().refine((value) => value.replace(/\D/g, '').length === 11, {
      message: 'Insira um CPF válido',
    }),
    email: z.string().email('Insira um email válido'),
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  })

export default function AddNewLead({
    open,
    setOpen,
    onCreate
}: Props){

    const [isLoading, setIsLoading] = useState(false)

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const registerWithMask = useHookFormMask(form.register)
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)

        try {
            await api.post('/leads/add-new', values)

            toast.success('Cadastro efetuado com sucesso!');
            onCreate();
            setOpen(false);
        } catch (error) {
            let errorMessage = 'Ocorreu um erro ao cadastrar usuário'

            if (error instanceof AxiosError) {
                if (error.response?.data?.message) {
                errorMessage = error.response.data.message
                }
            }

            toast.error(errorMessage);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
        >
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-poppins">Remover acessos</DialogTitle>
                    <DialogDescription>
                        Gerencie os acessos desse lead
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nome</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" required {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
            
                            <FormField
                            control={form.control}
                            name="cpf"
                            render={() => (
                                <FormItem>
                                <FormLabel>CPF</FormLabel>
                                <FormControl>
                                    <Input
                                    {...registerWithMask('cpf', ['999.999.999-99'], {
                                        required: true,
                                    })}
                                    placeholder="XXX.XXX.XXX-XX"
                                    minLength={14}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                    type="email"
                                    placeholder="m@exemplo.com"
                                    required
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Senha</FormLabel>
                                <FormControl>
                                    <Input
                                    type="password"
                                    placeholder="******"
                                    required
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                    'Cadastrar'
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}