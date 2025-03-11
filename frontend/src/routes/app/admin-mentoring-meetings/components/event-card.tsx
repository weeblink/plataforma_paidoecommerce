import { Button } from '@/components/ui/button'
import type { MeetingCalendar } from '@/types/meeting'
import { GraduationCap, School, Trash2, User, Users } from 'lucide-react'
import moment from 'moment'

interface Props {
  event: MeetingCalendar
  onCancel: () => void
}

export default function EventCard({ event, onCancel }: Props) {
  function renderParticipants() {
    if (event.type === 'group') {
      return (
        <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
              <Users className="size-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold leading-none text-primary">
              Qtd. participantes:
            </span>
          </div>
          <span className="truncate text-sm">{event.students.length}</span>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
            <User className="size-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold leading-none text-primary">
            Participante:
          </span>
        </div>
        <span className="truncate text-sm">{event.students[0].name}</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{event.title}</h3>
      <div className="flex items-center text-sm text-muted-foreground">
        <span>
          {moment(event.date, "DD/MM/YYYY").format('DD/MM/YYYY')} - {event.start_time} -{' '}
          {event.end_time}
        </span>
      </div>
      <p className="text-sm">{event.description}</p>

      {renderParticipants()}

      <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
            <School className="size-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold leading-none text-primary">
            Mentoria:
          </span>
        </div>
        <span className="truncate text-sm">{event.mentoring_title}</span>
      </div>

      <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
            <GraduationCap className="size-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold leading-none text-primary">
            Turma:
          </span>
        </div>
        <span className="truncate text-sm">{event.group.title}</span>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="destructive" size="icon" onClick={onCancel}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
