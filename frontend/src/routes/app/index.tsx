import { Navigate, Outlet } from 'react-router-dom'
import {
  ArrowLeftFromLine,
  ArrowRightFromLine,
  LoaderCircle,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { NAV_LINKS } from '@/constants/nav-links'
import { Nav } from '@/components/nav'
import Profile from '@/components/profile'
import { Button } from '@/components/ui/button'
import LogoutButton from '@/components/logout-button'
import { ModeToggle } from '@/components/mode-toggle'
import SettingsButton from '@/components/settings-button'
import { useAuth } from '@/hooks/auth'

export default function AppLayout() {
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const { isLoading, user } = useAuth()

  function onColapse() {
    setIsCollapsed(true)
    document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`
  }

  function onExpand() {
    setIsCollapsed(false)
    document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
      false,
    )}`
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoaderCircle className="mr-2 size-4 animate-spin text-primary" />
        <span className="text-sm">Carregando...</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <main className="overflow-y-hidden">
      {/* Mobile */}
      <Collapsible
        open={isMobileCollapsed}
        onOpenChange={setIsMobileCollapsed}
        className="group not-sr-only max-h-screen lg:sr-only"
      >
        <div className="flex h-[70px] items-center justify-between bg-secondary px-4 py-4 shadow-sm">
          <div className="flex size-24 items-center justify-center px-2 text-white">
            <img src="/white-logo.png" alt="Logo" />
          </div>
          <CollapsibleTrigger>
            <Menu className="text-white group-data-[state=open]:hidden" />
            <X className="text-white group-data-[state=closed]:hidden" />
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="fixed bottom-0 left-0 right-0 top-[69px] z-10 flex max-h-screen flex-1 flex-col overflow-y-scroll bg-secondary p-4 group-data-[state=closed]:hidden">
          <Nav
            isCollapsed={false}
            links={NAV_LINKS}
            onClick={() => setIsMobileCollapsed(false)}
          />

          <div className="mt-auto flex flex-col gap-6 px-2">
            <div
              className={cn('flex gap-1', {
                'flex-col': isCollapsed,
                '': !isCollapsed,
              })}
            >
              <SettingsButton />

              <ModeToggle />

              <LogoutButton />
            </div>

            <Separator />

            <Profile isCollapsed={false} />
          </div>
        </CollapsibleContent>
        <div className="group-data-[state=open]:hidden">
          <div className="h-screen max-h-screen overflow-y-scroll p-5">
            <Outlet />
          </div>
        </div>
      </Collapsible>

      {/* Desktop Sidebar */}
      <div className="grid-cols-app sr-only min-h-screen lg:not-sr-only">
        <TooltipProvider delayDuration={0}>
          <ResizablePanelGroup
            draggable={false}
            direction="horizontal"
            onLayout={(sizes: number[]) => {
              document.cookie = `react-resizable-panels:layout=${JSON.stringify(
                sizes,
              )}`
            }}
            className="h-screen w-screen items-stretch"
          >
            <ResizablePanel
              defaultSize={180}
              collapsedSize={4}
              collapsible={true}
              minSize={15}
              maxSize={15}
              className={cn(
                `flex h-screen max-h-screen flex-col bg-secondary pb-4 dark:bg-background`,
                {
                  'min-w-[52px] max-w-[52px] transition-all duration-300 ease-in-out':
                    isCollapsed,
                  'min-w-[250px] max-w-[250px]': !isCollapsed,
                },
              )}
              onCollapse={onColapse}
              onExpand={onExpand}
            >
              <div
                className={cn(
                  'flex w-full items-center px-2 pt-4',
                  isCollapsed
                    ? 'h-24 flex-col justify-center gap-4'
                    : 'h-20 flex-row justify-between',
                )}
              >
                <img src="/white-logo.png" className="w-1/3" alt="Logo" />

                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('hover:bg-white/20', isCollapsed && 'size-10')}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed ? (
                    <ArrowRightFromLine className="size-5 text-white" />
                  ) : (
                    <ArrowLeftFromLine className="size-5 text-white" />
                  )}
                </Button>
              </div>

              <Nav isCollapsed={isCollapsed} links={NAV_LINKS} />

              <div className="mt-auto flex flex-col gap-4 px-2">
                <div
                  className={cn('flex gap-1', {
                    'flex-col': isCollapsed,
                    '': !isCollapsed,
                  })}
                >
                  {user.user_type === 'STUDENT' ? <SettingsButton /> : null}

                  <ModeToggle />

                  <LogoutButton />
                </div>

                <Separator />

                <Profile isCollapsed={isCollapsed} />
              </div>
            </ResizablePanel>
            <ResizableHandle className="bg-secondary" disabled />
            <ResizablePanel>
              <div className="h-screen max-h-screen overflow-y-scroll p-5">
                <Outlet />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TooltipProvider>
      </div>
    </main>
  )
}
