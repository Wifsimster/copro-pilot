import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCopropriete, useUpdateCopropriete } from '@/hooks/useCoproprietes'
import { useLotsByCopropriete, useCreateLot, useDeleteLot } from '@/hooks/useLots'
import type { LotWithProprietaire } from '@/api/lots'
import { ArrowLeft, Plus, Trash2, Pencil, Home } from 'lucide-react'
import { LotFormDialog } from '@/components/coproprietes/LotFormDialog'
import { CoproprieteFormDialog } from '@/components/coproprietes/CoproprieteFormDialog'

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement',
  cave: 'Cave',
  parking: 'Parking',
  commerce: 'Commerce',
  bureau: 'Bureau',
  autre: 'Autre',
}

export default function CoproprieteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const coproprieteId = id ? parseInt(id) : undefined
  const { data: copropriete, isLoading: loadingCopro } = useCopropriete(coproprieteId)
  const { data: lots, isLoading: loadingLots } = useLotsByCopropriete(coproprieteId)
  const createLot = useCreateLot()
  const deleteLot = useDeleteLot()
  const updateCopropriete = useUpdateCopropriete()
  const [showCreateLot, setShowCreateLot] = useState(false)
  const [showEditCopro, setShowEditCopro] = useState(false)

  if (loadingCopro || loadingLots) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!copropriete) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-zinc-400">Copropriété non trouvée</p>
        <Link to="/coproprietes" className="mt-4 inline-block text-blue-600 hover:underline">
          Retour aux copropriétés
        </Link>
      </div>
    )
  }

  const handleDeleteLot = (lotId: number, numero: string) => {
    if (window.confirm(`Supprimer le lot ${numero} ?`)) {
      deleteLot.mutate(lotId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/coproprietes"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{copropriete.nom}</h1>
          <p className="text-gray-500 dark:text-zinc-400">
            {copropriete.adresse}, {copropriete.code_postal} {copropriete.ville}
          </p>
        </div>
        <button
          onClick={() => setShowEditCopro(true)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <Pencil className="h-4 w-4" />
          Modifier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-sm text-gray-500 dark:text-zinc-400">Lots</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{copropriete.nombre_lots}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-sm text-gray-500 dark:text-zinc-400">Copropriétaires</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{copropriete.nombre_coproprietaires}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-sm text-gray-500 dark:text-zinc-400">Total tantièmes</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{copropriete.total_tantiemes}</p>
        </div>
      </div>

      {/* Lots */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lots</h2>
          <button
            onClick={() => setShowCreateLot(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Ajouter un lot
          </button>
        </div>

        {(!lots || lots.length === 0) ? (
          <div className="flex flex-col items-center py-12">
            <Home className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
            <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucun lot enregistré</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">N°</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Type</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Surface</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Étage</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Tantièmes</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Propriétaire</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400"></th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot: LotWithProprietaire) => (
                  <tr key={lot.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{lot.numero}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{TYPE_LABELS[lot.type] || lot.type}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{lot.surface ? `${lot.surface} m²` : '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{lot.etage !== null ? lot.etage : '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{lot.tantiemes}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                      {lot.proprietaire_nom
                        ? `${lot.proprietaire_prenom} ${lot.proprietaire_nom}`
                        : <span className="text-gray-400 italic">Non attribué</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteLot(lot.id, lot.numero)}
                        className="rounded p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LotFormDialog
        open={showCreateLot}
        onOpenChange={setShowCreateLot}
        coproprieteId={coproprieteId!}
        onSubmit={async (data) => {
          await createLot.mutateAsync(data)
          setShowCreateLot(false)
        }}
        isLoading={createLot.isPending}
      />

      <CoproprieteFormDialog
        open={showEditCopro}
        onOpenChange={setShowEditCopro}
        defaultValues={copropriete}
        title="Modifier la copropriété"
        onSubmit={async (data) => {
          await updateCopropriete.mutateAsync({ id: coproprieteId!, data })
          setShowEditCopro(false)
        }}
        isLoading={updateCopropriete.isPending}
      />
    </div>
  )
}
