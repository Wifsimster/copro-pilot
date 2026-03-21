import { useState } from 'react'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import {
  useTaches,
  useCreateTache,
  useUpdateTache,
  useDeleteTache,
} from '@/hooks/useTaches'
import { TacheFormDialog } from '@/components/taches/TacheFormDialog'
import type { Tache, StatutTache, PrioriteTache } from '@/types'
import {
  CheckSquare,
  Plus,
  Trash2,
  Pencil,
  Check,
  AlertTriangle,
} from 'lucide-react'

const STATUT_LABELS: Record<StatutTache, string> = {
  a_faire: 'A faire',
  en_cours: 'En cours',
  fait: 'Fait',
  annule: 'Annule',
}

const STATUT_COLORS: Record<StatutTache, string> = {
  a_faire: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  en_cours:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  fait: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  annule: 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300',
}

const PRIORITE_LABELS: Record<PrioriteTache, string> = {
  basse: 'Basse',
  normale: 'Normale',
  haute: 'Haute',
  urgente: 'Urgente',
}

const PRIORITE_COLORS: Record<PrioriteTache, string> = {
  basse: 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300',
  normale:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  haute:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  urgente: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const ENTITE_TYPE_LABELS: Record<string, string> = {
  incident: 'Incident',
  contrat: 'Contrat',
  ag: 'AG',
  assurance: 'Assurance',
  diagnostic: 'Diagnostic',
}

type StatutFilter = 'tous' | StatutTache

export default function TachesPage() {
  const { selectedCoproprieteId: selectedCoproId } = useCoproprieteStore()
  const [statutFilter, setStatutFilter] = useState<StatutFilter>('tous')
  const [prioriteFilter, setPrioriteFilter] = useState<string>('tous')
  const [showDialog, setShowDialog] = useState(false)
  const [editingTache, setEditingTache] = useState<Tache | null>(null)

  const filters: {
    statut?: string
    priorite?: string
    copropriete_id?: number
  } = {}
  if (statutFilter !== 'tous') filters.statut = statutFilter
  if (prioriteFilter !== 'tous') filters.priorite = prioriteFilter
  if (selectedCoproId) filters.copropriete_id = selectedCoproId

  const { data: taches, isLoading } = useTaches(filters)
  const createTache = useCreateTache()
  const updateTache = useUpdateTache()
  const deleteTache = useDeleteTache()

  const today = new Date().toISOString().split('T')[0]

  const isOverdue = (tache: Tache) =>
    tache.date_echeance &&
    tache.date_echeance < today &&
    (tache.statut === 'a_faire' || tache.statut === 'en_cours')

  const filteredTaches = taches || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Taches & Rappels
          </h1>
          <p className="text-gray-500 dark:text-zinc-400">
            Gestion des taches et rappels
            {filteredTaches.length > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {filteredTaches.length}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nouvelle tache
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">
            Statut :
          </span>
          <div className="flex gap-1">
            {(
              [
                { key: 'tous', label: 'Tous' },
                { key: 'a_faire', label: 'A faire' },
                { key: 'en_cours', label: 'En cours' },
                { key: 'fait', label: 'Fait' },
              ] as { key: StatutFilter; label: string }[]
            ).map(f => (
              <button
                key={f.key}
                onClick={() => setStatutFilter(f.key)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  statutFilter === f.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">
            Priorite :
          </span>
          <div className="flex gap-1">
            {[
              { key: 'tous', label: 'Toutes' },
              { key: 'urgente', label: 'Urgente' },
              { key: 'haute', label: 'Haute' },
              { key: 'normale', label: 'Normale' },
              { key: 'basse', label: 'Basse' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setPrioriteFilter(f.key)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  prioriteFilter === f.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : filteredTaches.length === 0 ? (
          <div className="flex flex-col items-center py-12">
            <CheckSquare className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
            <p className="mt-3 text-gray-500 dark:text-zinc-400">
              Aucune tache
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">
                    Titre
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">
                    Priorite
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">
                    Statut
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">
                    Echeance
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">
                    Entite
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400" />
                </tr>
              </thead>
              <tbody>
                {filteredTaches.map((tache: Tache) => (
                  <tr
                    key={tache.id}
                    className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {tache.titre}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITE_COLORS[tache.priorite]}`}
                      >
                        {PRIORITE_LABELS[tache.priorite]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_COLORS[tache.statut]}`}
                      >
                        {STATUT_LABELS[tache.statut]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {tache.date_echeance ? (
                        <span
                          className={`inline-flex items-center gap-1 ${
                            isOverdue(tache)
                              ? 'font-medium text-red-600 dark:text-red-400'
                              : 'text-gray-600 dark:text-zinc-300'
                          }`}
                        >
                          {isOverdue(tache) && (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          )}
                          {new Date(
                            tache.date_echeance
                          ).toLocaleDateString('fr-FR')}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-zinc-500">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                      {tache.entite_type
                        ? ENTITE_TYPE_LABELS[tache.entite_type] ||
                          tache.entite_type
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {tache.statut !== 'fait' &&
                          tache.statut !== 'annule' && (
                            <button
                              onClick={() =>
                                updateTache.mutate({
                                  id: tache.id,
                                  data: { statut: 'fait' },
                                })
                              }
                              className="rounded p-1 text-gray-400 hover:text-green-600"
                              title="Marquer comme fait"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        <button
                          onClick={() => {
                            setEditingTache(tache)
                            setShowDialog(true)
                          }}
                          className="rounded p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                'Supprimer cette tache ?'
                              )
                            )
                              deleteTache.mutate(tache.id)
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
      </div>

      <TacheFormDialog
        open={showDialog}
        onOpenChange={open => {
          setShowDialog(open)
          if (!open) setEditingTache(null)
        }}
        coproprieteId={selectedCoproId}
        defaultValues={editingTache || undefined}
        title={
          editingTache ? 'Modifier la tache' : 'Nouvelle tache'
        }
        onSubmit={async data => {
          if (editingTache) {
            await updateTache.mutateAsync({
              id: editingTache.id,
              data,
            })
          } else {
            await createTache.mutateAsync(data)
          }
          setShowDialog(false)
          setEditingTache(null)
        }}
        isLoading={
          editingTache
            ? updateTache.isPending
            : createTache.isPending
        }
      />
    </div>
  )
}
