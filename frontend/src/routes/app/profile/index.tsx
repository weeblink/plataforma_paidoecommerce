import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { formatCPF } from '@/lib/format-cpf'
import { formatPhone } from '@/lib/format-phone'
import { AxiosError } from 'axios'
import type { Profile } from '@/types/profile'

const formSchema = z
  .object({
    id: z.number(),
    name: z.string({
      required_error: 'O nome é obrigatório.',
    }),
    email: z
      .string({
        required_error: 'O email é obrigatório.',
      })
      .email({
        message: 'O email é inválido.',
      }),
    phone: z
      .string({
        required_error: 'O telefone é obrigatório.',
      })
      .min(15, 'Insira um número de telefone válido'),
    cpf: z.string(),
    password: z
      .string({
        required_error: 'A senha é obrigatória.',
      })
      .min(8, {
        message: 'A senha deve ter no mínimo 8 caracteres.',
      }),
    confirmPassword: z.string({
      required_error: 'A confirmação de senha é obrigatória.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function fetchData() {
    setIsLoading(true)

    try {
      const { data } = await api.get<{ data: Profile }>('/profile')

      form.reset({
        id: data.data.id,
        cpf: formatCPF(data.data.cpf),
        email: data.data.email,
        name: data.data.name,
        phone: data.data.phone || undefined,
      })
    } catch {
      toast.error('Ocorreu um erro ao carregar o perfil')
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const requestBody = {
        name: values.name,
        phone: values.phone,
        password: values.password,
        confirmPassword: values.confirmPassword,
      }

      await api.put(`/profile/${values.id}`, requestBody)

      toast.success('Perfil editado com sucesso')
      fetchData()
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao editar o perfil'

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

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div>
        <h1 className="font-poppins text-2xl font-medium">Meu perfil</h1>

        <div className="mt-4 flex items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <h1 className="font-poppins text-2xl font-medium">Meu perfil</h1>

        <div className="mt-4">
          <p>Ocorreu um erro ao carregar o perfil</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-poppins text-2xl font-medium">Meu perfil</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="João, Miguel..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@exemplo.com"
                      type="email"
                      disabled
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(99) 99999-9999"
                      {...field}
                      value={formatPhone(field.value)}
                      onChange={(e) =>
                        field.onChange(formatPhone(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input placeholder="999.999.999-99" disabled {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Digite sua nova senha"
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
                  <FormLabel>Confirmar senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirme sua nova senha"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin text-white" />
              ) : (
                'Editar'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
