export interface CourseManagement {
  id: string
  title: string
  price: string
  is_pay: boolean
  promotional_price: string
  qnt_classes: number
  qnt_students: number
  image_url?: string
}

export interface CourseManagementWithModules extends CourseManagement {
  modules: CourseManagementModule[]
}

export interface CourseManagementModule {
  id: string
  course_id: string
  title: string
  sequence: number
  qtd_timeclass: number
  qtd_classes: number
  classes: CourseManagementClass[]
}

export interface CourseManagementClass {
  id: string
  module_id: string
  title: string
  description: string
  views: number
  sequence: number
  video_url: string
  already_seen?: boolean
  files: ClassFile[]
}

export interface ClassFile {
  id: string
  class_id: string
  title: string
  path: string
  size: string
}
