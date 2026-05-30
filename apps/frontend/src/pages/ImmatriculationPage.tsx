import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useCoproprietes } from '@/hooks/useCoproprietes'
import {
  useDeclarationsRegistreByCopropriete,
  useCreateDeclarationRegistre,
  useUpdateDeclarationRegistre,
  useDeleteDeclarationRegistre,
} from '@/hooks/useDeclarationsRegistre'
import { declarationsRegistreApi } from '@/api/declarations-registre'
import { DeclarationFormDialog } from '@/components/immatriculation/DeclarationFormDialog'
import { ComplianceDashboard } from '@/components/immatriculation/ComplianceDashboard'
import { DeclarationsTable } from '@/components/immatriculation/DeclarationsTable'
import type { DeclarationRegistre, DonneesDeclarees } from '@/types'
import { NoCoproprieteSelected } from '@/components/layout/NoCoproprieteSelected'
import { Building2 } from 'lucide-react'

export default function ImmatriculationPage() {
  const [searchParams] = useSearchParams()
  const { selectedCoproprieteId: selectedCoproId, setSelectedCoproprieteId } = useCoproprieteStore()

  useEffect(() => {
    const param = searchParams.get('copropriete')
    if (param) setSelectedCoproprieteId(parseInt(param))
  }, [searchParams, setSelectedCoproprieteId])

  const [ui, setUi] = useState<{
    showDialog: boolean
    editingDeclaration: DeclarationRegistre | null
    donneesPreparees: DonneesDeclarees | null
    isPreparating: boolean
    complianceData: DonneesDeclarees | null
    expandedRow: number | null
    deleteId: number | null
  }>({
    showDialog: false,
    editingDeclaration: null,
    donneesPreparees: null,
    isPreparating: false,
    complianceData: null,
    expandedRow: null,
    deleteId: null,
  })
  const patchUi = (p: Partial<typeof ui>) => setUi(s => ({ ...s, ...p }))
  const { showDialog, editingDeclaration, donneesPreparees, isPreparating, complianceData, expandedRow, deleteId } = ui

  const { data: coproprietes } = useCoproprietes()
  const { data: declarations, isLoading } = useDeclarationsRegistreByCopropriete(selectedCoproId)
  const createDeclaration = useCreateDeclarationRegistre()
  const updateDeclaration = useUpdateDeclarationRegistre()
  const deleteDeclaration = useDeleteDeclarationRegistre()

  const selectedCopropriete = coproprietes?.find(c => c.id === selectedCoproId)

  // Fetch compliance data for current year
  useEffect(() => {
    if (!selectedCoproId) {
      patchUi({ complianceData: null })
      return
    }
    const annee = new Date().getFullYear()
    declarationsRegistreApi.preparerDonnees(selectedCoproId, annee)
      .then(res => patchUi({ complianceData: res.data }))
      .catch(() => patchUi({ complianceData: null }))
  }, [selectedCoproId])

  const handlePreparer = async () => {
    if (!selectedCoproId) return
    const annee = new Date().getFullYear()
    patchUi({ isPreparating: true })
    try {
      const response = await declarationsRegistreApi.preparerDonnees(selectedCoproId, annee)
      patchUi({ donneesPreparees: response.data })
      patchUi({ editingDeclaration: null })
      patchUi({ showDialog: true })
    } catch {
      // Error handled by API layer
    } finally {
      patchUi({ isPreparating: false })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Immatriculation</h1>
          <p className="text-stone-500 dark:text-stone-400">Registre national des coproprietes</p>
        </div>
      </div>

      {!selectedCoproId ? (
        <NoCoproprieteSelected />
      ) : (
        <>
          {/* Info card */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="size-5 text-emerald-700 dark:text-emerald-400" />
              <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Informations d'immatriculation</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-stone-500 dark:text-stone-400">Numero d'immatriculation</p>
                <p className="font-medium text-stone-900 dark:text-white">
                  {selectedCopropriete?.numero_immatriculation || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-500 dark:text-stone-400">Date d'immatriculation</p>
                <p className="font-medium text-stone-900 dark:text-white">
                  {selectedCopropriete?.date_immatriculation
                    ? new Date(selectedCopropriete.date_immatriculation).toLocaleDateString('fr-FR')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-500 dark:text-stone-400">Dernière mise à jour registre</p>
                <p className="font-medium text-stone-900 dark:text-white">
                  {selectedCopropriete?.date_derniere_maj_registre
                    ? new Date(selectedCopropriete.date_derniere_maj_registre).toLocaleDateString('fr-FR')
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Compliance dashboard */}
          {complianceData && <ComplianceDashboard complianceData={complianceData} />}

          {/* Declarations table */}
          <DeclarationsTable
            declarations={declarations}
            isLoading={isLoading}
            isPreparating={isPreparating}
            expandedRow={expandedRow}
            onPreparer={handlePreparer}
            onNouvelle={() => { patchUi({ donneesPreparees: null }); patchUi({ editingDeclaration: null }); patchUi({ showDialog: true }) }}
            onToggleRow={(id) => patchUi({ expandedRow: expandedRow === id ? null : id })}
            onEdit={(decl) => { patchUi({ donneesPreparees: null }); patchUi({ editingDeclaration: decl }); patchUi({ showDialog: true }) }}
            onDelete={(id) => patchUi({ deleteId: id })}
          >
            <DeclarationFormDialog
              open={showDialog}
              onOpenChange={(open) => { patchUi({ showDialog: open }); if (!open) { patchUi({ editingDeclaration: null }); patchUi({ donneesPreparees: null }) } }}
              coproprieteId={selectedCoproId}
              defaultValues={editingDeclaration || undefined}
              title={editingDeclaration ? 'Modifier la declaration' : 'Nouvelle declaration'}
              donneesPreparees={donneesPreparees}
              onSubmit={async (data) => {
                if (editingDeclaration) {
                  await updateDeclaration.mutateAsync({ id: editingDeclaration.id, data })
                } else {
                  await createDeclaration.mutateAsync(data)
                }
                patchUi({ showDialog: false })
                patchUi({ editingDeclaration: null })
                patchUi({ donneesPreparees: null })
              }}
              isLoading={editingDeclaration ? updateDeclaration.isPending : createDeclaration.isPending}
            />
          </DeclarationsTable>
        </>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && patchUi({ deleteId: null })}
        title="Confirmer la suppression"
        description="Cette action est irréversible."
        variant="destructive"
        onConfirm={() => { deleteDeclaration.mutate(deleteId!); patchUi({ deleteId: null }) }}
      />
    </div>
  )
}
