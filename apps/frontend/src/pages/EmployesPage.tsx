import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import {
  useEmployesSyndicatByCopropriete,
  useCreateEmployeSyndicat,
  useUpdateEmployeSyndicat,
  useDeleteEmployeSyndicat,
} from '@/hooks/useEmployesSyndicat'
import { EmployeFormDialog } from '@/components/employes/EmployeFormDialog'
import type { EmployeSyndicat } from '@/types'
import { HardHat, Plus, Trash2, Pencil, Home } from 'lucide-react'

const TYPE_CONTRAT_LABELS: Record<string, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  interim: 'Interim',
  saisonnier: 'Saisonnier',
}

const STATUT_LABELS: Record<string, string> = {
  actif: 'Actif',
  inactif: 'Inactif',
}

const STATUT_COLORS: Record<string, string> = {
  actif: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactif: 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300',
}

export default function EmployesPage() {
  const [searchParams] = useSearchParams()
  const { selectedCoproprieteId: selectedCoproId, setSelectedCoproprieteId } = useCoproprieteStore()

  useEffect(() => {
    const param = searchParams.get('copropriete')
    if (param) setSelectedCoproprieteId(parseInt(param))
  }, [searchParams, setSelectedCoproprieteId])

  const [showDialog, setShowDialog] = useState(false)
  const [editingEmploye, setEditingEmploye] = useState<EmployeSyndicat | null>(null)

  const { data: employes, isLoading } = useEmployesSyndicatByCopropriete(selectedCoproId)
  const createEmploye = useCreateEmployeSyndicat()
  const updateEmploye = useUpdateEmployeSyndicat()
  const deleteEmploye = useDeleteEmployeSyndicat()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employes du syndicat</h1>
          <p className="text-gray-500 dark:text-zinc-400">Gestion du personnel de la copropriete</p>
        </div>
      </div>

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12 dark:border-zinc-600">
          <HardHat className="h-12 w-12 text-gray-400 dark:text-zinc-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Aucune copropriete selectionnee</h3>
          <p className="mt-2 text-gray-500 dark:text-zinc-400">Selectionnez une copropriete dans le menu lateral.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Liste des employes</h2>
            <button
              onClick={() => setShowDialog(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Nouvel employe
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : !employes || employes.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <HardHat className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
              <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucun employe enregistre</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Nom</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Prenom</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Poste</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Contrat</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Salaire brut</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Logement</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Statut</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {employes.map((employe: EmployeSyndicat) => (
                    <tr key={employe.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{employe.nom}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{employe.prenom}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{employe.poste}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                        {TYPE_CONTRAT_LABELS[employe.type_contrat] || employe.type_contrat}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                        {employe.salaire_brut
                          ? Number(employe.salaire_brut).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                        {employe.logement_fonction ? (
                          <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_COLORS[employe.statut]}`}>
                          {STATUT_LABELS[employe.statut]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditingEmploye(employe); setShowDialog(true) }}
                            className="rounded p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Supprimer cet employe ?')) deleteEmploye.mutate(employe.id)
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

          <EmployeFormDialog
            open={showDialog}
            onOpenChange={(open) => { setShowDialog(open); if (!open) setEditingEmploye(null) }}
            coproprieteId={selectedCoproId}
            defaultValues={editingEmploye || undefined}
            title={editingEmploye ? 'Modifier l\'employe' : 'Nouvel employe'}
            onSubmit={async (data) => {
              if (editingEmploye) {
                await updateEmploye.mutateAsync({ id: editingEmploye.id, data })
              } else {
                await createEmploye.mutateAsync(data)
              }
              setShowDialog(false)
              setEditingEmploye(null)
            }}
            isLoading={editingEmploye ? updateEmploye.isPending : createEmploye.isPending}
          />
        </div>
      )}
    </div>
  )
}
