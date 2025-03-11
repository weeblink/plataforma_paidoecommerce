import { Button } from '@/components/ui/button'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError()

  function getTitle() {
    if (!isRouteErrorResponse(error)) return 'Opss...'

    switch (error.status) {
      case 404:
        return 'Página não encontrada'
      case 403:
        return 'Acesso negado'
      case 500:
        return 'Opss...'
      default:
        return 'Opss...'
    }
  }

  function getDescription() {
    if (!isRouteErrorResponse(error))
      return 'Desculpe, ocorreu um erro inesperado.'

    switch (error.status) {
      case 404:
        return 'Desculpe, a página que você está procurando não foi encontrada.'
      case 403:
        return 'Desculpe, você não tem permissão para acessar esta página.'
      case 500:
        return 'Desculpe, ocorreu um erro inesperado.'
      default:
        return 'Desculpe, ocorreu um erro inesperado.'
    }
  }

  return (
    <main className="grid min-h-full place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-primary">
          {isRouteErrorResponse(error) ? error.status : 500}
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          {getTitle()}
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-400">
          {getDescription()}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-x-6 gap-y-4 sm:flex-row">
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
