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
import { Input } from '@/components/ui/input'
import { Plus, LoaderCircle } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useEffect, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { api } from '@/services/api'

const formSchema = z.object({
  title: z.string({
    required_error: 'O nome do curso é obrigatório.',
  }),
  description: z.string({
    required_error: 'A descrição do curso é obrigatória.',
  }),
})

interface Props {
  moduleId: string
  onCreate: () => void
}

export function CreateCourseClassModal({ moduleId, onCreate }: Props) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const formData = new FormData()

      formData.append('title', values.title)
      formData.append('description', values.description)

      await api.post(`/classes/${moduleId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast.success('Aula criada com sucesso')
      onCreate()
      setOpen(false)
    } catch (error) {
      console.log(error)

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
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // const r = new Resumable({
    //   target: '/api/photo/redeem-upload-token',
    //   query: { upload_token: 'my_token' },
    // })
    // console.log(r)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => e.stopPropagation()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <ScrollArea className="h-full max-h-[80vh]">
          <div className="max-w-lg p-6">
            <DialogHeader>
              <DialogTitle className="font-poppins">Criar aula</DialogTitle>
              <DialogDescription>
                Crie uma nova aula para o módulo.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-4 space-y-4 px-1"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da aula" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrição da aula"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <LoaderCircle className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      'Criar'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
          <ScrollBar orientation="vertical" className="bg-transparent" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
