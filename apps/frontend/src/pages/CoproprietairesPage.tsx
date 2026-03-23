import { useState } from 'react'
import { useCoproprietaires, useCreateCoproprietaire, useUpdateCoproprietaire, useDeleteCoproprietaire } from '@/hooks/useCoproprietaires'
import type { Coproprietaire } from '@/types'
import { Users, Plus, Trash2, Pencil, Mail, Phone } from 'lucide-react'
import { CoproprietaireFormDialog } from '@/components/coproprietaires/CoproprietaireFormDialog'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'

export default function CoproprietairesPage() {
  const { data: coproprietaires, isLoading } = useCoproprietaires()
  const createCoproprietaire = useCreateCoproprietaire()
  const updateCoproprietaire = useUpdateCoproprietaire()
  const deleteCoproprietaire = useDeleteCoproprietaire()
  const [showCreate, setShowCreate] = useState(false)
  const [editingCopro, setEditingCopro] = useState<Coproprietaire | null>(null)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const filtered = coproprietaires?.filter((c: Coproprietaire) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.nom.toLowerCase().includes(q) ||
      c.prenom.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    )
  })

  const handleDelete = (id: number) => {
    setDeleteId(id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="size-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Copropriétaires</h1>
          <p className="text-stone-500 dark:text-stone-400">
            {coproprietaires?.length || 0} copropriétaire{(coproprietaires?.length || 0) > 1 ? 's' : ''} enregistré{(coproprietaires?.length || 0) > 1 ? 's' : ''}
          </p>
        </div>
        <button type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Nouveau copropriétaire
        </button>
      </div>

      {/* Search */}
      <div>
        <input
          aria-label="Rechercher un copropriétaire"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, prénom ou email..."
          className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-stone-600 dark:bg-stone-800 dark:text-white dark:placeholder:text-stone-500"
        />
      </div>

      {/* List */}
      {(!filtered || filtered.length === 0) ? (
        <div className="flex flex-col items-center py-16">
          <Users className="size-12 text-stone-300 dark:text-stone-600" />
          <p className="mt-4 text-lg text-stone-500 dark:text-stone-400">
            {search ? 'Aucun résultat' : 'Aucun copropriétaire enregistré'}
          </p>
          {!search && (
            <button type="button"
              onClick={() => setShowCreate(true)}
              className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-800"
            >
              <Plus className="size-4" />
              Ajouter un copropriétaire
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((copro: Coproprietaire) => (
            <div
              key={copro.id}
              className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <span className="text-sm font-bold">
                      {copro.prenom[0]}{copro.nom[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-white">
                      {copro.prenom} {copro.nom}
                    </h3>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button type="button"
                    onClick={() => setEditingCopro(copro)}
                    className="rounded p-1 text-stone-400 hover:text-emerald-700"
                    title="Modifier"
                    aria-label="Modifier"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button type="button"
                    onClick={() => handleDelete(copro.id)}
                    className="rounded p-1 text-stone-400 hover:text-red-600"
                    title="Supprimer"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                {copro.email && (
                  <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                    <Mail className="size-3.5" />
                    <span className="truncate">{copro.email}</span>
                  </div>
                )}
                {copro.telephone && (
                  <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                    <Phone className="size-3.5" />
                    <span>{copro.telephone}</span>
                  </div>
                )}
                {!copro.email && !copro.telephone && (
                  <p className="text-sm italic text-stone-400 dark:text-stone-500">Aucun contact renseigné</p>
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
        title={editingCopro ? 'Modifier le copropriétaire' : 'Nouveau copropriétaire'}
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

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Confirmer la suppression"
        description="Cette action est irréversible."
        variant="destructive"
        onConfirm={() => { deleteCoproprietaire.mutate(deleteId!); setDeleteId(null) }}
      />
    </div>
  )
}
