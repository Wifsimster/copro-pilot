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
    <header className="flex h-16 items-center gap-3 border-b border-border bg-card px-4">
      <button type="button"
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-muted-foreground hover:bg-accent lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5" />
      </button>
      {!isCoproprietaire(userRole) && (
        <div data-tour="copropriete-selector" className="relative shrink-0">
          <Building2 className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
            className="appearance-none rounded-lg border border-input bg-muted py-2 pl-8 pr-8 text-sm font-medium text-foreground transition-colors hover:bg-accent focus:border-ring focus:bg-card focus:ring-1 focus:ring-ring focus:outline-none"
          >
            <option value="">Toutes les copropriétés</option>
            {coproprietes?.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
