import { Plus, Trash2, Pencil, UserCheck } from 'lucide-react'
import type { LotWithProprietaire } from '@/api/lots'
import type { Locataire } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement',
  cave: 'Cave',
  parking: 'Parking',
  commerce: 'Commerce',
  bureau: 'Bureau',
  autre: 'Autre',
}

interface LocatairesTabPanelProps {
  lots: LotWithProprietaire[] | undefined
  locataires: Locataire[] | undefined
  selectedLotId: number | undefined
  onSelectLot: (id: number | undefined) => void
  onCreate: () => void
  onEdit: (loc: Locataire) => void
  onDelete: (id: number) => void
}

export function LocatairesTabPanel({ lots, locataires, selectedLotId, onSelectLot, onCreate, onEdit, onDelete }: LocatairesTabPanelProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Locataires par lot</h2>
        <div className="mt-3 flex items-center gap-3">
          <select
            value={selectedLotId || ''}
            onChange={(e) => onSelectLot(e.target.value ? parseInt(e.target.value) : undefined)}
            className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-white"
          >
            <option value="">Selectionner un lot…</option>
            {lots?.map((l: LotWithProprietaire) => (
              <option key={l.id} value={l.id}>Lot {l.numero} - {TYPE_LABELS[l.type] || l.type}</option>
            ))}
          </select>
          {selectedLotId && (
            <button type="button"
              onClick={onCreate}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
            >
              <Plus className="size-4" />
              Ajouter
            </button>
          )}
        </div>
      </div>

      {!selectedLotId ? (
        <div className="flex flex-col items-center py-12">
          <UserCheck className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Selectionnez un lot pour voir ses locataires</p>
        </div>
      ) : (!locataires || locataires.length === 0) ? (
        <div className="flex flex-col items-center py-12">
          <UserCheck className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun locataire pour ce lot</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Nom</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Email</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Telephone</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Entree</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Sortie</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {locataires.map((loc: Locataire) => (
                <tr key={loc.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{loc.prenom} {loc.nom}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{loc.email || '—'}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{loc.telephone || '—'}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{loc.date_entree ? new Date(loc.date_entree).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{loc.date_sortie ? new Date(loc.date_sortie).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button type="button"
                        onClick={() => onEdit(loc)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(loc.id)}
                        className="rounded p-1 text-stone-400 hover:text-red-600"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
