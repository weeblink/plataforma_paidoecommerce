type UserType = 'STUDENT' | 'ADMIN'

export interface Profile {
  id: number
  name: string
  email: string
  phone: string
  cpf: string
  user_type: UserType
}
