import type { LastFiveSales } from '@/types/dashboard-admin'

interface Props {
  sales: LastFiveSales[]
}

export function RecentSales({ sales }: Props) {
  return (
    <div className="space-y-8">
      {sales?.length === 0 && (
        <div className="flex items-center justify-center">
          <p>Nenhuma venda recente</p>
        </div>
      )}

      {sales?.map((sale) => (
        <div key={sale.sale_id} className="flex items-center">
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.user_name}</p>
            <p className="text-sm text-muted-foreground">{sale.user_email}</p>
          </div>
          <div className="ml-auto font-medium">{sale.product_price}</div>
        </div>
      ))}
    </div>
  )
}
