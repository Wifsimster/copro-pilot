import { useState, useEffect } from 'react'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import {
  useComptesBancairesByCopropriete,
  useCreateCompteBancaire,
  useUpdateCompteBancaire,
  useDeleteCompteBancaire,
} from '@/hooks/useComptesBancaires'
import {
  useMouvementsBancairesByCompte,
  useCreateMouvementBancaire,
  useUpdateMouvementBancaire,
  useDeleteMouvementBancaire,
} from '@/hooks/useMouvementsBancaires'
import { CompteBancaireFormDialog } from '@/components/comptes-bancaires/CompteBancaireFormDialog'
import { MouvementBancaireFormDialog } from '@/components/comptes-bancaires/MouvementBancaireFormDialog'
import type { CompteBancaire, MouvementBancaire } from '@/types'
import { Landmark, Plus, Trash2, Pencil, ChevronDown, CreditCard, ArrowDownUp, CheckCircle, XCircle } from 'lucide-react'
import { ErrorAlert } from '@/components/layout/ErrorAlert'
import { TabBar } from '@/components/layout/TabBar'

const TYPE_COMPTE_LABELS: Record<string, string> = {
  courant: 'Courant',
  fonds_travaux: 'Fonds travaux',
  emprunt: 'Emprunt',
}

const TYPE_COMPTE_COLORS: Record<string, string> = {
  courant: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  fonds_travaux: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  emprunt: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

const TYPE_MOUVEMENT_COLORS: Record<string, string> = {
  credit: 'text-green-600 dark:text-green-400',
  debit: 'text-red-600 dark:text-red-400',
}

type Tab = 'comptes' | 'mouvements'

export default function ComptesBancairesPage() {
  const selectedCoproId = useCoproprieteStore((s) => s.selectedCoproprieteId)
  const [activeTab, setActiveTab] = useState<Tab>('comptes')
  const [selectedCompteId, setSelectedCompteId] = useState<number | undefined>()

  useEffect(() => {
    setSelectedCompteId(undefined)
  }, [selectedCoproId])

  const [showCompteDialog, setShowCompteDialog] = useState(false)
  const [editingCompte, setEditingCompte] = useState<CompteBancaire | null>(null)
  const [showMouvementDialog, setShowMouvementDialog] = useState(false)
  const [editingMouvement, setEditingMouvement] = useState<MouvementBancaire | null>(null)

  const { data: comptes, isLoading: loadingComptes, isError: isErrorComptes, error: errorComptes } = useComptesBancairesByCopropriete(selectedCoproId)
  const { data: mouvements, isLoading: loadingMouvements, isError: isErrorMouvements, error: errorMouvements } = useMouvementsBancairesByCompte(selectedCompteId)

  const createCompte = useCreateCompteBancaire()
  const updateCompte = useUpdateCompteBancaire()
  const deleteCompte = useDeleteCompteBancaire()
  const createMouvement = useCreateMouvementBancaire()
  const updateMouvement = useUpdateMouvementBancaire()
  const deleteMouvement = useDeleteMouvementBancaire()

  const comptesError = errorComptes || errorMouvements
  const hasComptesError = isErrorComptes || isErrorMouvements

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Comptes bancaires</h1>
          <p className="text-stone-500 dark:text-stone-400">Gestion des comptes bancaires et mouvements</p>
        </div>
      </div>

      {hasComptesError && <ErrorAlert error={comptesError as Error} message="Impossible de charger les comptes bancaires" />}

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
          <Landmark className="h-12 w-12 text-stone-400 dark:text-stone-500" />
          <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">Aucune copropriete selectionnee</h3>
          <p className="mt-2 text-stone-500 dark:text-stone-400">Selectionnez une copropriete dans le menu lateral.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <TabBar
            tabs={[
              { key: 'comptes', label: 'Comptes', icon: CreditCard },
              { key: 'mouvements', label: 'Mouvements', icon: ArrowDownUp },
            ]}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as Tab)}
          />

          {/* Comptes tab */}
          {activeTab === 'comptes' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Comptes bancaires</h2>
                <button
                  onClick={() => setShowCompteDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau compte
                </button>
              </div>

              {loadingComptes ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !comptes || comptes.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <CreditCard className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun compte bancaire enregistre</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Banque</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">IBAN</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Type</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Solde</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {comptes.map((compte: CompteBancaire) => (
                        <tr
                          key={compte.id}
                          className={`border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30 cursor-pointer ${
                            selectedCompteId === compte.id ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                          }`}
                          onClick={() => { setSelectedCompteId(compte.id); setActiveTab('mouvements') }}
                        >
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{compte.banque}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300 font-mono text-xs">{compte.iban}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COMPTE_COLORS[compte.type]}`}>
                              {TYPE_COMPTE_LABELS[compte.type]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={Number(compte.solde) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {Number(compte.solde).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {compte.actif ? (
                              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                <CheckCircle className="h-3.5 w-3.5" /> Actif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-stone-400">
                                <XCircle className="h-3.5 w-3.5" /> Inactif
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => { setEditingCompte(compte); setShowCompteDialog(true) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Supprimer ce compte bancaire ?')) deleteCompte.mutate(compte.id)
                                }}
                                className="rounded p-1 text-stone-400 hover:text-red-600"
                                aria-label="Supprimer"
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

              <CompteBancaireFormDialog
                open={showCompteDialog}
                onOpenChange={(open) => { setShowCompteDialog(open); if (!open) setEditingCompte(null) }}
                coproprieteId={selectedCoproId}
                defaultValues={editingCompte || undefined}
                title={editingCompte ? 'Modifier le compte bancaire' : 'Nouveau compte bancaire'}
                onSubmit={async (data) => {
                  if (editingCompte) {
                    await updateCompte.mutateAsync({ id: editingCompte.id, data })
                  } else {
                    await createCompte.mutateAsync(data)
                  }
                  setShowCompteDialog(false)
                  setEditingCompte(null)
                }}
                isLoading={editingCompte ? updateCompte.isPending : createCompte.isPending}
              />
            </div>
          )}

          {/* Mouvements tab */}
          {activeTab === 'mouvements' && (
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Mouvements bancaires</h2>
                  {/* Compte selector */}
                  <div className="relative">
                    <select
                      value={selectedCompteId || ''}
                      onChange={(e) => setSelectedCompteId(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="appearance-none rounded-lg border border-stone-300 bg-white px-3 py-1.5 pr-8 text-sm text-stone-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-stone-600 dark:bg-stone-700 dark:text-white"
                    >
                      <option value="">Selectionner un compte...</option>
                      {comptes?.map((c: CompteBancaire) => (
                        <option key={c.id} value={c.id}>{c.banque} ({TYPE_COMPTE_LABELS[c.type]})</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-stone-400" />
                  </div>
                </div>
                {selectedCompteId && (
                  <button
                    onClick={() => setShowMouvementDialog(true)}
                    className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                  >
                    <Plus className="h-4 w-4" />
                    Nouveau mouvement
                  </button>
                )}
              </div>

              {!selectedCompteId ? (
                <div className="flex flex-col items-center py-12">
                  <ArrowDownUp className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Selectionnez un compte pour voir ses mouvements</p>
                </div>
              ) : loadingMouvements ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
                </div>
              ) : !mouvements || mouvements.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <ArrowDownUp className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun mouvement enregistre</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Libelle</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Montant</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Categorie</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Reference</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Rapproche</th>
                        <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mouvements.map((mouvement: MouvementBancaire) => (
                        <tr key={mouvement.id} className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30">
                          <td className="px-4 py-3 text-stone-900 dark:text-white">
                            {new Date(mouvement.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{mouvement.libelle}</td>
                          <td className={`px-4 py-3 font-medium ${TYPE_MOUVEMENT_COLORS[mouvement.type]}`}>
                            {mouvement.type === 'credit' ? '+' : '-'}
                            {Number(mouvement.montant).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{mouvement.categorie || '\u2014'}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{mouvement.reference || '\u2014'}</td>
                          <td className="px-4 py-3">
                            {mouvement.rapproche ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-stone-300 dark:text-stone-600" />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setEditingMouvement(mouvement); setShowMouvementDialog(true) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                                aria-label="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Supprimer ce mouvement ?')) deleteMouvement.mutate(mouvement.id)
                                }}
                                className="rounded p-1 text-stone-400 hover:text-red-600"
                                aria-label="Supprimer"
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

              {selectedCompteId && (
                <MouvementBancaireFormDialog
                  open={showMouvementDialog}
                  onOpenChange={(open) => { setShowMouvementDialog(open); if (!open) setEditingMouvement(null) }}
                  compteId={selectedCompteId}
                  defaultValues={editingMouvement || undefined}
                  title={editingMouvement ? 'Modifier le mouvement' : 'Nouveau mouvement'}
                  onSubmit={async (data) => {
                    if (editingMouvement) {
                      await updateMouvement.mutateAsync({ id: editingMouvement.id, data })
                    } else {
                      await createMouvement.mutateAsync(data)
                    }
                    setShowMouvementDialog(false)
                    setEditingMouvement(null)
                  }}
                  isLoading={editingMouvement ? updateMouvement.isPending : createMouvement.isPending}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
