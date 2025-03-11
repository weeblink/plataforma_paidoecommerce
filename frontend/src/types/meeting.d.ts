export interface Meeting {
  id: string
  user: {
    id: string
    username: string
  }
  date: string
  times: {
    id: string
    start_time: string
    end_time: string
  }[]
}

export interface MeetingCalendar {
  id: string
  title: string
  date: string
  start_time: string
  end_time: string
  description: string
  mentoring_title: string
  group: {
    title: string
    description: string
  }
  students: {
    id: string
    name: string
  }[]
  type: 'group' | 'individual'
}

export interface ScheduleType {
  date: string
  start_time: string
  end_time: string
}
