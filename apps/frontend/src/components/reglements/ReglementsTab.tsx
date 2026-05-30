import { Plus, Pencil, Trash2, FileText } from 'lucide-react'
import { ReglementFormDialog } from '@/components/reglements/ReglementFormDialog'
import type { ReglementCopropriete } from '@/types'

const DESTINATION_LABELS: Record<string, string> = {
  habitation: 'Habitation',
  commerce: 'Commerce',
  mixte: 'Mixte',
}

const DESTINATION_COLORS: Record<string, string> = {
  habitation: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  commerce: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  mixte: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

type ReglementsTabProps = {
  reglements: ReglementCopropriete[] | undefined
  loadingReglements: boolean
  coproprieteId: number
  showReglementDialog: boolean
  editingReglement: ReglementCopropriete | null
  onCreate: () => void
  onEdit: (reglement: ReglementCopropriete) => void
  onDelete: (id: number) => void
  onDialogOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<ReglementCopropriete>) => Promise<void>
  isLoading: boolean
}

export function ReglementsTab({
  reglements,
  loadingReglements,
  coproprieteId,
  showReglementDialog,
  editingReglement,
  onCreate,
  onEdit,
  onDelete,
  onDialogOpenChange,
  onSubmit,
  isLoading,
}: ReglementsTabProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Reglements</h2>
        <button type="button"
          onClick={onCreate}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Nouveau reglement
        </button>
      </div>

      {loadingReglements ? (
        <div className="flex justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      ) : !reglements || reglements.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <FileText className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun reglement enregistre</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date d'etablissement</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Notaire</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Destination</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {reglements.map((reglement: ReglementCopropriete) => (
                <tr key={reglement.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">
                    {new Date(reglement.date_etablissement).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{reglement.notaire || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${DESTINATION_COLORS[reglement.destination_immeuble]}`}>
                      {DESTINATION_LABELS[reglement.destination_immeuble]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {reglement.date_derniere_modification ? (
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        Modifie le {new Date(reglement.date_derniere_modification).toLocaleDateString('fr-FR')}
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Original
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button"
                        onClick={() => onEdit(reglement)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(reglement.id)}
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

      <ReglementFormDialog
        open={showReglementDialog}
        onOpenChange={onDialogOpenChange}
        coproprieteId={coproprieteId}
        defaultValues={editingReglement || undefined}
        title={editingReglement ? 'Modifier le reglement' : 'Nouveau reglement'}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
