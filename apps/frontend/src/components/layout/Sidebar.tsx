import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { isCoproprietaire } from '@/utils/roleAccess'
import { SectionView } from './SectionView'
import type { NavSection } from './navigation'
import {
  X,
  UserCircle,
  Shield,
  Sun,
  Moon,
  CircleHelp,
  LifeBuoy,
  LogOut,
  ChevronsUpDown,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SidebarUser {
  firstname?: string
  lastname?: string
  email?: string
  role?: string
}

interface SidebarProps {
  sidebarOpen: boolean
  filteredSections: NavSection[]
  pathname: string
  effectiveSectionState: Record<string, boolean>
  user: SidebarUser | null | undefined
  isDark: boolean
  onCloseSidebar: () => void
  onToggleSection: (key: string) => void
  onToggleTheme: () => void
  onStartTour: () => void
  onOpenKoe: () => void
  onLogout: () => void
}

export function Sidebar({
  sidebarOpen,
  filteredSections,
  pathname,
  effectiveSectionState,
  user,
  isDark,
  onCloseSidebar,
  onToggleSection,
  onToggleTheme,
  onStartTour,
  onOpenKoe,
  onLogout,
}: SidebarProps) {
  const navigate = useNavigate()

  return (
    <aside
      data-tour="sidebar"
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card shadow-lg transition-transform lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <img src="/logo.svg" alt="CoproPilot" className="size-8 rounded-lg" />
        <span className="text-lg font-bold text-foreground">CoproPilot</span>
        <button type="button"
          onClick={onCloseSidebar}
          className="ml-auto lg:hidden"
          aria-label="Fermer le menu"
        >
          <X className="size-5 text-muted-foreground" />
        </button>
      </div>

      {/* Vue d'ensemble */}
      <div data-tour="section-overview" className="border-b border-border px-4 pt-4 pb-3">
        <SectionView
          section={filteredSections[0]}
          pathname={pathname}
          isOpen={effectiveSectionState[filteredSections[0].key] ?? true}
          onToggle={() => onToggleSection(filteredSections[0].key)}
          onNavigate={onCloseSidebar}
        />
      </div>


      {/* Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto p-4">
        {filteredSections.slice(1).map(section => (
          <SectionView
            key={section.key}
            section={section}
            pathname={pathname}
            isOpen={effectiveSectionState[section.key] ?? true}
            onToggle={() => onToggleSection(section.key)}
            onNavigate={onCloseSidebar}
          />
        ))}
      </nav>

      {/* User menu */}
      <div data-tour="user-profile" className="border-t border-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-accent data-[state=open]:bg-accent">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {(user?.firstname?.[0] ?? '').toUpperCase()}
                  {(user?.lastname?.[0] ?? '').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-foreground">
                  {user?.firstname} {user?.lastname}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="end"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {(user?.firstname?.[0] ?? '').toUpperCase()}
                    {(user?.lastname?.[0] ?? '').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.firstname} {user?.lastname}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  navigate(isCoproprietaire(user?.role) ? '/extranet/profil' : '/profil')
                  onCloseSidebar()
                }}
              >
                <UserCircle />
                Mon profil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigate('/donnees-personnelles')
                  onCloseSidebar()
                }}
              >
                <Shield className="size-4" />
                Mes données personnelles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleTheme}>
                {isDark ? <Sun /> : <Moon />}
                {isDark ? 'Mode clair' : 'Mode sombre'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onStartTour}>
                <CircleHelp />
                Aide
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  onOpenKoe()
                  onCloseSidebar()
                }}
              >
                <LifeBuoy />
                Support & retours
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={onLogout}
            >
              <LogOut />
              Déconnexion
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-center text-[10px] text-muted-foreground">
              v{__APP_VERSION__} · {new Date(__BUILD_DATE__).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
