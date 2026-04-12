import { useState } from 'react'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useCoproprietaires } from '@/hooks/useCoproprietaires'
import { useAssembleesByCopropriete } from '@/hooks/useAssemblees'
import { useConseilSyndicalByCopropriete, useCreateMembreConseil, useUpdateMembreConseil, useDeleteMembreConseil } from '@/hooks/useConseilSyndical'
import { ConseilSyndicalFormDialog } from '@/components/conseil-syndical/ConseilSyndicalFormDialog'
import type { MembreConseilSyndical } from '@/types'
import { NoCoproprieteSelected } from '@/components/layout/NoCoproprieteSelected'
import { UsersRound, Plus, Trash2, Pencil, Crown } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  president: 'President',
  membre: 'Membre',
  suppleant: 'Suppleant',
}

const ROLE_COLORS: Record<string, string> = {
  president: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  membre: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  suppleant: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

export default function ConseilSyndicalPage() {
  const selectedCoproId = useCoproprieteStore((s) => s.selectedCoproprieteId)

  const [showDialog, setShowDialog] = useState(false)
  const [editingMembre, setEditingMembre] = useState<MembreConseilSyndical | null>(null)

  const { data: coproprietaires } = useCoproprietaires()
  const { data: assemblees } = useAssembleesByCopropriete(selectedCoproId)
  const { data: membres, isLoading: loadingMembres } = useConseilSyndicalByCopropriete(selectedCoproId)

  const createMembre = useCreateMembreConseil()
  const updateMembre = useUpdateMembreConseil()
  const deleteMembre = useDeleteMembreConseil()

  const isMandatExpired = (dateStr: string | null | undefined) => {
    if (!dateStr) return false
    return new Date(dateStr).getTime() < Date.now()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Conseil Syndical</h1>
          <p className="text-stone-500 dark:text-stone-400">Gestion des membres du conseil syndical</p>
        </div>
      </div>

      {!selectedCoproId ? (
        <NoCoproprieteSelected />
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Membres du conseil syndical</h2>
            <button
              onClick={() => setShowDialog(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Nouveau membre
            </button>
          </div>

          {loadingMembres ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
            </div>
          ) : !membres || membres.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <UsersRound className="h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun membre enregistre</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Coproprietaire</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Role</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date d'election</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Fin de mandat</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Notes</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {membres.map((membre: MembreConseilSyndical) => (
                    <tr key={membre.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {membre.role === 'president' && (
                            <Crown className="h-4 w-4 text-emerald-600" />
                          )}
                          <div>
                            <div className="font-medium text-stone-900 dark:text-white">
                              {membre.coproprietaire_nom} {membre.coproprietaire_prenom}
                            </div>
                            {membre.coproprietaire_email && (
                              <div className="text-xs text-stone-400">{membre.coproprietaire_email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[membre.role]}`}>
                          {ROLE_LABELS[membre.role] || membre.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                        {new Date(membre.date_election).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        {membre.date_fin_mandat ? (
                          <span className={isMandatExpired(membre.date_fin_mandat) ? 'text-red-500 font-medium' : 'text-stone-600 dark:text-stone-300'}>
                            {new Date(membre.date_fin_mandat).toLocaleDateString('fr-FR')}
                          </span>
                        ) : (
                          <span className="text-stone-400">&mdash;</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                        {membre.notes || <span className="text-stone-400">&mdash;</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditingMembre(membre); setShowDialog(true) }}
                            className="rounded p-1 text-stone-400 hover:text-emerald-700"
                            aria-label="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Supprimer ce membre du conseil syndical ?')) deleteMembre.mutate(membre.id)
                            }}
                            className="rounded p-1 text-stone-400 hover:text-red-600"
                            aria-label="Supprimer"
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

          <ConseilSyndicalFormDialog
            open={showDialog}
            onOpenChange={(open) => { setShowDialog(open); if (!open) setEditingMembre(null) }}
            coproprieteId={selectedCoproId}
            coproprietaires={coproprietaires || []}
            assemblees={assemblees || []}
            defaultValues={editingMembre || undefined}
            title={editingMembre ? 'Modifier le membre' : 'Nouveau membre'}
            onSubmit={async (data) => {
              if (editingMembre) {
                await updateMembre.mutateAsync({ id: editingMembre.id, data })
              } else {
                await createMembre.mutateAsync(data)
              }
              setShowDialog(false)
              setEditingMembre(null)
            }}
            isLoading={editingMembre ? updateMembre.isPending : createMembre.isPending}
          />
        </div>
      )}
    </div>
  )
}
