import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import CourseCard from './components/course-card'
import { api } from '@/services/api'
import type { Course } from '@/types/course'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { LoaderCircle } from 'lucide-react'

export default function CoursePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const { coursesLocked, coursesUnlocked, freeCourses } = useMemo(() => {
    const locked: Course[] = [];
    const unlocked: Course[] = [];
    const free: Course[] = [];

    courses.forEach((course) => {
      if( ! course.is_pay ){
        free.push(course);
      } else if (course.is_locked) {
        locked.push(course)
      } else {
        unlocked.push(course)
      }
    })

    return { coursesLocked: locked, coursesUnlocked: unlocked, freeCourses: free }
  }, [courses])

  async function fetchData() {
    setIsLoading(true)

    try {
      const { data } = await api.get<{ data: Course[] }>('/courses')
      
      setCourses(data.data)
    } catch {
      setIsError(true)
      toast.error('Ocorreu um erro ao carregar os cursos')
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
        <h1 className="font-poppins text-2xl font-medium">Galeria de cursos</h1>

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
      <h1 className="font-poppins text-2xl font-medium">Galeria de cursos</h1>

      <div className="mt-8 w-full space-y-8">
        {coursesUnlocked.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Meus cursos</h2>
              <Carousel className="w-full">
                <CarouselContent>
                  {coursesUnlocked.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
              </Carousel>
            </div>
        )}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Cursos gratuitos</h2>

          {freeCourses.length === 0 ? (
            <p>Nenhum curso disponível</p>
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {freeCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
            </Carousel>
          )}
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Cursos</h2>

          {coursesLocked.length === 0 ? (
            <p>Nenhum curso disponível</p>
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {coursesLocked.map((course) => (
                  <CourseCard key={course.id} course={course} />
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
