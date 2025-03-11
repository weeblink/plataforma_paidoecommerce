'use client'

import { NavLinks } from '@/constants/nav-links'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { buttonVariants } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface Props {
  link: NavLinks
  isCollapsed: boolean
  onClick?: () => void
}

export default function NavItem({ link, isCollapsed, onClick }: Props) {
  const [isActive, setIsActive] = useState<boolean>()

  const location = useLocation()

  useEffect(() => {
    const isChildren =
      link.route === '/courses' &&
      location.pathname.startsWith(link.route + '/')

    setIsActive(location.pathname === link.route || isChildren)
  }, [location.pathname, link.route])

  return isCollapsed ? (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          to={link.route}
          className={cn(
            buttonVariants({
              variant: isActive ? 'default' : 'ghost',
              size: 'icon',
            }),
            'size-10',
            !isActive && 'text-white/80 hover:bg-white/20 hover:text-white',
          )}
        >
          <link.icon className="size-5" />
          <span className="sr-only">{link.title}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-4">
        {link.title}
      </TooltipContent>
    </Tooltip>
  ) : (
    <Link
      to={link.route}
      className={cn(
        buttonVariants({
          variant: isActive ? 'default' : 'ghost',
          size: 'lg',
        }),
        'justify-start px-4',
        !isActive && 'text-white/80 hover:bg-white/20 hover:text-white',
      )}
      onClick={() => onClick && onClick()}
    >
      <link.icon className="mr-2 size-5" />
      {link.title}
    </Link>
  )
}
