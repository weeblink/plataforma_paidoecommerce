export interface GroupMentoringDetails {
  id: string
  title: string
  price: number
  promotional_price: number
  qnt_students: number
  purchase_deadline: string
  expiration_date: string
  type: 'group' | 'single'
  mentor_id: string
  mentorship: {
    id: string
    title: string
    image_url: string
    created_at: string
    updated_at: string
  }
  course: {
    id: string
    title: string
    price: number
    progress: number
    promotional_price: number
    qnt_class: number
    qnt_students: number
    image_url: string
    is_pay: boolean
    created_at: string
    updated_at: string
  }
  last_class: {
    id: string
    module_id: string
    title: string
    description: string
    views: number
    sequence: number
    pv_video_id: string
    files: {
      id: string
      class_id: string
      title: string
      path: string
      size: string
    }[]
  }
  schedules_individual: MentoringMeeting[]
  schedules_groups: GroupMentoringMeeting[]
}

export interface MentoringMeeting {
  id: string
  title: string
  description: string
  date: string
  start_time: string
  end_time: string
  student: {
    student_id: string
    name: string
  }
}

export interface GroupMentoringMeeting
  extends Omit<MentoringMeeting, 'student'> {
  students: {
    student_id: string
    name: string
  }[]
}
