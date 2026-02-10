import { type ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Collapsible } from 'radix-ui'
import { useAuthStore } from '@/store/authStore'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useCoproprietes } from '@/hooks/useCoproprietes'
import { cn } from '@/lib/utils'
import { NotificationBell } from './NotificationBell'
import {
  Building2,
  LayoutDashboard,
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
  type LucideIcon,
} from 'lucide-react'

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

const navigationSections: NavSection[] = [
  {
    key: 'overview',
    label: 'Vue d\'ensemble',
    collapsible: false,
    items: [
      { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
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
      { name: 'Exports', href: '/exports', icon: FileDown },
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(
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

  // Auto-expand section containing active route
  const effectiveSectionState = { ...sectionState }
  for (const section of navigationSections) {
    if (
      section.collapsible &&
      section.items.some(item =>
        item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
      )
    ) {
      effectiveSectionState[section.key] = true
    }
  }

  const isItemActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

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

  const renderNavItem = (item: NavItem) => {
    const active = isItemActive(item.href)
    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
          active
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            : 'text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-700'
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.name}
      </Link>
    )
  }

  const renderSection = (section: NavSection) => {
    if (!section.collapsible) {
      return (
        <div key={section.key} className="space-y-0.5">
          <div className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            {section.label}
          </div>
          {section.items.map(renderNavItem)}
        </div>
      )
    }

    const isOpen = effectiveSectionState[section.key] ?? true

    return (
      <Collapsible.Root
        key={section.key}
        open={isOpen}
        onOpenChange={() => toggleSection(section.key)}
      >
        <Collapsible.Trigger className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 transition-colors hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300">
          {section.label}
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-200',
              isOpen && 'rotate-90'
            )}
          />
        </Collapsible.Trigger>
        <Collapsible.Content
          className="overflow-hidden data-[state=closed]:animate-[collapsible-up_150ms_ease-out] data-[state=open]:animate-[collapsible-down_150ms_ease-out]"
        >
          <div className="space-y-0.5 pt-0.5">
            {section.items.map(renderNavItem)}
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-lg transition-transform dark:bg-zinc-800 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6 dark:border-zinc-700">
          <img src="/logo.svg" alt="CoproPilot" className="h-8 w-8 rounded-lg" />
          <span className="text-lg font-bold text-gray-900 dark:text-white">CoproPilot</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Copropriete selector */}
        <div className="border-b border-gray-200 px-4 py-3 dark:border-zinc-700">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            Copropriété
          </label>
          <div className="relative">
            <select
              value={selectedCoproprieteId ?? ''}
              onChange={(e) => {
                const value = e.target.value
                if (value) {
                  const id = parseInt(value)
                  setSelectedCoproprieteId(id)
                  navigate(`/coproprietes/${id}`)
                } else {
                  setSelectedCoproprieteId(undefined)
                  navigate('/coproprietes')
                }
                setSidebarOpen(false)
              }}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 pr-8 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600 dark:focus:bg-zinc-700 dark:focus:border-blue-500"
            >
              <option value="" className="dark:bg-zinc-800 dark:text-white">Toutes les copropriétés</option>
              {coproprietes?.map((c) => (
                <option key={c.id} value={c.id} className="dark:bg-zinc-800 dark:text-white">{c.nom}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-4 overflow-y-auto p-4">
          {navigationSections.map(renderSection)}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 p-4 dark:border-zinc-700">
          <div className="mb-3 text-sm text-gray-600 dark:text-zinc-400">
            {user?.firstname} {user?.lastname}
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
              title={isDark ? 'Mode clair' : 'Mode sombre'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="flex h-16 items-center border-b border-gray-200 bg-white px-4 dark:border-zinc-700 dark:bg-zinc-800 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-3 text-lg font-bold text-gray-900 dark:text-white">CoproPilot</span>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
