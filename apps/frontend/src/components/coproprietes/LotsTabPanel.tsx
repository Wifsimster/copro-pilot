import { Plus, Trash2, Pencil, Home } from 'lucide-react'
import type { LotWithProprietaire } from '@/api/lots'

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement',
  cave: 'Cave',
  parking: 'Parking',
  commerce: 'Commerce',
  bureau: 'Bureau',
  autre: 'Autre',
}

interface LotsTabPanelProps {
  lots: LotWithProprietaire[] | undefined
  onCreate: () => void
  onEdit: (lot: LotWithProprietaire) => void
  onDelete: (lotId: number) => void
}

export function LotsTabPanel({ lots, onCreate, onEdit, onDelete }: LotsTabPanelProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Lots</h2>
        <button type="button"
          onClick={onCreate}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Ajouter un lot
        </button>
      </div>

      {(!lots || lots.length === 0) ? (
        <div className="flex flex-col items-center py-12">
          <Home className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun lot enregistre</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">N</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Type</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Surface</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Etage</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Tantiemes</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Proprietaire</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot: LotWithProprietaire) => (
                <tr key={lot.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{lot.numero}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{TYPE_LABELS[lot.type] || lot.type}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{lot.surface ? `${lot.surface} m2` : '—'}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{lot.etage !== null ? lot.etage : '—'}</td>
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{lot.tantiemes}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {lot.proprietaire_nom
                      ? `${lot.proprietaire_prenom} ${lot.proprietaire_nom}`
                      : <span className="text-stone-400 italic">Non attribue</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button type="button"
                        onClick={() => onEdit(lot)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(lot.id)}
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
