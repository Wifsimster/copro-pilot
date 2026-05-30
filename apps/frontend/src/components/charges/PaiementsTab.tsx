import { PaiementFormDialog } from '@/components/charges/PaiementFormDialog'
import type { AppelFonds, Paiement, Coproprietaire } from '@/types'
import { Plus, Trash2, Pencil, CreditCard } from 'lucide-react'

const MODE_PAIEMENT_LABELS: Record<string, string> = {
  virement: 'Virement',
  cheque: 'Cheque',
  prelevement: 'Prelevement',
  especes: 'Especes',
  autre: 'Autre',
}

interface PaiementsTabProps {
  paiements: Paiement[] | undefined
  loading: boolean
  showDialog: boolean
  editing: Paiement | null
  coproprietaires: Coproprietaire[]
  appelsFonds: AppelFonds[]
  onCreate: () => void
  onEdit: (paiement: Paiement) => void
  onDelete: (id: number) => void
  onDialogOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
  isSubmitting: boolean
}

export function PaiementsTab({
  paiements,
  loading,
  showDialog,
  editing,
  coproprietaires,
  appelsFonds,
  onCreate,
  onEdit,
  onDelete,
  onDialogOpenChange,
  onSubmit,
  isSubmitting,
}: PaiementsTabProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Paiements</h2>
        <button type="button"
          onClick={onCreate}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Nouveau paiement
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      ) : !paiements || paiements.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <CreditCard className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun paiement enregistre</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Coproprietaire</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Montant</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Mode</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Reference</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {paiements.map((paiement: Paiement) => (
                <tr key={paiement.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">
                    {paiement.prenom} {paiement.nom}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {Number(paiement.montant).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {new Date(paiement.date_paiement).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {MODE_PAIEMENT_LABELS[paiement.mode] || paiement.mode}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {paiement.reference || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button"
                        onClick={() => onEdit(paiement)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(paiement.id)}
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

      <PaiementFormDialog
        open={showDialog}
        onOpenChange={onDialogOpenChange}
        coproprietaireId={editing?.coproprietaire_id}
        appelFondsId={editing?.appel_fonds_id || undefined}
        coproprietaires={coproprietaires}
        appelsFonds={appelsFonds}
        defaultValues={editing || undefined}
        title={editing ? 'Modifier le paiement' : 'Nouveau paiement'}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
      />
    </div>
  )
}
