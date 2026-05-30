import { type ReactNode, useMemo, useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Collapsible } from 'radix-ui'
import { useAuthStore } from '@/store/authStore'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useCoproprietes } from '@/hooks/useCoproprietes'
import { cn } from '@/lib/utils'
import { NotificationBell } from './NotificationBell'
import { GlobalSearch } from './GlobalSearch'
import { NavigationTour } from './NavigationTour'
import { KoeSupportWidget } from './KoeSupportWidget'
import { canAccessRoute, isCoproprietaire } from '@/utils/roleAccess'
import { useEventStream } from '@/hooks/useEventStream'
import {
  Building2,
  LayoutDashboard,
  UserCircle,
  Users,
  Receipt,
  Calendar,
  Wrench,
  FolderOpen,
  FileText,
  Landmark,
  UsersRound,
  Handshake,
  Shield,
  Scale,
  Calculator,
  HardHat,
  BookOpen,
  ClipboardList,
  Stamp,
  FileDown,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  CreditCard,
  PiggyBank,
  MessageSquare,
  LifeBuoy,
  type LucideIcon,
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

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface NavSection {
  key: string
  label: string
  collapsible: boolean
  items: NavItem[]
}

function isItemActive(pathname: string, href: string) {
  return href === '/' || href === '/extranet'
    ? pathname === href
    : pathname.startsWith(href)
}

function NavItemLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem
  pathname: string
  onNavigate: () => void
}) {
  const active = isItemActive(pathname, item.href)
  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-700'
      )}
    >
      <item.icon className="size-4" />
      {item.name}
    </Link>
  )
}

function SectionView({
  section,
  pathname,
  isOpen,
  onToggle,
  onNavigate,
}: {
  section: NavSection
  pathname: string
  isOpen: boolean
  onToggle: () => void
  onNavigate: () => void
}) {
  const items = section.items.map(item => (
    <NavItemLink
      key={item.name}
      item={item}
      pathname={pathname}
      onNavigate={onNavigate}
    />
  ))

  if (!section.collapsible) {
    return (
      <div className="space-y-0.5">
        <div className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          {section.label}
        </div>
        {items}
      </div>
    )
  }

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={onToggle}
      data-tour={`section-${section.key}`}
    >
      <Collapsible.Trigger className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400 transition-colors hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300">
        {section.label}
        <ChevronRight
          className={cn(
            'size-3.5 transition-transform duration-200',
            isOpen && 'rotate-90'
          )}
        />
      </Collapsible.Trigger>
      <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-[collapsible-up_150ms_ease-out] data-[state=open]:animate-[collapsible-down_150ms_ease-out]">
        <div className="space-y-0.5 pt-0.5">{items}</div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

const navigationSections: NavSection[] = [
  {
    key: 'overview',
    label: 'Vue d\'ensemble',
    collapsible: false,
    items: [
      { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Espace copropriétaire', href: '/extranet', icon: UserCircle },
      { name: 'Copropriétés', href: '/coproprietes', icon: Building2 },
      { name: 'Copropriétaires', href: '/coproprietaires', icon: Users },
    ],
  },
  {
    key: 'gestion',
    label: 'Gestion',
    collapsible: true,
    items: [
      { name: 'Charges', href: '/charges', icon: Receipt },
      { name: 'Assemblées', href: '/assemblees', icon: Calendar },
      { name: 'Conseil syndical', href: '/conseil-syndical', icon: UsersRound },
      { name: 'Messagerie', href: '/tickets', icon: MessageSquare },
      { name: 'Fiche synthétique', href: '/fiche-synthetique', icon: FileText },
    ],
  },
  {
    key: 'technique',
    label: 'Technique',
    collapsible: true,
    items: [
      { name: 'Travaux', href: '/travaux', icon: Wrench },
      { name: 'Contrats', href: '/contrats', icon: Handshake },
      { name: 'Employés', href: '/employes', icon: HardHat },
    ],
  },
  {
    key: 'finances',
    label: 'Finances',
    collapsible: true,
    items: [
      { name: 'Comptabilite', href: '/comptabilite-reglementaire', icon: Calculator },
      { name: 'Comptes bancaires', href: '/comptes-bancaires', icon: Landmark },
      { name: 'Assurances', href: '/assurances', icon: Shield },
      { name: 'Contentieux', href: '/contentieux', icon: Scale },
    ],
  },
  {
    key: 'administration',
    label: 'Administration',
    collapsible: true,
    items: [
      { name: 'Documents', href: '/documents', icon: FolderOpen },
      { name: 'Règlement', href: '/reglements', icon: BookOpen },
      { name: 'Immatriculation', href: '/immatriculation', icon: ClipboardList },
      { name: 'Contrat syndic', href: '/contrats-syndic', icon: Stamp },
      { name: 'Gestion utilisateurs', href: '/gestion-utilisateurs', icon: Users },
      { name: 'Exports', href: '/exports', icon: FileDown },
    ],
  },
]

const coproprietaireNavigationSections: NavSection[] = [
  {
    key: 'mon-espace',
    label: 'Mon espace',
    collapsible: false,
    items: [
      { name: 'Tableau de bord', href: '/extranet', icon: LayoutDashboard },
    ],
  },
  {
    key: 'finances',
    label: 'Finances',
    collapsible: true,
    items: [
      { name: 'Mon compte', href: '/extranet/compte', icon: CreditCard },
      { name: 'Mes charges', href: '/extranet/charges', icon: Receipt },
      { name: 'Appels de fonds', href: '/extranet/appels-fonds', icon: ClipboardList },
      { name: 'Fonds travaux', href: '/extranet/fonds-travaux', icon: PiggyBank },
    ],
  },
  {
    key: 'copropriete',
    label: 'Copropriété',
    collapsible: true,
    items: [
      { name: 'Documents', href: '/extranet/documents', icon: FolderOpen },
      { name: 'Conseil syndical', href: '/extranet/conseil-syndical', icon: UsersRound },
    ],
  },
]

const SIDEBAR_STORAGE_KEY = 'sidebar-sections'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { selectedCoproprieteId, setSelectedCoproprieteId } = useCoproprieteStore()
  const { data: coproprietes } = useCoproprietes()

  useEventStream()

  const [ui, setUi] = useState<{ sidebarOpen: boolean; tourRunning: boolean }>({
    sidebarOpen: false,
    tourRunning: false,
  })
  const patchUi = (p: Partial<typeof ui>) => setUi(s => ({ ...s, ...p }))
  const { sidebarOpen, tourRunning } = ui
  const [koeOpenSignal, setKoeOpenSignal] = useState(0)
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  )

  const [sectionState, setSectionState] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch { /* ignore */ }
    return { gestion: true, technique: true, finances: true, administration: true }
  })

  const toggleSection = (key: string) => {
    setSectionState(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const pathname = location.pathname

  const filteredSections = useMemo(() => {
    const role = user?.role
    const baseSections = isCoproprietaire(role)
      ? coproprietaireNavigationSections
      : navigationSections
    return baseSections.flatMap(section => {
      const items = section.items.filter(item =>
        canAccessRoute(role, item.href)
      )
      return items.length > 0 ? [{ ...section, items }] : []
    })
  }, [user?.role])

  // Auto-expand section containing active route
  const effectiveSectionState = { ...sectionState }
  for (const section of filteredSections) {
    if (
      section.collapsible &&
      section.items.some(item => isItemActive(pathname, item.href))
    ) {
      effectiveSectionState[section.key] = true
    }
  }

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const startTour = useCallback(() => {
    patchUi({ sidebarOpen: false })
    patchUi({ tourRunning: true })
  }, [])

  const onTourFinish = useCallback(() => {
    patchUi({ tourRunning: false })
  }, [])

  const closeSidebar = () => patchUi({ sidebarOpen: false })

  return (
    <div className="flex h-screen bg-[#FAF8F5] dark:bg-stone-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => patchUi({ sidebarOpen: false })}
        />
      )}

      {/* Sidebar */}
      <aside
        data-tour="sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-lg transition-transform dark:bg-stone-900 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-stone-200 px-6 dark:border-stone-700">
          <img src="/logo.svg" alt="CoproPilot" className="size-8 rounded-lg" />
          <span className="text-lg font-bold text-stone-900 dark:text-white">CoproPilot</span>
          <button type="button"
            onClick={() => patchUi({ sidebarOpen: false })}
            className="ml-auto lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="size-5 text-stone-500" />
          </button>
        </div>

        {/* Vue d'ensemble */}
        <div data-tour="section-overview" className="border-b border-stone-200 px-4 pt-4 pb-3 dark:border-stone-700">
          <SectionView
            section={filteredSections[0]}
            pathname={pathname}
            isOpen={effectiveSectionState[filteredSections[0].key] ?? true}
            onToggle={() => toggleSection(filteredSections[0].key)}
            onNavigate={closeSidebar}
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
              onToggle={() => toggleSection(section.key)}
              onNavigate={closeSidebar}
            />
          ))}
        </nav>

        {/* User menu */}
        <div data-tour="user-profile" className="border-t border-stone-200 p-2 dark:border-stone-700">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-stone-100 data-[state=open]:bg-stone-100 dark:hover:bg-stone-800 dark:data-[state=open]:bg-stone-800">
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {(user?.firstname?.[0] ?? '').toUpperCase()}
                    {(user?.lastname?.[0] ?? '').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-stone-900 dark:text-white">
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
                    patchUi({ sidebarOpen: false })
                  }}
                >
                  <UserCircle />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigate('/donnees-personnelles')
                    patchUi({ sidebarOpen: false })
                  }}
                >
                  <Shield className="size-4" />
                  Mes données personnelles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme}>
                  {isDark ? <Sun /> : <Moon />}
                  {isDark ? 'Mode clair' : 'Mode sombre'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={startTour}>
                  <CircleHelp />
                  Aide
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setKoeOpenSignal(s => s + 1)
                    patchUi({ sidebarOpen: false })
                  }}
                >
                  <LifeBuoy />
                  Support & retours
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={logout}
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

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-3 border-b border-stone-200 bg-white px-4 dark:border-stone-700 dark:bg-stone-900">
          <button type="button"
            onClick={() => patchUi({ sidebarOpen: true })}
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-5" />
          </button>
          {!isCoproprietaire(user?.role) && (
            <div data-tour="copropriete-selector" className="relative shrink-0">
              <Building2 className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
              <select
                value={selectedCoproprieteId ?? ''}
                onChange={(e) => {
                  const value = e.target.value
                  if (value) {
                    const id = parseInt(value)
                    setSelectedCoproprieteId(id)
                    const detailMatch = pathname.match(/^\/coproprietes\/\d+/)
                    if (detailMatch) {
                      navigate(`/coproprietes/${id}`)
                    }
                  } else {
                    setSelectedCoproprieteId(undefined)
                  }
                }}
                className="appearance-none rounded-lg border border-stone-200 bg-stone-50 py-2 pl-8 pr-8 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-100 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-white dark:hover:bg-stone-700 dark:focus:bg-stone-800 dark:focus:border-emerald-500"
              >
                <option value="" className="dark:bg-stone-800 dark:text-white">Toutes les copropriétés</option>
                {coproprietes?.map((c) => (
                  <option key={c.id} value={c.id} className="dark:bg-stone-800 dark:text-white">{c.nom}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
            </div>
          )}
          <div data-tour="global-search" className="min-w-0 flex-1">
            <GlobalSearch />
          </div>
          <div data-tour="notifications" className="shrink-0">
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      <NavigationTour run={tourRunning} onFinish={onTourFinish} role={user?.role} />
      <KoeSupportWidget openSignal={koeOpenSignal} />
    </div>
  )
}
