import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useState } from 'react'
import { CircleCheck, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Link, useLoaderData } from 'react-router-dom'
import { api } from '@/services/api'
import { AxiosError } from 'axios'

const formSchema = z
  .object({
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z
      .string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres'),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)

  const data = useLoaderData() as { token: string }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 2000))
    try {
      await api.put('/password/reset', {
        ...values,
        token: data.token,
      })

      toast.success('Senha atualizada com sucesso!')

      setHasChanged(true)
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao cadastrar usuário'

      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
      }

      form.setError('confirmPassword', {
        type: 'manual',
        message: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen w-full lg:grid lg:grid-cols-2">
      {hasChanged ? (
        <div className="mx-auto flex w-full max-w-md items-center justify-center p-6 sm:px-0 sm:py-12">
          <div className="flex flex-col items-center gap-2 text-center">
            <CircleCheck className="text-success size-12 text-primary" />

            <h1 className="text-3xl font-bold">
              Senha redefinida com sucesso!
            </h1>
            <p className="text-balance text-muted-foreground">
              Sua senha foi redefinida com sucesso. Você já pode acessar sua
              conta.
            </p>
            <Link to="/login" className="mt-2 w-full">
              <Button type="submit" className="w-full">
                Voltar para o login
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-6 sm:px-0 sm:py-12">
          <div className="mx-auto grid w-full max-w-sm gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Redefinir senha</h1>
              <p className="text-balance text-muted-foreground">
                Insira sua nova senha para redefini-la.
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova senha</FormLabel>
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirme a senha</FormLabel>
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
                    'Redefinir'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      )}

      <div className="hidden bg-muted lg:block">
        <img
          src="/auth.png"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
