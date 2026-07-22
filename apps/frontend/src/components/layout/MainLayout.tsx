import { type ReactNode, useMemo, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useCoproprietes } from '@/hooks/useCoproprietes'
import { NavigationTour } from './NavigationTour'
import { KoeSupportWidget } from './KoeSupportWidget'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import {
  isItemActive,
  navigationSections,
  coproprietaireNavigationSections,
} from './navigation'
import { canAccessRoute, isCoproprietaire } from '@/utils/roleAccess'
import { useEventStream } from '@/hooks/useEventStream'

const SIDEBAR_STORAGE_KEY = 'sidebar-sections'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()
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
    <div className="flex h-screen bg-background">
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
      <Sidebar
        sidebarOpen={sidebarOpen}
        filteredSections={filteredSections}
        pathname={pathname}
        effectiveSectionState={effectiveSectionState}
        user={user}
        isDark={isDark}
        onCloseSidebar={closeSidebar}
        onToggleSection={toggleSection}
        onToggleTheme={toggleTheme}
        onStartTour={startTour}
        onOpenKoe={() => setKoeOpenSignal(s => s + 1)}
        onLogout={logout}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <TopBar
          pathname={pathname}
          userRole={user?.role}
          selectedCoproprieteId={selectedCoproprieteId}
          coproprietes={coproprietes}
          onOpenSidebar={() => patchUi({ sidebarOpen: true })}
          onSelectCopropriete={setSelectedCoproprieteId}
        />

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
