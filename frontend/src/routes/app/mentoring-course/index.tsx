import BreadcrumbLinks from './components/breadcrumb-links'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ArrowRight, Download, LoaderCircle } from 'lucide-react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { useEffect, useState } from 'react'
import {
  CourseManagementClass,
  CourseManagementWithModules,
} from '@/types/course-management'
import { toast } from 'sonner'
import { useLoaderData } from 'react-router-dom'
import { api } from '@/services/api'
import ClassCard from './components/class-card'
import { Button } from '@/components/ui/button'
import { ScheduleMentoringModal } from './components/schedule-mentoring-modal'

export default function MentoringCoursePage() {
  const [course, setCourse] = useState<CourseManagementWithModules>(
    {} as CourseManagementWithModules,
  )
  const [selectedClass, setSelectedClass] = useState<CourseManagementClass>(
    {} as CourseManagementClass,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const courseId = useLoaderData() as string
  const nextClass = getNextClass()

  let player: PandaPlayer

  async function fetchData() {
    setIsLoading(true)
    try {
      const { data } = await api.get<{ data: CourseManagementWithModules }>(
        `/courses/${courseId}`,
      )

      setCourse(data.data)
      if (data.data.modules[0]?.classes[0]) {
        setSelectedClass(data.data.modules[0].classes[0])
        setPlayer()
      }
    } catch {
      toast.error('Ocorreu um erro ao carregar os detalhes do curso')
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  function handleSelectClass(classe: CourseManagementClass) {
    setSelectedClass(classe)
    setPlayer()
  }

  async function handleWatchClass(classe: CourseManagementClass) {
    try {
      const url = classe.already_seen
        ? `/courses/${course.id}/${classe.id}/not-watched`
        : `/courses/${course.id}/${classe.id}/watched`

      await api.post(url)

      toast.success('Aula atualizada com sucesso')
      fetchData()
    } catch (err) {
      console.log(err)

      toast.error('Ocorreu um erro ao atualizar a aula')
    }
  }

  function getNextClass() {
    if (course.modules === undefined) return null

    const currentModuleIndex = course.modules.findIndex((module) =>
      module.classes.some((classe) => classe.id === selectedClass.id),
    )

    const currentModule = course.modules[currentModuleIndex]
    const currentClassIndex = currentModule.classes.findIndex(
      (classe) => classe.id === selectedClass.id,
    )

    if (currentClassIndex + 1 < currentModule.classes.length) {
      return currentModule.classes[currentClassIndex + 1]
    }

    if (currentModuleIndex + 1 < course.modules.length) {
      return course.modules[currentModuleIndex + 1].classes[0]
    }

    return null
  }

  function handleGoToNextClass() {
    setSelectedClass(nextClass as CourseManagementClass)
  }

  function setPlayer() {
    window.onPandaPlayerApiLoad = function () {
      player = new PandaPlayer('panda-XXXX', {
        onReady: () => {
          player.onEvent(function ({ message }) {
            if (message === 'panda_pause') {
              console.log('paused')
            } else if (message === 'panda_play') {
              console.log('playing')
            } else if (message === 'panda_ended') {
              console.log('ended')
            } else if (message === 'panda_error') {
              console.log('error')
            }
          })
        },
      })
    }
    window.onPandaPlayerApiLoad()
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
        <p>Ocorreu um erro ao carregar os detalhes do curso</p>
      </div>
    )
  }

  if (
    Object.keys(course).length === 0 ||
    Object.keys(selectedClass).length === 0
  )
    return null

  return (
    <div>
      <BreadcrumbLinks courseName={course.title} isMentoring />

      <div className="mt-6 flex flex-col items-start gap-6 lg:flex-row">
        <div className="w-full lg:flex-1">
          <div>
            <AspectRatio ratio={16 / 9} className="rounded-lg">
              <iframe
                id="panda-XXXX"
                title="video"
                src={selectedClass.video_url}
                className="h-full w-full rounded-lg border-none"
              ></iframe>
            </AspectRatio>
          </div>

          <div className="mt-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-poppins text-2xl font-medium">
                  {selectedClass.title}
                </h1>
                <p className="text-gray-500">{selectedClass.description}</p>
              </div>

              {/*<ScheduleMentoringModal groupId={} />*/}
            </div>

            <div className="mt-4">
              <h2 className="text-lg font-bold">Arquivos</h2>
              <div className="mt-2 space-y-2">
                {selectedClass.files.length === 0 && (
                  <p>Nenhum arquivo disponível</p>
                )}
                {selectedClass.files.map((file) => (
                  <a
                    key={file.id}
                    href={file.path}
                    download
                    target="_blank"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Download className="h-4 w-4 text-primary" />
                    <p>{file.title}</p>
                  </a>
                ))}
              </div>
            </div>

            {nextClass && (
              <div className="mt-4 flex justify-end">
                <Button onClick={handleGoToNextClass} variant="secondary">
                  Próxima aula
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-auto">
          <Card className="w-full lg:w-[300px] xl:w-[350px]">
            <CardHeader className="p-4">
              <CardTitle>Módulos do curso</CardTitle>
              <CardDescription>
                Confira os módulos disponíveis para este curso.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Accordion
                type="multiple"
                defaultValue={course.modules.map((module) => module.id)}
              >
                {course.modules.map((module) => (
                  <AccordionItem
                    value={module.id}
                    key={module.id}
                    className="last:border-b-0"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-col items-start">
                        <h2 className="text-sm font-bold">{module.title}</h2>
                        <p className="text-sm text-gray-500">
                          {module.qtd_classes} aulas - {module.qtd_timeclass}{' '}
                          min
                        </p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      {module.classes.map((classe) => (
                        <ClassCard
                          key={classe.id}
                          classe={classe}
                          isSelected={selectedClass.id === classe.id}
                          onClick={() => handleSelectClass(classe)}
                          onSetWatched={() => handleWatchClass(classe)}
                        />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
