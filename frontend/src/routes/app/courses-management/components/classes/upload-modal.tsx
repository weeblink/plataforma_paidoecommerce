import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { CourseManagementClass } from '@/types/course-management'
import { Play } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import Resumable from "resumablejs";
import { env } from '@/lib/env'
import { useAuth } from '@/hooks/auth'

const formSchema = z.object({
    video_file: z.any().refine((value) => value, 'O arquivo do vídeo é obrigatório')
});

interface Props {
    data: CourseManagementClass,
    onChange: (  ) => void
}

export function UploadVideoClassModal({data, onChange}: Props){

    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showProgressBar, setShowProgressBar] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const {user} = useAuth();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    async function onsubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
    
        try {
            if (!values.video_file) {
                throw new Error('No video file selected');
            }
    
            const resumable = new Resumable({
                target: `${env.REACT_APP_API_URL}/classes/${data.id}/upload-video`,
                chunkSize: 1 * 1024 * 1024,
                uploadMethod: "POST",
                simultaneousUploads: 1,
                testChunks: false,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                }
            });
    
            await new Promise((resolve, reject) => {

                setShowProgressBar(true);

                resumable.on('fileAdded', (file) => {
                    console.log('File added:', file.fileName);
                    resumable.upload();
                });

                resumable.on('fileSuccess', (_: any, response: string) => {
                    console.log('Upload successful:', response);
                    resolve(JSON.parse(response));
                });
    
                resumable.on('fileError', (_, message) => {
                    console.error('Upload error:', message);
                    toast.error("Ocorreu um erro inesperado ao tentar fazer o upload do arquivo");
                    reject(new Error(message));
                });
    
                resumable.on('error', (message, file) => {
                    console.error('General error:', message, file);
                    toast.error("Um erro inesperado aconteceu durante o upload do vídeo");
                    reject(new Error(message));
                });
    
                resumable.on('progress', () => {
                    setProgress((resumable.progress() * 100));
                });
    
                resumable.addFile(values.video_file);
            });

            setShowProgressBar(false);
    
            onChange();
            toast.success("Vídeo adicionado com sucesso!");
            setOpen(false);
    
        } catch(error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao fazer upload do vídeo');
            setShowProgressBar(false);
            setProgress(0);
        } finally {
            setIsLoading(false);
        }
    }

    function onOpenChange(value: boolean) {
        if (!value) {
          form.reset();
        }
    
        setOpen(value)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button
                    size={'icon'}
                    variant={'ghost'}
                    onClick={(e) => e.stopPropagation()}
                >
                   <Play className="h-4 w-4" /> 
                </Button>
            </DialogTrigger>
            <DialogContent className="p-0">
                <ScrollArea className="h-full max-h-[80vh]">
                    <div className="max-w-lg p-6">
                        <DialogHeader>
                            <DialogTitle className="font-poppins">
                                Upload do vídeo
                            </DialogTitle>
                            <DialogDescription>
                                Faça o upload da sua aula do curso
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onsubmit)}
                                className="mt-4 space-y-4 px-1"
                            >
                                <FormField
                                    control={form.control}
                                    name="video_file"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Vídeo:</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    placeholder="Selecione o arquivo"
                                                    accept="video/*"
                                                    onChange={(e) => {
                                                        form.setValue('video_file', e.target.files?.[0])
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                { showProgressBar && (
                                    <div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="h-2.5 rounded-full transition-all duration-300"
                                                style={{width: `${progress}%`, backgroundColor: `hsl(var(--primary))`}}
                                            />
                                        </div>
                                        <p className="text-sm text-gray-500 text-center mt-5">
                                            {Math.round(progress)}% Concluído
                                        </p>
                                        <p className="text-sm text-gray-500 text-center">( Não feche essa tela até finalizar )</p>
                                    </div>
                                )}
                                <DialogFooter>
                                    <Button type='submit' disabled={isLoading}>
                                        {isLoading ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin text-white"/>
                                        ) : (
                                            'Criar'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                    <ScrollBar orientation="vertical" className="bg-transparent"/>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}