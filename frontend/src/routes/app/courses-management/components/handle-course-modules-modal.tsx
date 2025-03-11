import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Accordion, AccordionItem } from '@/components/ui/accordion'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import type {
  CourseManagement,
  CourseManagementModule,
  CourseManagementWithModules,
} from '@/types/course-management'
import { Label } from '@/components/ui/label'
import ModuleCard from './module-card'
import { CreateCourseModuleModal } from './modules/create-modal'
import { LoaderCircle } from 'lucide-react'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

interface Props {
  course: CourseManagement
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export function HandleCourseModulesModal({ course, open, setOpen }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [modules, setModules] = useState<CourseManagementModule[]>([])
  const [value, setAccordionValue] = useState<string | undefined>(undefined)

  async function fetchData() {
    setIsLoading(true)

    try {
      const { data } = await api.get<{ data: CourseManagementWithModules }>(
        `/courses-management/${course.id}`,
      )

      setModules(data.data.modules)
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao buscar os modulos do curso'

      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }

        if (!error.response?.data?.message && error.response?.data?.error) {
          errorMessage = error.response.data.error
        }
      }

      toast.error(errorMessage)
      setIsError(true)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    if (!open) return

    fetchData()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl w-full">
        <DialogHeader>
          <DialogTitle className="font-poppins">
            Gerenciar módulos do curso
          </DialogTitle>
          <DialogDescription>
            Gerencie os módulos e aulas do curso <strong>{course.title}</strong>
            .
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm">
              Ocorreu um erro ao carregar os módulos do curso
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="mt-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Módulos</Label>
                <p className="text-xs text-gray-400">
                  Clique no card para ver informações do módulo
                </p>
              </div>

              <CreateCourseModuleModal
                courseId={course.id}
                onCreate={fetchData}
              />
            </div>

            {isLoading && (
              <div className="flex items-center justify-center">
                <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}

            <Accordion
              type="single"
              collapsible
              onValueChange={setAccordionValue}
              value={value}
            >
              <div className="space-y-4">
                {modules.map((module) => (
                  <AccordionItem
                    value={module.id}
                    key={module.id}
                    className="group border-b-0"
                  >
                    <ModuleCard
                      modules={modules}
                      module={module}
                      onRefresh={fetchData}
                    />
                  </AccordionItem>
                ))}
              </div>
            </Accordion>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
