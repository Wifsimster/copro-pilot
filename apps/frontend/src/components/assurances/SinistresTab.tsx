import { FileWarning, Plus, Trash2, Pencil } from 'lucide-react'
import { SinistreFormDialog } from '@/components/assurances/SinistreFormDialog'
import type { Assurance, Sinistre, Incident } from '@/types'

const STATUT_SINISTRE_LABELS: Record<string, string> = {
  declare: 'Declare',
  en_instruction: 'En instruction',
  accepte: 'Accepte',
  refuse: 'Refuse',
  clos: 'Clos',
}

const STATUT_SINISTRE_COLORS: Record<string, string> = {
  declare: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  en_instruction: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  accepte: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  refuse: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  clos: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
}

interface SinistresTabProps {
  sinistres: Sinistre[] | undefined
  loadingSinistres: boolean
  showSinistreDialog: boolean
  editingSinistre: Sinistre | null
  selectedCoproId: number
  assurances: Assurance[]
  incidents: Incident[]
  isSubmitting: boolean
  onNew: () => void
  onEdit: (sinistre: Sinistre) => void
  onDelete: (id: number) => void
  onDialogOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Sinistre>) => Promise<void>
}

export function SinistresTab({
  sinistres,
  loadingSinistres,
  showSinistreDialog,
  editingSinistre,
  selectedCoproId,
  assurances,
  incidents,
  isSubmitting,
  onNew,
  onEdit,
  onDelete,
  onDialogOpenChange,
  onSubmit,
}: SinistresTabProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Sinistres</h2>
        <button type="button"
          onClick={onNew}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Declarer un sinistre
        </button>
      </div>

      {loadingSinistres ? (
        <div className="flex justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      ) : !sinistres || sinistres.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <FileWarning className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun sinistre enregistre</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">N° sinistre</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Description</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Assurance</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Montant estime</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Indemnise</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {sinistres.map((sinistre: Sinistre) => (
                <tr key={sinistre.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{sinistre.numero_sinistre || '—'}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-stone-600 dark:text-stone-300">{sinistre.description || '—'}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{sinistre.assurance_compagnie || '—'}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {sinistre.montant_estime
                      ? Number(sinistre.montant_estime).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {sinistre.montant_indemnise
                      ? Number(sinistre.montant_indemnise).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_SINISTRE_COLORS[sinistre.statut]}`}>
                      {STATUT_SINISTRE_LABELS[sinistre.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {new Date(sinistre.date_sinistre).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button"
                        onClick={() => onEdit(sinistre)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(sinistre.id)}
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

      <SinistreFormDialog
        open={showSinistreDialog}
        onOpenChange={onDialogOpenChange}
        coproprieteId={selectedCoproId}
        defaultValues={editingSinistre || undefined}
        title={editingSinistre ? 'Modifier le sinistre' : 'Declarer un sinistre'}
        assurances={assurances}
        incidents={incidents}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
      />
    </div>
  )
}
