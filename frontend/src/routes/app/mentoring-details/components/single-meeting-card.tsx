import { Card } from '@/components/ui/card'
import type { MentoringMeeting } from '@/types/mentoring'
import { CalendarDays } from 'lucide-react'
import moment from 'moment'

interface Props {
  meeting: MentoringMeeting
}

export default function SingleMeetingCard({ meeting }: Props) {
  return (
    <Card className="p-4">
      <div className="flex items-start">
        <div className="space-y-2">
          <h3 className="font-semibold">{meeting.title}</h3>
          <p className="text-sm text-muted-foreground">{meeting.description}</p>

          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>
              {moment(meeting.date, "DD/MM/YYYY").format('DD/MM/YYYY')} {meeting.start_time} -{' '}
              {meeting.end_time}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
