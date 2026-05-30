import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { useUpdateCopropriete } from '@/hooks/useCoproprietes'
import { useCreateLot, useUpdateLot, useDeleteLot } from '@/hooks/useLots'
import { useCreatePartieCommune, useUpdatePartieCommune, useDeletePartieCommune } from '@/hooks/usePartiesCommunes'
import { useCreateCleRepartition, useUpdateCleRepartition, useDeleteCleRepartition } from '@/hooks/useClesRepartition'
import { useCreateLocataire, useUpdateLocataire, useDeleteLocataire } from '@/hooks/useLocataires'
import { useCreateMutation, useUpdateMutation, useDeleteMutation } from '@/hooks/useMutations'
import { useCreateDiagnostic, useUpdateDiagnostic, useDeleteDiagnostic } from '@/hooks/useDiagnostics'
import type { LotWithProprietaire } from '@/api/lots'
import type { Copropriete, PartieCommune, CleRepartition, Locataire, Mutation, Diagnostic } from '@/types'
import { LotFormDialog } from '@/components/coproprietes/LotFormDialog'
import { CoproprieteFormDialog } from '@/components/coproprietes/CoproprieteFormDialog'
import { PartieCommuneFormDialog } from '@/components/coproprietes/PartieCommuneFormDialog'
import { CleRepartitionFormDialog } from '@/components/coproprietes/CleRepartitionFormDialog'
import { LocataireFormDialog } from '@/components/coproprietes/LocataireFormDialog'
import { MutationFormDialog } from '@/components/coproprietes/MutationFormDialog'
import { DiagnosticFormDialog } from '@/components/coproprietes/DiagnosticFormDialog'
import { BulkCreateAccountsDialog } from '@/components/coproprietes/BulkCreateAccountsDialog'

interface CoproprieteDetailDialogsState {
  showCreateLot: boolean
  showEditCopro: boolean
  showCreatePC: boolean
  showCreateCle: boolean
  showCreateLocataire: boolean
  showCreateMutation: boolean
  showCreateDiagnostic: boolean
  editingLot: LotWithProprietaire | null
  editingPC: PartieCommune | null
  editingCle: CleRepartition | null
  editingLocataire: Locataire | null
  editingMutation: Mutation | null
  editingDiagnostic: Diagnostic | null
  selectedLotId: number | undefined
  showBulkCreate: boolean
  deleteTarget: { type: 'lot' | 'pc' | 'cle' | 'locataire' | 'mutation' | 'diagnostic', id: number } | null
}

interface CoproprieteDetailDialogsProps {
  ui: CoproprieteDetailDialogsState
  patchUi: (p: Partial<CoproprieteDetailDialogsState>) => void
  copropriete: Copropriete
  coproprieteId: number | undefined
  createLot: ReturnType<typeof useCreateLot>
  updateLot: ReturnType<typeof useUpdateLot>
  deleteLot: ReturnType<typeof useDeleteLot>
  updateCopropriete: ReturnType<typeof useUpdateCopropriete>
  createPC: ReturnType<typeof useCreatePartieCommune>
  updatePC: ReturnType<typeof useUpdatePartieCommune>
  deletePC: ReturnType<typeof useDeletePartieCommune>
  createCle: ReturnType<typeof useCreateCleRepartition>
  updateCle: ReturnType<typeof useUpdateCleRepartition>
  deleteCle: ReturnType<typeof useDeleteCleRepartition>
  createLocataire: ReturnType<typeof useCreateLocataire>
  updateLocataire: ReturnType<typeof useUpdateLocataire>
  deleteLocataire: ReturnType<typeof useDeleteLocataire>
  createMutation: ReturnType<typeof useCreateMutation>
  updateMutation: ReturnType<typeof useUpdateMutation>
  deleteMutation: ReturnType<typeof useDeleteMutation>
  createDiagnostic: ReturnType<typeof useCreateDiagnostic>
  updateDiagnostic: ReturnType<typeof useUpdateDiagnostic>
  deleteDiagnostic: ReturnType<typeof useDeleteDiagnostic>
}

export function CoproprieteDetailDialogs({
  ui,
  patchUi,
  copropriete,
  coproprieteId,
  createLot,
  updateLot,
  deleteLot,
  updateCopropriete,
  createPC,
  updatePC,
  deletePC,
  createCle,
  updateCle,
  deleteCle,
  createLocataire,
  updateLocataire,
  deleteLocataire,
  createMutation,
  updateMutation,
  deleteMutation,
  createDiagnostic,
  updateDiagnostic,
  deleteDiagnostic,
}: CoproprieteDetailDialogsProps) {
  const { showCreateLot, showEditCopro, showCreatePC, showCreateCle, showCreateLocataire, showCreateMutation, showCreateDiagnostic, editingLot, editingPC, editingCle, editingLocataire, editingMutation, editingDiagnostic, selectedLotId, showBulkCreate, deleteTarget } = ui
  return (
    <>
      <LotFormDialog
        open={showCreateLot || !!editingLot}
        onOpenChange={(open) => { if (!open) { patchUi({ showCreateLot: false }); patchUi({ editingLot: null }) } }}
        coproprieteId={coproprieteId!}
        defaultValues={editingLot || undefined}
        title={editingLot ? 'Modifier le lot' : 'Nouveau lot'}
        onSubmit={async (data) => {
          if (editingLot) {
            await updateLot.mutateAsync({ id: editingLot.id, data })
            patchUi({ editingLot: null })
          } else {
            await createLot.mutateAsync(data)
            patchUi({ showCreateLot: false })
          }
        }}
        isLoading={editingLot ? updateLot.isPending : createLot.isPending}
      />
      <CoproprieteFormDialog
        open={showEditCopro}
        onOpenChange={v => patchUi({ showEditCopro: v })}
        defaultValues={copropriete}
        title="Modifier la copropriete"
        onSubmit={async (data) => { await updateCopropriete.mutateAsync({ id: coproprieteId!, data }); patchUi({ showEditCopro: false }) }}
        isLoading={updateCopropriete.isPending}
      />
      <PartieCommuneFormDialog
        open={showCreatePC || !!editingPC}
        onOpenChange={(open) => { if (!open) { patchUi({ showCreatePC: false }); patchUi({ editingPC: null }) } }}
        coproprieteId={coproprieteId!}
        defaultValues={editingPC || undefined}
        title={editingPC ? 'Modifier la partie commune' : 'Nouvelle partie commune'}
        onSubmit={async (data) => {
          if (editingPC) {
            await updatePC.mutateAsync({ id: editingPC.id, data })
            patchUi({ editingPC: null })
          } else {
            await createPC.mutateAsync(data)
            patchUi({ showCreatePC: false })
          }
        }}
        isLoading={editingPC ? updatePC.isPending : createPC.isPending}
      />
      <CleRepartitionFormDialog
        open={showCreateCle || !!editingCle}
        onOpenChange={(open) => { if (!open) { patchUi({ showCreateCle: false }); patchUi({ editingCle: null }) } }}
        coproprieteId={coproprieteId!}
        defaultValues={editingCle || undefined}
        title={editingCle ? 'Modifier la cle de repartition' : 'Nouvelle cle de repartition'}
        onSubmit={async (data) => {
          if (editingCle) {
            await updateCle.mutateAsync({ id: editingCle.id, data })
            patchUi({ editingCle: null })
          } else {
            await createCle.mutateAsync(data)
            patchUi({ showCreateCle: false })
          }
        }}
        isLoading={editingCle ? updateCle.isPending : createCle.isPending}
      />
      {selectedLotId && (
        <>
          <LocataireFormDialog
            open={showCreateLocataire || !!editingLocataire}
            onOpenChange={(open) => { if (!open) { patchUi({ showCreateLocataire: false }); patchUi({ editingLocataire: null }) } }}
            lotId={selectedLotId}
            defaultValues={editingLocataire || undefined}
            title={editingLocataire ? 'Modifier le locataire' : 'Nouveau locataire'}
            onSubmit={async (data) => {
              if (editingLocataire) {
                await updateLocataire.mutateAsync({ id: editingLocataire.id, data })
                patchUi({ editingLocataire: null })
              } else {
                await createLocataire.mutateAsync(data)
                patchUi({ showCreateLocataire: false })
              }
            }}
            isLoading={editingLocataire ? updateLocataire.isPending : createLocataire.isPending}
          />
          <MutationFormDialog
            open={showCreateMutation || !!editingMutation}
            onOpenChange={(open) => { if (!open) { patchUi({ showCreateMutation: false }); patchUi({ editingMutation: null }) } }}
            lotId={selectedLotId}
            defaultValues={editingMutation || undefined}
            title={editingMutation ? 'Modifier la mutation' : 'Nouvelle mutation'}
            onSubmit={async (data) => {
              if (editingMutation) {
                await updateMutation.mutateAsync({ id: editingMutation.id, data })
                patchUi({ editingMutation: null })
              } else {
                await createMutation.mutateAsync(data)
                patchUi({ showCreateMutation: false })
              }
            }}
            isLoading={editingMutation ? updateMutation.isPending : createMutation.isPending}
          />
        </>
      )}
      <DiagnosticFormDialog
        open={showCreateDiagnostic || !!editingDiagnostic}
        onOpenChange={(open) => { if (!open) { patchUi({ showCreateDiagnostic: false }); patchUi({ editingDiagnostic: null }) } }}
        coproprieteId={coproprieteId!}
        defaultValues={editingDiagnostic || undefined}
        title={editingDiagnostic ? 'Modifier le diagnostic' : 'Nouveau diagnostic'}
        onSubmit={async (data) => {
          if (editingDiagnostic) {
            await updateDiagnostic.mutateAsync({ id: editingDiagnostic.id, data })
            patchUi({ editingDiagnostic: null })
          } else {
            await createDiagnostic.mutateAsync(data)
            patchUi({ showCreateDiagnostic: false })
          }
        }}
        isLoading={editingDiagnostic ? updateDiagnostic.isPending : createDiagnostic.isPending}
      />
      {coproprieteId && (
        <BulkCreateAccountsDialog
          coproprieteId={coproprieteId}
          isOpen={showBulkCreate}
          onClose={() => patchUi({ showBulkCreate: false })}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && patchUi({ deleteTarget: null })}
        title="Confirmer la suppression"
        description="Cette action est irréversible."
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget?.type === 'lot') deleteLot.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'pc') deletePC.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'cle') deleteCle.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'locataire') deleteLocataire.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'mutation') deleteMutation.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'diagnostic') deleteDiagnostic.mutate(deleteTarget.id)
          patchUi({ deleteTarget: null })
        }}
      />
    </>
  )
}
