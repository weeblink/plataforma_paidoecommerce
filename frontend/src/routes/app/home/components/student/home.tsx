import { useAuth } from '@/hooks/auth'
import BannerCarousel from './banner-carousel'
import type { Course } from '@/types/course'
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import CourseCard from '@/routes/app/courses/components/course-card'
import type { ExtraProduct } from '@/types/extra'
import type { Banner } from '@/types/banner'
import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { LoaderCircle } from 'lucide-react'
import MentoringCard from '@/routes/app/mentoring/components/mentoring-card'
import ExtraProductCard from '@/routes/app/extra/components/extra-product-card'
import { Card } from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { cn } from '@/lib/utils'

interface MentoringProps {
  id: string
  image_url: string
}

export interface StudentData {
  courses: Course[]
  banners: Banner[]
  extras: ExtraProduct[]
  mentorings_groups: MentoringProps[]
}

export default function StudentHomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [data, setData] = useState<StudentData>({
    banners: [],
    courses: [],
    extras: [],
    mentorings_groups: [],
  } as StudentData)

  const { user } = useAuth()

  async function fetchData() {
    setIsLoading(true)

    try {
      const { data } = await api.get<{ data: StudentData }>(
        '/dashboard/student',
      )

      setData(data.data)
    } catch {
      setIsError(true)
      toast.error('Ocorreu um erro ao carregar as informações')
    } finally {
      setIsLoading(false)
    }
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
        <p>Ocorreu um erro ao carregar as informações</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative -my-5',
        data.courses.length === 0 &&
          data.mentorings_groups.length === 0 &&
          data.mentorings_groups.length === 0 &&
          'h-screen',
      )}
    >
      <BannerCarousel banners={data.banners} />

      <h1 className="pt-[400px] font-poppins text-2xl font-medium text-white">
        Olá {user?.name}
      </h1>
      <p className="mt-1 font-poppins text-white">
        Seja bem-vindo à nossa plataforma!
      </p>

      <div className="mt-8 space-y-8">
        {data.courses.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">Meus cursos</h2>
              <a className="text-sm text-white/70 underline" href="/courses">
                Ver mais
              </a>
            </div>
            <Carousel className="w-full">
              <CarouselContent>
                {data.courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
            </Carousel>
          </div>
        )}

        {data.mentorings_groups.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">Minhas mentorias</h2>
              <a className="text-sm text-white/70 underline" href="/mentoring">
                Ver mais
              </a>
            </div>
            <Carousel className="w-full">
              <CarouselContent>
                {data.mentorings_groups.map((mentoring) => (
                  <MentoringCard key={mentoring.id} mentoring={mentoring} />
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
            </Carousel>
          </div>
        )}

        {data.mentorings_groups.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">Meus produtos</h2>
              <a className="text-sm text-white/70 underline" href="/extra">
                Ver mais
              </a>
            </div>
            <Carousel className="w-full">
              <CarouselContent>
                {data.extras.map((extra) => (
                  <ExtraProductCard key={extra.id} product={extra} />
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
            </Carousel>
          </div>
        )}

        {data.courses.length === 0 &&
          data.mentorings_groups.length === 0 &&
          data.mentorings_groups.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-4">
              <Card className="m-3 p-3 py-8 text-center">
                <h3 className="text-2xl font-bold text-primary">Cursos</h3>
                <p className="mt-3">
                  Confira todos os cursos disponíveis em nossa plataforma e
                  comece a assistir
                </p>

                <a href="/courses">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4 bg-primary"
                  >
                    Conferir cursos
                  </Button>
                </a>
              </Card>
              <Card className="m-3 p-3 py-8 text-center">
                <h3 className="text-2xl font-bold text-primary">Mentorias</h3>
                <p className="mt-3">
                  Conheça todas as mentorias e turmas disponíveis para início
                  imediato
                </p>
                <a href="/mentoring">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4 bg-primary"
                  >
                    Conferir mentorias
                  </Button>
                </a>
              </Card>
              <Card className="m-3 p-3 py-8 text-center">
                <h3 className="text-2xl font-bold text-primary">Produtos</h3>
                <p className="mt-3">
                  Conheça os nossos produtos que podem te auxiliar durante as
                  suas tarefas diárias
                </p>
                <a href="/extra">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4 bg-primary"
                  >
                    Conferir produtos
                  </Button>
                </a>
              </Card>
            </div>
          )}
      </div>
    </div>
  )
}
