import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { api } from '@/services/api';
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { LoaderCircle } from 'lucide-react'
import MentoringCard from './components/mentoring-card'

interface MentoringProps {
    id: string,
    image_url: string
}

export default function MentoringPage() {
  const [mentorings, setMentorings] = useState<MentoringProps[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  async function fetchData() {
    setIsLoading(true)

    try {
      const { data } = await api.get<{ data: MentoringProps[] }>('/mentorings')

      setMentorings(data.data);
    } catch {
      setIsError(true)
      toast.error('Ocorreu um erro ao carregar as mentorias')
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
          Galeria de mentorias
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
        <h1 className="font-poppins text-2xl font-medium">
          Galeria de mentorias
        </h1>

        <div className="mt-4">
          <p>Ocorreu um erro ao carregar as turmas</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-poppins text-2xl font-medium">
        Galeria de mentorias
      </h1>

      <div className="mt-8 w-full space-y-8">
        <div className="space-y-4">
          {mentorings.length === 0 ? (
            <p>Nenhuma mentoria disponível</p>
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {mentorings.map((mentoring) => (
                  <MentoringCard key={mentoring.id} mentoring={mentoring} />
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
