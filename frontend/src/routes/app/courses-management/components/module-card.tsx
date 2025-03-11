import type { CourseManagementModule } from '@/types/course-management'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccordionContent, AccordionTrigger } from '@/components/ui/accordion'
import { Label } from '@/components/ui/label'
import ClassCard from './class-card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { UpdateCourseModuleModal } from './modules/update-modal'
import { DeleteModuleModal } from './modules/delete-modal'
import { CreateCourseClassModal } from './classes/create-modal'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AxiosError } from 'axios'
import { api } from '@/services/api'
import { toast } from 'sonner'

interface Props {
  modules: CourseManagementModule[]
  module: CourseManagementModule
  onRefresh: () => Promise<void>
}

export default function ModuleCard({ module, modules, onRefresh }: Props) {
  async function handleSwap(direction: 'up' | 'down') {
    const index = modules.findIndex((item) => item.id === module.id)
    const module1_id = module.id
    const module2_id = modules[direction === 'up' ? index - 1 : index + 1].id

    try {
      await api.patch(`/modules/swap-order`, {
        module1_id,
        module2_id,
      })

      onRefresh()
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao trocar a posição dos modulos'

      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }

        if (!error.response?.data?.message && error.response?.data?.error) {
          errorMessage = error.response.data.error
        }
      }

      toast.error(errorMessage)
    }
  }

  return (
    <Card>
      <AccordionTrigger className="py-0 pl-2 pr-4">
        <div
          className={cn(
            'flex items-center gap-2 p-2',
            modules.length === 1 && 'px-0',
          )}
        >
          <div className="flex flex-col">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSwap('up')
              }}
              className="group-first"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSwap('down')
              }}
              className="group-last"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <CardHeader className="p-0">
            <CardTitle>{module.title}</CardTitle>
          </CardHeader>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-0">
        <CardContent className="px-4 pb-4">
          <div className="flex items-center justify-between gap-2">
            <Label>Aulas</Label>

            <div className="space-x-2">
              <DeleteModuleModal module={module} onDelete={onRefresh} />

              <UpdateCourseModuleModal module={module} onUpdate={onRefresh} />

              <CreateCourseClassModal
                moduleId={module.id}
                onCreate={onRefresh}
              />
            </div>
          </div>

          <ScrollArea className="mt-4 h-full">
            <div className="max-h-[240px] space-y-4">
              {module.classes.map((item) => (
                <ClassCard
                  key={item.id}
                  data={item}
                  classes={module.classes}
                  onRefresh={onRefresh}
                />
              ))}
            </div>

            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </CardContent>
      </AccordionContent>
    </Card>
  )
}
