import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { ExtraSalesMonthly } from '@/types/dashboard-admin'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

const chartConfig = {} satisfies ChartConfig

interface Props {
  data: ExtraSalesMonthly[]
}

export function ExtraProductsChart({ data }: Props) {

  const productKeys = Object.keys(data[0] || {}).filter(key => key !== 'month');

  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        {productKeys.map((productKey, index) => (
            <Bar
                key={productKey}
                dataKey={productKey}
                stackId="a"
                fill={colors[index % colors.length]}
                radius={
                  index === 0
                      ? [0, 0, 4, 4]
                      : index === productKeys.length - 1
                          ? [4, 4, 0, 0]
                          : [0, 0, 0, 0]
                }
            />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
