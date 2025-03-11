import type { CourseManagementClass } from '@/types/course-management'
import { ChevronDown, ChevronUp, Eye, File } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UpdateCourseClassModal } from './classes/update-modal'
import { DeleteCourseClassModal } from './classes/delete-modal'
import { LinkFilesClassModal } from './classes/link-files-modal'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { api } from '@/services/api'
import { UploadVideoClassModal } from './classes/upload-modal'

interface Props {
  data: CourseManagementClass
  classes: CourseManagementClass[]
  onRefresh: () => Promise<void>
}

export default function ClassCard({ data, classes, onRefresh }: Props) {
  async function handleSwap(direction: 'up' | 'down') {
    const index = classes.findIndex((item) => item.id === data.id)
    const class1_id = data.id
    const class2_id = classes[direction === 'up' ? index - 1 : index + 1].id

    try {
      await api.patch(`/classes/swap-order`, {
        class1_id,
        class2_id,
      })

      onRefresh()
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao trocar a posição das aulas'

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
    <Card key={data.id} className="group">
      <CardHeader className="flex-row gap-2 space-y-0 p-4">
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

        <div className="space-y-1.5">
          <CardTitle>{data.title}</CardTitle>
          <CardDescription>{data.description}</CardDescription>
        </div>

        <div className="ml-auto">
          <DeleteCourseClassModal data={data} onDelete={onRefresh} />

          <UpdateCourseClassModal data={data} onUpdate={onRefresh} />

          <LinkFilesClassModal data={data} onChange={onRefresh} />

          <UploadVideoClassModal data={data} onChange={onRefresh} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
              <Eye className="size-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold leading-none text-primary">
              Views:
            </span>
          </div>
          <span className="truncate text-sm">{data.views}</span>
        </div>

        <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
              <File className="size-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold leading-none text-primary">
              Arquivos:
            </span>
          </div>
          <span className="truncate text-sm">
            {data.files.length} {data.files.length > 1 ? 'arquivos' : 'arquivo'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
