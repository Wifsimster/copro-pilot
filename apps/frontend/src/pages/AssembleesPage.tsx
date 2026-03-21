import { useState } from 'react'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useAssembleesByCopropriete, useCreateAssemblee, useUpdateAssemblee, useDeleteAssemblee } from '@/hooks/useAssemblees'
import { AssembleeFormDialog } from '@/components/assemblees/AssembleeFormDialog'
import type { AssembleeGenerale } from '@/types'
import { Calendar, Plus, Trash2, Pencil, Eye, MapPin, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

const TYPE_LABELS: Record<string, string> = {
  ordinaire: 'Ordinaire',
  extraordinaire: 'Extraordinaire',
}

const STATUT_LABELS: Record<string, string> = {
  planifiee: 'Planifiee',
  convoquee: 'Convoquee',
  en_cours: 'En cours',
  terminee: 'Terminee',
  annulee: 'Annulee',
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
  const { data: assemblees, isLoading: loadingAGs } = useAssembleesByCopropriete(selectedCoproId)
  const createAG = useCreateAssemblee()
  const updateAG = useUpdateAssemblee()
  const deleteAG = useDeleteAssemblee()
  const [editingAG, setEditingAG] = useState<AssembleeGenerale | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Assemblees Generales</h1>
          <p className="text-stone-500 dark:text-stone-400">Gestion des AG, resolutions et votes</p>
        </div>
      </div>

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
          <Calendar className="h-12 w-12 text-stone-400 dark:text-stone-500" />
          <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">Aucune copropriete selectionnee</h3>
          <p className="mt-2 text-stone-500 dark:text-stone-400">Selectionnez une copropriete dans le menu lateral.</p>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowDialog(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Nouvelle AG
            </button>
          </div>

          {loadingAGs ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
            </div>
          ) : !assemblees || assemblees.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
              <Calendar className="h-12 w-12 text-stone-400 dark:text-stone-500" />
              <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">Aucune assemblee generale</h3>
              <p className="mt-2 text-stone-500 dark:text-stone-400">Planifiez votre premiere AG.</p>
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
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setEditingAG(ag)}
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-emerald-700 dark:hover:bg-stone-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Supprimer cette AG ?')) deleteAG.mutate(ag.id)
                        }}
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-red-600 dark:hover:bg-stone-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    {ag.heure && (
                      <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                        <Clock className="h-3.5 w-3.5" />
                        {ag.heure}
                      </div>
                    )}
                    {ag.lieu && (
                      <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                        <MapPin className="h-3.5 w-3.5" />
                        {ag.lieu}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <AssembleeFormDialog
            open={showDialog || !!editingAG}
            onOpenChange={(open) => { if (!open) { setShowDialog(false); setEditingAG(null) } }}
            coproprieteId={selectedCoproId}
            defaultValues={editingAG || undefined}
            title={editingAG ? 'Modifier l\'assemblee generale' : 'Nouvelle assemblee generale'}
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
    </div>
  )
}
