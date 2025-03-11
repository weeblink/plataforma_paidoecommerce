import { useAuth } from '@/hooks/auth'
import AdminHomePage from './components/admin/home'
import StudentHomePage from './components/student/home'

export default function HomePage() {
  const { user } = useAuth()

  if (user?.user_type === 'ADMIN') {
    return <AdminHomePage />
  }

  if (user?.user_type === 'STUDENT') {
    return <StudentHomePage />
  }
}
