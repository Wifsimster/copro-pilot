import { useNavigate } from 'react-router-dom'
import { Menu, Building2, ChevronDown } from 'lucide-react'
import { NotificationBell } from './NotificationBell'
import { GlobalSearch } from './GlobalSearch'
import { isCoproprietaire } from '@/utils/roleAccess'

interface TopBarCopropriete {
  id: number
  nom: string
}

interface TopBarProps {
  pathname: string
  userRole?: string
  selectedCoproprieteId?: number
  coproprietes: TopBarCopropriete[] | undefined
  onOpenSidebar: () => void
  onSelectCopropriete: (id: number | undefined) => void
}

export function TopBar({
  pathname,
  userRole,
  selectedCoproprieteId,
  coproprietes,
  onOpenSidebar,
  onSelectCopropriete,
}: TopBarProps) {
  const navigate = useNavigate()

  return (
    <header className="flex h-16 items-center gap-3 border-b border-stone-200 bg-white px-4 dark:border-stone-700 dark:bg-stone-900">
      <button type="button"
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5" />
      </button>
      {!isCoproprietaire(userRole) && (
        <div data-tour="copropriete-selector" className="relative shrink-0">
          <Building2 className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
          <select
            value={selectedCoproprieteId ?? ''}
            onChange={(e) => {
              const value = e.target.value
              if (value) {
                const id = parseInt(value)
                onSelectCopropriete(id)
                const detailMatch = pathname.match(/^\/coproprietes\/\d+/)
                if (detailMatch) {
                  navigate(`/coproprietes/${id}`)
                }
              } else {
                onSelectCopropriete(undefined)
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
  )
}
