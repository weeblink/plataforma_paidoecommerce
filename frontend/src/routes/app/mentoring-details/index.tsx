import BreadcrumbLinks from './components/breadcrumb-links'
import {
  ArrowRight,
  CalendarDays, Computer,
  LoaderCircle,
  PlayCircle,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Link, useLoaderData } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { GroupMentoringDetails } from '@/types/mentoring'
import { groupMentoringDetailsMock } from './mock'
import GroupMeetingCard from './components/group-meeting-card'
import SingleMeetingCard from './components/single-meeting-card'
import {api} from "@/services/api.ts";
import moment from "moment";
import {ScheduleMentoringModal} from "@/routes/app/mentoring-course/components/schedule-mentoring-modal.tsx";

export default function MentoringDetailsPage() {
  const [mentoring, setMentoring] = useState<GroupMentoringDetails>(
    {} as GroupMentoringDetails,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const mentoringID = useLoaderData() as string

  const isGroup = useMemo(() => mentoring.type === 'group', [mentoring.type])

  async function fetchData() {
    setIsLoading(true)
    try {
       const { data } = await api.get<{ data: GroupMentoringDetails }>(
         `/mentorings/${mentoringID}`,
       );

       setMentoring(data.data);
    } catch {
      toast.error('Ocorreu um erro ao carregar os detalhes da mentoria')
      setIsError(true)
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
        <p>Ocorreu um erro ao carregar os detalhes da mentoria</p>
      </div>
    )
  }

  if (Object.keys(mentoring).length === 0) return null

  return (
    <div>
      <BreadcrumbLinks courseName={mentoring.course.title} isMentoring />

      <div className="mt-8">
        <h1 className="text-2xl font-semibold">{mentoring.title}</h1>
        <p className="mt-1 text-lg text-secondary">{mentoring.course.title}</p>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-semibold">
            R$ {mentoring.promotional_price.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
          <span className="text-sm text-gray-500 line-through">
            R$ {mentoring.price.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </div>

        <Badge>{isGroup ? 'Grupo' : 'Individual'}</Badge>

        <div className="mt-4 space-y-1">
          <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
                <Users className="size-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold leading-none text-primary">
                Quantidade de alunos:
              </span>
            </div>
            <span className="truncate text-sm">{mentoring.qnt_students}</span>
          </div>

          <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
                <CalendarDays className="size-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold leading-none text-primary">
                Data de expiração:
              </span>
            </div>
            <span className="truncate text-sm">
              {moment(mentoring.expiration_date).format('DD/MM/YYYY')}
            </span>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="mt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2>Curso</h2>
            <h1 className="text-xl font-semibold">{mentoring.course.title}</h1>
          </div>

          <span className="text-primary">{mentoring.course.progress}%</span>
        </div>

        {/* <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-gray-400">Aulas Concluídas</div>
          </div>
          <div>
            <div className="text-2xl font-bold">8</div>
            <div className="text-sm text-gray-400">Aulas Restantes</div>
          </div>
          <div>
            <div className="text-2xl font-bold">20</div>
            <div className="text-sm text-gray-400">Total de Aulas</div>
          </div>
        </div> */}

        <div className="my-6 flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/40">
              <PlayCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          { mentoring.last_class ? (
              <div className="flex-grow">
                <h3 className="font-semibold">{mentoring.last_class.title}</h3>
                <p className="mt-1 text-sm text-gray-400">
                  {mentoring.last_class.description}
                </p>
              </div>
          ) : (
              <div className="flex-grow">
                <h3 className="font-semibold">Começar a ver curso</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Inicie agora sua jornada de aprendizado
                </p>
              </div>
          )}

          <div className="flex-shrink-0">
            <Link to={`/mentoring-course/${mentoring.course.id}`}>
              <Button variant="secondary" size="sm">
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {mentoring.type === "single" && (
          <>
            <Separator className="my-6"/>

            <div>
              <h2>Reuniões</h2>
              <h1 className="text-xl font-semibold">Agende sua reunião</h1>
            </div>

            <div className="my-6 flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/40">
                  <Computer className="h-8 w-8 text-primary"/>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold">Agende o seu encontro com nossos especialistas</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Agende uma reunião com um dos nossos especialistas no melhor horário para você!
                </p>
              </div>

              <div className="flex-shrink-0">
                <ScheduleMentoringModal groupId={mentoringID} onCreate={fetchData} />
              </div>
            </div>
          </>
      )}

      {mentoring.schedules_groups.length > 0 && (
          <>
            <Separator className="my-6"/>

            <div className="mb-4">
              <h2 className="text-xl font-semibold">Reuniões em grupo</h2>
            </div>

            <div className="space-y-4">
              {mentoring.schedules_groups.map((meeting) => (
                  <GroupMeetingCard
                      meeting={meeting}
                      onMarkPresent={fetchData}
                  />
              ))}
            </div>
          </>
      )}

      {mentoring.schedules_individual.length > 0 && (
          <>
            <Separator className="my-6"/>

            <div className="mb-4">
              <h2 className="text-xl font-semibold">Reuniões indivíduais</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mentoring.schedules_individual.map((meeting) => (
                  <SingleMeetingCard meeting={meeting} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
