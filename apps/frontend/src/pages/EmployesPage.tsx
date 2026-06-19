import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import {
  useEmployesSyndicatByCopropriete,
  useCreateEmployeSyndicat,
  useUpdateEmployeSyndicat,
  useDeleteEmployeSyndicat,
} from '@/hooks/useEmployesSyndicat'
import { EmployeFormDialog } from '@/components/employes/EmployeFormDialog'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { DataTable, type Column } from '@/components/ui/data-table'
import type { EmployeSyndicat } from '@/types'
import { HardHat, Plus, Trash2, Pencil, Home } from 'lucide-react'

const TYPE_CONTRAT_LABELS: Record<string, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  interim: 'Intérim',
  saisonnier: 'Saisonnier',
}

const STATUT_LABELS: Record<string, string> = {
  actif: 'Actif',
  inactif: 'Inactif',
}

const STATUT_COLORS: Record<string, string> = {
  actif: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactif: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
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
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: employes, isLoading } = useEmployesSyndicatByCopropriete(selectedCoproId)
  const createEmploye = useCreateEmployeSyndicat()
  const updateEmploye = useUpdateEmployeSyndicat()
  const deleteEmploye = useDeleteEmployeSyndicat()

  const columns: Column<EmployeSyndicat>[] = useMemo(() => [
    {
      key: 'nom',
      header: 'Nom',
      sortable: true,
      render: (e) => (
        <span className="font-medium text-stone-900 dark:text-white">{e.nom}</span>
      ),
    },
    {
      key: 'prenom',
      header: 'Prenom',
      sortable: true,
    },
    {
      key: 'poste',
      header: 'Poste',
      sortable: true,
    },
    {
      key: 'type_contrat',
      header: 'Contrat',
      render: (e) => TYPE_CONTRAT_LABELS[e.type_contrat] || e.type_contrat,
    },
    {
      key: 'salaire_brut',
      header: 'Salaire brut',
      sortable: true,
      render: (e) =>
        e.salaire_brut
          ? Number(e.salaire_brut).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
          : '\u2014',
    },
    {
      key: 'logement_fonction',
      header: 'Logement',
      render: (e) =>
        e.logement_fonction ? (
          <Home className="size-4 text-emerald-700 dark:text-emerald-400" />
        ) : (
          '\u2014'
        ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: (e) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_COLORS[e.statut]}`}>
          {STATUT_LABELS[e.statut]}
        </span>
      ),
    },
  ], [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Employés du syndicat</h1>
          <p className="text-stone-500 dark:text-stone-400">Gestion du personnel de la copropriété</p>
        </div>
      </div>

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
          <HardHat className="size-12 text-stone-400 dark:text-stone-500" />
          <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">Aucune copropriété sélectionnée</h3>
          <p className="mt-2 text-stone-500 dark:text-stone-400">Sélectionnez une copropriété dans le menu latéral.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Liste des employes</h2>
            <button type="button"
              onClick={() => setShowDialog(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
            >
              <Plus className="size-4" />
              Nouvel employe
            </button>
          </div>

          <div className="p-4">
            <DataTable
              columns={columns}
              data={employes || []}
              isLoading={isLoading}
              searchable
              searchPlaceholder="Rechercher un employe..."
              emptyMessage="Aucun employe enregistre"
              actions={(employe) => (
                <div className="flex gap-1">
                  <button type="button"
                    onClick={() => { setEditingEmploye(employe); setShowDialog(true) }}
                    className="rounded p-1 text-stone-400 hover:text-emerald-700"
                    aria-label="Modifier"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button type="button"
                    onClick={() => setDeleteId(employe.id)}
                    className="rounded p-1 text-stone-400 hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}
            />
          </div>

          <EmployeFormDialog
            open={showDialog}
            onOpenChange={(open) => { setShowDialog(open); if (!open) setEditingEmploye(null) }}
            coproprieteId={selectedCoproId}
            defaultValues={editingEmploye || undefined}
            title={editingEmploye ? 'Modifier l\'employé' : 'Nouvel employé'}
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

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Confirmer la suppression"
        description="Cette action est irréversible."
        variant="destructive"
        onConfirm={() => { deleteEmploye.mutate(deleteId!); setDeleteId(null) }}
      />
    </div>
  )
}
