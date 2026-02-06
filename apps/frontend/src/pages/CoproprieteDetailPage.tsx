import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCopropriete, useUpdateCopropriete } from '@/hooks/useCoproprietes'
import { useLotsByCopropriete, useCreateLot, useDeleteLot } from '@/hooks/useLots'
import { usePartiesCommunesByCopropriete, useCreatePartieCommune, useDeletePartieCommune } from '@/hooks/usePartiesCommunes'
import { useClesRepartitionByCopropriete, useCreateCleRepartition, useDeleteCleRepartition } from '@/hooks/useClesRepartition'
import type { LotWithProprietaire } from '@/api/lots'
import type { PartieCommune, CleRepartition } from '@/types'
import { ArrowLeft, Plus, Trash2, Pencil, Home, DoorOpen, Key } from 'lucide-react'
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

const CATEGORIE_LABELS: Record<string, string> = {
  generales: 'Générales',
  speciales: 'Spéciales',
}

type Tab = 'lots' | 'parties-communes' | 'cles-repartition'

export default function CoproprieteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const coproprieteId = id ? parseInt(id) : undefined
  const { data: copropriete, isLoading: loadingCopro } = useCopropriete(coproprieteId)
  const { data: lots, isLoading: loadingLots } = useLotsByCopropriete(coproprieteId)
  const { data: partiesCommunes } = usePartiesCommunesByCopropriete(coproprieteId)
  const { data: clesRepartition } = useClesRepartitionByCopropriete(coproprieteId)
  const createLot = useCreateLot()
  const deleteLot = useDeleteLot()
  const createPC = useCreatePartieCommune()
  const deletePC = useDeletePartieCommune()
  const createCle = useCreateCleRepartition()
  const deleteCle = useDeleteCleRepartition()
  const updateCopropriete = useUpdateCopropriete()
  const [showCreateLot, setShowCreateLot] = useState(false)
  const [showEditCopro, setShowEditCopro] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('lots')

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

  const handleCreatePC = async () => {
    if (!coproprieteId) return
    const nom = window.prompt('Nom de la partie commune :')
    if (!nom) return
    await createPC.mutateAsync({ copropriete_id: coproprieteId, nom, categorie: 'generales' })
  }

  const handleCreateCle = async () => {
    if (!coproprieteId) return
    const nom = window.prompt('Nom de la clé de répartition :')
    if (!nom) return
    await createCle.mutateAsync({ copropriete_id: coproprieteId, nom })
  }

  const tabs = [
    { id: 'lots' as Tab, label: 'Lots', icon: Home, count: lots?.length || 0 },
    { id: 'parties-communes' as Tab, label: 'Parties communes', icon: DoorOpen, count: partiesCommunes?.length || 0 },
    { id: 'cles-repartition' as Tab, label: 'Clés de répartition', icon: Key, count: clesRepartition?.length || 0 },
  ]

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

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow dark:bg-zinc-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-zinc-400'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span className="ml-1 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-zinc-600">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Lots tab */}
      {activeTab === 'lots' && (
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
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">N</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Type</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Surface</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Etage</th>
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
      )}

      {/* Parties Communes tab */}
      {activeTab === 'parties-communes' && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Parties communes</h2>
            <button
              onClick={handleCreatePC}
              disabled={createPC.isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>

          {(!partiesCommunes || partiesCommunes.length === 0) ? (
            <div className="flex flex-col items-center py-12">
              <DoorOpen className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
              <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucune partie commune enregistrée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Nom</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Catégorie</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Description</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {partiesCommunes.map((pc: PartieCommune) => (
                    <tr key={pc.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{pc.nom}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          pc.categorie === 'generales'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {CATEGORIE_LABELS[pc.categorie]}
                        </span>
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-gray-600 dark:text-zinc-300">{pc.description || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            if (window.confirm(`Supprimer "${pc.nom}" ?`)) deletePC.mutate(pc.id)
                          }}
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
      )}

      {/* Clés de Répartition tab */}
      {activeTab === 'cles-repartition' && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Clés de répartition</h2>
            <button
              onClick={handleCreateCle}
              disabled={createCle.isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>

          {(!clesRepartition || clesRepartition.length === 0) ? (
            <div className="flex flex-col items-center py-12">
              <Key className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
              <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucune clé de répartition enregistrée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Nom</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Description</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {clesRepartition.map((cle: CleRepartition) => (
                    <tr key={cle.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{cle.nom}</td>
                      <td className="max-w-xs truncate px-4 py-3 text-gray-600 dark:text-zinc-300">{cle.description || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            if (window.confirm(`Supprimer "${cle.nom}" ?`)) deleteCle.mutate(cle.id)
                          }}
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
      )}

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
