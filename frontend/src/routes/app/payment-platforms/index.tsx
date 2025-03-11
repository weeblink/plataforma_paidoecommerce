import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { PaymentPlatform } from '@/types/payment-platforms'
import { LoaderCircle } from 'lucide-react'
import { PlatformCard } from './components/platform-card'
import { AppmaxEditModal } from './components/appmax-edit-modal'
import { AssasEditModal } from './components/assas-edit-modal'
import { api } from '@/services/api'

export default function PaymentPlatformsPage() {
  const [platforms, setPlatforms] = useState<PaymentPlatform[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const [isAppMaxEditModalOpen, setIsAppMaxEditModalOpen] = useState(false)
  const [isAssasEditModalOpen, setIsAssasEditModalOpen] = useState(false)

  async function fetchData() {
    setIsLoading(true)
    setIsError(false)

    try {
      const { data } = await api.get<{ data: PaymentPlatform[] }>(
         '/credentials-checkout/available-checkouts',
      )
      setPlatforms(data.data);
    } catch {
      setIsError(true)
      toast.error('Ocorreu um erro ao carregar as plataformas de pagamento')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSelectPlatform(platform: PaymentPlatform) {
    // Implementar a lógica de seleção da plataforma de pagamento e no final rodar o
    // método fetchData() para atualizar a lista de plataformas de pagamento
    // Talvez rodar um modal de confirmação!
    console.log(platform)
  }

  function handleEditPlatform(platform: PaymentPlatform) {
    if (platform.name === 'AppMax') {
      setIsAppMaxEditModalOpen(true)
    }

    if (platform.name === 'Asaas') {
      setIsAssasEditModalOpen(true)
    }
  }

  function handleDeletePlatform(platform: PaymentPlatform) {
    // Implementar a lógica de exclusão da plataforma de pagamento e no final rodar o
    // método fetchData() para atualizar a lista de plataformas de pagamento
    // Talvez rodar um modal de confirmação!
    console.log(platform)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div>
      <h1 className="font-poppins text-2xl font-medium">
        Gerenciar plataformas de pagamento
      </h1>
      <p className="mt-1 text-gray-500">
        Gerencie as plataformas de pagamento disponíveis para os clientes,
        clique no card da plataforma para selecionar a plataforma de pagamento.
      </p>

      {isLoading && (
        <div className="mt-4 flex items-center justify-center">
          <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <div className="mt-4">
          <p>Ocorreu um erro ao carregar as informações</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="mt-8">
          {platforms.length === 0 && (
            <div>
              <p>Nenhuma plataforma de pagamento encontrada</p>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4">
            {platforms.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                onSelect={handleSelectPlatform}
                onEdit={handleEditPlatform}
                onDelete={handleDeletePlatform}
              />
            ))}
          </div>
        </div>
      )}

      <AppmaxEditModal
        open={isAppMaxEditModalOpen}
        setOpen={setIsAppMaxEditModalOpen}
      />

      <AssasEditModal
        open={isAssasEditModalOpen}
        setOpen={setIsAssasEditModalOpen}
      />
    </div>
  )
}
