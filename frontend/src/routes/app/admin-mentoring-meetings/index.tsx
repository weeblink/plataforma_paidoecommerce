import { DataTable } from './components/data-table'
import { columns } from './components/columns'
import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { toast } from 'sonner'
import type { Meeting } from '@/types/meeting'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MeetingsCalendar from './components/meetings-calendar'
import CreateDropdownMenu from './components/create-dropdown-menu'

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  async function fetchData() {
    setIsLoading(true)

    try {
      const { data } = await api.get<{ data: Meeting[] }>('/mentoring/schedule')

      setMeetings(data.data)
    } catch {
      setIsError(true)
      toast.error('Ocorreu um erro ao carregar as reuniões')
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
        <h1 className="font-poppins text-2xl font-medium">Minhas reuniões</h1>

        <CreateDropdownMenu onCreate={fetchData} />
      </div>

      <div className="mt-8">
        <Tabs defaultValue="schedules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedules">Mentorias marcadas</TabsTrigger>
            <TabsTrigger value="my-schedules">Meus horários</TabsTrigger>
          </TabsList>
          <TabsContent value="schedules" className="space-y-4">
            <MeetingsCalendar />
          </TabsContent>
          <TabsContent value="my-schedules" className="space-y-4">
            {isError ? (
              <p>Ocorreu um erro ao carregar as reuniões</p>
            ) : (
              <DataTable
                columns={columns({ onRefresh: fetchData })}
                data={meetings}
                isLoading={isLoading}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
