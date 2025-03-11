import { Link, useNavigate } from 'react-router-dom'
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
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useHookFormMask } from 'use-mask-input'
import { api } from '@/services/api'
import { AxiosError } from 'axios'

const formSchema = z
  .object({
    name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
    cpf: z.string().refine((value) => value.replace(/\D/g, '').length === 11, {
      message: 'Insira um CPF válido',
    }),
    email: z.string().email('Insira um email válido'),
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z
      .string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const registerWithMask = useHookFormMask(form.register)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      await api.post('/register', values)

      toast.success('Cadastro efetuado com sucesso!', {
        description: 'Você será redirecionado para a página de login',
      })

      await new Promise((resolve) => setTimeout(resolve, 3000))
      navigate('/login')
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
      <div className="hidden bg-muted lg:block">
        <img
          src="/auth.png"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex items-center justify-center p-6 sm:px-0 sm:py-12">
        <div className="mx-auto grid w-full max-w-sm gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Cadastro</h1>
            <p className="text-muted-foreground">
              Insira seus dados para criar uma conta.
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={() => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        {...registerWithMask('cpf', ['999.999.999-99'], {
                          required: true,
                        })}
                        placeholder="XXX.XXX.XXX-XX"
                        minLength={14}
                      />
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
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
                    <FormLabel>Confirmar senha</FormLabel>
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
                  'Cadastrar'
                )}
              </Button>
            </form>
            <div className="text-center text-sm">
              Já possui uma conta?{' '}
              <Link to="/login" className="text-primary underline">
                Entrar
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
