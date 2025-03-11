import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useState, type Dispatch, type SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AxiosError } from 'axios'
import ConfirmationSection from './confirmation-section'
import { api } from '@/services/api'

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const formSchema = z.object({
  email: z.string().email('Insira um email válido'),
})

export default function SendResetPasswordEmail({ open, setOpen }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSended, setIsSended] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      await api.post('/password/recover', values)

      toast.success('Email de recuperação de senha foi enviado com sucesso!', {
        description: 'Verifique sua caixa de entrada e siga as instruções',
      })

      setIsSended(true)
    } catch (error) {
      let errorMessage =
        'Ocorreu um erro ao enviar o email de recuperação de senha'

      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
      }

      form.setError('email', {
        type: 'manual',
        message: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        {isSended ? (
          <ConfirmationSection />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Enviar email para redefinir senha</DialogTitle>
              <DialogDescription>
                Insira seu email para receber um link de redefinição de senha.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      'Enviar'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
