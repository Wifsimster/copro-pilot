import { useState } from 'react'
import { useCoproprietes, useCreateCopropriete, useUpdateCopropriete, useDeleteCopropriete } from '@/hooks/useCoproprietes'
import type { CoproprieteWithStats } from '@/api/coproprietes'
import { Building2, Plus, Trash2, Pencil, Eye, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CoproprieteFormDialog } from '@/components/coproprietes/CoproprieteFormDialog'

export default function CoproprietesPage() {
  const { data: coproprietes, isLoading } = useCoproprietes()
  const createMutation = useCreateCopropriete()
  const updateMutation = useUpdateCopropriete()
  const deleteMutation = useDeleteCopropriete()
  const [showCreate, setShowCreate] = useState(false)
  const [editingCopro, setEditingCopro] = useState<CoproprieteWithStats | null>(null)
  const [search, setSearch] = useState('')

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

  const handleDelete = async (id: number, nom: string) => {
    if (window.confirm(`Supprimer la copropriété "${nom}" ? Cette action est irréversible.`)) {
      deleteMutation.mutate(id)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Copropriétés</h1>
          <p className="text-gray-500 dark:text-zinc-400">
            {coproprietes?.length || 0} copropriété{(coproprietes?.length || 0) > 1 ? 's' : ''} gérée{(coproprietes?.length || 0) > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nouvelle copropriété
        </button>
      </div>

      {/* Search */}
      {coproprietes && coproprietes.length > 0 && (
        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, adresse, ville ou code postal..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
          />
        </div>
      )}

      {(!filtered || filtered.length === 0) ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12 dark:border-zinc-600">
          <Building2 className="h-12 w-12 text-gray-400 dark:text-zinc-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {search ? 'Aucun resultat' : 'Aucune copropriete'}
          </h3>
          <p className="mt-2 text-gray-500 dark:text-zinc-400">
            {search ? 'Essayez un autre terme de recherche.' : 'Commencez par creer votre premiere copropriete.'}
          </p>
          {!search && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Creer une copropriete
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered!.map((copro: CoproprieteWithStats) => (
            <div
              key={copro.id}
              className="group rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{copro.nom}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-zinc-400">
                      <MapPin className="h-3 w-3" />
                      {copro.ville} ({copro.code_postal})
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Link
                    to={`/coproprietes/${copro.id}`}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-zinc-700"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setEditingCopro(copro)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-zinc-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(copro.id, copro.nom)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-zinc-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 dark:border-zinc-700">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{copro.nombre_lots}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Lots</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{copro.nombre_coproprietaires}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Copropriétaires</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{copro.total_tantiemes}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Tantièmes</p>
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
    </div>
  )
}
