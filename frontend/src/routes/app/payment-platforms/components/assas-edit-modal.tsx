import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoaderCircle } from 'lucide-react'
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
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
  api_key: z.string({
    required_error: 'O token é obrigatório.',
  }),
  token: z.string({
    required_error: 'O token é obrigatório.',
  }),
})

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

interface AssasInfo {
  api_key: string
  token: string
}

export function AssasEditModal({ open, setOpen }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {

      const data = {
        app_name: 'Asaas',
        app_id: 'asaas',
        ...values
      }

      await api.post(`/credentials-checkout/config`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      toast.success('Dados da plataforma editado com sucesso');
      setOpen(false);
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao editar os dados da plataforma'

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

  async function fetchData() {
    setIsLoading(true)
    setIsError(false)

    try {
      const { data } = await api.get<AssasInfo>(`/credentials-checkout/get-credential/asaas`)

      form.reset({
        api_key: data.data.api_key || '',
        token: data.data.token || '',
      })
    } catch {
      setIsError(true)
      toast.error('Ocorreu um erro ao carregar as informações da plataforma')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) fetchData()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-poppins">
            Editar dados do Assas
          </DialogTitle>
          <DialogDescription>
            Edite os dados da plataforma Assas para que os clientes possam
            realizar pagamentos
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm">
              Ocorreu um erro ao carregar as informações
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <Form {...form}>
              <form
                id="assasEditForm"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="api_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="API Key da plataforma"
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
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token validador</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Token validador da plataforma"
                          className="resize-none"
                          {...field}
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
                form="assasEditForm"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin text-white" />
                ) : (
                  'Salvar'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
