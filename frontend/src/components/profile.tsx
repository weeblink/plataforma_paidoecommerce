import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/auth'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface ProfileProps {
  isCollapsed: boolean
}

interface UserProfile {
  acronym: string,
  name: string,
  email: string
}

export default function Profile({ isCollapsed }: ProfileProps) {
  
  const { user } = useAuth();
  const [profileInfo, setProfileInfo] = useState<UserProfile | null>();

  useEffect(() => {
    setProfileInfo({
      acronym: getFirstLetters( user.name ),
      name: user.name,
      email: user.email
    });
  }, []);

  const getFirstLetters = ( name: string ) : string => {

    const words = name.trim().split(' ');
    const initials = words.slice(0, 2).map( word => word.charAt(0).toUpperCase(  ));

    return initials.join('');
  }

  return (
    <div
      className={cn('grid items-center gap-3', {
        'grid-cols-1': isCollapsed,
        'grid-cols-[max-content_1fr]': !isCollapsed,
      })}
    >
      <div
        className={cn('', {
          'flex items-center justify-center': isCollapsed,
        })}
      >
        <Avatar className={isCollapsed ? 'size-8' : 'size-10'}>
          <AvatarFallback>{profileInfo?.acronym}</AvatarFallback>
        </Avatar>
      </div>

      {!isCollapsed && (
        <div className="flex flex-col truncate text-sm">
          <span className="truncate font-bold text-white">{profileInfo?.name}</span>
          <span className="truncate text-[0.8rem] text-gray-400">
            {profileInfo?.email}
          </span>
        </div>
      )}
    </div>
  )
}
