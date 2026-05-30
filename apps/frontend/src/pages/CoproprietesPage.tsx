import { useState } from 'react'
import { useCoproprietes, useCreateCopropriete, useUpdateCopropriete, useDeleteCopropriete } from '@/hooks/useCoproprietes'
import type { CoproprieteWithStats } from '@/api/coproprietes'
import { Building2, Plus, Trash2, Pencil, Eye, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CoproprieteFormDialog } from '@/components/coproprietes/CoproprieteFormDialog'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { ErrorAlert } from '@/components/layout/ErrorAlert'

export default function CoproprietesPage() {
  const { data: coproprietes, isLoading, isError, error } = useCoproprietes()
  const createMutation = useCreateCopropriete()
  const updateMutation = useUpdateCopropriete()
  const deleteMutation = useDeleteCopropriete()
  const [showCreate, setShowCreate] = useState(false)
  const [editingCopro, setEditingCopro] = useState<CoproprieteWithStats | null>(null)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const filtered = coproprietes?.filter((c: CoproprieteWithStats) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.nom.toLowerCase().includes(q) ||
      c.adresse.toLowerCase().includes(q) ||
      c.ville.toLowerCase().includes(q) ||
      c.code_postal.includes(q)
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
      {isError && <ErrorAlert error={error} message="Impossible de charger les coproprietes" />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Copropriétés</h1>
          <p className="text-stone-500 dark:text-stone-400">
            {coproprietes?.length || 0} copropriété{(coproprietes?.length || 0) > 1 ? 's' : ''} gérée{(coproprietes?.length || 0) > 1 ? 's' : ''}
          </p>
        </div>
        <button type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Nouvelle copropriété
        </button>
      </div>

      {/* Search */}
      {coproprietes && coproprietes.length > 0 && (
        <div>
          <input
            aria-label="Rechercher une copropriété"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, adresse, ville ou code postal..."
            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-stone-600 dark:bg-stone-800 dark:text-white dark:placeholder:text-stone-500"
          />
        </div>
      )}

      {(!filtered || filtered.length === 0) ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
          <Building2 className="size-12 text-stone-400 dark:text-stone-500" />
          <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">
            {search ? 'Aucun résultat' : 'Aucune copropriété'}
          </h3>
          <p className="mt-2 text-stone-500 dark:text-stone-400">
            {search ? 'Essayez un autre terme de recherche.' : 'Commencez par créer votre première copropriété.'}
          </p>
          {!search && (
            <button type="button"
              onClick={() => setShowCreate(true)}
              className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-800"
            >
              <Plus className="size-4" />
              Creer une copropriete
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered!.map((copro: CoproprieteWithStats) => (
            <div
              key={copro.id}
              className="group rounded-xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-white">{copro.nom}</h3>
                    <div className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
                      <MapPin className="size-3" />
                      {copro.ville} ({copro.code_postal})
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Link
                    to={`/coproprietes/${copro.id}`}
                    className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-emerald-700 dark:hover:bg-stone-800"
                    aria-label="Voir"
                  >
                    <Eye className="size-4" />
                  </Link>
                  <button type="button"
                    onClick={() => setEditingCopro(copro)}
                    className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-emerald-700 dark:hover:bg-stone-800"
                    aria-label="Modifier"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button type="button"
                    onClick={() => handleDelete(copro.id)}
                    className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-red-600 dark:hover:bg-stone-800"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-stone-100 pt-4 dark:border-stone-700">
                <div className="text-center">
                  <p className="text-lg font-bold text-stone-900 dark:text-white">{copro.nombre_lots}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Lots</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-stone-900 dark:text-white">{copro.nombre_coproprietaires}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Copropriétaires</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-stone-900 dark:text-white">{copro.total_tantiemes}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Tantièmes</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CoproprieteFormDialog
        open={showCreate || !!editingCopro}
        onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditingCopro(null) } }}
        defaultValues={editingCopro || undefined}
        title={editingCopro ? 'Modifier la copropriete' : 'Nouvelle copropriete'}
        onSubmit={async (data) => {
          if (editingCopro) {
            await updateMutation.mutateAsync({ id: editingCopro.id, data })
            setEditingCopro(null)
          } else {
            await createMutation.mutateAsync(data)
            setShowCreate(false)
          }
        }}
        isLoading={editingCopro ? updateMutation.isPending : createMutation.isPending}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Confirmer la suppression"
        description="Cette action est irréversible."
        variant="destructive"
        onConfirm={() => { deleteMutation.mutate(deleteId!); setDeleteId(null) }}
      />
    </div>
  )
}
