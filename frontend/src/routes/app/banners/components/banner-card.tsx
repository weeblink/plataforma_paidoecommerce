import { Calendar, ChevronDown, ChevronUp, Link } from 'lucide-react'
import { AxiosError } from 'axios'
import { api } from '@/services/api'
import { toast } from 'sonner'
import type { Banner } from '@/types/banner'
import { UpdateModal } from './update-modal'
import { DeleteModal } from './delete-modal'
import { Button } from '@/components/ui/button'
import moment from 'moment'

interface Props {
  banner: Banner
  banners: Banner[]
  index: number
  onRefresh: () => Promise<void>
}

export default function BannerCard({
  banner,
  onRefresh,
  index,
  banners,
}: Props) {
  async function handleSwap(direction: 'up' | 'down') {
    const index = banners.findIndex((item) => item.id === banner.id)
    const banner1_id = banner.id
    const banner2_id = banners[direction === 'up' ? index - 1 : index + 1].id

    try {
      await api.patch(`/banners/swap-order`, {
        banner1_id,
        banner2_id,
      })

      onRefresh()
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao trocar a posição dos banners'

      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }

        if (!error.response?.data?.message && error.response?.data?.error) {
          errorMessage = error.response.data.error
        }
      }

      toast.error(errorMessage)
    }
  }

  return (
    <div className="group relative max-w-screen-xl rounded-lg border bg-background text-card-foreground shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col gap-4 p-4">
        <img
          src={banner.image_url}
          alt={banner.alt}
          className="h-40 w-full rounded-lg object-cover sm:h-[200px] xl:h-[300px]"
        />

        <div className="flex-1 space-y-2">
          <h1 className="text-lg font-medium">{banner.title}</h1>

          <div className="flex flex-col gap-x-2 gap-y-1 lg:flex-row lg:items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
                <Link className="size-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold leading-none text-primary">
                Link de ação:
              </span>
            </div>
            <span className="text-sm">{banner.link_action}</span>
          </div>

          <div className="flex flex-col gap-x-2 gap-y-1 lg:flex-row lg:items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
                <Calendar className="size-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold leading-none text-primary">
                Data de criação:
              </span>
            </div>
            <span className="text-sm">
              {moment(banner.created_at).format('DD/MM/YYYY')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {index !== 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSwap('up')
                }}
                className="group-first"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}

            {index !== banners.length - 1 && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSwap('down')
                }}
                className="group-last"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <UpdateModal banner={banner} onUpdate={onRefresh} />
            <DeleteModal banner={banner} onDelete={onRefresh} />
          </div>
        </div>
      </div>
    </div>
  )
}
