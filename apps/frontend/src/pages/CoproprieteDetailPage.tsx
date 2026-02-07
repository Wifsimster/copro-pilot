import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCopropriete, useUpdateCopropriete } from '@/hooks/useCoproprietes'
import { useLotsByCopropriete, useCreateLot, useDeleteLot } from '@/hooks/useLots'
import { usePartiesCommunesByCopropriete, useCreatePartieCommune, useDeletePartieCommune } from '@/hooks/usePartiesCommunes'
import { useClesRepartitionByCopropriete, useCreateCleRepartition, useDeleteCleRepartition } from '@/hooks/useClesRepartition'
import { useLocatairesByLot, useCreateLocataire, useDeleteLocataire } from '@/hooks/useLocataires'
import { useMutationsByLot, useCreateMutation, useDeleteMutation } from '@/hooks/useMutations'
import type { LotWithProprietaire } from '@/api/lots'
import type { PartieCommune, CleRepartition, Locataire, Mutation } from '@/types'
import { ArrowLeft, Plus, Trash2, Pencil, Home, DoorOpen, Key, UserCheck, ArrowRightLeft } from 'lucide-react'
import { LotFormDialog } from '@/components/coproprietes/LotFormDialog'
import { CoproprieteFormDialog } from '@/components/coproprietes/CoproprieteFormDialog'
import { PartieCommuneFormDialog } from '@/components/coproprietes/PartieCommuneFormDialog'
import { CleRepartitionFormDialog } from '@/components/coproprietes/CleRepartitionFormDialog'
import { LocataireFormDialog } from '@/components/coproprietes/LocataireFormDialog'
import { MutationFormDialog } from '@/components/coproprietes/MutationFormDialog'

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement',
  cave: 'Cave',
  parking: 'Parking',
  commerce: 'Commerce',
  bureau: 'Bureau',
  autre: 'Autre',
}

const CATEGORIE_LABELS: Record<string, string> = {
  generales: 'Generales',
  speciales: 'Speciales',
}

const TYPE_MUTATION_LABELS: Record<string, string> = {
  vente: 'Vente',
  donation: 'Donation',
  succession: 'Succession',
  autre: 'Autre',
}

type Tab = 'lots' | 'parties-communes' | 'cles-repartition' | 'locataires' | 'mutations'

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
  const createLocataire = useCreateLocataire()
  const deleteLocataire = useDeleteLocataire()
  const createMutation = useCreateMutation()
  const deleteMutation = useDeleteMutation()
  const [showCreateLot, setShowCreateLot] = useState(false)
  const [showEditCopro, setShowEditCopro] = useState(false)
  const [showCreatePC, setShowCreatePC] = useState(false)
  const [showCreateCle, setShowCreateCle] = useState(false)
  const [showCreateLocataire, setShowCreateLocataire] = useState(false)
  const [showCreateMutation, setShowCreateMutation] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('lots')
  const [selectedLotId, setSelectedLotId] = useState<number | undefined>()

  const { data: locataires } = useLocatairesByLot(selectedLotId)
  const { data: mutations } = useMutationsByLot(selectedLotId)

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
        <p className="text-gray-500 dark:text-zinc-400">Copropriete non trouvee</p>
        <Link to="/coproprietes" className="mt-4 inline-block text-blue-600 hover:underline">
          Retour aux coproprietes
        </Link>
      </div>
    )
  }

  const handleDeleteLot = (lotId: number, numero: string) => {
    if (window.confirm(`Supprimer le lot ${numero} ?`)) {
      deleteLot.mutate(lotId)
    }
  }

  const tabs = [
    { id: 'lots' as Tab, label: 'Lots', icon: Home, count: lots?.length || 0 },
    { id: 'parties-communes' as Tab, label: 'Parties communes', icon: DoorOpen, count: partiesCommunes?.length || 0 },
    { id: 'cles-repartition' as Tab, label: 'Cles de repartition', icon: Key, count: clesRepartition?.length || 0 },
    { id: 'locataires' as Tab, label: 'Locataires', icon: UserCheck },
    { id: 'mutations' as Tab, label: 'Mutations', icon: ArrowRightLeft },
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
          <p className="text-sm text-gray-500 dark:text-zinc-400">Coproprietaires</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{copropriete.nombre_coproprietaires}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-sm text-gray-500 dark:text-zinc-400">Total tantiemes</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{copropriete.total_tantiemes}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1 dark:bg-zinc-800">
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
            {'count' in tab && (
              <span className="ml-1 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-zinc-600">{tab.count}</span>
            )}
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
              <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucun lot enregistre</p>
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
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Tantiemes</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Proprietaire</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot: LotWithProprietaire) => (
                    <tr key={lot.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{lot.numero}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{TYPE_LABELS[lot.type] || lot.type}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{lot.surface ? `${lot.surface} m2` : '—'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{lot.etage !== null ? lot.etage : '—'}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{lot.tantiemes}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                        {lot.proprietaire_nom
                          ? `${lot.proprietaire_prenom} ${lot.proprietaire_nom}`
                          : <span className="text-gray-400 italic">Non attribue</span>
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
              onClick={() => setShowCreatePC(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>

          {(!partiesCommunes || partiesCommunes.length === 0) ? (
            <div className="flex flex-col items-center py-12">
              <DoorOpen className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
              <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucune partie commune enregistree</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Nom</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Categorie</th>
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
                          onClick={() => { if (window.confirm(`Supprimer "${pc.nom}" ?`)) deletePC.mutate(pc.id) }}
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

      {/* Cles de Repartition tab */}
      {activeTab === 'cles-repartition' && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cles de repartition</h2>
            <button
              onClick={() => setShowCreateCle(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>

          {(!clesRepartition || clesRepartition.length === 0) ? (
            <div className="flex flex-col items-center py-12">
              <Key className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
              <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucune cle de repartition enregistree</p>
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
                          onClick={() => { if (window.confirm(`Supprimer "${cle.nom}" ?`)) deleteCle.mutate(cle.id) }}
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

      {/* Locataires tab */}
      {activeTab === 'locataires' && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <div className="border-b border-gray-200 p-4 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Locataires par lot</h2>
            <div className="mt-3 flex items-center gap-3">
              <select
                value={selectedLotId || ''}
                onChange={(e) => setSelectedLotId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              >
                <option value="">Selectionner un lot...</option>
                {lots?.map((l: LotWithProprietaire) => (
                  <option key={l.id} value={l.id}>Lot {l.numero} — {TYPE_LABELS[l.type] || l.type}</option>
                ))}
              </select>
              {selectedLotId && (
                <button
                  onClick={() => setShowCreateLocataire(true)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </button>
              )}
            </div>
          </div>

          {!selectedLotId ? (
            <div className="flex flex-col items-center py-12">
              <UserCheck className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
              <p className="mt-3 text-gray-500 dark:text-zinc-400">Selectionnez un lot pour voir ses locataires</p>
            </div>
          ) : (!locataires || locataires.length === 0) ? (
            <div className="flex flex-col items-center py-12">
              <UserCheck className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
              <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucun locataire pour ce lot</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Nom</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Email</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Telephone</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Entree</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Sortie</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {locataires.map((loc: Locataire) => (
                    <tr key={loc.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{loc.prenom} {loc.nom}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{loc.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{loc.telephone || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{loc.date_entree ? new Date(loc.date_entree).toLocaleDateString('fr-FR') : '—'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{loc.date_sortie ? new Date(loc.date_sortie).toLocaleDateString('fr-FR') : '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { if (window.confirm('Supprimer ce locataire ?')) deleteLocataire.mutate(loc.id) }}
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

      {/* Mutations tab */}
      {activeTab === 'mutations' && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <div className="border-b border-gray-200 p-4 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mutations par lot</h2>
              {selectedLotId && (
                <button
                  onClick={() => setShowCreateMutation(true)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle mutation
                </button>
              )}
            </div>
            <div className="mt-3">
              <select
                value={selectedLotId || ''}
                onChange={(e) => setSelectedLotId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              >
                <option value="">Selectionner un lot...</option>
                {lots?.map((l: LotWithProprietaire) => (
                  <option key={l.id} value={l.id}>Lot {l.numero} — {TYPE_LABELS[l.type] || l.type}</option>
                ))}
              </select>
            </div>
          </div>

          {!selectedLotId ? (
            <div className="flex flex-col items-center py-12">
              <ArrowRightLeft className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
              <p className="mt-3 text-gray-500 dark:text-zinc-400">Selectionnez un lot pour voir ses mutations</p>
            </div>
          ) : (!mutations || mutations.length === 0) ? (
            <div className="flex flex-col items-center py-12">
              <ArrowRightLeft className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
              <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucune mutation pour ce lot</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Date</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Type</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Ancien proprietaire</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Nouveau proprietaire</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {mutations.map((m: Mutation) => (
                    <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{new Date(m.date_mutation).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-zinc-700 dark:text-zinc-300">
                          {TYPE_MUTATION_LABELS[m.type] || m.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                        {m.ancien_nom ? `${m.ancien_prenom} ${m.ancien_nom}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                        {m.nouveau_nom ? `${m.nouveau_prenom} ${m.nouveau_nom}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { if (window.confirm('Supprimer cette mutation ?')) deleteMutation.mutate(m.id) }}
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

      {/* Dialogs */}
      <LotFormDialog
        open={showCreateLot}
        onOpenChange={setShowCreateLot}
        coproprieteId={coproprieteId!}
        onSubmit={async (data) => { await createLot.mutateAsync(data); setShowCreateLot(false) }}
        isLoading={createLot.isPending}
      />
      <CoproprieteFormDialog
        open={showEditCopro}
        onOpenChange={setShowEditCopro}
        defaultValues={copropriete}
        title="Modifier la copropriete"
        onSubmit={async (data) => { await updateCopropriete.mutateAsync({ id: coproprieteId!, data }); setShowEditCopro(false) }}
        isLoading={updateCopropriete.isPending}
      />
      <PartieCommuneFormDialog
        open={showCreatePC}
        onOpenChange={setShowCreatePC}
        coproprieteId={coproprieteId!}
        onSubmit={async (data) => { await createPC.mutateAsync(data); setShowCreatePC(false) }}
        isLoading={createPC.isPending}
      />
      <CleRepartitionFormDialog
        open={showCreateCle}
        onOpenChange={setShowCreateCle}
        coproprieteId={coproprieteId!}
        onSubmit={async (data) => { await createCle.mutateAsync(data); setShowCreateCle(false) }}
        isLoading={createCle.isPending}
      />
      {selectedLotId && (
        <>
          <LocataireFormDialog
            open={showCreateLocataire}
            onOpenChange={setShowCreateLocataire}
            lotId={selectedLotId}
            onSubmit={async (data) => { await createLocataire.mutateAsync(data); setShowCreateLocataire(false) }}
            isLoading={createLocataire.isPending}
          />
          <MutationFormDialog
            open={showCreateMutation}
            onOpenChange={setShowCreateMutation}
            lotId={selectedLotId}
            onSubmit={async (data) => { await createMutation.mutateAsync(data); setShowCreateMutation(false) }}
            isLoading={createMutation.isPending}
          />
        </>
      )}
    </div>
  )
}
