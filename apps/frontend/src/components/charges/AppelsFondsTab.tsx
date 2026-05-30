import { AppelFondsFormDialog } from '@/components/charges/AppelFondsFormDialog'
import type { AppelFonds } from '@/types'
import { Plus, Trash2, Pencil, Banknote } from 'lucide-react'

const STATUT_APPEL_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  emis: 'Emis',
  cloture: 'Cloture',
}

const STATUT_APPEL_COLORS: Record<string, string> = {
  brouillon: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  emis: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cloture: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

interface AppelsFondsTabProps {
  coproprieteId: number
  appels: AppelFonds[] | undefined
  loading: boolean
  showDialog: boolean
  editing: AppelFonds | null
  onCreate: () => void
  onEdit: (appel: AppelFonds) => void
  onDelete: (id: number) => void
  onDialogOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
  isSubmitting: boolean
}

export function AppelsFondsTab({
  coproprieteId,
  appels,
  loading,
  showDialog,
  editing,
  onCreate,
  onEdit,
  onDelete,
  onDialogOpenChange,
  onSubmit,
  isSubmitting,
}: AppelsFondsTabProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Appels de fonds</h2>
        <button type="button"
          onClick={onCreate}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Nouvel appel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      ) : !appels || appels.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <Banknote className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun appel de fonds enregistre</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Periode</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Montant</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Emission</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Echeance</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {appels.map((appel: AppelFonds) => (
                <tr key={appel.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">T{appel.trimestre} {appel.annee}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {Number(appel.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {new Date(appel.date_emission).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {new Date(appel.date_echeance).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_APPEL_COLORS[appel.statut]}`}>
                      {STATUT_APPEL_LABELS[appel.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button"
                        onClick={() => onEdit(appel)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(appel.id)}
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

      <AppelFondsFormDialog
        open={showDialog}
        onOpenChange={onDialogOpenChange}
        coproprieteId={coproprieteId}
        defaultValues={editing || undefined}
        title={editing ? 'Modifier l\'appel de fonds' : 'Nouvel appel de fonds'}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
      />
    </div>
  )
}
