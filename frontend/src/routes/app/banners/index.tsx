import { CreateModal } from './components/create-modal'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Banner } from '@/types/banner'
import { LoaderCircle } from 'lucide-react'
import BannerCard from './components/banner-card'
import { api } from '@/services/api'

export default function BannersManagementPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  async function fetchData() {
    setIsLoading(true)

    try {
      const { data } = await api.get<{ data: Banner[] }>('/banners')

      setBanners(data.data)
    } catch {
      setIsError(true)
      toast.error('Ocorreu um erro ao carregar os banners')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div>
        <h1 className="font-poppins text-2xl font-medium">
          Galeria de banners
        </h1>

        <div className="mt-4 flex items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <h1 className="font-poppins text-2xl font-medium">Galeria de cursos</h1>

        <div className="mt-4">
          <p>Ocorreu um erro ao carregar os cursos</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between gap-2">
        <h1 className="font-poppins text-2xl font-medium">Gerenciar banners</h1>

        <CreateModal onCreate={fetchData} />
      </div>

      {banners.length === 0 && (
        <p className="mt-2 text-sm">Nenhum banner cadastrado</p>
      )}

      <div className="mt-8">
        <div className="space-y-4">
          {banners.map((banner, i) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              index={i}
              banners={banners}
              onRefresh={fetchData}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
