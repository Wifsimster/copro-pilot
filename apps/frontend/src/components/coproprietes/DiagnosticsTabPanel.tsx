import { Plus, Trash2, Pencil, ClipboardCheck } from 'lucide-react'
import type { Diagnostic } from '@/types'

const TYPE_DIAGNOSTIC_LABELS: Record<string, string> = {
  dpe: 'DPE',
  amiante: 'Amiante',
  plomb: 'Plomb',
  dtg: 'DTG',
  ppt: 'PPT',
  gaz: 'Gaz',
  electricite: 'Electricite',
  autre: 'Autre',
}

const STATUT_DIAGNOSTIC_STYLES: Record<string, string> = {
  valide: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expire: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  a_renouveler: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

const STATUT_DIAGNOSTIC_LABELS: Record<string, string> = {
  valide: 'Valide',
  expire: 'Expire',
  a_renouveler: 'A renouveler',
}

interface DiagnosticsTabPanelProps {
  diagnostics: Diagnostic[] | undefined
  onCreate: () => void
  onEdit: (diag: Diagnostic) => void
  onDelete: (id: number) => void
}

export function DiagnosticsTabPanel({ diagnostics, onCreate, onEdit, onDelete }: DiagnosticsTabPanelProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Diagnostics techniques</h2>
        <button type="button"
          onClick={onCreate}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Ajouter
        </button>
      </div>

      {(!diagnostics || diagnostics.length === 0) ? (
        <div className="flex flex-col items-center py-12">
          <ClipboardCheck className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun diagnostic enregistre</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Type</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Prestataire</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Realisation</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Validite</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {diagnostics.map((diag: Diagnostic) => (
                <tr key={diag.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">
                    {TYPE_DIAGNOSTIC_LABELS[diag.type] || diag.type}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{diag.prestataire || '—'}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {new Date(diag.date_realisation).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {diag.date_validite ? new Date(diag.date_validite).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_DIAGNOSTIC_STYLES[diag.statut] || ''}`}>
                      {STATUT_DIAGNOSTIC_LABELS[diag.statut] || diag.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button type="button"
                        onClick={() => onEdit(diag)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(diag.id)}
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
