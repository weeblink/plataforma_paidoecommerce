import { CreateModal } from './components/create-modal'
import { DataTable } from './components/data-table'
import { columns } from './components/columns'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { MentoringManagement } from '@/types/mentoring-management'
import { api } from '@/services/api'

export default function MentoringManagementPage() {
  const [mentorings, setMentorings] = useState<MentoringManagement[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  async function fetchData() {
    setIsLoading(true)

    try {
      const { data } = await api.get<{ data: MentoringManagement[] }>(
        '/mentoring-management',
      )

      setMentorings(data.data)
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

  return (
    <div>
      <div className="flex justify-between gap-2">
        <h1 className="font-poppins text-2xl font-medium">
          Gerenciar mentorias
        </h1>

        <CreateModal onCreate={fetchData} />
      </div>

      <div className="mt-8">
        {isError ? (
          <p>Ocorreu um erro ao carregar as mentorias</p>
        ) : (
          <DataTable
            columns={columns({ onRefresh: fetchData })}
            data={mentorings}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}
