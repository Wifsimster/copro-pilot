import { Plus, Trash2, Pencil, Mail, Loader2, Send, UserPlus, Eye } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { CONVOCATIONS_QUERY_KEY } from '@/hooks/useConvocations'
import { convocationsApi } from '@/api/convocations'
import { ConvocationFormDialog } from '@/components/assemblees/ConvocationFormDialog'
import type { ConvocationAG, DestinataireConvocation } from '@/types'

const CONVOC_STATUT_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  validee: 'Validee',
  envoyee: 'Envoyee',
  cloturee: 'Cloturee',
}

const CONVOC_STATUT_COLORS: Record<string, string> = {
  brouillon: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  validee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  envoyee: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cloturee: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

const DEST_STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  envoyee: 'Envoyee',
  recue: 'Recue',
  ar_signe: 'AR signe',
}

const DEST_STATUT_COLORS: Record<string, string> = {
  en_attente: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  envoyee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  recue: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ar_signe: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const MODE_ENVOI_LABELS: Record<string, string> = {
  email: 'Email',
  courrier_recommande: 'Courrier recommande',
  les_deux: 'Email + Courrier',
}

interface ConvocationsTabProps {
  agId: number | undefined
  convocations: ConvocationAG[] | undefined
  expandedConvocation: number | null
  showConvocationDialog: boolean
  editingConvocation: ConvocationAG | null
  genererDestinatairesIsPending: boolean
  envoyerConvocationIsPending: boolean
  createIsPending: boolean
  updateIsPending: boolean
  onShowDialog: () => void
  onGenererDestinataires: (id: number) => void
  onEnvoyer: (id: number) => void
  onToggleExpand: (id: number) => void
  onEdit: (convoc: ConvocationAG) => void
  onDeleteTarget: (id: number) => void
  onDialogOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<ConvocationAG>) => Promise<void>
}

export function ConvocationsTab({
  agId,
  convocations,
  expandedConvocation,
  showConvocationDialog,
  editingConvocation,
  genererDestinatairesIsPending,
  envoyerConvocationIsPending,
  createIsPending,
  updateIsPending,
  onShowDialog,
  onGenererDestinataires,
  onEnvoyer,
  onToggleExpand,
  onEdit,
  onDeleteTarget,
  onDialogOpenChange,
  onSubmit,
}: ConvocationsTabProps) {
  // Fetch destinataires when expanding a convocation
  const { data: expandedDestinataires } = useQuery({
    queryKey: [...CONVOCATIONS_QUERY_KEY, 'destinataires', expandedConvocation],
    queryFn: async () => {
      const response = await convocationsApi.getDestinataires(expandedConvocation!)
      return response.data
    },
    enabled: !!expandedConvocation,
  })

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
        <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Convocations</h2>
          <button type="button"
            onClick={onShowDialog}
            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
          >
            <Plus className="size-4" />
            Nouvelle convocation
          </button>
        </div>

        {(!convocations || convocations.length === 0) ? (
          <div className="flex flex-col items-center py-12">
            <Mail className="size-10 text-stone-300 dark:text-stone-600" />
            <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune convocation creee</p>
            <p className="text-xs text-stone-400 dark:text-stone-500">Creez une convocation pour envoyer aux coproprietaires</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-700/50">
            {convocations.map((convoc: ConvocationAG) => (
              <div key={convoc.id}>
                <div className="p-4 hover:bg-stone-50 dark:hover:bg-stone-800/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CONVOC_STATUT_COLORS[convoc.statut]}`}>
                          {CONVOC_STATUT_LABELS[convoc.statut]}
                        </span>
                        <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                          {MODE_ENVOI_LABELS[convoc.mode_envoi]}
                        </span>
                      </div>
                      {convoc.date_envoi && (
                        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                          Envoyee le {new Date(convoc.date_envoi).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                      {convoc.notes && (
                        <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">{convoc.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {convoc.statut === 'brouillon' && (
                        <>
                          <button type="button"
                            onClick={() => onGenererDestinataires(convoc.id)}
                            disabled={genererDestinatairesIsPending}
                            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            title="Generer les destinataires"
                          >
                            <UserPlus className="size-3.5" />
                            Destinataires
                          </button>
                          <button type="button"
                            onClick={() => onEnvoyer(convoc.id)}
                            disabled={envoyerConvocationIsPending}
                            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Envoyer la convocation"
                          >
                            {envoyerConvocationIsPending ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Send className="size-3.5" />
                            )}
                            Envoyer
                          </button>
                        </>
                      )}
                      <button type="button"
                        onClick={() => onToggleExpand(convoc.id)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        title="Voir les destinataires"
                        aria-label="Voir les destinataires"
                      >
                        <Eye className="size-4" />
                      </button>
                      {convoc.statut === 'brouillon' && (
                        <button type="button"
                          onClick={() => onEdit(convoc)}
                          className="rounded p-1 text-stone-400 hover:text-emerald-700"
                          aria-label="Modifier"
                        >
                          <Pencil className="size-4" />
                        </button>
                      )}
                      {convoc.statut === 'brouillon' && (
                        <button type="button"
                          onClick={() => onDeleteTarget(convoc.id)}
                          className="rounded p-1 text-stone-400 hover:text-red-600"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded destinataires */}
                {expandedConvocation === convoc.id && (
                  <div className="border-t border-stone-100 bg-stone-50/50 px-4 py-3 dark:border-stone-700/50 dark:bg-stone-800/50">
                    <h4 className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                      Destinataires
                      {expandedDestinataires && (
                        <span className="ml-1 text-stone-400">({expandedDestinataires.length})</span>
                      )}
                    </h4>
                    {!expandedDestinataires ? (
                      <div className="flex items-center gap-2 py-2">
                        <Loader2 className="size-4 animate-spin text-stone-400" />
                        <span className="text-sm text-stone-400">Chargement…</span>
                      </div>
                    ) : expandedDestinataires.length === 0 ? (
                      <p className="text-sm text-stone-400 dark:text-stone-500">
                        Aucun destinataire. Cliquez "Destinataires" pour generer la liste.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left text-stone-500 dark:text-stone-400">
                              <th className="pb-2 pr-4">Nom</th>
                              <th className="pb-2 pr-4">Email</th>
                              <th className="pb-2 pr-4">Mode</th>
                              <th className="pb-2 pr-4">Statut</th>
                              <th className="pb-2 pr-4">Reception</th>
                              <th className="pb-2">AR</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expandedDestinataires.map((dest: DestinataireConvocation) => (
                              <tr key={dest.id} className="border-t border-stone-100 dark:border-stone-700/50">
                                <td className="py-2 pr-4 font-medium text-stone-900 dark:text-white">
                                  {dest.coproprietaire_prenom} {dest.coproprietaire_nom}
                                </td>
                                <td className="py-2 pr-4 text-stone-500 dark:text-stone-400">
                                  {dest.email_envoye_a || '—'}
                                </td>
                                <td className="py-2 pr-4 text-stone-500 dark:text-stone-400">
                                  {dest.mode_envoi ? (dest.mode_envoi === 'email' ? 'Email' : 'Courrier') : '—'}
                                </td>
                                <td className="py-2 pr-4">
                                  <span className={`inline-flex rounded-full px-1.5 py-0.5 text-xs font-medium ${DEST_STATUT_COLORS[dest.statut]}`}>
                                    {DEST_STATUT_LABELS[dest.statut]}
                                  </span>
                                </td>
                                <td className="py-2 pr-4 text-stone-500 dark:text-stone-400">
                                  {dest.date_reception ? new Date(dest.date_reception).toLocaleDateString('fr-FR') : '—'}
                                </td>
                                <td className="py-2 text-stone-500 dark:text-stone-400">
                                  {dest.date_ar ? new Date(dest.date_ar).toLocaleDateString('fr-FR') : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {agId && (
        <ConvocationFormDialog
          open={showConvocationDialog || !!editingConvocation}
          onOpenChange={onDialogOpenChange}
          agId={agId}
          defaultValues={editingConvocation ?? undefined}
          title={editingConvocation ? 'Modifier la convocation' : 'Nouvelle convocation'}
          onSubmit={onSubmit}
          isLoading={editingConvocation ? updateIsPending : createIsPending}
        />
      )}
    </div>
  )
}
