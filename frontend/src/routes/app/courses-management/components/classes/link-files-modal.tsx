import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { LoaderCircle, X, Paperclip, File } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { formatBytes } from '@/lib/format-bytes'
import type {
  ClassFile,
  CourseManagementClass,
} from '@/types/course-management'
import { AxiosError } from 'axios'
import { api } from '@/services/api'
import { toast } from 'sonner'

const formSchema = z.object({
  title: z.string({
    required_error: 'O nome do curso é obrigatório.',
  }),
  file: z.any(),
})

interface Props {
  data: CourseManagementClass
  onChange: () => void
}

export function LinkFilesClassModal({ data, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [files, setFiles] = useState<ClassFile[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function fetchData() {
    setIsLoading(true)

    try {
      const { data: response } = await api.get<{ data: ClassFile[] }>(
        `/attachments/${data.id}`,
      )

      setFiles(response.data)
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao buscar os arquivos da aula'

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!file) {
      toast.warning('Selecione um arquivo para adicionar a aula')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', values.title)
      await api.post(`/attachments/${data.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast.success('Arquivo editado com sucesso')
      fetchData()
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao adicionar o arquivo a aula'

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
      setIsSubmitting(false)
    }
  }

  function handleFileChange(selectedFile: File | null) {
    if (!selectedFile) {
      return
    }

    setFile(selectedFile)
  }

  async function handleRemoveFile(id: string) {
    try {
      await api.delete(`/attachments/${id}`)

      toast.success('Arquivo removido com sucesso')
      fetchData()
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao remover o arquivo da aula'

      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }

        if (!error.response?.data?.message && error.response?.data?.error) {
          errorMessage = error.response.data.error
        }
      }

      toast.error(errorMessage)
    }
  }

  function onOpenChange(value: boolean) {
    if (!value) {
      form.reset()
      if (data.files.length !== files.length) {
        onChange()
      }
      setFiles([])
    }

    setOpen(value)
  }

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => e.stopPropagation()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <ScrollArea className="h-full max-h-[80vh]">
          <div className="max-w-lg p-6">
            <DialogHeader>
              <DialogTitle className="font-poppins">
                Gerenciar arquivos da aula
              </DialogTitle>
              <DialogDescription>
                Gerencie os arquivos da aula <strong>{data.title}</strong>.
              </DialogDescription>
            </DialogHeader>

            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}

            {!isLoading && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-4 space-y-4 px-1"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do arquivo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="file"
                      render={() => (
                        <FormItem>
                          <FormLabel>Arquivo</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              onChange={(e) =>
                                handleFileChange(e.target.files?.[0] || null)
                              }
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="sm"
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <LoaderCircle className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      'Adicionar'
                    )}
                  </Button>

                  <div className="space-y-2">
                    <Label>Arquivos selecionados</Label>
                    {files.length === 0 && (
                      <p className="text-sm text-gray-500">
                        Nenhum arquivo selecionado
                      </p>
                    )}

                    {files.length > 0 && (
                      <div className="space-y-1">
                        {files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-start gap-2 rounded-md border p-4"
                          >
                            <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
                              <File className="size-3.5 text-primary" />
                            </div>

                            <div className="truncate">
                              <p className="truncate text-sm font-medium">
                                {file.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatBytes(Number(file.size) * 1024 * 1024)}
                              </p>
                            </div>

                            <button
                              onClick={() => handleRemoveFile(file.id)}
                              className="ml-auto"
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </form>
              </Form>
            )}

            <DialogFooter className="sticky bottom-4 mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Fechar
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
          <ScrollBar orientation="vertical" className="bg-transparent" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
