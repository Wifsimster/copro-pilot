import { Plus, Trash2, Pencil, Users } from 'lucide-react'
import { PresenceFormDialog } from '@/components/assemblees/PresenceFormDialog'
import type { PresenceAG } from '@/types'

interface PresencesTabProps {
  agId: number | undefined
  presences: PresenceAG[] | undefined
  showPresenceDialog: boolean
  editingPresence: PresenceAG | null
  setPresenceIsPending: boolean
  onShowDialog: () => void
  onEdit: (p: PresenceAG) => void
  onDeleteTarget: (id: number) => void
  onDialogOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<PresenceAG>) => Promise<void>
}

export function PresencesTab({
  agId,
  presences,
  showPresenceDialog,
  editingPresence,
  setPresenceIsPending,
  onShowDialog,
  onEdit,
  onDeleteTarget,
  onDialogOpenChange,
  onSubmit,
}: PresencesTabProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Feuille de presence</h2>
        <button type="button"
          onClick={onShowDialog}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Ajouter
        </button>
      </div>

      {(!presences || presences.length === 0) ? (
        <div className="flex flex-col items-center py-12">
          <Users className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune presence enregistree</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Coproprietaire</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Represente par</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Tantiemes</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {presences.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">
                    {p.coproprietaire_prenom} {p.coproprietaire_nom}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.statut === 'present'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : p.statut === 'represente'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                    }`}>
                      {p.statut === 'present' ? 'Present' : p.statut === 'represente' ? 'Represente' : 'Absent'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {p.represente_par_nom ? `${p.represente_par_prenom} ${p.represente_par_nom}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{p.tantiemes}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button"
                        onClick={() => onEdit(p)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDeleteTarget(p.id)}
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

      {agId && (
        <PresenceFormDialog
          open={showPresenceDialog || !!editingPresence}
          onOpenChange={onDialogOpenChange}
          agId={agId}
          defaultValues={editingPresence ?? undefined}
          title={editingPresence ? 'Modifier la presence' : 'Ajouter une presence'}
          onSubmit={onSubmit}
          isLoading={setPresenceIsPending}
        />
      )}
    </div>
  )
}
