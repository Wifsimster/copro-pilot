import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
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
import { ArrowLeft, Pencil, Home, DoorOpen, Key, UserCheck, ArrowRightLeft, ClipboardCheck, ListChecks, UserPlus } from 'lucide-react'
import { ComplianceCard } from '@/components/coproprietes/ComplianceCard'
import { CoproprieteDetailDialogs } from '@/components/coproprietes/CoproprieteDetailDialogs'
import { LotsTabPanel } from '@/components/coproprietes/LotsTabPanel'
import { PartiesCommunesTabPanel } from '@/components/coproprietes/PartiesCommunesTabPanel'
import { ClesRepartitionTabPanel } from '@/components/coproprietes/ClesRepartitionTabPanel'
import { LocatairesTabPanel } from '@/components/coproprietes/LocatairesTabPanel'
import { MutationsTabPanel } from '@/components/coproprietes/MutationsTabPanel'
import { DiagnosticsTabPanel } from '@/components/coproprietes/DiagnosticsTabPanel'
import { CycleAnnuelTabPanel } from '@/components/coproprietes/CycleAnnuelTabPanel'

type Tab = 'lots' | 'parties-communes' | 'cles-repartition' | 'locataires' | 'mutations' | 'diagnostics' | 'cycle-annuel'

type UiState = {
  showCreateLot: boolean
  showEditCopro: boolean
  showCreatePC: boolean
  showCreateCle: boolean
  showCreateLocataire: boolean
  showCreateMutation: boolean
  showCreateDiagnostic: boolean
  editingLot: LotWithProprietaire | null
  editingPC: PartieCommune | null
  editingCle: CleRepartition | null
  editingLocataire: Locataire | null
  editingMutation: Mutation | null
  editingDiagnostic: Diagnostic | null
  activeTab: Tab
  selectedLotId: number | undefined
  showBulkCreate: boolean
  deleteTarget: { type: 'lot' | 'pc' | 'cle' | 'locataire' | 'mutation' | 'diagnostic', id: number } | null
}

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
  const [ui, setUi] = useState<UiState>({
    showCreateLot: false,
    showEditCopro: false,
    showCreatePC: false,
    showCreateCle: false,
    showCreateLocataire: false,
    showCreateMutation: false,
    showCreateDiagnostic: false,
    editingLot: null,
    editingPC: null,
    editingCle: null,
    editingLocataire: null,
    editingMutation: null,
    editingDiagnostic: null,
    activeTab: 'lots',
    selectedLotId: undefined,
    showBulkCreate: false,
    deleteTarget: null,
  })
  const patchUi = (p: Partial<typeof ui>) => setUi(s => ({ ...s, ...p }))
  const { activeTab, selectedLotId } = ui
  const userRole = useAuthStore(state => state.user?.role)

  const { data: locataires } = useLocatairesByLot(selectedLotId)
  const { data: mutations } = useMutationsByLot(selectedLotId)

  if (loadingCopro || loadingLots) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="size-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    )
  }

  if (!copropriete) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500 dark:text-stone-400">Copropriété non trouvée</p>
        <Link to="/coproprietes" className="mt-4 inline-block text-emerald-700 hover:underline">
          Retour aux copropriétés
        </Link>
      </div>
    )
  }

  const handleDeleteLot = (lotId: number) => {
    patchUi({ deleteTarget: { type: 'lot', id: lotId } })
  }

  const tabs = [
    { id: 'lots' as Tab, label: 'Lots', icon: Home, count: lots?.length || 0 },
    { id: 'parties-communes' as Tab, label: 'Parties communes', icon: DoorOpen, count: partiesCommunes?.length || 0 },
    { id: 'cles-repartition' as Tab, label: 'Clés de répartition', icon: Key, count: clesRepartition?.length || 0 },
    { id: 'locataires' as Tab, label: 'Locataires', icon: UserCheck },
    { id: 'mutations' as Tab, label: 'Mutations', icon: ArrowRightLeft },
    { id: 'diagnostics' as Tab, label: 'Diagnostics', icon: ClipboardCheck, count: diagnostics?.length || 0 },
    { id: 'cycle-annuel' as Tab, label: 'Cycle annuel', icon: ListChecks, count: cycleAnnuel?.filter(t => t.statut === 'completed').length || 0 },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Copropriétés', href: '/coproprietes' },
        { label: copropriete.nom },
      ]} />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/coproprietes"
          className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{copropriete.nom}</h1>
          <p className="text-stone-500 dark:text-stone-400">
            {copropriete.adresse}, {copropriete.code_postal} {copropriete.ville}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(userRole === 'syndic' || userRole === 'admin') && (
            <button type="button"
              onClick={() => patchUi({ showBulkCreate: true })}
              className="flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              <UserPlus className="size-4" />
              Créer les comptes extranet
            </button>
          )}
          <button type="button"
            onClick={() => patchUi({ showEditCopro: true })}
            className="flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <Pencil className="size-4" />
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
          <p className="text-sm text-stone-500 dark:text-stone-400">Copropriétaires</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-white">{copropriete.nombre_coproprietaires}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
          <p className="text-sm text-stone-500 dark:text-stone-400">Total tantièmes</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-white">{copropriete.total_tantiemes}</p>
        </div>
      </div>

      {/* Compliance Card */}
      {coproprieteId && <ComplianceCard coproprieteId={coproprieteId} />}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
        {tabs.map((tab) => (
          <button type="button"
            key={tab.id}
            onClick={() => patchUi({ activeTab: tab.id })}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-stone-900 shadow dark:bg-stone-700 dark:text-white'
                : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'
            }`}
          >
            <tab.icon className="size-4" />
            {tab.label}
            {'count' in tab && (
              <span className="ml-1 rounded-full bg-stone-200 px-1.5 py-0.5 text-xs dark:bg-stone-600">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Lots tab */}
      {activeTab === 'lots' && (
        <LotsTabPanel
          lots={lots}
          onCreate={() => patchUi({ showCreateLot: true })}
          onEdit={lot => patchUi({ editingLot: lot })}
          onDelete={handleDeleteLot}
        />
      )}

      {/* Parties Communes tab */}
      {activeTab === 'parties-communes' && (
        <PartiesCommunesTabPanel
          partiesCommunes={partiesCommunes}
          onCreate={() => patchUi({ showCreatePC: true })}
          onEdit={pc => patchUi({ editingPC: pc })}
          onDelete={id => patchUi({ deleteTarget: { type: 'pc', id } })}
        />
      )}

      {/* Cles de Repartition tab */}
      {activeTab === 'cles-repartition' && (
        <ClesRepartitionTabPanel
          clesRepartition={clesRepartition}
          onCreate={() => patchUi({ showCreateCle: true })}
          onEdit={cle => patchUi({ editingCle: cle })}
          onDelete={id => patchUi({ deleteTarget: { type: 'cle', id } })}
        />
      )}

      {/* Locataires tab */}
      {activeTab === 'locataires' && (
        <LocatairesTabPanel
          lots={lots}
          locataires={locataires}
          selectedLotId={selectedLotId}
          onSelectLot={id => patchUi({ selectedLotId: id })}
          onCreate={() => patchUi({ showCreateLocataire: true })}
          onEdit={loc => patchUi({ editingLocataire: loc })}
          onDelete={id => patchUi({ deleteTarget: { type: 'locataire', id } })}
        />
      )}

      {/* Mutations tab */}
      {activeTab === 'mutations' && (
        <MutationsTabPanel
          lots={lots}
          mutations={mutations}
          selectedLotId={selectedLotId}
          onSelectLot={id => patchUi({ selectedLotId: id })}
          onCreate={() => patchUi({ showCreateMutation: true })}
          onEdit={m => patchUi({ editingMutation: m })}
          onDelete={id => patchUi({ deleteTarget: { type: 'mutation', id } })}
        />
      )}

      {/* Diagnostics tab */}
      {activeTab === 'diagnostics' && (
        <DiagnosticsTabPanel
          diagnostics={diagnostics}
          onCreate={() => patchUi({ showCreateDiagnostic: true })}
          onEdit={diag => patchUi({ editingDiagnostic: diag })}
          onDelete={id => patchUi({ deleteTarget: { type: 'diagnostic', id } })}
        />
      )}

      {/* Cycle annuel tab */}
      {activeTab === 'cycle-annuel' && (
        <CycleAnnuelTabPanel
          cycleAnnuel={cycleAnnuel}
          currentYear={currentYear}
          onInitialize={() => initCycle.mutate({ coproprieteId: coproprieteId!, annee: currentYear })}
          isInitializing={initCycle.isPending}
          onRefresh={() => refreshCycleAction.mutate({ coproprieteId: coproprieteId!, annee: currentYear })}
          isRefreshing={refreshCycleAction.isPending}
        />
      )}

      {/* Dialogs */}
      <CoproprieteDetailDialogs
        ui={ui}
        patchUi={patchUi}
        copropriete={copropriete}
        coproprieteId={coproprieteId}
        createLot={createLot}
        updateLot={updateLot}
        deleteLot={deleteLot}
        updateCopropriete={updateCopropriete}
        createPC={createPC}
        updatePC={updatePC}
        deletePC={deletePC}
        createCle={createCle}
        updateCle={updateCle}
        deleteCle={deleteCle}
        createLocataire={createLocataire}
        updateLocataire={updateLocataire}
        deleteLocataire={deleteLocataire}
        createMutation={createMutation}
        updateMutation={updateMutation}
        deleteMutation={deleteMutation}
        createDiagnostic={createDiagnostic}
        updateDiagnostic={updateDiagnostic}
        deleteDiagnostic={deleteDiagnostic}
      />
    </div>
  )
}
