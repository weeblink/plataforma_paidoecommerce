import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { LoaderCircle } from 'lucide-react'
import type { ExtraProduct } from '@/types/extra'
import ExtraProductCard from './components/extra-product-card'
import {api} from "@/services/api.ts";

export default function ExtraProductsPage() {
  const [products, setProducts] = useState<ExtraProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const { productsLocked, productsUnlocked } = useMemo(() => {
    const locked: ExtraProduct[] = []
    const unlocked: ExtraProduct[] = []

    products.forEach((item) => {
      if (item.is_locked) {
        locked.push(item)
      } else {
        unlocked.push(item)
      }
    })

    return {
      productsLocked: locked,
      productsUnlocked: unlocked,
    }
  }, [products])

  async function fetchData() {
    setIsLoading(true)

    try {
      const { data } = await api.get<{ data: ExtraProduct[] }>('/extras')

      setProducts(data.data);
    } catch {
      setIsError(true)
      toast.error('Ocorreu um erro ao carregar os produtos')
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
        <h1 className="font-poppins text-2xl font-medium">Produtos</h1>

        <div className="mt-4 flex items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <h1 className="font-poppins text-2xl font-medium">Produtos</h1>

        <div className="mt-4">
          <p>Ocorreu um erro ao carregar os produtos extras</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-poppins text-2xl font-medium">Galeria de produtos</h1>

      <div className="mt-8 w-full space-y-8">

          {productsUnlocked.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Meus Produtos</h2>
                <Carousel className="w-full">
                  <CarouselContent>
                    {productsUnlocked.map((product) => (
                      <ExtraProductCard key={product.id} product={product} />
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                  <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
                </Carousel>
              </div>
          )}

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Produtos</h2>

          {productsLocked.length === 0 ? (
            <p>Nenhuma produto disponível</p>
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {productsLocked.map((product) => (
                  <ExtraProductCard key={product.id} product={product} />
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
            </Carousel>
          )}
        </div>
      </div>
    </div>
  )
}
