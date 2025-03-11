import { cn } from '@/lib/utils'
import type { PaymentPlatform } from '@/types/payment-platforms'
import { Pencil } from 'lucide-react'

interface Props {
  platform: PaymentPlatform
  onSelect: (platform: PaymentPlatform) => void
  onEdit: (platform: PaymentPlatform) => void
  onDelete: (platform: PaymentPlatform) => void
}

export function PlatformCard({ platform, onSelect, onEdit }: Props) {
  return (
    <div
      className={cn('cursor-pointer rounded-lg border p-4 shadow-md', {
        'border-green-600': platform.is_selected,
      })}
      onClick={() => onSelect(platform)}
    >
      <div className="flex items-start justify-between">
        <img
          src={platform.image_url}
          alt={platform.name}
          className="h-10 w-10 rounded-lg object-contain"
        />

        <div className="flex items-center gap-2">
          <button
            aria-label="Editar plataforma"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(platform)
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          {/* <button
            aria-label="Excluir plataforma"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(platform)
            }}
          >
            <Trash className="h-4 w-4 text-red-600" />
          </button> */}
        </div>
      </div>

      <h1 className="mt-2 font-poppins font-semibold">{platform.name}</h1>

      <div className="mt-2 flex justify-end">
        {platform.is_selected ? (
          <span className="rounded-full bg-primary px-2 py-1 text-xs text-white">
            Selecionado
          </span>
        ) : (
          <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-800">
            Não selecionado
          </span>
        )}
      </div>
    </div>
  )
}
