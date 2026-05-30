import { useState, useEffect } from 'react'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import {
  useComptesBancairesByCopropriete,
  useCreateCompteBancaire,
  useUpdateCompteBancaire,
  useDeleteCompteBancaire,
} from '@/hooks/useComptesBancaires'
import {
  useMouvementsBancairesByCompte,
  useCreateMouvementBancaire,
  useUpdateMouvementBancaire,
  useDeleteMouvementBancaire,
} from '@/hooks/useMouvementsBancaires'
import { ComptesTabPanel } from '@/components/comptes-bancaires/ComptesTabPanel'
import { MouvementsTabPanel } from '@/components/comptes-bancaires/MouvementsTabPanel'
import type { CompteBancaire, MouvementBancaire } from '@/types'
import { Landmark, CreditCard, ArrowDownUp } from 'lucide-react'
import { ErrorAlert } from '@/components/layout/ErrorAlert'
import { TabBar } from '@/components/layout/TabBar'

type Tab = 'comptes' | 'mouvements'

export default function ComptesBancairesPage() {
  const selectedCoproId = useCoproprieteStore((s) => s.selectedCoproprieteId)
  const [ui, setUi] = useState<{
    activeTab: Tab
    selectedCompteId: number | undefined
    showCompteDialog: boolean
    editingCompte: CompteBancaire | null
    showMouvementDialog: boolean
    editingMouvement: MouvementBancaire | null
    deleteTarget: { type: 'compte' | 'mouvement', id: number } | null
  }>({
    activeTab: 'comptes',
    selectedCompteId: undefined,
    showCompteDialog: false,
    editingCompte: null,
    showMouvementDialog: false,
    editingMouvement: null,
    deleteTarget: null,
  })
  const patchUi = (p: Partial<typeof ui>) => setUi(s => ({ ...s, ...p }))
  const { activeTab, selectedCompteId, showCompteDialog, editingCompte, showMouvementDialog, editingMouvement, deleteTarget } = ui

  useEffect(() => {
    patchUi({ selectedCompteId: undefined })
  }, [selectedCoproId])


  const { data: comptes, isLoading: loadingComptes, isError: isErrorComptes, error: errorComptes } = useComptesBancairesByCopropriete(selectedCoproId)
  const { data: mouvements, isLoading: loadingMouvements, isError: isErrorMouvements, error: errorMouvements } = useMouvementsBancairesByCompte(selectedCompteId)

  const createCompte = useCreateCompteBancaire()
  const updateCompte = useUpdateCompteBancaire()
  const deleteCompte = useDeleteCompteBancaire()
  const createMouvement = useCreateMouvementBancaire()
  const updateMouvement = useUpdateMouvementBancaire()
  const deleteMouvement = useDeleteMouvementBancaire()

  const comptesError = errorComptes || errorMouvements
  const hasComptesError = isErrorComptes || isErrorMouvements

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Comptes bancaires</h1>
          <p className="text-stone-500 dark:text-stone-400">Gestion des comptes bancaires et mouvements</p>
        </div>
      </div>

      {hasComptesError && <ErrorAlert error={comptesError as Error} message="Impossible de charger les comptes bancaires" />}

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
          <Landmark className="size-12 text-stone-400 dark:text-stone-500" />
          <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">Aucune copropriete selectionnee</h3>
          <p className="mt-2 text-stone-500 dark:text-stone-400">Selectionnez une copropriete dans le menu lateral.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <TabBar
            tabs={[
              { key: 'comptes', label: 'Comptes', icon: CreditCard },
              { key: 'mouvements', label: 'Mouvements', icon: ArrowDownUp },
            ]}
            activeTab={activeTab}
            onTabChange={(key) => patchUi({ activeTab: key as Tab })}
          />

          {/* Comptes tab */}
          {activeTab === 'comptes' && (
            <ComptesTabPanel
              comptes={comptes}
              loadingComptes={loadingComptes}
              selectedCompteId={selectedCompteId}
              selectedCoproId={selectedCoproId}
              showCompteDialog={showCompteDialog}
              editingCompte={editingCompte}
              onNewCompte={() => patchUi({ showCompteDialog: true })}
              onSelectCompte={(id) => { patchUi({ selectedCompteId: id }); patchUi({ activeTab: 'mouvements' }) }}
              onEditCompte={(compte) => { patchUi({ editingCompte: compte }); patchUi({ showCompteDialog: true }) }}
              onDeleteCompte={(id) => patchUi({ deleteTarget: { type: 'compte', id } })}
              onCompteDialogOpenChange={(open) => { patchUi({ showCompteDialog: open }); if (!open) patchUi({ editingCompte: null }) }}
              onCompteSubmit={async (data) => {
                if (editingCompte) {
                  await updateCompte.mutateAsync({ id: editingCompte.id, data })
                } else {
                  await createCompte.mutateAsync(data)
                }
                patchUi({ showCompteDialog: false })
                patchUi({ editingCompte: null })
              }}
              compteSubmitLoading={editingCompte ? updateCompte.isPending : createCompte.isPending}
            />
          )}

          {/* Mouvements tab */}
          {activeTab === 'mouvements' && (
            <MouvementsTabPanel
              comptes={comptes}
              mouvements={mouvements}
              loadingMouvements={loadingMouvements}
              selectedCompteId={selectedCompteId}
              showMouvementDialog={showMouvementDialog}
              editingMouvement={editingMouvement}
              onSelectCompteId={(id) => patchUi({ selectedCompteId: id })}
              onNewMouvement={() => patchUi({ showMouvementDialog: true })}
              onEditMouvement={(mouvement) => { patchUi({ editingMouvement: mouvement }); patchUi({ showMouvementDialog: true }) }}
              onDeleteMouvement={(id) => patchUi({ deleteTarget: { type: 'mouvement', id } })}
              onMouvementDialogOpenChange={(open) => { patchUi({ showMouvementDialog: open }); if (!open) patchUi({ editingMouvement: null }) }}
              onMouvementSubmit={async (data) => {
                if (editingMouvement) {
                  await updateMouvement.mutateAsync({ id: editingMouvement.id, data })
                } else {
                  await createMouvement.mutateAsync(data)
                }
                patchUi({ showMouvementDialog: false })
                patchUi({ editingMouvement: null })
              }}
              mouvementSubmitLoading={editingMouvement ? updateMouvement.isPending : createMouvement.isPending}
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
          if (deleteTarget?.type === 'compte') deleteCompte.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'mouvement') deleteMouvement.mutate(deleteTarget.id)
          patchUi({ deleteTarget: null })
        }}
      />
    </div>
  )
}
