import { NavLinks } from '@/constants/nav-links'
import NavItem from './nav-item'
import { useAuth } from '@/hooks/auth'

interface Props {
  isCollapsed: boolean
  links: NavLinks[]
  onClick?: () => void
}

export function Nav({ links, isCollapsed, onClick }: Props) {

  const { user } = useAuth();

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-2 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => (
          user?.user_type === link.role ? (
            <NavItem
              key={index}
              link={link}
              isCollapsed={isCollapsed}
              onClick={onClick}
            />
          ) : null
        ))}
      </nav>
    </div>
  )
}
