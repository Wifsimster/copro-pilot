import { Plus, Trash2, Pencil, DoorOpen } from 'lucide-react'
import type { PartieCommune } from '@/types'

const CATEGORIE_LABELS: Record<string, string> = {
  generales: 'Generales',
  speciales: 'Speciales',
}

interface PartiesCommunesTabPanelProps {
  partiesCommunes: PartieCommune[] | undefined
  onCreate: () => void
  onEdit: (pc: PartieCommune) => void
  onDelete: (id: number) => void
}

export function PartiesCommunesTabPanel({ partiesCommunes, onCreate, onEdit, onDelete }: PartiesCommunesTabPanelProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Parties communes</h2>
        <button type="button"
          onClick={onCreate}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Ajouter
        </button>
      </div>

      {(!partiesCommunes || partiesCommunes.length === 0) ? (
        <div className="flex flex-col items-center py-12">
          <DoorOpen className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune partie commune enregistree</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Nom</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Categorie</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Description</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {partiesCommunes.map((pc: PartieCommune) => (
                <tr key={pc.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{pc.nom}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      pc.categorie === 'generales'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {CATEGORIE_LABELS[pc.categorie]}
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-stone-600 dark:text-stone-300">{pc.description || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button type="button"
                        onClick={() => onEdit(pc)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(pc.id)}
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
