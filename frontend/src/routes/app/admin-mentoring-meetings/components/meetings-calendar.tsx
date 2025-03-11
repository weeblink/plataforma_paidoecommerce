import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/services/api'
import { toast } from 'sonner'
import type { MeetingCalendar } from '@/types/meeting'
import EventCard from './event-card'
import { CancelCalendarMeetingModal } from './cancel-calendar-meeting-modal'

export default function MeetingsCalendar() {
  const [meetings, setMeetings] = useState<MeetingCalendar[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  const [currentMeeting, setCurrentMeeting] = useState<MeetingCalendar | null>(
    null,
  )
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  async function fetchData() {
    setIsLoading(true)

    try {
      const { data } = await api.get<{ data: MeetingCalendar[] }>(
        '/mentoring/schedule/calendar',
      )

      setMeetings(data.data);
    } catch {
      setIsError(true)
      toast.error('Ocorreu um erro ao carregar as reuniões')
    } finally {
      setIsLoading(false)
    }
  }

  const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()

    const days = []

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const getEventsForDay = (day: number) => {

    return meetings.filter((meeting) => {
      const [meetingDay, meetingMonth, meetingYear] = meeting.date.split('/').map(Number);

      const meetingDate = new Date(meetingYear, meetingMonth - 1, meetingDay);

      return (
          meetingDate.getFullYear() === currentDate.getFullYear() &&
          meetingDate.getMonth() === currentDate.getMonth() &&
          meetingDate.getDate() === day
      );
    });
  }

  function capitalizeFirstLetter(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  function handleCancelClick(event: MeetingCalendar) {
    setCurrentMeeting(event)
    setIsCancelModalOpen(true)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2">
        <LoaderCircle className="h-4 animate-spin text-primary" />
        Carregando...
      </div>
    )
  }

  if (isError) {
    return <p>Ocorreu um erro ao carregar as reuniões</p>
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {capitalizeFirstLetter(
            format(currentDate, 'MMMM yyyy', { locale: ptBR }),
          )}
        </h1>
        <div className="flex items-center space-x-2">
          <Select
            value={currentDate.getFullYear().toString()}
            onValueChange={(value) => {
              const newDate = new Date(currentDate)
              newDate.setFullYear(parseInt(value))
              setCurrentDate(newDate)
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => 2024 + i).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-gray-50 dark:bg-black/10">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="bg-background p-4 text-center font-semibold"
          >
            {day}
          </div>
        ))}

        {getDaysInMonth(currentDate).map((day, index) => {
          const dayEvents = day ? getEventsForDay(day) : []
          return (
            <div
              key={index}
              className={cn(
                'min-h-24 border border-gray-100 bg-background p-1 transition-colors hover:bg-gray-50 dark:border-gray-50/10 dark:hover:bg-white/20',
              )}
            >
              {day && (
                <>
                  <span className="block p-2">{day}</span>
                  {dayEvents.map((event) => (
                    <HoverCard openDelay={100} closeDelay={100} key={event.id}>
                      <HoverCardTrigger asChild>
                        <div className="mb-1 cursor-pointer rounded bg-primary/80 p-1 text-sm text-white hover:bg-primary">
                          {event.start_time} - {event.end_time} {event.title}
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <EventCard
                          event={event}
                          onCancel={() => handleCancelClick(event)}
                        />
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </>
              )}
            </div>
          )
        })}
      </div>

      {currentMeeting && (
        <CancelCalendarMeetingModal
          open={isCancelModalOpen}
          setOpen={setIsCancelModalOpen}
          onCancel={fetchData}
          meeting={currentMeeting}
        />
      )}
    </div>
  )
}
