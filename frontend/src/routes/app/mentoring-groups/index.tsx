import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel.tsx'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { api } from '@/services/api.ts'
import { MentoringExibition } from '@/types/mentoring-management'
import { toast } from 'sonner'
import GroupCard from '@/routes/app/mentoring/components/group-card.tsx'

export default function MentoringGroupPage() {
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [groups, setGroups] = useState<MentoringExibition[]>([])
  const [isError, setIsError] = useState(false)

  const { groupsLocked, groupsUnlocked } = useMemo(() => {
    const locked: MentoringExibition[] = []
    const unlocked: MentoringExibition[] = []

    groups.forEach((item) => {
      if (item.is_locked) {
        locked.push(item)
      } else {
        unlocked.push(item)
      }
    })

    return {
      groupsLocked: locked,
      groupsUnlocked: unlocked,
    }
  }, [groups])

  async function fetchData() {
    setIsLoading(true)

    try {
      const { data } = await api.get<{ data: MentoringExibition[] }>(
        `/mentorings/${id}/groups`,
      )

      setGroups(data.data)
    } catch {
      setIsError(true)
      toast.error('Ocorreu um erro ao carregar as turmas da mentoria')
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
        <div className="mt-8 w-full space-y-8">
          <div className="space-y-4">
            <Skeleton className={`h-10`} />
            <Carousel className="w-full">
              <CarouselContent>
                <CarouselItem
                  key={1}
                  className="max-w-xs md:basis-1/2 lg:basis-1/3"
                >
                  <Skeleton className={'h-96'} />
                </CarouselItem>
                <CarouselItem
                  key={2}
                  className="max-w-xs md:basis-1/2 lg:basis-1/3"
                >
                  <Skeleton className={'h-96'} />
                </CarouselItem>
                <CarouselItem
                  key={3}
                  className="max-w-xs md:basis-1/2 lg:basis-1/3"
                >
                  <Skeleton className={'h-96'} />
                </CarouselItem>
                <CarouselItem
                  key={4}
                  className="max-w-xs md:basis-1/2 lg:basis-1/3"
                >
                  <Skeleton className={'h-96'} />
                </CarouselItem>
                <CarouselItem
                  key={5}
                  className="max-w-xs md:basis-1/2 lg:basis-1/3"
                >
                  <Skeleton className={'h-96'} />
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
            </Carousel>
          </div>
        </div>
        <div className="mt-8 w-full space-y-8">
          <div className="space-y-4">
            <Skeleton className={`h-10`} />
            <Carousel className="w-full">
              <CarouselContent>
                <CarouselItem
                  key={1}
                  className="max-w-xs md:basis-1/2 lg:basis-1/3"
                >
                  <Skeleton className={'h-96'} />
                </CarouselItem>
                <CarouselItem
                  key={2}
                  className="max-w-xs md:basis-1/2 lg:basis-1/3"
                >
                  <Skeleton className={'h-96'} />
                </CarouselItem>
                <CarouselItem
                  key={3}
                  className="max-w-xs md:basis-1/2 lg:basis-1/3"
                >
                  <Skeleton className={'h-96'} />
                </CarouselItem>
                <CarouselItem
                  key={4}
                  className="max-w-xs md:basis-1/2 lg:basis-1/3"
                >
                  <Skeleton className={'h-96'} />
                </CarouselItem>
                <CarouselItem
                  key={5}
                  className="max-w-xs md:basis-1/2 lg:basis-1/3"
                >
                  <Skeleton className={'h-96'} />
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
            </Carousel>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <h1 className="font-poppins text-2xl font-medium">
          Turmas da mentoria
        </h1>

        <div className="mt-4">
          <p>Ocorreu um erro ao carregar as turmas</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mt-8 w-full space-y-8">
        {groupsUnlocked.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Minhas Turmas</h2>
            <Carousel>
              <CarouselContent>
                {groupsUnlocked.map((group) => (
                  <GroupCard group={group} key={group.id} />
                ))}
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
              </CarouselContent>
            </Carousel>
          </div>
        )}
      </div>

      <div className="mt-8 w-full space-y-8">
        {groupsLocked.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Turmas disponíveis</h2>
            <Carousel>
              <CarouselContent>
                {groupsLocked.map((group) => (
                  <GroupCard group={group} key={group.id} />
                ))}
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
              </CarouselContent>
            </Carousel>
          </div>
        )}
      </div>
    </div>
  )
}
