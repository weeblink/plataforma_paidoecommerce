import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useLoaderData } from 'react-router-dom'
import type { ExtraProduct } from '@/types/extra'
import PDFReader from '@/components/pdf-reader'
import {api} from "@/services/api.ts";

export default function ExtraProductDetailsPage() {
  const [product, setProduct] = useState<ExtraProduct>({} as ExtraProduct)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const productId = useLoaderData() as number

  async function fetchData() {
    setIsLoading(true)
    try {
      const { data } = await api.get<{ data: ExtraProduct }>(
        `/extras/${productId}`,
      )
      setProduct(data.data)
    } catch {
      toast.error('Ocorreu um erro ao carregar os detalhes do produto')
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  function goBack() {
    window.history.back()
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="mt-4 flex items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mt-4">
        <p>Ocorreu um erro ao carregar os detalhes do produto</p>
      </div>
    )
  }

  if (Object.keys(product).length === 0) return null

  return (
    <div className="h-full">
      <button onClick={goBack} className="mb-2 flex items-center text-sm">
        <ArrowLeft className="mr-2 size-4" /> Voltar
      </button>

      <h1 className="font-poppins text-2xl font-medium">{product.title}</h1>

      <div className="mt-4">
        <PDFReader fileId={product.id} />
      </div>
    </div>
  )
}
