import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { LeadPerMonth } from '@/types/dashboard-admin'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const config: ChartConfig = {
  total: {
    label: 'Total',
  },
}

interface OverviewProps {
  leads: LeadPerMonth[]
}

export function Overview({ leads }: OverviewProps) {
  return (
    <ChartContainer config={config}>
      <BarChart accessibilityLayer data={leads}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
