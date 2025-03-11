import { CheckCircle2 } from 'lucide-react'

export default function ConfirmationSection() {
  return (
    <div className="flex flex-col items-center justify-center focus-visible:ring-0">
      <CheckCircle2 className="h-16 w-16 text-green-500" />

      <div className="mt-4 space-y-2 text-center">
        <h1 className="text-lg font-bold">Email enviado com sucesso!</h1>
        <p className="text-sm text-foreground">
          Verifique sua caixa de entrada e siga as instruções para redefinir sua
          senha.
        </p>
      </div>
    </div>
  )
}
