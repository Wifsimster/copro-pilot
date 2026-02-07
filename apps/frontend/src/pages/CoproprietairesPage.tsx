import { useState } from 'react'
import { useCoproprietaires, useCreateCoproprietaire, useUpdateCoproprietaire, useDeleteCoproprietaire } from '@/hooks/useCoproprietaires'
import type { Coproprietaire } from '@/types'
import { Users, Plus, Trash2, Pencil, Mail, Phone } from 'lucide-react'
import { CoproprietaireFormDialog } from '@/components/coproprietaires/CoproprietaireFormDialog'

export default function CoproprietairesPage() {
  const { data: coproprietaires, isLoading } = useCoproprietaires()
  const createCoproprietaire = useCreateCoproprietaire()
  const updateCoproprietaire = useUpdateCoproprietaire()
  const deleteCoproprietaire = useDeleteCoproprietaire()
  const [showCreate, setShowCreate] = useState(false)
  const [editingCopro, setEditingCopro] = useState<Coproprietaire | null>(null)
  const [search, setSearch] = useState('')

  const filtered = coproprietaires?.filter((c: Coproprietaire) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.nom.toLowerCase().includes(q) ||
      c.prenom.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    )
  })

  const handleDelete = (id: number, nom: string, prenom: string) => {
    if (window.confirm(`Supprimer ${prenom} ${nom} ?`)) {
      deleteCoproprietaire.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Copropriétaires</h1>
          <p className="text-gray-500 dark:text-zinc-400">
            {coproprietaires?.length || 0} copropriétaire{(coproprietaires?.length || 0) > 1 ? 's' : ''} enregistré{(coproprietaires?.length || 0) > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nouveau copropriétaire
        </button>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, prénom ou email..."
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
        />
      </div>

      {/* List */}
      {(!filtered || filtered.length === 0) ? (
        <div className="flex flex-col items-center py-16">
          <Users className="h-12 w-12 text-gray-300 dark:text-zinc-600" />
          <p className="mt-4 text-lg text-gray-500 dark:text-zinc-400">
            {search ? 'Aucun résultat' : 'Aucun copropriétaire enregistré'}
          </p>
          {!search && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Ajouter un copropriétaire
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((copro: Coproprietaire) => (
            <div
              key={copro.id}
              className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    <span className="text-sm font-bold">
                      {copro.prenom[0]}{copro.nom[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {copro.prenom} {copro.nom}
                    </h3>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingCopro(copro)}
                    className="rounded p-1 text-gray-400 hover:text-blue-600"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(copro.id, copro.nom, copro.prenom)}
                    className="rounded p-1 text-gray-400 hover:text-red-600"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                {copro.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{copro.email}</span>
                  </div>
                )}
                {copro.telephone && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{copro.telephone}</span>
                  </div>
                )}
                {!copro.email && !copro.telephone && (
                  <p className="text-sm italic text-gray-400 dark:text-zinc-500">Aucun contact renseigné</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CoproprietaireFormDialog
        open={showCreate || !!editingCopro}
        onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditingCopro(null) } }}
        defaultValues={editingCopro || undefined}
        title={editingCopro ? 'Modifier le coproprietaire' : 'Nouveau coproprietaire'}
        onSubmit={async (data) => {
          if (editingCopro) {
            await updateCoproprietaire.mutateAsync({ id: editingCopro.id, data })
            setEditingCopro(null)
          } else {
            await createCoproprietaire.mutateAsync(data)
            setShowCreate(false)
          }
        }}
        isLoading={editingCopro ? updateCoproprietaire.isPending : createCoproprietaire.isPending}
      />
    </div>
  )
}
