import { useState } from 'react'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useCoproprietaires } from '@/hooks/useCoproprietaires'
import { useBudgetsByCopropriete, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useBudgets'
import { useAppelsFondsByCopropriete, useCreateAppelFonds, useUpdateAppelFonds, useDeleteAppelFonds } from '@/hooks/useAppelsFonds'
import { useFondsTravauxByCopropriete, useCreateFondsTravaux, useUpdateFondsTravaux, useDeleteFondsTravaux } from '@/hooks/useFondsTravaux'
import { usePaiementsByCopropriete, useCreatePaiement, useUpdatePaiement, useDeletePaiement } from '@/hooks/usePaiements'
import { BudgetsTab } from '@/components/charges/BudgetsTab'
import { AppelsFondsTab } from '@/components/charges/AppelsFondsTab'
import { PaiementsTab } from '@/components/charges/PaiementsTab'
import { FondsTravauxTab } from '@/components/charges/FondsTravauxTab'
import type { BudgetPrevisionnel, AppelFonds, FondsTravaux, Paiement } from '@/types'
import { Receipt, FileText, Banknote, PiggyBank, CreditCard } from 'lucide-react'
import { ErrorAlert } from '@/components/layout/ErrorAlert'
import { TabBar } from '@/components/layout/TabBar'

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
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Charges & Comptabilité</h1>
          <p className="text-stone-500 dark:text-stone-400">Budgets prévisionnels, appels de fonds et fonds travaux</p>
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
            <BudgetsTab
              coproprieteId={selectedCoproId}
              budgets={budgets}
              loading={loadingBudgets}
              showDialog={showBudgetDialog}
              editing={editingBudget}
              onCreate={() => patchUi({ showBudgetDialog: true })}
              onEdit={(budget) => { patchUi({ editingBudget: budget }); patchUi({ showBudgetDialog: true }) }}
              onDelete={(id) => patchUi({ deleteTarget: { type: 'budget', id } })}
              onDialogOpenChange={(open) => { patchUi({ showBudgetDialog: open }); if (!open) patchUi({ editingBudget: null }) }}
              onSubmit={async (data) => {
                if (editingBudget) {
                  await updateBudget.mutateAsync({ id: editingBudget.id, data })
                } else {
                  await createBudget.mutateAsync(data)
                }
                patchUi({ showBudgetDialog: false })
                patchUi({ editingBudget: null })
              }}
              isSubmitting={editingBudget ? updateBudget.isPending : createBudget.isPending}
            />
          )}

          {/* Appels de fonds tab */}
          {activeTab === 'appels' && (
            <AppelsFondsTab
              coproprieteId={selectedCoproId}
              appels={appels}
              loading={loadingAppels}
              showDialog={showAppelDialog}
              editing={editingAppel}
              onCreate={() => patchUi({ showAppelDialog: true })}
              onEdit={(appel) => { patchUi({ editingAppel: appel }); patchUi({ showAppelDialog: true }) }}
              onDelete={(id) => patchUi({ deleteTarget: { type: 'appel', id } })}
              onDialogOpenChange={(open) => { patchUi({ showAppelDialog: open }); if (!open) patchUi({ editingAppel: null }) }}
              onSubmit={async (data) => {
                if (editingAppel) {
                  await updateAppel.mutateAsync({ id: editingAppel.id, data })
                } else {
                  await createAppel.mutateAsync(data)
                }
                patchUi({ showAppelDialog: false })
                patchUi({ editingAppel: null })
              }}
              isSubmitting={editingAppel ? updateAppel.isPending : createAppel.isPending}
            />
          )}

          {/* Paiements tab */}
          {activeTab === 'paiements' && (
            <PaiementsTab
              paiements={paiements}
              loading={loadingPaiements}
              showDialog={showPaiementDialog}
              editing={editingPaiement}
              coproprietaires={coproprietaires || []}
              appelsFonds={appels || []}
              onCreate={() => patchUi({ showPaiementDialog: true })}
              onEdit={(paiement) => { patchUi({ editingPaiement: paiement }); patchUi({ showPaiementDialog: true }) }}
              onDelete={(id) => patchUi({ deleteTarget: { type: 'paiement', id } })}
              onDialogOpenChange={(open) => { patchUi({ showPaiementDialog: open }); if (!open) patchUi({ editingPaiement: null }) }}
              onSubmit={async (data) => {
                if (editingPaiement) {
                  await updatePaiement.mutateAsync({ id: editingPaiement.id, data })
                } else {
                  await createPaiement.mutateAsync(data)
                }
                patchUi({ showPaiementDialog: false })
                patchUi({ editingPaiement: null })
              }}
              isSubmitting={editingPaiement ? updatePaiement.isPending : createPaiement.isPending}
            />
          )}

          {/* Fonds travaux tab */}
          {activeTab === 'fonds-travaux' && (
            <FondsTravauxTab
              coproprieteId={selectedCoproId}
              fondsTravaux={fondsTravaux}
              loading={loadingFonds}
              showDialog={showFondsDialog}
              editing={editingFonds}
              onCreate={() => patchUi({ showFondsDialog: true })}
              onEdit={(fonds) => { patchUi({ editingFonds: fonds }); patchUi({ showFondsDialog: true }) }}
              onDelete={(id) => patchUi({ deleteTarget: { type: 'fonds', id } })}
              onDialogOpenChange={(open) => { patchUi({ showFondsDialog: open }); if (!open) patchUi({ editingFonds: null }) }}
              onSubmit={async (data) => {
                if (editingFonds) {
                  await updateFonds.mutateAsync({ id: editingFonds.id, data })
                } else {
                  await createFonds.mutateAsync(data)
                }
                patchUi({ showFondsDialog: false })
                patchUi({ editingFonds: null })
              }}
              isSubmitting={editingFonds ? updateFonds.isPending : createFonds.isPending}
            />
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
