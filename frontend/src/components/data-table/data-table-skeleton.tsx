import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '../ui/table'

interface Props {
  columns: number
  lines: number
}

export default function DataTableSkeleton({ columns, lines }: Props) {
  return (
    <>
      {Array.from({ length: lines }).map((_, index) => (
        <TableRow key={index}>
          {Array.from({ length: columns }).map((_, index) => (
            <TableCell key={index}>
              <Skeleton className="h-[20px] w-[50px]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
