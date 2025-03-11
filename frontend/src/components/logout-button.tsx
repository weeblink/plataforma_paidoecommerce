import { LogOut } from 'lucide-react'
import { Button } from './ui/button'
import { useAuth } from '@/hooks/auth'

export default function LogoutButton() {
  const { handleLogout } = useAuth()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="hover:bg-white/20"
      onClick={handleLogout}
    >
      <LogOut className="size-5 text-white" />
    </Button>
  )
}
