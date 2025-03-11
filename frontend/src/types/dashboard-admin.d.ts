export interface CourseActiveStatistics {
  active_courses: number
  courses_added_this_month: number
}

export interface LeadsStatistics {
  leads_added_this_month: number
  total_leads: number
}

export interface ExtraStatistics {
  extras_added_this_month: number
  total_extras: number
}

export interface MentorshipStatistics {
  mentorships_added_this_month: number
  total_mentorships: number
}

export interface LeadPerMonth {
  name: string
  total: number
}

export interface LastFiveSales {
  sale_id: number
  user_name: string
  user_email: string
  product_price: number
}

export interface StudentsPerItemConfig {
  label: string
}

export interface StudentsPerItem {
  data: { name: string; value: number }[]
  config: Record<string, StudentsPerItemConfig>
}

export interface ExtraSalesMonthly {
  month: string
  [key: string]: number | string
}

export interface DashboardAdminResponse {
  course_active_statistics: CourseActiveStatistics
  leads_statistics: LeadsStatistics
  extra_statistics: ExtraStatistics
  mentorship_statistics: MentorshipStatistics
  leads_per_month: LeadPerMonth[]
  last_five_sales: LastFiveSales[]
  last_month_sales_count: number
  students_per_mentorship: StudentsPerItem
  students_per_course: StudentsPerItem
  extra_sales_monthly: ExtraSalesMonthly[]
}
