import { useState } from 'react'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { usePrestataires, useCreatePrestataire, useUpdatePrestataire, useDeletePrestataire } from '@/hooks/usePrestataires'
import { useContratsByCopropriete, useCreateContrat, useUpdateContrat, useDeleteContrat } from '@/hooks/useContrats'
import { PrestataireFormDialog } from '@/components/contrats/PrestataireFormDialog'
import { ContratFormDialog } from '@/components/contrats/ContratFormDialog'
import type { Contrat, Prestataire } from '@/types'
import { Handshake, Plus, Trash2, Pencil, FileSignature, Building2, AlertTriangle } from 'lucide-react'
import { ErrorAlert } from '@/components/layout/ErrorAlert'
import { TabBar } from '@/components/layout/TabBar'

const STATUT_CONTRAT_LABELS: Record<string, string> = {
  actif: 'Actif',
  expire: 'Expire',
  resilie: 'Resilie',
  en_attente: 'En attente',
}

const STATUT_CONTRAT_COLORS: Record<string, string> = {
  actif: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expire: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  resilie: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  en_attente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

const FREQUENCE_LABELS: Record<string, string> = {
  mensuel: 'Mensuel',
  trimestriel: 'Trimestriel',
  semestriel: 'Semestriel',
  annuel: 'Annuel',
}

type Tab = 'contrats' | 'prestataires'

const isExpiringSoon = (dateStr: string | null) => {
  if (!dateStr) return false
  const diff = new Date(dateStr).getTime() - Date.now()
  return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000
}

export default function ContratsPage() {
  const selectedCoproId = useCoproprieteStore((s) => s.selectedCoproprieteId)
  const [ui, setUi] = useState<{
    activeTab: Tab
    showContratDialog: boolean
    editingContrat: Contrat | null
    showPrestataireDialog: boolean
    editingPrestataire: Prestataire | null
    deleteTarget: { type: 'contrat' | 'prestataire', id: number } | null
  }>({
    activeTab: 'contrats',
    showContratDialog: false,
    editingContrat: null,
    showPrestataireDialog: false,
    editingPrestataire: null,
    deleteTarget: null,
  })
  const patchUi = (p: Partial<typeof ui>) => setUi(s => ({ ...s, ...p }))
  const { activeTab, showContratDialog, editingContrat, showPrestataireDialog, editingPrestataire, deleteTarget } = ui


  const { data: prestataires, isLoading: loadingPrestataires, isError: isErrorPrestataires, error: errorPrestataires } = usePrestataires()
  const { data: contrats, isLoading: loadingContrats, isError: isErrorContrats, error: errorContrats } = useContratsByCopropriete(selectedCoproId)

  const createContrat = useCreateContrat()
  const updateContrat = useUpdateContrat()
  const deleteContrat = useDeleteContrat()
  const createPrestataire = useCreatePrestataire()
  const updatePrestataire = useUpdatePrestataire()
  const deletePrestataire = useDeletePrestataire()

  const contratsError = errorContrats || errorPrestataires
  const hasContratsError = isErrorContrats || isErrorPrestataires

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Contrats & Prestataires</h1>
          <p className="text-stone-500 dark:text-stone-400">Gestion des contrats prestataires et suivi des echeances</p>
        </div>
      </div>

      {hasContratsError && <ErrorAlert error={contratsError as Error} message="Impossible de charger les contrats" />}

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
          <Handshake className="size-12 text-stone-400 dark:text-stone-500" />
          <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">Aucune copropriete selectionnee</h3>
          <p className="mt-2 text-stone-500 dark:text-stone-400">Selectionnez une copropriete dans le menu lateral.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <TabBar
            tabs={[
              { key: 'contrats', label: 'Contrats', icon: FileSignature },
              { key: 'prestataires', label: 'Prestataires', icon: Building2 },
            ]}
            activeTab={activeTab}
            onTabChange={(key) => patchUi({ activeTab: key as Tab })}
          />

          {/* Contrats tab */}
          {activeTab === 'contrats' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Contrats</h2>
                <button type="button"
                  onClick={() => patchUi({ showContratDialog: true })}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="size-4" />
                  Nouveau contrat
                </button>
              </div>

              {loadingContrats ? (
                <div className="flex justify-center py-8">
                  <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !contrats || contrats.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <FileSignature className="size-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun contrat enregistre</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Prestataire</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Objet</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Periode</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Montant annuel</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Frequence</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {contrats.map((contrat: Contrat) => (
                        <tr key={contrat.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">
                            {contrat.prestataire_nom}
                            {contrat.prestataire_specialite && (
                              <span className="ml-2 text-xs text-stone-400">({contrat.prestataire_specialite})</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{contrat.objet}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            <div className="flex items-center gap-1">
                              {new Date(contrat.date_debut).toLocaleDateString('fr-FR')}
                              {contrat.date_fin && (
                                <>
                                  <span className="text-stone-400">→</span>
                                  <span className={isExpiringSoon(contrat.date_fin) ? 'text-orange-500 font-medium' : ''}>
                                    {new Date(contrat.date_fin).toLocaleDateString('fr-FR')}
                                  </span>
                                  {isExpiringSoon(contrat.date_fin) && (
                                    <AlertTriangle className="size-3.5 text-orange-500" />
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {contrat.montant_annuel
                              ? Number(contrat.montant_annuel).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {FREQUENCE_LABELS[contrat.frequence_paiement] || contrat.frequence_paiement}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_CONTRAT_COLORS[contrat.statut]}`}>
                              {STATUT_CONTRAT_LABELS[contrat.statut]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button type="button"
                                onClick={() => { patchUi({ editingContrat: contrat }); patchUi({ showContratDialog: true }) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button type="button"
                                onClick={() => patchUi({ deleteTarget: { type: 'contrat', id: contrat.id } })}
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

              <ContratFormDialog
                open={showContratDialog}
                onOpenChange={(open) => { patchUi({ showContratDialog: open }); if (!open) patchUi({ editingContrat: null }) }}
                coproprieteId={selectedCoproId}
                prestataires={prestataires || []}
                defaultValues={editingContrat || undefined}
                title={editingContrat ? 'Modifier le contrat' : 'Nouveau contrat'}
                onSubmit={async (data) => {
                  if (editingContrat) {
                    await updateContrat.mutateAsync({ id: editingContrat.id, data })
                  } else {
                    await createContrat.mutateAsync(data)
                  }
                  patchUi({ showContratDialog: false })
                  patchUi({ editingContrat: null })
                }}
                isLoading={editingContrat ? updateContrat.isPending : createContrat.isPending}
              />
            </div>
          )}

          {/* Prestataires tab */}
          {activeTab === 'prestataires' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Prestataires</h2>
                <button type="button"
                  onClick={() => patchUi({ showPrestataireDialog: true })}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="size-4" />
                  Nouveau prestataire
                </button>
              </div>

              {loadingPrestataires ? (
                <div className="flex justify-center py-8">
                  <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !prestataires || prestataires.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <Building2 className="size-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun prestataire enregistre</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Nom</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Specialite</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">SIRET</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Contact</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Telephone</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {prestataires.map((presta: Prestataire) => (
                        <tr key={presta.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{presta.nom}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{presta.specialite || '—'}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300 font-mono text-xs">{presta.siret || '—'}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {presta.contact_nom || '—'}
                            {presta.contact_email && (
                              <span className="ml-2 text-xs text-stone-400">{presta.contact_email}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{presta.contact_telephone || '—'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button type="button"
                                onClick={() => { patchUi({ editingPrestataire: presta }); patchUi({ showPrestataireDialog: true }) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button type="button"
                                onClick={() => patchUi({ deleteTarget: { type: 'prestataire', id: presta.id } })}
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

              <PrestataireFormDialog
                open={showPrestataireDialog}
                onOpenChange={(open) => { patchUi({ showPrestataireDialog: open }); if (!open) patchUi({ editingPrestataire: null }) }}
                defaultValues={editingPrestataire || undefined}
                title={editingPrestataire ? 'Modifier le prestataire' : 'Nouveau prestataire'}
                onSubmit={async (data) => {
                  if (editingPrestataire) {
                    await updatePrestataire.mutateAsync({ id: editingPrestataire.id, data })
                  } else {
                    await createPrestataire.mutateAsync(data)
                  }
                  patchUi({ showPrestataireDialog: false })
                  patchUi({ editingPrestataire: null })
                }}
                isLoading={editingPrestataire ? updatePrestataire.isPending : createPrestataire.isPending}
              />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && patchUi({ deleteTarget: null })}
        title="Confirmer la suppression"
        description="Cette action est irréversible."
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget?.type === 'contrat') deleteContrat.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'prestataire') deletePrestataire.mutate(deleteTarget.id)
          patchUi({ deleteTarget: null })
        }}
      />
    </div>
  )
}
