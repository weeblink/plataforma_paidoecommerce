import { DataTable } from './components/data-table'
import { useEffect, useState } from 'react'
import type { Lead } from '@/types/leads'
import { columns } from './components/columns'
import { api } from '@/services/api'
import { toast } from 'sonner'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  async function fetchData() {
    setIsLoading(true)

    try {
      const { data } = await api.get<{ data: Lead[] }>('/leads')

      setLeads(data.data)
    } catch {
      setIsError(true)
      toast.error('Ocorreu um erro ao carregar os leads')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div>
      <h1 className="font-poppins text-2xl font-medium">Gerenciar leads</h1>

      <div className="mt-8">
        {isError ? (
          <p>Ocorreu um erro ao carregar os leads</p>
        ) : (
          <DataTable 
            columns={columns({ onRefresh: fetchData })} 
            data={leads} 
            isLoading={isLoading}
            onRefresh={fetchData}
          />
        )}
      </div>
    </div>
  )
}
