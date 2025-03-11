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
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

const formSchema = z
  .object({
    title: z.string({
      required_error: 'O nome do curso é obrigatório.',
    }),
    is_pay: z.boolean().default(false),
    price: z.coerce.number().optional(),
    promotional_price: z.coerce.number().optional(),
    thumbnail: z.any(),
  })
  .superRefine((data, ctx) => {
    if (data.is_pay) {
      if (data.price === undefined || isNaN(data.price)) {
        ctx.addIssue({
          path: ['price'],
          message:
            "O preço do curso é obrigatório quando 'É Pago' está marcado.",
          code: 'custom',
        })
      }
      if (
        data.promotional_price === undefined ||
        isNaN(data.promotional_price)
      ) {
        ctx.addIssue({
          path: ['promotional_price'],
          message:
            "O preço promocional é obrigatório quando 'É Pago' está marcado.",
          code: 'custom',
        })
      }
    }
  })

interface Props {
  onCreate: () => void
}

interface FormData {
  title: string
  is_pay: boolean
  price?: number
  promotional_price?: number
  thumbnail?: File
}

export function CreateModal({ onCreate }: Props) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      is_pay: false,
    },
  })

  const [isPay, setIsPay] = useState(form.getValues('is_pay'))

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('is_pay', values.is_pay ? '1' : '0')
      formData.append('price', values.price?.toString() || '0')
      formData.append(
        'promotional_price',
        values.promotional_price?.toString() || '0',
      )
      if (values.thumbnail) {
        formData.append('thumbnail', values.thumbnail)
      }

      await api.post('/courses-management', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      onCreate()
      toast.success('Curso criado com sucesso')
      setOpen(false)
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

  const handleImageChange = useCallback(
    (file: File | null) => {
      if (file) {
        form.setValue('thumbnail', file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        form.setValue('thumbnail', undefined)
        setPreviewUrl(null)
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

  function handleChangeIsPay(data: FormData) {
    setIsPay(data.is_pay)
  }

  useEffect(() => {
    if (isPay) {
      form.setValue('price', 0)
      form.setValue('promotional_price', 0)
    }
  }, [isPay, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Criar curso
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-poppins">Criar curso</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para criar um novo curso.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="updateCourseform"
            onSubmit={form.handleSubmit(onSubmit)}
            onChange={() => handleChangeIsPay(form.getValues())}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome de exibição do curso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_pay"
              render={({ field }) => {
                const { value, ...rest } = field
                return (
                  <FormItem>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={value}
                        className="me-2"
                        {...rest}
                      />
                    </FormControl>
                    <FormLabel>É Pago</FormLabel>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            {isPay ? (
              <>
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
              </>
            ) : null}

            <FormField
              control={form.control}
              name="thumbnail"
              render={() => (
                <FormItem>
                  <FormLabel>Imagem do curso</FormLabel>
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
                        aria-label="Upload imagem do curso"
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
          </form>
        </Form>
        <DialogFooter>
          <Button form="updateCourseform" type="submit" disabled={isLoading}>
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
