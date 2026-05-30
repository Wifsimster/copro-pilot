import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { useAssemblee, useCreateResolution, useUpdateResolution, useDeleteResolution, useSetPresence, useDeletePresence, useGenererPv } from '@/hooks/useAssemblees'
import { useConvocationsByAg, useDelaiVerification, useCreateConvocation, useUpdateConvocation, useDeleteConvocation, useGenererDestinataires, useEnvoyerConvocation } from '@/hooks/useConvocations'
import { ResolutionsTab } from '@/components/assemblees/ResolutionsTab'
import { PresencesTab } from '@/components/assemblees/PresencesTab'
import { ConvocationsTab } from '@/components/assemblees/ConvocationsTab'
import { AssembleeHeader } from '@/components/assemblees/AssembleeHeader'
import type { Resolution, PresenceAG, ConvocationAG } from '@/types'
import { Vote, Users, Mail } from 'lucide-react'

type Tab = 'resolutions' | 'presences' | 'convocations'

export default function AssembleeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const agId = id ? parseInt(id) : undefined
  const { data: ag, isLoading } = useAssemblee(agId)
  const createResolution = useCreateResolution()
  const updateResolution = useUpdateResolution()
  const deleteResolution = useDeleteResolution()
  const setPresence = useSetPresence()
  const deletePresence = useDeletePresence()
  const genererPv = useGenererPv()

  // Convocations
  const { data: convocations } = useConvocationsByAg(agId)
  const { data: delai } = useDelaiVerification(agId)
  const createConvocation = useCreateConvocation()
  const updateConvocation = useUpdateConvocation()
  const deleteConvocation = useDeleteConvocation()
  const genererDestinataires = useGenererDestinataires()
  const envoyerConvocation = useEnvoyerConvocation()

  const [ui, setUi] = useState<{
    activeTab: Tab
    showResolutionDialog: boolean
    showPresenceDialog: boolean
    showConvocationDialog: boolean
    editingResolution: Resolution | null
    editingPresence: PresenceAG | null
    editingConvocation: ConvocationAG | null
    expandedConvocation: number | null
    deleteTarget: { type: 'resolution' | 'presence' | 'convocation', id: number } | null
    showSendConfirm: number | null
  }>({
    activeTab: 'resolutions',
    showResolutionDialog: false,
    showPresenceDialog: false,
    showConvocationDialog: false,
    editingResolution: null,
    editingPresence: null,
    editingConvocation: null,
    expandedConvocation: null,
    deleteTarget: null,
    showSendConfirm: null,
  })
  const patchUi = (p: Partial<typeof ui>) => setUi(s => ({ ...s, ...p }))
  const { activeTab, showResolutionDialog, showPresenceDialog, showConvocationDialog, editingResolution, editingPresence, editingConvocation, expandedConvocation, deleteTarget, showSendConfirm } = ui

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="size-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    )
  }

  if (!ag) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500 dark:text-stone-400">Assemblee generale non trouvee</p>
        <Link to="/assemblees" className="mt-4 inline-block text-emerald-700 hover:underline">
          Retour aux assemblees
        </Link>
      </div>
    )
  }

  const nextNumero = (ag.resolutions?.length || 0) + 1

  const handleSetResultat = async (resId: number, resultat: string) => {
    await updateResolution.mutateAsync({ id: resId, data: { resultat } as Partial<Resolution> })
  }

  const presenceStats = ag.presences ? {
    presents: ag.presences.filter((p) => p.statut === 'present').length,
    representes: ag.presences.filter((p) => p.statut === 'represente').length,
    absents: ag.presences.filter((p) => p.statut === 'absent').length,
    totalTantiemes: ag.presences.reduce((s, p) => s + (p.statut !== 'absent' ? p.tantiemes : 0), 0),
  } : null

  const handleEnvoyer = async (convocId: number) => {
    if (!delai?.valide) {
      patchUi({ showSendConfirm: convocId })
      return
    }
    await envoyerConvocation.mutateAsync(convocId)
  }

  const agLabel = `AG du ${new Date(ag.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Assemblées', href: '/assemblees' },
        { label: agLabel },
      ]} />

      <AssembleeHeader
        ag={ag}
        agId={agId}
        agLabel={agLabel}
        delai={delai}
        presenceStats={presenceStats}
        genererPvIsPending={genererPv.isPending}
        onGenererPv={() => agId && genererPv.mutate(agId)}
      />

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
        <button type="button"
          onClick={() => patchUi({ activeTab: 'resolutions' })}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'resolutions'
              ? 'bg-white text-stone-900 shadow dark:bg-stone-700 dark:text-white'
              : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'
          }`}
        >
          <Vote className="size-4" />
          Resolutions
        </button>
        <button type="button"
          onClick={() => patchUi({ activeTab: 'presences' })}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'presences'
              ? 'bg-white text-stone-900 shadow dark:bg-stone-700 dark:text-white'
              : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'
          }`}
        >
          <Users className="size-4" />
          Presences
        </button>
        <button type="button"
          onClick={() => patchUi({ activeTab: 'convocations' })}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'convocations'
              ? 'bg-white text-stone-900 shadow dark:bg-stone-700 dark:text-white'
              : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'
          }`}
        >
          <Mail className="size-4" />
          Convocations
          {convocations && convocations.length > 0 && (
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {convocations.length}
            </span>
          )}
        </button>
      </div>

      {/* Resolutions tab */}
      {activeTab === 'resolutions' && (
        <ResolutionsTab
          agId={agId}
          resolutions={ag.resolutions}
          nextNumero={nextNumero}
          showResolutionDialog={showResolutionDialog}
          editingResolution={editingResolution}
          createIsPending={createResolution.isPending}
          updateIsPending={updateResolution.isPending}
          onShowDialog={() => patchUi({ showResolutionDialog: true })}
          onEdit={res => patchUi({ editingResolution: res })}
          onDeleteTarget={resId => patchUi({ deleteTarget: { type: 'resolution', id: resId } })}
          onSetResultat={handleSetResultat}
          onDialogOpenChange={open => { patchUi({ showResolutionDialog: open }); if (!open) patchUi({ editingResolution: null }) }}
          onSubmit={async data => {
            if (editingResolution) {
              await updateResolution.mutateAsync({ id: editingResolution.id, data })
            } else {
              await createResolution.mutateAsync(data)
            }
            patchUi({ showResolutionDialog: false })
            patchUi({ editingResolution: null })
          }}
        />
      )}

      {/* Presences tab */}
      {activeTab === 'presences' && (
        <PresencesTab
          agId={agId}
          presences={ag.presences}
          showPresenceDialog={showPresenceDialog}
          editingPresence={editingPresence}
          setPresenceIsPending={setPresence.isPending}
          onShowDialog={() => patchUi({ showPresenceDialog: true })}
          onEdit={p => patchUi({ editingPresence: p })}
          onDeleteTarget={pId => patchUi({ deleteTarget: { type: 'presence', id: pId } })}
          onDialogOpenChange={open => { patchUi({ showPresenceDialog: open }); if (!open) patchUi({ editingPresence: null }) }}
          onSubmit={async data => {
            await setPresence.mutateAsync(data)
            patchUi({ showPresenceDialog: false })
            patchUi({ editingPresence: null })
          }}
        />
      )}

      {/* Convocations tab */}
      {activeTab === 'convocations' && (
        <ConvocationsTab
          agId={agId}
          convocations={convocations}
          expandedConvocation={expandedConvocation}
          showConvocationDialog={showConvocationDialog}
          editingConvocation={editingConvocation}
          genererDestinatairesIsPending={genererDestinataires.isPending}
          envoyerConvocationIsPending={envoyerConvocation.isPending}
          createIsPending={createConvocation.isPending}
          updateIsPending={updateConvocation.isPending}
          onShowDialog={() => patchUi({ showConvocationDialog: true })}
          onGenererDestinataires={convocId => genererDestinataires.mutate(convocId)}
          onEnvoyer={handleEnvoyer}
          onToggleExpand={convocId => patchUi({ expandedConvocation: expandedConvocation === convocId ? null : convocId })}
          onEdit={convoc => patchUi({ editingConvocation: convoc })}
          onDeleteTarget={convocId => patchUi({ deleteTarget: { type: 'convocation', id: convocId } })}
          onDialogOpenChange={open => { patchUi({ showConvocationDialog: open }); if (!open) patchUi({ editingConvocation: null }) }}
          onSubmit={async data => {
            if (editingConvocation) {
              await updateConvocation.mutateAsync({ id: editingConvocation.id, data })
            } else {
              await createConvocation.mutateAsync(data)
            }
            patchUi({ showConvocationDialog: false })
            patchUi({ editingConvocation: null })
          }}
        />
      )}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && patchUi({ deleteTarget: null })}
        title="Confirmer la suppression"
        description="Cette action est irréversible."
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget?.type === 'resolution') deleteResolution.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'presence') deletePresence.mutate(deleteTarget.id)
          else if (deleteTarget?.type === 'convocation') deleteConvocation.mutate(deleteTarget.id)
          patchUi({ deleteTarget: null })
        }}
      />

      <ConfirmDialog
        open={showSendConfirm !== null}
        onOpenChange={(o) => !o && patchUi({ showSendConfirm: null })}
        title="Delai legal non respecte"
        description="Le delai legal de 21 jours n'est pas respecte. Envoyer quand meme ?"
        variant="default"
        onConfirm={() => {
          envoyerConvocation.mutateAsync(showSendConfirm!)
          patchUi({ showSendConfirm: null })
        }}
      />
    </div>
  )
}
