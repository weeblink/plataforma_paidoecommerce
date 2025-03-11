import { Settings } from 'lucide-react'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'

export default function SettingsButton() {
  return (
    <Link to="profile">
      <Button variant="ghost" size="icon" className="hover:bg-white/20">
        <Settings className="size-5 text-white" />
      </Button>
    </Link>
  )
}
