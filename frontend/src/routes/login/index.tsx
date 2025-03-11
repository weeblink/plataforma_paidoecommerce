import { useAuth, type LoginResponse } from '@/hooks/auth'
import { Link, Navigate, useNavigate } from 'react-router-dom'
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
import SendResetPasswordEmail from './components/send-reset-password-email'

const formSchema = z.object({
  email: z.string().email('Insira um email válido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
})

export default function LoginPage() {
  const [
    isSendResetPasswordEmailModalOpen,
    setIsSendResetPasswordEmailModalOpen,
  ] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, handleLogin } = useAuth()

  const navigate = useNavigate()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    const data: LoginResponse = await handleLogin(values)

    setIsLoading(false)

    if (!data.status) {
      form.setError('password', {
        type: 'manual',
        message: data.message,
      })
      return
    }

    if( data.roleType === "ADMIN" )
      navigate('/courses-management');

    navigate('/')
  }

  if (user) {
    return <Navigate to="/" />
  }

  return (
    <>
      <div className="h-screen w-full lg:grid lg:grid-cols-2">
        <div className="flex items-center justify-center p-6 sm:px-0 sm:py-12">
          <div className="mx-auto grid w-full max-w-sm gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Entrar</h1>
              <p className="text-balance text-muted-foreground">
                Insira seu email e senha para ter acesso ao sistema.
              </p>
            </div>
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
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Senha</FormLabel>
                        <button
                          onClick={() =>
                            setIsSendResetPasswordEmailModalOpen(true)
                          }
                          type="button"
                          className="ml-auto inline-block text-sm text-gray-500 underline"
                        >
                          Esqueceu a senha?
                        </button>
                      </div>

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
                    'Entrar'
                  )}
                </Button>
              </form>
              <div className="text-center text-sm">
                Não possui conta?{' '}
                <Link to="/register" className="text-primary underline">
                  Cadastre-se
                </Link>
              </div>
            </Form>
          </div>
        </div>
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

      <SendResetPasswordEmail
        open={isSendResetPasswordEmailModalOpen}
        setOpen={setIsSendResetPasswordEmailModalOpen}
      />
    </>
  )
}
