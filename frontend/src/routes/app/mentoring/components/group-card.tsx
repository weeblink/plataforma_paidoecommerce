import { Card, CardContent } from '@/components/ui/card'
import { CarouselItem } from '@/components/ui/carousel'
import type { MentoringExibition } from '@/types/mentoring-management'
import { Ban, CalendarIcon, LockIcon } from 'lucide-react'
import moment from 'moment'
import { Link } from 'react-router-dom'
import ProductDetails from '@/components/ProductDetails.tsx'

export enum TypeUrl {
  Course = 'course',
  Mentoring = 'mentoring',
  Extra = 'extra',
}

interface Props {
  group: MentoringExibition
}

export default function GroupCard({ group }: Props) {
  function isAvailable(
    group: MentoringExibition,
    key: keyof MentoringExibition,
  ) {
    const currentDate = new Date()
    const targetDate = new Date(group[key] as string)

    return currentDate < targetDate
  }

  return (
    <CarouselItem key={group.id} className="max-w-xs md:basis-1/2 lg:basis-1/3">
      <Card>
        <CardContent className="p-0">
          <div className="relative">
            <Link to={`/mentoring-details/${group.id}`}>
              {group.image_url ? (
                <img
                  src={group.image_url}
                  alt={group.title}
                  className="h-100 w-full rounded object-cover"
                />
              ) : (
                <div className="h-48 w-full rounded-lg rounded-b-none bg-secondary/20"></div>
              )}
            </Link>

            {!group.is_locked && isAvailable(group, 'expiration_date') ? (
              <div className="p-2">
                <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
                      <CalendarIcon className="size-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold leading-none text-primary">
                      Data de expiração:
                    </span>
                  </div>
                  <span className="truncate text-sm">
                    {moment(group.purchase_deadline).format('DD/MM/YYYY')}
                  </span>
                </div>
              </div>
            ) : group.is_locked && isAvailable(group, 'purchase_deadline') ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl rounded-b-none bg-black bg-opacity-50">
                <LockIcon className="h-12 w-12 text-white" />
                <div className={'mt-3'}>
                  <ProductDetails
                    title={group.title}
                    price={group.price}
                    promotional_price={group.price_promotional}
                    image_url={group.image_url}
                    linkBuy={`/payment/${TypeUrl.Mentoring}/${group.id}`}
                  />
                </div>
              </div>
            ) : (
              ((!group.is_locked && !isAvailable(group, 'expiration_date')) ||
                (group.is_locked &&
                  !isAvailable(group, 'purchase_deadline'))) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl rounded-b-none bg-gray-600 bg-opacity-50 text-white">
                  <Ban className="h-12 w-12" />
                  <div className={'mt-2 px-10 text-center'}>
                    <span className={'font-bold'}>
                      {group.is_locked
                        ? 'Tempo limite de compra finalizado'
                        : 'Tempo de expiração atingido'}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </CarouselItem>
  )
}
