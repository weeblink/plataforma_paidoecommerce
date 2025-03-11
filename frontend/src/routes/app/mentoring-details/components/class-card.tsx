import { cn } from '@/lib/utils'
import type { CourseManagementClass } from '@/types/course-management'
import { Circle, CircleCheck } from 'lucide-react'

interface Props {
  classe: CourseManagementClass
  isSelected: boolean
  onClick: () => void
  onSetWatched: () => void
}

export default function ClassCard({
  classe,
  isSelected,
  onClick,
  onSetWatched,
}: Props) {
  return (
    <button className="flex w-full items-center gap-2" onClick={onClick}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onSetWatched()
        }}
      >
        {!classe.already_seen ? (
          <Circle className="h-4 w-4 text-primary" />
        ) : (
          <CircleCheck className="h-4 w-4 text-green-600" />
        )}
      </button>

      <div className="flex flex-1 items-center justify-between">
        <h3
          className={cn('truncate font-medium', {
            'text-primary': isSelected,
            'text-green-600': classe.already_seen,
          })}
        >
          {classe.title}
        </h3>
      </div>
    </button>
  )
}
