import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCopropriete, useUpdateCopropriete } from '@/hooks/useCoproprietes'
import { useLotsByCopropriete, useCreateLot, useUpdateLot, useDeleteLot } from '@/hooks/useLots'
import { usePartiesCommunesByCopropriete, useCreatePartieCommune, useUpdatePartieCommune, useDeletePartieCommune } from '@/hooks/usePartiesCommunes'
import { useClesRepartitionByCopropriete, useCreateCleRepartition, useUpdateCleRepartition, useDeleteCleRepartition } from '@/hooks/useClesRepartition'
import { useLocatairesByLot, useCreateLocataire, useUpdateLocataire, useDeleteLocataire } from '@/hooks/useLocataires'
import { useMutationsByLot, useCreateMutation, useUpdateMutation, useDeleteMutation } from '@/hooks/useMutations'
import { useDiagnosticsByCopropriete, useCreateDiagnostic, useUpdateDiagnostic, useDeleteDiagnostic } from '@/hooks/useDiagnostics'
import { useCycleAnnuel, useInitializeCycle, useRefreshCycle } from '@/hooks/useCycleAnnuel'
import type { LotWithProprietaire } from '@/api/lots'
import type { PartieCommune, CleRepartition, Locataire, Mutation, Diagnostic } from '@/types'
import { ArrowLeft, Plus, Trash2, Pencil, Home, DoorOpen, Key, UserCheck, ArrowRightLeft, ClipboardCheck, ListChecks, UserPlus } from 'lucide-react'
import { CycleAnnuelChecklist } from '@/components/coproprietes/CycleAnnuelChecklist'
import { LotFormDialog } from '@/components/coproprietes/LotFormDialog'
import { CoproprieteFormDialog } from '@/components/coproprietes/CoproprieteFormDialog'
import { PartieCommuneFormDialog } from '@/components/coproprietes/PartieCommuneFormDialog'
import { CleRepartitionFormDialog } from '@/components/coproprietes/CleRepartitionFormDialog'
import { LocataireFormDialog } from '@/components/coproprietes/LocataireFormDialog'
import { MutationFormDialog } from '@/components/coproprietes/MutationFormDialog'
import { DiagnosticFormDialog } from '@/components/coproprietes/DiagnosticFormDialog'
import { BulkCreateAccountsDialog } from '@/components/coproprietes/BulkCreateAccountsDialog'

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

const TYPE_DIAGNOSTIC_LABELS: Record<string, string> = {
  dpe: 'DPE',
  amiante: 'Amiante',
  plomb: 'Plomb',
  dtg: 'DTG',
  ppt: 'PPT',
  gaz: 'Gaz',
  electricite: 'Electricite',
  autre: 'Autre',
}

const STATUT_DIAGNOSTIC_STYLES: Record<string, string> = {
  valide: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expire: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  a_renouveler: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

const STATUT_DIAGNOSTIC_LABELS: Record<string, string> = {
  valide: 'Valide',
  expire: 'Expire',
  a_renouveler: 'A renouveler',
}

type Tab = 'lots' | 'parties-communes' | 'cles-repartition' | 'locataires' | 'mutations' | 'diagnostics' | 'cycle-annuel'

export default function CoproprieteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const coproprieteId = id ? parseInt(id) : undefined
  const { data: copropriete, isLoading: loadingCopro } = useCopropriete(coproprieteId)
  const { data: lots, isLoading: loadingLots } = useLotsByCopropriete(coproprieteId)
  const { data: partiesCommunes } = usePartiesCommunesByCopropriete(coproprieteId)
  const { data: clesRepartition } = useClesRepartitionByCopropriete(coproprieteId)
  const createLot = useCreateLot()
  const updateLot = useUpdateLot()
  const deleteLot = useDeleteLot()
  const createPC = useCreatePartieCommune()
  const updatePC = useUpdatePartieCommune()
  const deletePC = useDeletePartieCommune()
  const createCle = useCreateCleRepartition()
  const updateCle = useUpdateCleRepartition()
  const deleteCle = useDeleteCleRepartition()
  const updateCopropriete = useUpdateCopropriete()
  const createLocataire = useCreateLocataire()
  const updateLocataire = useUpdateLocataire()
  const deleteLocataire = useDeleteLocataire()
  const createMutation = useCreateMutation()
  const updateMutation = useUpdateMutation()
  const deleteMutation = useDeleteMutation()
  const { data: diagnostics } = useDiagnosticsByCopropriete(coproprieteId)
  const createDiagnostic = useCreateDiagnostic()
  const updateDiagnostic = useUpdateDiagnostic()
  const deleteDiagnostic = useDeleteDiagnostic()
  const currentYear = new Date().getFullYear()
  const { data: cycleAnnuel } = useCycleAnnuel(coproprieteId, currentYear)
  const initCycle = useInitializeCycle()
  const refreshCycleAction = useRefreshCycle()
  const [showCreateLot, setShowCreateLot] = useState(false)
  const [showEditCopro, setShowEditCopro] = useState(false)
  const [showCreatePC, setShowCreatePC] = useState(false)
  const [showCreateCle, setShowCreateCle] = useState(false)
  const [showCreateLocataire, setShowCreateLocataire] = useState(false)
  const [showCreateMutation, setShowCreateMutation] = useState(false)
  const [showCreateDiagnostic, setShowCreateDiagnostic] = useState(false)
  const [editingLot, setEditingLot] = useState<LotWithProprietaire | null>(null)
  const [editingPC, setEditingPC] = useState<PartieCommune | null>(null)
  const [editingCle, setEditingCle] = useState<CleRepartition | null>(null)
  const [editingLocataire, setEditingLocataire] = useState<Locataire | null>(null)
  const [editingMutation, setEditingMutation] = useState<Mutation | null>(null)
  const [editingDiagnostic, setEditingDiagnostic] = useState<Diagnostic | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('lots')
  const [selectedLotId, setSelectedLotId] = useState<number | undefined>()
  const [showBulkCreate, setShowBulkCreate] = useState(false)
  const userRole = useAuthStore(state => state.user?.role)

  const { data: locataires } = useLocatairesByLot(selectedLotId)
  const { data: mutations } = useMutationsByLot(selectedLotId)

  if (loadingCopro || loadingLots) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    )
  }

  if (!copropriete) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500 dark:text-stone-400">Copropriete non trouvee</p>
        <Link to="/coproprietes" className="mt-4 inline-block text-emerald-700 hover:underline">
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
    { id: 'diagnostics' as Tab, label: 'Diagnostics', icon: ClipboardCheck, count: diagnostics?.length || 0 },
    { id: 'cycle-annuel' as Tab, label: 'Cycle annuel', icon: ListChecks, count: cycleAnnuel?.filter(t => t.statut === 'completed').length || 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/coproprietes"
          className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{copropriete.nom}</h1>
          <p className="text-stone-500 dark:text-stone-400">
            {copropriete.adresse}, {copropriete.code_postal} {copropriete.ville}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(userRole === 'syndic' || userRole === 'admin') && (
            <button
              onClick={() => setShowBulkCreate(true)}
              className="flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              <UserPlus className="h-4 w-4" />
              Créer les comptes extranet
            </button>
          )}
          <button
            onClick={() => setShowEditCopro(true)}
            className="flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
          <p className="text-sm text-stone-500 dark:text-stone-400">Lots</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-white">{copropriete.nombre_lots}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
          <p className="text-sm text-stone-500 dark:text-stone-400">Coproprietaires</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-white">{copropriete.nombre_coproprietaires}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
          <p className="text-sm text-stone-500 dark:text-stone-400">Total tantiemes</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-white">{copropriete.total_tantiemes}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-stone-900 shadow dark:bg-stone-700 dark:text-white'
                : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {'count' in tab && (
              <span className="ml-1 rounded-full bg-stone-200 px-1.5 py-0.5 text-xs dark:bg-stone-600">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Lots tab */}
      {activeTab === 'lots' && (
        <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Lots</h2>
            <button
              onClick={() => setShowCreateLot(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Ajouter un lot
            </button>
          </div>

          {(!lots || lots.length === 0) ? (
            <div className="flex flex-col items-center py-12">
              <Home className="h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun lot enregistre</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">N</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Type</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Surface</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Etage</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Tantiemes</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Proprietaire</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot: LotWithProprietaire) => (
                    <tr key={lot.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                      <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{lot.numero}</td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{TYPE_LABELS[lot.type] || lot.type}</td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{lot.surface ? `${lot.surface} m2` : '—'}</td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{lot.etage !== null ? lot.etage : '—'}</td>
                      <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{lot.tantiemes}</td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                        {lot.proprietaire_nom
                          ? `${lot.proprietaire_prenom} ${lot.proprietaire_nom}`
                          : <span className="text-stone-400 italic">Non attribue</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingLot(lot)}
                            className="rounded p-1 text-stone-400 hover:text-emerald-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLot(lot.id, lot.numero)}
                            className="rounded p-1 text-stone-400 hover:text-red-600"
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
      )}

      {/* Parties Communes tab */}
      {activeTab === 'parties-communes' && (
        <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Parties communes</h2>
            <button
              onClick={() => setShowCreatePC(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>

          {(!partiesCommunes || partiesCommunes.length === 0) ? (
            <div className="flex flex-col items-center py-12">
              <DoorOpen className="h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune partie commune enregistree</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Nom</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Categorie</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Description</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {partiesCommunes.map((pc: PartieCommune) => (
                    <tr key={pc.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                      <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{pc.nom}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          pc.categorie === 'generales'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {CATEGORIE_LABELS[pc.categorie]}
                        </span>
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-stone-600 dark:text-stone-300">{pc.description || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingPC(pc)}
                            className="rounded p-1 text-stone-400 hover:text-emerald-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { if (window.confirm(`Supprimer "${pc.nom}" ?`)) deletePC.mutate(pc.id) }}
                            className="rounded p-1 text-stone-400 hover:text-red-600"
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
      )}

      {/* Cles de Repartition tab */}
      {activeTab === 'cles-repartition' && (
        <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Cles de repartition</h2>
            <button
              onClick={() => setShowCreateCle(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>

          {(!clesRepartition || clesRepartition.length === 0) ? (
            <div className="flex flex-col items-center py-12">
              <Key className="h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune cle de repartition enregistree</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Nom</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Description</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {clesRepartition.map((cle: CleRepartition) => (
                    <tr key={cle.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                      <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{cle.nom}</td>
                      <td className="max-w-xs truncate px-4 py-3 text-stone-600 dark:text-stone-300">{cle.description || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingCle(cle)}
                            className="rounded p-1 text-stone-400 hover:text-emerald-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { if (window.confirm(`Supprimer "${cle.nom}" ?`)) deleteCle.mutate(cle.id) }}
                            className="rounded p-1 text-stone-400 hover:text-red-600"
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
      )}

      {/* Locataires tab */}
      {activeTab === 'locataires' && (
        <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
          <div className="border-b border-stone-200 p-4 dark:border-stone-700">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Locataires par lot</h2>
            <div className="mt-3 flex items-center gap-3">
              <select
                value={selectedLotId || ''}
                onChange={(e) => setSelectedLotId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-white"
              >
                <option value="">Selectionner un lot...</option>
                {lots?.map((l: LotWithProprietaire) => (
                  <option key={l.id} value={l.id}>Lot {l.numero} — {TYPE_LABELS[l.type] || l.type}</option>
                ))}
              </select>
              {selectedLotId && (
                <button
                  onClick={() => setShowCreateLocataire(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </button>
              )}
            </div>
          </div>

          {!selectedLotId ? (
            <div className="flex flex-col items-center py-12">
              <UserCheck className="h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="mt-3 text-stone-500 dark:text-stone-400">Selectionnez un lot pour voir ses locataires</p>
            </div>
          ) : (!locataires || locataires.length === 0) ? (
            <div className="flex flex-col items-center py-12">
              <UserCheck className="h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun locataire pour ce lot</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Nom</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Email</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Telephone</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Entree</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Sortie</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {locataires.map((loc: Locataire) => (
                    <tr key={loc.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                      <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{loc.prenom} {loc.nom}</td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{loc.email || '—'}</td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{loc.telephone || '—'}</td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{loc.date_entree ? new Date(loc.date_entree).toLocaleDateString('fr-FR') : '—'}</td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{loc.date_sortie ? new Date(loc.date_sortie).toLocaleDateString('fr-FR') : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingLocataire(loc)}
                            className="rounded p-1 text-stone-400 hover:text-emerald-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { if (window.confirm('Supprimer ce locataire ?')) deleteLocataire.mutate(loc.id) }}
                            className="rounded p-1 text-stone-400 hover:text-red-600"
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
      )}

      {/* Mutations tab */}
      {activeTab === 'mutations' && (
        <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
          <div className="border-b border-stone-200 p-4 dark:border-stone-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Mutations par lot</h2>
              {selectedLotId && (
                <button
                  onClick={() => setShowCreateMutation(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
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
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-white"
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
              <ArrowRightLeft className="h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="mt-3 text-stone-500 dark:text-stone-400">Selectionnez un lot pour voir ses mutations</p>
            </div>
          ) : (!mutations || mutations.length === 0) ? (
            <div className="flex flex-col items-center py-12">
              <ArrowRightLeft className="h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune mutation pour ce lot</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Type</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Ancien proprietaire</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Nouveau proprietaire</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {mutations.map((m: Mutation) => (
                    <tr key={m.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                      <td className="px-4 py-3 text-stone-900 dark:text-white">{new Date(m.date_mutation).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700 dark:bg-stone-700 dark:text-stone-300">
                          {TYPE_MUTATION_LABELS[m.type] || m.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                        {m.ancien_nom ? `${m.ancien_prenom} ${m.ancien_nom}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                        {m.nouveau_nom ? `${m.nouveau_prenom} ${m.nouveau_nom}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingMutation(m)}
                            className="rounded p-1 text-stone-400 hover:text-emerald-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { if (window.confirm('Supprimer cette mutation ?')) deleteMutation.mutate(m.id) }}
                            className="rounded p-1 text-stone-400 hover:text-red-600"
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
      )}

      {/* Diagnostics tab */}
      {activeTab === 'diagnostics' && (
        <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Diagnostics techniques</h2>
            <button
              onClick={() => setShowCreateDiagnostic(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>

          {(!diagnostics || diagnostics.length === 0) ? (
            <div className="flex flex-col items-center py-12">
              <ClipboardCheck className="h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun diagnostic enregistre</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Type</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Prestataire</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Realisation</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Validite</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {diagnostics.map((diag: Diagnostic) => (
                    <tr key={diag.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                      <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">
                        {TYPE_DIAGNOSTIC_LABELS[diag.type] || diag.type}
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{diag.prestataire || '—'}</td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                        {new Date(diag.date_realisation).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                        {diag.date_validite ? new Date(diag.date_validite).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_DIAGNOSTIC_STYLES[diag.statut] || ''}`}>
                          {STATUT_DIAGNOSTIC_LABELS[diag.statut] || diag.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingDiagnostic(diag)}
                            className="rounded p-1 text-stone-400 hover:text-emerald-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { if (window.confirm('Supprimer ce diagnostic ?')) deleteDiagnostic.mutate(diag.id) }}
                            className="rounded p-1 text-stone-400 hover:text-red-600"
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
      )}

      {/* Cycle annuel tab */}
      {activeTab === 'cycle-annuel' && (
        <div className="space-y-4">
          {(!cycleAnnuel || cycleAnnuel.length === 0) ? (
            <div className="rounded-xl border border-stone-200 bg-white p-8 text-center dark:border-stone-700 dark:bg-stone-800">
              <ListChecks className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="mt-3 text-stone-500 dark:text-stone-400">
                Aucun cycle annuel initialise pour {currentYear}
              </p>
              <button
                onClick={() => initCycle.mutate({ coproprieteId: coproprieteId!, annee: currentYear })}
                disabled={initCycle.isPending}
                className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {initCycle.isPending ? 'Initialisation...' : `Initialiser le cycle ${currentYear}`}
              </button>
            </div>
          ) : (
            <CycleAnnuelChecklist
              taches={cycleAnnuel}
              onRefresh={() => refreshCycleAction.mutate({ coproprieteId: coproprieteId!, annee: currentYear })}
              isRefreshing={refreshCycleAction.isPending}
            />
          )}
        </div>
      )}

      {/* Dialogs */}
      <LotFormDialog
        open={showCreateLot || !!editingLot}
        onOpenChange={(open) => { if (!open) { setShowCreateLot(false); setEditingLot(null) } }}
        coproprieteId={coproprieteId!}
        defaultValues={editingLot || undefined}
        title={editingLot ? 'Modifier le lot' : 'Nouveau lot'}
        onSubmit={async (data) => {
          if (editingLot) {
            await updateLot.mutateAsync({ id: editingLot.id, data })
            setEditingLot(null)
          } else {
            await createLot.mutateAsync(data)
            setShowCreateLot(false)
          }
        }}
        isLoading={editingLot ? updateLot.isPending : createLot.isPending}
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
        open={showCreatePC || !!editingPC}
        onOpenChange={(open) => { if (!open) { setShowCreatePC(false); setEditingPC(null) } }}
        coproprieteId={coproprieteId!}
        defaultValues={editingPC || undefined}
        title={editingPC ? 'Modifier la partie commune' : 'Nouvelle partie commune'}
        onSubmit={async (data) => {
          if (editingPC) {
            await updatePC.mutateAsync({ id: editingPC.id, data })
            setEditingPC(null)
          } else {
            await createPC.mutateAsync(data)
            setShowCreatePC(false)
          }
        }}
        isLoading={editingPC ? updatePC.isPending : createPC.isPending}
      />
      <CleRepartitionFormDialog
        open={showCreateCle || !!editingCle}
        onOpenChange={(open) => { if (!open) { setShowCreateCle(false); setEditingCle(null) } }}
        coproprieteId={coproprieteId!}
        defaultValues={editingCle || undefined}
        title={editingCle ? 'Modifier la cle de repartition' : 'Nouvelle cle de repartition'}
        onSubmit={async (data) => {
          if (editingCle) {
            await updateCle.mutateAsync({ id: editingCle.id, data })
            setEditingCle(null)
          } else {
            await createCle.mutateAsync(data)
            setShowCreateCle(false)
          }
        }}
        isLoading={editingCle ? updateCle.isPending : createCle.isPending}
      />
      {selectedLotId && (
        <>
          <LocataireFormDialog
            open={showCreateLocataire || !!editingLocataire}
            onOpenChange={(open) => { if (!open) { setShowCreateLocataire(false); setEditingLocataire(null) } }}
            lotId={selectedLotId}
            defaultValues={editingLocataire || undefined}
            title={editingLocataire ? 'Modifier le locataire' : 'Nouveau locataire'}
            onSubmit={async (data) => {
              if (editingLocataire) {
                await updateLocataire.mutateAsync({ id: editingLocataire.id, data })
                setEditingLocataire(null)
              } else {
                await createLocataire.mutateAsync(data)
                setShowCreateLocataire(false)
              }
            }}
            isLoading={editingLocataire ? updateLocataire.isPending : createLocataire.isPending}
          />
          <MutationFormDialog
            open={showCreateMutation || !!editingMutation}
            onOpenChange={(open) => { if (!open) { setShowCreateMutation(false); setEditingMutation(null) } }}
            lotId={selectedLotId}
            defaultValues={editingMutation || undefined}
            title={editingMutation ? 'Modifier la mutation' : 'Nouvelle mutation'}
            onSubmit={async (data) => {
              if (editingMutation) {
                await updateMutation.mutateAsync({ id: editingMutation.id, data })
                setEditingMutation(null)
              } else {
                await createMutation.mutateAsync(data)
                setShowCreateMutation(false)
              }
            }}
            isLoading={editingMutation ? updateMutation.isPending : createMutation.isPending}
          />
        </>
      )}
      <DiagnosticFormDialog
        open={showCreateDiagnostic || !!editingDiagnostic}
        onOpenChange={(open) => { if (!open) { setShowCreateDiagnostic(false); setEditingDiagnostic(null) } }}
        coproprieteId={coproprieteId!}
        defaultValues={editingDiagnostic || undefined}
        title={editingDiagnostic ? 'Modifier le diagnostic' : 'Nouveau diagnostic'}
        onSubmit={async (data) => {
          if (editingDiagnostic) {
            await updateDiagnostic.mutateAsync({ id: editingDiagnostic.id, data })
            setEditingDiagnostic(null)
          } else {
            await createDiagnostic.mutateAsync(data)
            setShowCreateDiagnostic(false)
          }
        }}
        isLoading={editingDiagnostic ? updateDiagnostic.isPending : createDiagnostic.isPending}
      />
      {coproprieteId && (
        <BulkCreateAccountsDialog
          coproprieteId={coproprieteId}
          isOpen={showBulkCreate}
          onClose={() => setShowBulkCreate(false)}
        />
      )}
    </div>
  )
}
