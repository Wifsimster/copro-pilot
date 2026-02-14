import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useGlobalSearch } from '@/hooks/useGlobalSearch'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import {
  Building2,
  Users,
  Handshake,
  AlertTriangle,
  FolderOpen,
  Calendar,
  Shield,
  LayoutDashboard,
  Receipt,
  Wrench,
  Calculator,
  Landmark,
  Scale,
  HardHat,
  BookOpen,
  ClipboardList,
  Stamp,
  FileDown,
  FileText,
  UsersRound,
  Search,
  Loader2,
} from 'lucide-react'

const navigationItems = [
  { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { name: 'Copropriétés', href: '/coproprietes', icon: Building2 },
  { name: 'Copropriétaires', href: '/coproprietaires', icon: Users },
  { name: 'Charges', href: '/charges', icon: Receipt },
  { name: 'Assemblées', href: '/assemblees', icon: Calendar },
  {
    name: 'Conseil syndical',
    href: '/conseil-syndical',
    icon: UsersRound,
  },
  {
    name: 'Fiche synthétique',
    href: '/fiche-synthetique',
    icon: FileText,
  },
  { name: 'Travaux', href: '/travaux', icon: Wrench },
  { name: 'Contrats', href: '/contrats', icon: Handshake },
  { name: 'Employés', href: '/employes', icon: HardHat },
  {
    name: 'Comptabilité',
    href: '/comptabilite-reglementaire',
    icon: Calculator,
  },
  {
    name: 'Comptes bancaires',
    href: '/comptes-bancaires',
    icon: Landmark,
  },
  { name: 'Assurances', href: '/assurances', icon: Shield },
  { name: 'Contentieux', href: '/contentieux', icon: Scale },
  { name: 'Documents', href: '/documents', icon: FolderOpen },
  { name: 'Règlement', href: '/reglements', icon: BookOpen },
  {
    name: 'Immatriculation',
    href: '/immatriculation',
    icon: ClipboardList,
  },
  { name: 'Contrat syndic', href: '/contrats-syndic', icon: Stamp },
  { name: 'Exports', href: '/exports', icon: FileDown },
]

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { selectedCoproprieteId } = useCoproprieteStore()
  const { query, setQuery, results, isLoading } =
    useGlobalSearch(selectedCoproprieteId)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = useCallback(
    (path: string) => {
      setOpen(false)
      setQuery('')
      navigate(path)
    },
    [navigate, setQuery]
  )

  const hasResults =
    results &&
    (results.coproprietes.length > 0 ||
      results.coproprietaires.length > 0 ||
      results.contrats.length > 0 ||
      results.incidents.length > 0 ||
      results.documents.length > 0 ||
      results.assemblees.length > 0 ||
      results.assurances.length > 0)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Rechercher...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-gray-300 bg-white px-1.5 font-mono text-[10px] font-medium text-gray-500 dark:border-zinc-500 dark:bg-zinc-600 dark:text-zinc-300 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog
        open={open}
        onOpenChange={val => {
          setOpen(val)
          if (!val) setQuery('')
        }}
        title="Recherche globale"
      >
        <CommandInput
          placeholder="Rechercher une copropriété, un copropriétaire, un document..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}

          {query.length >= 2 && !isLoading && !hasResults && (
            <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          )}

          {/* Search results */}
          {results?.coproprietes &&
            results.coproprietes.length > 0 && (
              <CommandGroup heading="Copropriétés">
                {results.coproprietes.map(c => (
                  <CommandItem
                    key={`copro-${c.id}`}
                    value={`copropriete-${c.nom}-${c.adresse}`}
                    onSelect={() =>
                      handleSelect(`/coproprietes/${c.id}`)
                    }
                  >
                    <Building2 className="text-blue-500" />
                    <span className="font-medium">{c.nom}</span>
                    <span className="text-muted-foreground ml-1 truncate text-xs">
                      {c.adresse}, {c.ville}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

          {results?.coproprietaires &&
            results.coproprietaires.length > 0 && (
              <CommandGroup heading="Copropriétaires">
                {results.coproprietaires.map(c => (
                  <CommandItem
                    key={`owner-${c.id}`}
                    value={`coproprietaire-${c.prenom}-${c.nom}`}
                    onSelect={() =>
                      handleSelect('/coproprietaires')
                    }
                  >
                    <Users className="text-green-500" />
                    <span className="font-medium">
                      {c.prenom} {c.nom}
                    </span>
                    {c.email && (
                      <span className="text-muted-foreground ml-1 truncate text-xs">
                        {c.email}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

          {results?.contrats && results.contrats.length > 0 && (
            <CommandGroup heading="Contrats">
              {results.contrats.map(c => (
                <CommandItem
                  key={`contrat-${c.id}`}
                  value={`contrat-${c.objet}-${c.prestataire_nom}`}
                  onSelect={() => handleSelect('/contrats')}
                >
                  <Handshake className="text-purple-500" />
                  <span className="font-medium">{c.objet}</span>
                  {c.prestataire_nom && (
                    <span className="text-muted-foreground ml-1 truncate text-xs">
                      {c.prestataire_nom}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results?.incidents && results.incidents.length > 0 && (
            <CommandGroup heading="Incidents">
              {results.incidents.map(i => (
                <CommandItem
                  key={`incident-${i.id}`}
                  value={`incident-${i.titre}`}
                  onSelect={() => handleSelect('/travaux')}
                >
                  <AlertTriangle className="text-orange-500" />
                  <span className="font-medium">{i.titre}</span>
                  {i.categorie && (
                    <span className="text-muted-foreground ml-1 truncate text-xs">
                      {i.categorie}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results?.documents && results.documents.length > 0 && (
            <CommandGroup heading="Documents">
              {results.documents.map(d => (
                <CommandItem
                  key={`doc-${d.id}`}
                  value={`document-${d.nom}`}
                  onSelect={() => handleSelect('/documents')}
                >
                  <FolderOpen className="text-amber-500" />
                  <span className="font-medium">{d.nom}</span>
                  <span className="text-muted-foreground ml-1 text-xs">
                    {d.categorie}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results?.assemblees && results.assemblees.length > 0 && (
            <CommandGroup heading="Assemblées">
              {results.assemblees.map(a => (
                <CommandItem
                  key={`ag-${a.id}`}
                  value={`assemblee-${a.type}-${a.date}`}
                  onSelect={() =>
                    handleSelect(`/assemblees/${a.id}`)
                  }
                >
                  <Calendar className="text-indigo-500" />
                  <span className="font-medium">AG {a.type}</span>
                  <span className="text-muted-foreground ml-1 text-xs">
                    {new Date(a.date).toLocaleDateString('fr-FR')}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results?.assurances && results.assurances.length > 0 && (
            <CommandGroup heading="Assurances">
              {results.assurances.map(a => (
                <CommandItem
                  key={`assurance-${a.id}`}
                  value={`assurance-${a.compagnie}-${a.numero_police}`}
                  onSelect={() => handleSelect('/assurances')}
                >
                  <Shield className="text-teal-500" />
                  <span className="font-medium">{a.compagnie}</span>
                  {a.numero_police && (
                    <span className="text-muted-foreground ml-1 truncate text-xs">
                      {a.numero_police}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Navigation — always shown when no search query */}
          {query.length < 2 && (
            <>
              {hasResults && <CommandSeparator />}
              <CommandGroup heading="Navigation rapide">
                {navigationItems.map(item => (
                  <CommandItem
                    key={item.href}
                    value={`nav-${item.name}`}
                    onSelect={() => handleSelect(item.href)}
                  >
                    <item.icon className="text-gray-400" />
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
