import { useState } from 'react'
import { useCoproprietes } from '@/hooks/useCoproprietes'
import { useBudgetsByCopropriete, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useBudgets'
import { useAppelsFondsByCopropriete, useCreateAppelFonds, useUpdateAppelFonds, useDeleteAppelFonds } from '@/hooks/useAppelsFonds'
import { useFondsTravauxByCopropriete, useCreateFondsTravaux, useDeleteFondsTravaux } from '@/hooks/useFondsTravaux'
import { BudgetFormDialog } from '@/components/charges/BudgetFormDialog'
import { AppelFondsFormDialog } from '@/components/charges/AppelFondsFormDialog'
import { FondsTravauxFormDialog } from '@/components/charges/FondsTravauxFormDialog'
import type { BudgetPrevisionnel, AppelFonds, FondsTravaux } from '@/types'
import { Receipt, Plus, Trash2, Pencil, ChevronDown, FileText, Banknote, PiggyBank } from 'lucide-react'

const STATUT_BUDGET_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  vote: 'Vote',
  approuve: 'Approuve',
}

const STATUT_BUDGET_COLORS: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300',
  vote: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approuve: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const STATUT_APPEL_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  emis: 'Emis',
  cloture: 'Cloture',
}

const STATUT_APPEL_COLORS: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300',
  emis: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  cloture: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

type Tab = 'budgets' | 'appels' | 'fonds-travaux'

export default function ChargesPage() {
  const { data: coproprietes, isLoading: loadingCopros } = useCoproprietes()
  const [selectedCoproId, setSelectedCoproId] = useState<number | undefined>()
  const [activeTab, setActiveTab] = useState<Tab>('budgets')
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)
  const [showAppelDialog, setShowAppelDialog] = useState(false)
  const [showFondsDialog, setShowFondsDialog] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetPrevisionnel | null>(null)
  const [editingAppel, setEditingAppel] = useState<AppelFonds | null>(null)

  const { data: budgets, isLoading: loadingBudgets } = useBudgetsByCopropriete(selectedCoproId)
  const { data: appels, isLoading: loadingAppels } = useAppelsFondsByCopropriete(selectedCoproId)
  const { data: fondsTravaux, isLoading: loadingFonds } = useFondsTravauxByCopropriete(selectedCoproId)
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const deleteBudget = useDeleteBudget()
  const createAppel = useCreateAppelFonds()
  const updateAppel = useUpdateAppelFonds()
  const deleteAppel = useDeleteAppelFonds()
  const createFonds = useCreateFondsTravaux()
  const deleteFonds = useDeleteFondsTravaux()

  if (loadingCopros) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Charges & Comptabilite</h1>
          <p className="text-gray-500 dark:text-zinc-400">Budgets previsionnels, appels de fonds et fonds travaux</p>
        </div>
      </div>

      {/* Copropriete selector */}
      <div className="relative">
        <select
          value={selectedCoproId || ''}
          onChange={(e) => setSelectedCoproId(e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        >
          <option value="">Selectionner une copropriete...</option>
          {coproprietes?.map((c) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12 dark:border-zinc-600">
          <Receipt className="h-12 w-12 text-gray-400 dark:text-zinc-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Selectionnez une copropriete</h3>
          <p className="mt-2 text-gray-500 dark:text-zinc-400">Choisissez une copropriete pour voir ses charges.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-zinc-800">
            {([
              { key: 'budgets' as Tab, label: 'Budgets', icon: FileText },
              { key: 'appels' as Tab, label: 'Appels de fonds', icon: Banknote },
              { key: 'fonds-travaux' as Tab, label: 'Fonds travaux', icon: PiggyBank },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow dark:bg-zinc-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-zinc-400'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Budgets tab */}
          {activeTab === 'budgets' && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Budgets previsionnels</h2>
                <button
                  onClick={() => setShowBudgetDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau budget
                </button>
              </div>

              {loadingBudgets ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : !budgets || budgets.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <FileText className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
                  <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucun budget enregistre</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Annee</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Montant total</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Statut</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgets.map((budget: BudgetPrevisionnel) => (
                        <tr key={budget.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{budget.annee}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                            {Number(budget.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_BUDGET_COLORS[budget.statut]}`}>
                              {STATUT_BUDGET_LABELS[budget.statut]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setEditingBudget(budget); setShowBudgetDialog(true) }}
                                className="rounded p-1 text-gray-400 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Supprimer ce budget ?')) deleteBudget.mutate(budget.id)
                                }}
                                className="rounded p-1 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
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
                onOpenChange={(open) => { setShowBudgetDialog(open); if (!open) setEditingBudget(null) }}
                coproprieteId={selectedCoproId}
                defaultValues={editingBudget || undefined}
                title={editingBudget ? 'Modifier le budget' : 'Nouveau budget'}
                onSubmit={async (data) => {
                  if (editingBudget) {
                    await updateBudget.mutateAsync({ id: editingBudget.id, data })
                  } else {
                    await createBudget.mutateAsync(data)
                  }
                  setShowBudgetDialog(false)
                  setEditingBudget(null)
                }}
                isLoading={editingBudget ? updateBudget.isPending : createBudget.isPending}
              />
            </div>
          )}

          {/* Appels de fonds tab */}
          {activeTab === 'appels' && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appels de fonds</h2>
                <button
                  onClick={() => setShowAppelDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Nouvel appel
                </button>
              </div>

              {loadingAppels ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : !appels || appels.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <Banknote className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
                  <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucun appel de fonds enregistre</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Periode</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Montant</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Emission</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Echeance</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Statut</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {appels.map((appel: AppelFonds) => (
                        <tr key={appel.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">T{appel.trimestre} {appel.annee}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                            {Number(appel.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                            {new Date(appel.date_emission).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                            {new Date(appel.date_echeance).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_APPEL_COLORS[appel.statut]}`}>
                              {STATUT_APPEL_LABELS[appel.statut]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setEditingAppel(appel); setShowAppelDialog(true) }}
                                className="rounded p-1 text-gray-400 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Supprimer cet appel de fonds ?')) deleteAppel.mutate(appel.id)
                                }}
                                className="rounded p-1 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
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
                onOpenChange={(open) => { setShowAppelDialog(open); if (!open) setEditingAppel(null) }}
                coproprieteId={selectedCoproId}
                defaultValues={editingAppel || undefined}
                title={editingAppel ? 'Modifier l\'appel de fonds' : 'Nouvel appel de fonds'}
                onSubmit={async (data) => {
                  if (editingAppel) {
                    await updateAppel.mutateAsync({ id: editingAppel.id, data })
                  } else {
                    await createAppel.mutateAsync(data)
                  }
                  setShowAppelDialog(false)
                  setEditingAppel(null)
                }}
                isLoading={editingAppel ? updateAppel.isPending : createAppel.isPending}
              />
            </div>
          )}

          {/* Fonds travaux tab */}
          {activeTab === 'fonds-travaux' && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fonds travaux</h2>
                <button
                  onClick={() => setShowFondsDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau fonds
                </button>
              </div>

              {loadingFonds ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : !fondsTravaux || fondsTravaux.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <PiggyBank className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
                  <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucun fonds travaux enregistre</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Annee</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Cotisation annuelle</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Solde</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {fondsTravaux.map((fonds: FondsTravaux) => (
                        <tr key={fonds.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{fonds.annee}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                            {Number(fonds.cotisation_annuelle).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                            <span className={Number(fonds.solde) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {Number(fonds.solde).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                if (window.confirm('Supprimer ce fonds travaux ?')) deleteFonds.mutate(fonds.id)
                              }}
                              className="rounded p-1 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <FondsTravauxFormDialog
                open={showFondsDialog}
                onOpenChange={setShowFondsDialog}
                coproprieteId={selectedCoproId}
                onSubmit={async (data) => {
                  await createFonds.mutateAsync(data)
                  setShowFondsDialog(false)
                }}
                isLoading={createFonds.isPending}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
