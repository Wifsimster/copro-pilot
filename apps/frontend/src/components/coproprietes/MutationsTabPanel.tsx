import { Plus, Trash2, Pencil, ArrowRightLeft } from 'lucide-react'
import type { LotWithProprietaire } from '@/api/lots'
import type { Mutation } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement',
  cave: 'Cave',
  parking: 'Parking',
  commerce: 'Commerce',
  bureau: 'Bureau',
  autre: 'Autre',
}

const TYPE_MUTATION_LABELS: Record<string, string> = {
  vente: 'Vente',
  donation: 'Donation',
  succession: 'Succession',
  autre: 'Autre',
}

interface MutationsTabPanelProps {
  lots: LotWithProprietaire[] | undefined
  mutations: Mutation[] | undefined
  selectedLotId: number | undefined
  onSelectLot: (id: number | undefined) => void
  onCreate: () => void
  onEdit: (m: Mutation) => void
  onDelete: (id: number) => void
}

export function MutationsTabPanel({ lots, mutations, selectedLotId, onSelectLot, onCreate, onEdit, onDelete }: MutationsTabPanelProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="border-b border-stone-200 p-4 dark:border-stone-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Mutations par lot</h2>
          {selectedLotId && (
            <button type="button"
              onClick={onCreate}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
            >
              <Plus className="size-4" />
              Nouvelle mutation
            </button>
          )}
        </div>
        <div className="mt-3">
          <select
            value={selectedLotId || ''}
            onChange={(e) => onSelectLot(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-white"
          >
            <option value="">Selectionner un lot…</option>
            {lots?.map((l: LotWithProprietaire) => (
              <option key={l.id} value={l.id}>Lot {l.numero} - {TYPE_LABELS[l.type] || l.type}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedLotId ? (
        <div className="flex flex-col items-center py-12">
          <ArrowRightLeft className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Selectionnez un lot pour voir ses mutations</p>
        </div>
      ) : (!mutations || mutations.length === 0) ? (
        <div className="flex flex-col items-center py-12">
          <ArrowRightLeft className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune mutation pour ce lot</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Type</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Ancien proprietaire</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Nouveau proprietaire</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {mutations.map((m: Mutation) => (
                <tr key={m.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 text-stone-900 dark:text-white">{new Date(m.date_mutation).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700 dark:bg-stone-700 dark:text-stone-300">
                      {TYPE_MUTATION_LABELS[m.type] || m.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {m.ancien_nom ? `${m.ancien_prenom} ${m.ancien_nom}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {m.nouveau_nom ? `${m.nouveau_prenom} ${m.nouveau_nom}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button type="button"
                        onClick={() => onEdit(m)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(m.id)}
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
