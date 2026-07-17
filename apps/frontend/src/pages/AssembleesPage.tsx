import { useState } from 'react'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useAssembleesByCopropriete, useCreateAssemblee, useUpdateAssemblee, useDeleteAssemblee } from '@/hooks/useAssemblees'
import { AssembleeFormDialog } from '@/components/assemblees/AssembleeFormDialog'
import { AGBuilderWizard } from '@/components/assemblees/AGBuilderWizard'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import type { AssembleeGenerale } from '@/types'
import { Calendar, Plus, Trash2, Pencil, Eye, MapPin, Clock, Wand2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ErrorAlert } from '@/components/layout/ErrorAlert'

const TYPE_LABELS: Record<string, string> = {
  ordinaire: 'Ordinaire',
  extraordinaire: 'Extraordinaire',
}

const STATUT_LABELS: Record<string, string> = {
  planifiee: 'Planifiée',
  convoquee: 'Convoquée',
  en_cours: 'En cours',
  terminee: 'Terminée',
  annulee: 'Annulée',
}

const STATUT_COLORS: Record<string, string> = {
  planifiee: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  convoquee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  en_cours: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  terminee: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  annulee: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function AssembleesPage() {
  const selectedCoproId = useCoproprieteStore((s) => s.selectedCoproprieteId)
  const [showDialog, setShowDialog] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const { data: assemblees, isLoading: loadingAGs, isError, error } = useAssembleesByCopropriete(selectedCoproId)
  const createAG = useCreateAssemblee()
  const updateAG = useUpdateAssemblee()
  const deleteAG = useDeleteAssemblee()
  const [editingAG, setEditingAG] = useState<AssembleeGenerale | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Assemblées Générales</h1>
          <p className="text-stone-500 dark:text-stone-400">Gestion des AG, résolutions et votes</p>
        </div>
      </div>

      {isError && <ErrorAlert error={error} message="Impossible de charger les assemblees generales" />}

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
          <Calendar className="size-12 text-stone-400 dark:text-stone-500" />
          <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">Aucune copropriété sélectionnée</h3>
          <p className="mt-2 text-stone-500 dark:text-stone-400">Sélectionnez une copropriété dans le menu latéral.</p>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-end gap-2">
            <button type="button"
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              <Wand2 className="size-4" />
              Créer (guidé)
            </button>
            <button type="button"
              onClick={() => setShowDialog(true)}
              className="flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              <Plus className="size-4" />
              Formulaire
            </button>
          </div>

          {loadingAGs ? (
            <div className="flex justify-center py-8">
              <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
            </div>
          ) : !assemblees || assemblees.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
              <Calendar className="size-12 text-stone-400 dark:text-stone-500" />
              <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">Aucune assemblée générale</h3>
              <p className="mt-2 text-stone-500 dark:text-stone-400">Planifiez votre première AG.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {assemblees.map((ag: AssembleeGenerale) => (
                <div
                  key={ag.id}
                  className="group rounded-xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-800"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_COLORS[ag.statut]}`}>
                          {STATUT_LABELS[ag.statut]}
                        </span>
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          {TYPE_LABELS[ag.type]}
                        </span>
                      </div>
                      <h3 className="mt-2 font-semibold text-stone-900 dark:text-white">
                        AG du {new Date(ag.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </h3>
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link
                        to={`/assemblees/${ag.id}`}
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-emerald-700 dark:hover:bg-stone-800"
                        aria-label="Voir"
                      >
                        <Eye className="size-4" />
                      </Link>
                      <button type="button"
                        onClick={() => setEditingAG(ag)}
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-emerald-700 dark:hover:bg-stone-800"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => setDeleteId(ag.id)}
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-red-600 dark:hover:bg-stone-800"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    {ag.heure && (
                      <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                        <Clock className="size-3.5" />
                        {ag.heure}
                      </div>
                    )}
                    {ag.lieu && (
                      <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                        <MapPin className="size-3.5" />
                        {ag.lieu}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <AGBuilderWizard
            open={showWizard}
            onOpenChange={setShowWizard}
            coproprieteId={selectedCoproId}
          />

          <AssembleeFormDialog
            open={showDialog || !!editingAG}
            onOpenChange={(open) => { if (!open) { setShowDialog(false); setEditingAG(null) } }}
            coproprieteId={selectedCoproId}
            defaultValues={editingAG || undefined}
            title={editingAG ? 'Modifier l\'assemblée générale' : 'Nouvelle assemblée générale'}
            onSubmit={async (data) => {
              if (editingAG) {
                await updateAG.mutateAsync({ id: editingAG.id, data })
                setEditingAG(null)
              } else {
                await createAG.mutateAsync(data)
                setShowDialog(false)
              }
            }}
            isLoading={editingAG ? updateAG.isPending : createAG.isPending}
          />
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Confirmer la suppression"
        description="Cette action est irréversible."
        variant="destructive"
        onConfirm={() => { deleteAG.mutate(deleteId!); setDeleteId(null) }}
      />
    </div>
  )
}
