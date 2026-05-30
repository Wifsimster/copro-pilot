import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useExtranetProfil } from '@/hooks/useExtranet'
import { AlertCircle, ChevronDown, Users } from 'lucide-react'
import type { ExtranetOutletContext } from '@/components/extranet/shared'

export default function ExtranetLayout() {
  const [selectedCoproId, setSelectedCoproId] = useState<
    number | undefined
  >()

  const {
    data: profil,
    isLoading: loadingProfil,
    error: profilError,
  } = useExtranetProfil()

  const coproprietes = profil?.coproprietes ?? []
  const currentCoproId = selectedCoproId ?? coproprietes[0]?.id
  const isConseil =
    profil?.conseilSyndical?.some(
      cs => cs.copropriete_id === currentCoproId
    ) ?? false

  if (loadingProfil) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Espace coproprietaire
          </h1>
          <p className="text-muted-foreground">Chargement…</p>
        </div>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (profilError || !profil) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Espace coproprietaire
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-16">
          <AlertCircle className="size-16 text-muted-foreground/40" />
          <h3 className="mt-6 text-lg font-medium">
            Acces non disponible
          </h3>
          <p className="mt-2 max-w-md text-center text-muted-foreground">
            Votre compte utilisateur n'est pas lie a un profil
            coproprietaire. Contactez votre syndic pour obtenir
            l'acces.
          </p>
        </div>
      </div>
    )
  }

  const context: ExtranetOutletContext = {
    profil,
    currentCoproId,
    isConseil,
  }

  return (
    <div className="space-y-6">
      {/* Copropriete selector */}
      {coproprietes.length > 1 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground">
            Copropriete :
          </label>
          <div className="relative">
            <select
              value={currentCoproId ?? ''}
              onChange={e =>
                setSelectedCoproId(Number(e.target.value))
              }
              className="appearance-none rounded-lg border border-input bg-background py-2 pl-3 pr-8 text-sm font-medium ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {coproprietes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
          {isConseil && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              <Users className="size-3" /> Conseil syndical
            </span>
          )}
        </div>
      )}

      <Outlet context={context} />
    </div>
  )
}
