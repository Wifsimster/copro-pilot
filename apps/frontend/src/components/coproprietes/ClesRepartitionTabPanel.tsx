import { Plus, Trash2, Pencil, Key } from 'lucide-react'
import type { CleRepartition } from '@/types'

interface ClesRepartitionTabPanelProps {
  clesRepartition: CleRepartition[] | undefined
  onCreate: () => void
  onEdit: (cle: CleRepartition) => void
  onDelete: (id: number) => void
}

export function ClesRepartitionTabPanel({ clesRepartition, onCreate, onEdit, onDelete }: ClesRepartitionTabPanelProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Cles de repartition</h2>
        <button type="button"
          onClick={onCreate}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Ajouter
        </button>
      </div>

      {(!clesRepartition || clesRepartition.length === 0) ? (
        <div className="flex flex-col items-center py-12">
          <Key className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune cle de repartition enregistree</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Nom</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Description</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {clesRepartition.map((cle: CleRepartition) => (
                <tr key={cle.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{cle.nom}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-stone-600 dark:text-stone-300">{cle.description || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button type="button"
                        onClick={() => onEdit(cle)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(cle.id)}
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
