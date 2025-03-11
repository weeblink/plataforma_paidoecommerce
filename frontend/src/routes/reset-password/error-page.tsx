import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function ResetPasswordErrorPage() {
  return (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-primary">403</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          O link de redefinição de senha expirou ou é inválido!
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          Por favor, solicite um novo link de redefinição de senha.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-x-6 gap-y-4 sm:flex-row">
          <Link to="/">
            <Button>Voltar para a página inicial</Button>
          </Link>

          <a href="/">
            <Button variant="outline">Entrar em contato com suporte</Button>
          </a>
        </div>
      </div>
    </main>
  )
}
