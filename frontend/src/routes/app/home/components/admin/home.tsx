import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExtraProductsChart } from './extra-products-chart'
import { CourseChart } from './course-chart'
import { RecentSales } from './recent-sales'
import { Overview } from './overview'
import { MentoryChart } from './mentory-chart'
import type { DashboardAdminResponse } from '@/types/dashboard-admin'
import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/services/api'

export default function AdminHomePage() {
  const [data, setData] = useState<DashboardAdminResponse>(
    {} as DashboardAdminResponse,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  async function fetchData() {
    setIsLoading(true)

    try {
      const { data } = await api.get<{ data: DashboardAdminResponse }>(
        '/dashboard/admin',
      )

      setData(data.data)
    } catch {
      setIsError(true)
      toast.error('Ocorreu um erro ao carregar as informações')
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
        <p>Ocorreu um erro ao carregar as informações</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análise Detalhada</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.leads_statistics?.total_leads}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{data?.leads_statistics?.leads_added_this_month} desde o
                  último mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cursos Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.course_active_statistics?.active_courses}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data?.course_active_statistics?.courses_added_this_month}{' '}
                  novos cursos este mês
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Mentorias Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.mentorship_statistics?.total_mentorships}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data?.mentorship_statistics?.mentorships_added_this_month}{' '}
                  nova mentoria este mês
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Produtos ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.extra_statistics?.total_extras}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data?.extra_statistics?.extras_added_this_month} novos
                  produtos este mês
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>Visão geral de leads</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview leads={data?.leads_per_month} />
                </CardContent>
              </Card>
            </div>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Vendas Recentes</CardTitle>
                <CardDescription>
                  Você fez {data?.last_month_sales_count} vendas este mês.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales sales={data?.last_five_sales} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Alunos por Mentoria</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <MentoryChart data={data?.students_per_mentorship} />
                </CardContent>
              </Card>
            </div>
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Alunos por Curso</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <CourseChart data={data?.students_per_course} />
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Venda de produtos extras</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ExtraProductsChart data={data?.extra_sales_monthly} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
