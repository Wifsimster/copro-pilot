import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import type { DeclarationRegistre, DonneesDeclarees } from '@/types'
import { ClipboardList, Plus, Trash2, Pencil, FileSearch, Building2, CalendarDays } from 'lucide-react'

const STATUT_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  soumis: 'Soumis',
  valide: 'Valide',
}

const STATUT_COLORS: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300',
  soumis: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  valide: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

export default function ImmatriculationPage() {
  const [searchParams] = useSearchParams()
  const { selectedCoproprieteId: selectedCoproId, setSelectedCoproprieteId } = useCoproprieteStore()

  useEffect(() => {
    const param = searchParams.get('copropriete')
    if (param) setSelectedCoproprieteId(parseInt(param))
  }, [searchParams, setSelectedCoproprieteId])

  const [showDialog, setShowDialog] = useState(false)
  const [editingDeclaration, setEditingDeclaration] = useState<DeclarationRegistre | null>(null)
  const [donneesPreparees, setDonneesPreparees] = useState<DonneesDeclarees | null>(null)
  const [isPreparating, setIsPreparating] = useState(false)

  const { data: coproprietes } = useCoproprietes()
  const { data: declarations, isLoading } = useDeclarationsRegistreByCopropriete(selectedCoproId)
  const createDeclaration = useCreateDeclarationRegistre()
  const updateDeclaration = useUpdateDeclarationRegistre()
  const deleteDeclaration = useDeleteDeclarationRegistre()

  const selectedCopropriete = coproprietes?.find(c => c.id === selectedCoproId)

  const handlePreparer = async () => {
    if (!selectedCoproId) return
    const annee = new Date().getFullYear()
    setIsPreparating(true)
    try {
      const response = await declarationsRegistreApi.preparerDonnees(selectedCoproId, annee)
      setDonneesPreparees(response.data)
      setEditingDeclaration(null)
      setShowDialog(true)
    } catch {
      // Error handled by API layer
    } finally {
      setIsPreparating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Immatriculation</h1>
          <p className="text-gray-500 dark:text-zinc-400">Registre national des coproprietes</p>
        </div>
      </div>

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12 dark:border-zinc-600">
          <ClipboardList className="h-12 w-12 text-gray-400 dark:text-zinc-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Aucune copropriete selectionnee</h3>
          <p className="mt-2 text-gray-500 dark:text-zinc-400">Selectionnez une copropriete dans le menu lateral.</p>
        </div>
      ) : (
        <>
          {/* Info card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Informations d'immatriculation</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-zinc-400">Numero d'immatriculation</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedCopropriete?.numero_immatriculation || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-zinc-400">Date d'immatriculation</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedCopropriete?.date_immatriculation
                    ? new Date(selectedCopropriete.date_immatriculation).toLocaleDateString('fr-FR')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-zinc-400">Derniere mise a jour registre</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedCopropriete?.date_derniere_maj_registre
                    ? new Date(selectedCopropriete.date_derniere_maj_registre).toLocaleDateString('fr-FR')
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Declarations table */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Declarations annuelles</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePreparer}
                  disabled={isPreparating}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                >
                  <FileSearch className="h-4 w-4" />
                  {isPreparating ? 'Preparation...' : 'Preparer declaration'}
                </button>
                <button
                  onClick={() => { setDonneesPreparees(null); setEditingDeclaration(null); setShowDialog(true) }}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle declaration
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : !declarations || declarations.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <CalendarDays className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
                <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucune declaration enregistree</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Annee</th>
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Date de declaration</th>
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Statut</th>
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Notes</th>
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {declarations.map((decl: DeclarationRegistre) => (
                      <tr key={decl.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{decl.annee}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                          {decl.date_declaration
                            ? new Date(decl.date_declaration).toLocaleDateString('fr-FR')
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_COLORS[decl.statut]}`}>
                            {STATUT_LABELS[decl.statut]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-zinc-300 max-w-xs truncate">
                          {decl.notes || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => { setDonneesPreparees(null); setEditingDeclaration(decl); setShowDialog(true) }}
                              className="rounded p-1 text-gray-400 hover:text-blue-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Supprimer cette declaration ?')) deleteDeclaration.mutate(decl.id)
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

            <DeclarationFormDialog
              open={showDialog}
              onOpenChange={(open) => { setShowDialog(open); if (!open) { setEditingDeclaration(null); setDonneesPreparees(null) } }}
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
                setShowDialog(false)
                setEditingDeclaration(null)
                setDonneesPreparees(null)
              }}
              isLoading={editingDeclaration ? updateDeclaration.isPending : createDeclaration.isPending}
            />
          </div>
        </>
      )}
    </div>
  )
}
