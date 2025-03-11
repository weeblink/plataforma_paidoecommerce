export interface Course {
  id: string
  title: string
  description: string
  image_url: string
  is_locked: boolean
  is_pay: boolean
}

export interface CoursePayment {
  id: string
  title: string
  price: number
  promotional_price: number
  image_url: string
}
