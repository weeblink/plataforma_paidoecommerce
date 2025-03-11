import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from '@/components/ui/dialog'
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Plus, Upload } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z
    .object({
        subject: z.string({
            required_error: "O assunto do email é obrigatório"
        }),
        message: z.string({
            required_error: "A mensagem de email é obrigatória"
        }),
        type_action: z.string({
            required_error: "É necessário selecionar um tipo de ação"
        }),
        link: z.string().optional(),
        file: z.any().optional(),
        scheduled: z.boolean().default(false),
        schedule_time: z.string().optional()
    })

interface Props {
    onCreate: () => void
}

interface FormData{
    subject: string,
    contacts?: string,
    message: string,
    type_action: string,
    link?: string|null,
    file?: any|null,
    scheduled: boolean,
    schedule_time?: string
}

interface FileEmail{
    title: string
}

export function CreateModal({ onCreate }: Props) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isScheduled, setIsScheduled] = useState(false);
    const [typeAction, setTypeAction] = useState<string | undefined>();
    const [previewFile, setPreviewFile] = useState<FileEmail | undefined>();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema)
    });

    function onOpenChange(value: boolean) {
        if (!value) {
          form.reset();
          setIsScheduled(false);
        }
    
        setOpen(value)
    }

    async function onSubmit( values: z.infer<typeof formSchema> ){
        setIsLoading(true);

        try{
            const formData = new FormData();
            formData.append('subject', values.subject);
            formData.append('message', values.message);
            formData.append('type_action', values.type_action);
            formData.append('scheduled', values.scheduled ? "1" : "0");

            if( values.link )
                formData.append('link',values.link.toString() );

            if( values.file )
                formData.append('file', values.file);

            if( values.schedule_time )
                formData.append('schedule_time', formatDateTime( values.schedule_time ));

            await api.post("/email-marketing/send", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            onCreate();
            toast.success('Curso criado com sucesso');
            setOpen(false);

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

    function handleChangesForm( data: FormData ){
        setTypeAction(data.type_action);
        setIsScheduled(data.scheduled);
    }

    const handleFileChange = useCallback(
        (file: File | null) => {
            if(file){
                form.setValue('file', file);

                const reader = new FileReader();
                reader.onloadend = (  ) => {
                    setPreviewFile({ title: file.name });
                }

                reader.readAsDataURL(file);
            }else{
                form.setValue('file', undefined);
                setPreviewFile(undefined);
            }
        }, [form]
    )

    function formatDateTime(input: string) {
        const date = new Date(input);
    
        // Ajuste o formato para 'YYYY-MM-DD HH:mm'
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
    
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar email
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <DialogTitle className="font-poppins">Criar email</DialogTitle>
                    <DialogDescription>
                        Preencha os campos abaixo para criar um novo email.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id="createEmailForm"
                        onSubmit={form.handleSubmit(onSubmit)}
                        onChange={() => handleChangesForm( form.getValues() )}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome</FormLabel>
                                <FormControl>
                                  <Input placeholder="Assunto do email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mensagem</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="Mensagem de email"
                                    className="resize-none"
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type_action"
                            render={({ field }) => {
                                const { value, onChange } = field;

                                return (
                                    <FormItem>
                                        <FormLabel>Escolha uma opção:</FormLabel>
                                        <FormControl>
                                            <div>
                                                <div>
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            value="file"
                                                            checked={value === 'file'}
                                                            onChange={onChange}
                                                            className="me-2"
                                                        />
                                                        Arquivo
                                                    </label>
                                                </div>                                            
                                                <label>
                                                    <input
                                                        type="radio"
                                                        value="link"
                                                        checked={value === 'link'}
                                                        onChange={onChange}
                                                        className="me-2"
                                                    />
                                                    Link
                                                </label>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                        { ( typeAction ) && (
                            typeAction === "file" ? (
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="file"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Arquivo</FormLabel>
                                                <FormControl>
                                                    <div
                                                        className={`relative flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors border-gray-300 hover:border-gray-400'
                                                          }`}
                                                    >
                                                        <Input
                                                            type="file"
                                                            accept="*"
                                                            onChange={(e) => 
                                                                handleFileChange( e.target.files?.[0] || null )
                                                            }
                                                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                                            aria-label="Upload de arquivo do email"
                                                        />
                                                        {previewFile ? (
                                                            <div className="text-center">
                                                                <span>{previewFile.title}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                                <p className="mt-2 text-sm text-gray-500">
                                                                    Clique para selecionar o arquivo desejado
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="link"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Link</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Link da ação" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )
                        ) }
                        <FormField
                            control={form.control}
                            name="scheduled"
                            render={({ field }) => {
                                const { value, ...rest } = field;
                                return (
                                <FormItem>
                                    <FormControl>
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        className='me-2'
                                        {...rest}
                                    />
                                    </FormControl>
                                    <FormLabel>Envio agendado?</FormLabel>                
                                    <FormMessage />
                                </FormItem>
                                );
                            }}
                        />
                        { isScheduled && (
                            <div>
                                <FormField                        
                                    control={form.control}
                                    name="schedule_time"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Horário agendado</FormLabel>
                                        <div>
                                            <FormControl>
                                                <Input
                                                    className="inline border border-gray-300 rounded-md p-2 w-50"
                                                    type="datetime-local" 
                                                    placeholder="Assunto do email" 
                                                    {...field} />
                                            </FormControl>
                                        </div>                                    
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                        ) }
                    </form>
                </Form>
                <DialogFooter>
                    <Button form="createEmailForm" type="submit" disabled={isLoading}>
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