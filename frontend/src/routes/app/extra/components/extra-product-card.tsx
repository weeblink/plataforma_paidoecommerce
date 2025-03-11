import { Card, CardContent } from '@/components/ui/card'
import { CarouselItem } from '@/components/ui/carousel'
import type { ExtraProduct } from '@/types/extra'
import { LockIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TypeUrl } from '../../payment'
import ProductDetails from '@/components/ProductDetails.tsx'

interface Props {
  product: ExtraProduct
}

export default function ExtraProductCard({ product }: Props) {
  return (
    <CarouselItem
      key={product.id}
      className="max-w-xs md:basis-1/2 lg:basis-1/3"
    >
      <Card className="border-none">
        <CardContent className="p-0">
          <div className="relative">
            {product.image_url ? (
              <Link to={`/extra/${product.id}`}>
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="h-100 w-full rounded-xl object-cover"
                />
              </Link>
            ) : (
              <div className="h-48 w-full rounded-lg rounded-b-none bg-secondary/20"></div>
            )}
            {product.is_locked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl rounded-b-none bg-black bg-opacity-50">
                <LockIcon className="h-12 w-12 text-white" />
                <div className={'mt-3'}>
                  <ProductDetails
                    title={product.title}
                    price={product.price}
                    promotional_price={product.promotional_price}
                    image_url={product.image_url}
                    linkBuy={`/payment/${TypeUrl.Extra}/${product.id}`}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </CarouselItem>
  )
}
