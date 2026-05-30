import { useState } from 'react'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useCoproprietaires } from '@/hooks/useCoproprietaires'
import { useBudgetsByCopropriete, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useBudgets'
import { useAppelsFondsByCopropriete, useCreateAppelFonds, useUpdateAppelFonds, useDeleteAppelFonds } from '@/hooks/useAppelsFonds'
import { useFondsTravauxByCopropriete, useCreateFondsTravaux, useUpdateFondsTravaux, useDeleteFondsTravaux } from '@/hooks/useFondsTravaux'
import { usePaiementsByCopropriete, useCreatePaiement, useUpdatePaiement, useDeletePaiement } from '@/hooks/usePaiements'
import { BudgetFormDialog } from '@/components/charges/BudgetFormDialog'
import { AppelFondsFormDialog } from '@/components/charges/AppelFondsFormDialog'
import { FondsTravauxFormDialog } from '@/components/charges/FondsTravauxFormDialog'
import { PaiementFormDialog } from '@/components/charges/PaiementFormDialog'
import type { BudgetPrevisionnel, AppelFonds, FondsTravaux, Paiement } from '@/types'
import { Receipt, Plus, Trash2, Pencil, FileText, Banknote, PiggyBank, CreditCard } from 'lucide-react'
import { ErrorAlert } from '@/components/layout/ErrorAlert'
import { TabBar } from '@/components/layout/TabBar'

const STATUT_BUDGET_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  vote: 'Vote',
  approuve: 'Approuve',
}

const STATUT_BUDGET_COLORS: Record<string, string> = {
  brouillon: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  vote: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approuve: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

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

const MODE_PAIEMENT_LABELS: Record<string, string> = {
  virement: 'Virement',
  cheque: 'Cheque',
  prelevement: 'Prelevement',
  especes: 'Especes',
  autre: 'Autre',
}

type Tab = 'budgets' | 'appels' | 'paiements' | 'fonds-travaux'

export default function ChargesPage() {
  const selectedCoproId = useCoproprieteStore((s) => s.selectedCoproprieteId)
  const [ui, setUi] = useState<{
    activeTab: Tab
    showBudgetDialog: boolean
    showAppelDialog: boolean
    showFondsDialog: boolean
    editingBudget: BudgetPrevisionnel | null
    editingAppel: AppelFonds | null
    editingFonds: FondsTravaux | null
    showPaiementDialog: boolean
    editingPaiement: Paiement | null
    deleteTarget: { type: 'budget' | 'appel' | 'paiement' | 'fonds', id: number } | null
  }>({
    activeTab: 'budgets',
    showBudgetDialog: false,
    showAppelDialog: false,
    showFondsDialog: false,
    editingBudget: null,
    editingAppel: null,
    editingFonds: null,
    showPaiementDialog: false,
    editingPaiement: null,
    deleteTarget: null,
  })
  const patchUi = (p: Partial<typeof ui>) => setUi(s => ({ ...s, ...p }))
  const { activeTab, showBudgetDialog, showAppelDialog, showFondsDialog, editingBudget, editingAppel, editingFonds, showPaiementDialog, editingPaiement, deleteTarget } = ui

  const { data: coproprietaires } = useCoproprietaires()
  const { data: budgets, isLoading: loadingBudgets, isError: isErrorBudgets, error: errorBudgets } = useBudgetsByCopropriete(selectedCoproId)
  const { data: appels, isLoading: loadingAppels, isError: isErrorAppels, error: errorAppels } = useAppelsFondsByCopropriete(selectedCoproId)
  const { data: fondsTravaux, isLoading: loadingFonds, isError: isErrorFonds, error: errorFonds } = useFondsTravauxByCopropriete(selectedCoproId)
  const { data: paiements, isLoading: loadingPaiements, isError: isErrorPaiements, error: errorPaiements } = usePaiementsByCopropriete(selectedCoproId)
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const deleteBudget = useDeleteBudget()
  const createAppel = useCreateAppelFonds()
  const updateAppel = useUpdateAppelFonds()
  const deleteAppel = useDeleteAppelFonds()
  const createFonds = useCreateFondsTravaux()
  const updateFonds = useUpdateFondsTravaux()
  const deleteFonds = useDeleteFondsTravaux()
  const createPaiement = useCreatePaiement()
  const updatePaiement = useUpdatePaiement()
  const deletePaiement = useDeletePaiement()

  const chargesError = errorBudgets || errorAppels || errorFonds || errorPaiements
  const hasChargesError = isErrorBudgets || isErrorAppels || isErrorFonds || isErrorPaiements

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Charges & Comptabilite</h1>
          <p className="text-stone-500 dark:text-stone-400">Budgets previsionnels, appels de fonds et fonds travaux</p>
        </div>
      </div>

      {hasChargesError && <ErrorAlert error={chargesError as Error} message="Impossible de charger les donnees comptables" />}

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
          <Receipt className="size-12 text-stone-400 dark:text-stone-500" />
          <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">Aucune copropriete selectionnee</h3>
          <p className="mt-2 text-stone-500 dark:text-stone-400">Selectionnez une copropriete dans le menu lateral.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <TabBar
            tabs={[
              { key: 'budgets', label: 'Budgets', icon: FileText },
              { key: 'appels', label: 'Appels de fonds', icon: Banknote },
              { key: 'paiements', label: 'Paiements', icon: CreditCard },
              { key: 'fonds-travaux', label: 'Fonds travaux', icon: PiggyBank },
            ]}
            activeTab={activeTab}
            onTabChange={(key) => patchUi({ activeTab: key as Tab })}
          />

          {/* Budgets tab */}
          {activeTab === 'budgets' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Budgets previsionnels</h2>
                <button type="button"
                  onClick={() => patchUi({ showBudgetDialog: true })}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="size-4" />
                  Nouveau budget
                </button>
              </div>

              {loadingBudgets ? (
                <div className="flex justify-center py-8">
                  <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !budgets || budgets.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <FileText className="size-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun budget enregistre</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Annee</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Montant total</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgets.map((budget: BudgetPrevisionnel) => (
                        <tr key={budget.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{budget.annee}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {Number(budget.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_BUDGET_COLORS[budget.statut]}`}>
                              {STATUT_BUDGET_LABELS[budget.statut]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button type="button"
                                onClick={() => { patchUi({ editingBudget: budget }); patchUi({ showBudgetDialog: true }) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button type="button"
                                onClick={() => patchUi({ deleteTarget: { type: 'budget', id: budget.id } })}
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

              <BudgetFormDialog
                open={showBudgetDialog}
                onOpenChange={(open) => { patchUi({ showBudgetDialog: open }); if (!open) patchUi({ editingBudget: null }) }}
                coproprieteId={selectedCoproId}
                defaultValues={editingBudget || undefined}
                title={editingBudget ? 'Modifier le budget' : 'Nouveau budget'}
                onSubmit={async (data) => {
                  if (editingBudget) {
                    await updateBudget.mutateAsync({ id: editingBudget.id, data })
                  } else {
                    await createBudget.mutateAsync(data)
                  }
                  patchUi({ showBudgetDialog: false })
                  patchUi({ editingBudget: null })
                }}
                isLoading={editingBudget ? updateBudget.isPending : createBudget.isPending}
              />
            </div>
          )}

          {/* Appels de fonds tab */}
          {activeTab === 'appels' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Appels de fonds</h2>
                <button type="button"
                  onClick={() => patchUi({ showAppelDialog: true })}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="size-4" />
                  Nouvel appel
                </button>
              </div>

              {loadingAppels ? (
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
                                onClick={() => { patchUi({ editingAppel: appel }); patchUi({ showAppelDialog: true }) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button type="button"
                                onClick={() => patchUi({ deleteTarget: { type: 'appel', id: appel.id } })}
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
                open={showAppelDialog}
                onOpenChange={(open) => { patchUi({ showAppelDialog: open }); if (!open) patchUi({ editingAppel: null }) }}
                coproprieteId={selectedCoproId}
                defaultValues={editingAppel || undefined}
                title={editingAppel ? 'Modifier l\'appel de fonds' : 'Nouvel appel de fonds'}
                onSubmit={async (data) => {
                  if (editingAppel) {
                    await updateAppel.mutateAsync({ id: editingAppel.id, data })
                  } else {
                    await createAppel.mutateAsync(data)
                  }
                  patchUi({ showAppelDialog: false })
                  patchUi({ editingAppel: null })
                }}
                isLoading={editingAppel ? updateAppel.isPending : createAppel.isPending}
              />
            </div>
          )}

          {/* Paiements tab */}
          {activeTab === 'paiements' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Paiements</h2>
                <button type="button"
                  onClick={() => patchUi({ showPaiementDialog: true })}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="size-4" />
                  Nouveau paiement
                </button>
              </div>

              {loadingPaiements ? (
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
                                onClick={() => { patchUi({ editingPaiement: paiement }); patchUi({ showPaiementDialog: true }) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button type="button"
                                onClick={() => patchUi({ deleteTarget: { type: 'paiement', id: paiement.id } })}
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
                open={showPaiementDialog}
                onOpenChange={(open) => { patchUi({ showPaiementDialog: open }); if (!open) patchUi({ editingPaiement: null }) }}
                coproprietaireId={editingPaiement?.coproprietaire_id}
                appelFondsId={editingPaiement?.appel_fonds_id || undefined}
                coproprietaires={coproprietaires || []}
                appelsFonds={appels || []}
                defaultValues={editingPaiement || undefined}
                title={editingPaiement ? 'Modifier le paiement' : 'Nouveau paiement'}
                onSubmit={async (data) => {
                  if (editingPaiement) {
                    await updatePaiement.mutateAsync({ id: editingPaiement.id, data })
                  } else {
                    await createPaiement.mutateAsync(data)
                  }
                  patchUi({ showPaiementDialog: false })
                  patchUi({ editingPaiement: null })
                }}
                isLoading={editingPaiement ? updatePaiement.isPending : createPaiement.isPending}
              />
            </div>
          )}

          {/* Fonds travaux tab */}
          {activeTab === 'fonds-travaux' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Fonds travaux</h2>
                <button type="button"
                  onClick={() => patchUi({ showFondsDialog: true })}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="size-4" />
                  Nouveau fonds
                </button>
              </div>

              {loadingFonds ? (
                <div className="flex justify-center py-8">
                  <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !fondsTravaux || fondsTravaux.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <PiggyBank className="size-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun fonds travaux enregistre</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Annee</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Cotisation annuelle</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Solde</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {fondsTravaux.map((fonds: FondsTravaux) => (
                        <tr key={fonds.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{fonds.annee}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {Number(fonds.cotisation_annuelle).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            <span className={Number(fonds.solde) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {Number(fonds.solde).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button type="button"
                                onClick={() => { patchUi({ editingFonds: fonds }); patchUi({ showFondsDialog: true }) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button type="button"
                                onClick={() => patchUi({ deleteTarget: { type: 'fonds', id: fonds.id } })}
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

              <FondsTravauxFormDialog
                open={showFondsDialog}
                onOpenChange={(open) => { patchUi({ showFondsDialog: open }); if (!open) patchUi({ editingFonds: null }) }}
                coproprieteId={selectedCoproId}
                defaultValues={editingFonds || undefined}
                title={editingFonds ? 'Modifier le fonds travaux' : 'Nouveau fonds travaux'}
                onSubmit={async (data) => {
                  if (editingFonds) {
                    await updateFonds.mutateAsync({ id: editingFonds.id, data })
                  } else {
                    await createFonds.mutateAsync(data)
                  }
                  patchUi({ showFondsDialog: false })
                  patchUi({ editingFonds: null })
                }}
                isLoading={editingFonds ? updateFonds.isPending : createFonds.isPending}
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
          if (deleteTarget?.type === 'budget') deleteBudget.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'appel') deleteAppel.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'paiement') deletePaiement.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'fonds') deleteFonds.mutate(deleteTarget.id)
          patchUi({ deleteTarget: null })
        }}
      />
    </div>
  )
}
