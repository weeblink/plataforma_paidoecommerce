import { CreateModal } from './components/create-modal'
import { DataTable } from './components/data-table'
import { columns } from './components/columns'
import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { toast } from 'sonner'
import type { CourseManagement } from '@/types/course-management'

export default function CourseManagementPage() {
  const [courses, setCourses] = useState<CourseManagement[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  async function fetchData() {
    setIsLoading(true)

    try {
      const { data } = await api.get<{ data: CourseManagement[] }>(
        '/courses-management',
      )

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

  return (
    <div>
      <div className="flex justify-between gap-2">
        <h1 className="font-poppins text-2xl font-medium">Gerenciar cursos</h1>

        <CreateModal onCreate={fetchData} />
      </div>

      <div className="mt-8">
        {isError ? (
          <p>Ocorreu um erro ao carregar os cursos</p>
        ) : (
          <DataTable
            columns={columns({ onRefresh: fetchData })}
            data={courses}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}
