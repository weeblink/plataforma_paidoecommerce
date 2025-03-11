export interface MentoringManagement {
  id: string
  title: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface MentoringGroup {
  id: string
  mentorship_id: string
  course_id: string
  title: string
  price: number
  price_promotional: number
  qnt_students: number
  purchase_deadline: string
  expiration_date: string
  type: 'group' | 'single'
}

export interface MentoringExibition {
  id: string
  mentorship_id: string
  course_id: string
  title: string
  price: number
  price_promotional: number
  qnt_students: number
  purchase_deadline: string
  expiration_date: string
  is_locked: boolean
  image_url?: string
  type: 'group' | 'single'
}
