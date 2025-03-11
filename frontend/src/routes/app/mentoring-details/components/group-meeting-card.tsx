import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { GroupMentoringMeeting } from '@/types/mentoring'
import { CalendarDays, Users } from 'lucide-react'
import moment from 'moment'
import { toast } from 'sonner'
import {api} from "@/services/api.ts";

interface Props {
  meeting: GroupMentoringMeeting,
  onMarkPresent: () => void
}

export default function GroupMeetingCard({ meeting, onMarkPresent }: Props) {

  async function markAsPresent(  ){
    try{

      await api.patch(`/meet/schedule/mark-as-present/${meeting.id}`);

      toast.success("Presença marcada com sucesso!");
      onMarkPresent();

    }catch(error){
      toast.error("Não foi possível marcar como presente")
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="font-semibold">{meeting.title}</h3>
          <p className="text-sm text-muted-foreground">{meeting.description}</p>

          <div className="flex items-center gap-x-2 gap-y-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-primary/40 p-1.5">
                <Users className="size-3 text-primary" />
              </div>
              <span className="text-sm font-semibold leading-none text-primary">
                Qtd. participantes:
              </span>
            </div>
            <span className="truncate text-sm">{meeting.students.length}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>
              {moment(meeting.date).format('DD/MM/YYY')} {meeting.start_time} -{' '}
              {meeting.end_time}
            </span>
          </div>
        </div>
        <Button
            variant="secondary"
            size="sm"
            onClick={markAsPresent}
        >
          Marcar presença
        </Button>
      </div>
    </Card>
  )
}
