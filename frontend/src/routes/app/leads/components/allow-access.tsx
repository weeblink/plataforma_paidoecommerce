import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { SelectTrigger } from "@radix-ui/react-select";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { CourseManagement } from "@/types/course-management";
import { MentoringGroup } from "@/types/mentoring-management";
import { ExtraManagement } from "@/types/extra-management";

interface Props {
    open: boolean,
    setOpen: (value:boolean) => void,
    userId: string;
    onCreate: () => void;
}

const formSchema = z.object({
    type: z.enum(['course', 'mentorship', 'extra']),
})

export default function AllowAccess({
    open,
    setOpen,
    userId,
    onCreate
}: Props){

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [productInfo, setProductInfo] = useState<{product_id: string, title: string}[]>([]);

    const [searchParam, setSearchParam] = useState('');
    const [typeSearch, setTypeSearch] = useState('course');

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<string>('');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    async function onSubmit( values: z.infer<typeof formSchema> ){

        if(!selectedProduct){
            toast.error("Você deve selecionar um produto antes de prosseguir");
            return;
        }

        setIsLoading(true);

        try {

            await api.post(`/leads/${userId}/allow-access`, {
                course_id: values.type === 'course' ? selectedProduct : null,
                extra_id: values.type === 'extra' ? selectedProduct : null,
                group_id: values.type === 'mentorship' ? selectedProduct : null,
                type_product: values.type
            })

            onCreate();
            toast.success("Conteúdo adicionado corretamente");
            setOpen(false);

        } catch (error) {
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
        } finally {
            setIsLoading(false)
        }
    }

    async function fetchData( type: string ){

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        setIsLoading(true);

        try {

            searchTimeoutRef.current = setTimeout(async () => {
                if( type === 'course' ){
                    const {data} = await api.get<{data: CourseManagement[]}>(`/courses-management/search?q=${searchParam}`);
                    setProductInfo(data.data.map((d) => {
                        return {product_id: d.id, title: d.title}
                    }));
                }

                if( type === 'mentorship' ){
                    const {data} = await api.get<{data: MentoringGroup[]}>(`/mentoring-management/search?q=${searchParam}`);
                    setProductInfo(data.data.map((d) => {
                        return {product_id: d.id, title: d.title}
                    }));
                }

                if( type === 'extra' ){
                    const {data} = await api.get<{data: ExtraManagement[]}>(`/extras-management/search?q=${searchParam}`);
                    setProductInfo(data.data.map((d) => {
                        return {product_id: d.id, title: d.title}
                    }));
                }
            }, 400);

        } catch (error) {
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
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (searchParam && searchParam.length >= 2) {
            fetchData(typeSearch);
        }
    }, [searchParam])

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-poppins">Adicionar novo conteúdo</DialogTitle>
                    <DialogDescription>
                        Adicione cursos, mentorias e produtos extras ao seu menu para ser exibido na área de membros
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id="addContentLayout"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 py-4"
                    >
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Tipo de produto</FormLabel>
                                    <Select
                                        onValueChange={(newValue) => {
                                            setTypeSearch(newValue)
                                            fetchData(newValue);
                                            field.onChange(newValue)
                                        }}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className={'shadow-md border p-2 px-4 rounded-lg'}>
                                                <SelectValue placeholder="Selecione o tipo de produto que deseja incluir"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="course">Cursos</SelectItem>
                                            <SelectItem value="mentorship">Mentoria</SelectItem>
                                            <SelectItem value="extra">Produtos extras</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div>
                            <h5 className={'pb-2 text-sm'}>Busque pelo produto desejado:</h5>
                            <Input
                                placeholder="Busque pelo produto desejado"
                                value={searchParam}
                                onChange={(e) => setSearchParam(e.target.value)}
                            />
                            <div className="mt-10">
                                <div className={'pb-2 text-primary'}>
                                    Resultados:
                                </div>
                                {isLoading ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                                ): (
                                    <div className={'flex flex-col gap-4 max-h-[250px] overflow-y-auto'}>
                                        {productInfo.length === 0 ? (
                                            <div>
                                                Nenhum registro encontrado
                                            </div>
                                        ) : (
                                            productInfo.map((product) => (
                                                <div 
                                                    className={`rounded-lg shadow-md border p-2 text-sm cursor-pointer ${product.product_id === selectedProduct ? 'border border-primary' : ''}`}
                                                    onClick={() => setSelectedProduct(product.product_id)}
                                                >
                                                    {product.title}
                                                </div>
                                            ))
                                        )}                                        
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                    <DialogFooter>
                        <Button form="addContentLayout" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                            ) : (
                                'Adicionar'
                            )}
                        </Button>
                    </DialogFooter>
                </Form>                
            </DialogContent>
        </Dialog>
    )
}