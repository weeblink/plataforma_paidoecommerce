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
import { Plus, LoaderCircle, Upload, X } from 'lucide-react'
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
import { useCallback, useState } from 'react'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

const formSchema = z.object({
  title: z.string({
    required_error: 'O nome da mentoria é obrigatório.',
  }),
  price: z.coerce.number({
    invalid_type_error: 'O preço deve ser um número.',
    required_error: 'O preço é obrigatório.',
  }),
  promotional_price: z.coerce.number({
    invalid_type_error: 'O preço deve ser um número.',
    required_error: 'O preço é obrigatório.',
  }),
  image_url: z.any(),
  file_url: z.any(),
})

interface Props {
  onCreate: () => void
}

export function CreateModal({ onCreate }: Props) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('price', String(values.price))
      formData.append('promotional_price', String(values.promotional_price))

      if (values.file_url) {
        formData.append('file_url', values.file_url)
        console.log('file_url', values.file_url)
      }

      if (values.image_url) {
        formData.append('image_url', values.image_url)
      }

      await api.post('/extras-management', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      onCreate()
      toast.success('Produto extra criado com sucesso')
      setOpen(false)
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao criar o produto extra'

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

  const handleImageChange = useCallback(
    (file: File | null) => {
      if (file) {
        form.setValue('image_url', file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        form.setValue('image_url', undefined)
        setPreviewUrl(null)
      }
    },
    [form],
  )

  const handleFileChange = useCallback(
    (file: File | null) => {
      if (file) {
        form.setValue('file_url', file)
      } else {
        form.setValue('file_url', undefined)
      }
    },
    [form],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        handleImageChange(file)
      }
    },
    [handleImageChange],
  )

  function onOpenChange(value: boolean) {
    if (!value) {
      form.reset()
      setPreviewUrl(null)
    }

    setOpen(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Criar produto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-poppins">
            Criar produto extra
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para criar um produto extra.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="createExtraProductForm"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome de exibição do produto"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input placeholder="XXX" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="promotional_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço promocional</FormLabel>
                    <FormControl>
                      <Input placeholder="XXX" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image_url"
              render={() => (
                <FormItem>
                  <FormLabel>Imagem do produto</FormLabel>
                  <FormControl>
                    <div
                      className={`relative flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                        isDragging
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageChange(e.target.files?.[0] || null)
                        }
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        aria-label="Upload imagem"
                      />
                      {previewUrl ? (
                        <div className="relative h-full w-full">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-full w-full rounded-lg object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2"
                            onClick={() => handleImageChange(null)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remover imagem</span>
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">
                            Arraste e solte uma imagem aqui ou clique para
                            selecionar
                          </p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file_url"
              render={() => (
                <FormItem>
                  <FormLabel>Arquivo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Arquivo do produto"
                      type="file"
                      required
                      onChange={(e) =>
                        handleFileChange(e.target.files?.[0] || null)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            form="createExtraProductForm"
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
  )
}
