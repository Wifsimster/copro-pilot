import { useState } from 'react'
import { useCoproprietes } from '@/hooks/useCoproprietes'
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

const TYPE_COMPTE_LABELS: Record<string, string> = {
  courant: 'Courant',
  fonds_travaux: 'Fonds travaux',
  emprunt: 'Emprunt',
}

const TYPE_COMPTE_COLORS: Record<string, string> = {
  courant: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  fonds_travaux: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  emprunt: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

const TYPE_MOUVEMENT_COLORS: Record<string, string> = {
  credit: 'text-green-600 dark:text-green-400',
  debit: 'text-red-600 dark:text-red-400',
}

type Tab = 'comptes' | 'mouvements'

export default function ComptesBancairesPage() {
  const { data: coproprietes, isLoading: loadingCopros } = useCoproprietes()
  const [selectedCoproId, setSelectedCoproId] = useState<number | undefined>()
  const [activeTab, setActiveTab] = useState<Tab>('comptes')
  const [selectedCompteId, setSelectedCompteId] = useState<number | undefined>()

  const [showCompteDialog, setShowCompteDialog] = useState(false)
  const [editingCompte, setEditingCompte] = useState<CompteBancaire | null>(null)
  const [showMouvementDialog, setShowMouvementDialog] = useState(false)
  const [editingMouvement, setEditingMouvement] = useState<MouvementBancaire | null>(null)

  const { data: comptes, isLoading: loadingComptes } = useComptesBancairesByCopropriete(selectedCoproId)
  const { data: mouvements, isLoading: loadingMouvements } = useMouvementsBancairesByCompte(selectedCompteId)

  const createCompte = useCreateCompteBancaire()
  const updateCompte = useUpdateCompteBancaire()
  const deleteCompte = useDeleteCompteBancaire()
  const createMouvement = useCreateMouvementBancaire()
  const updateMouvement = useUpdateMouvementBancaire()
  const deleteMouvement = useDeleteMouvementBancaire()

  if (loadingCopros) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Comptes bancaires</h1>
          <p className="text-gray-500 dark:text-zinc-400">Gestion des comptes bancaires et mouvements</p>
        </div>
      </div>

      {/* Copropriete selector */}
      <div className="relative">
        <select
          value={selectedCoproId || ''}
          onChange={(e) => {
            const id = e.target.value ? parseInt(e.target.value) : undefined
            setSelectedCoproId(id)
            setSelectedCompteId(undefined)
          }}
          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        >
          <option value="">Selectionner une copropriete...</option>
          {coproprietes?.map((c) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12 dark:border-zinc-600">
          <Landmark className="h-12 w-12 text-gray-400 dark:text-zinc-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Selectionnez une copropriete</h3>
          <p className="mt-2 text-gray-500 dark:text-zinc-400">Choisissez une copropriete pour voir ses comptes bancaires.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-zinc-800">
            {([
              { key: 'comptes' as Tab, label: 'Comptes', icon: CreditCard },
              { key: 'mouvements' as Tab, label: 'Mouvements', icon: ArrowDownUp },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow dark:bg-zinc-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-zinc-400'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Comptes tab */}
          {activeTab === 'comptes' && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comptes bancaires</h2>
                <button
                  onClick={() => setShowCompteDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau compte
                </button>
              </div>

              {loadingComptes ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : !comptes || comptes.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <CreditCard className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
                  <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucun compte bancaire enregistre</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Banque</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">IBAN</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Type</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Solde</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Statut</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {comptes.map((compte: CompteBancaire) => (
                        <tr
                          key={compte.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30 cursor-pointer ${
                            selectedCompteId === compte.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                          onClick={() => { setSelectedCompteId(compte.id); setActiveTab('mouvements') }}
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{compte.banque}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-zinc-300 font-mono text-xs">{compte.iban}</td>
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
                              <span className="inline-flex items-center gap-1 text-gray-400">
                                <XCircle className="h-3.5 w-3.5" /> Inactif
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => { setEditingCompte(compte); setShowCompteDialog(true) }}
                                className="rounded p-1 text-gray-400 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Supprimer ce compte bancaire ?')) deleteCompte.mutate(compte.id)
                                }}
                                className="rounded p-1 text-gray-400 hover:text-red-600"
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
            <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mouvements bancaires</h2>
                  {/* Compte selector */}
                  <div className="relative">
                    <select
                      value={selectedCompteId || ''}
                      onChange={(e) => setSelectedCompteId(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="appearance-none rounded-lg border border-gray-300 bg-white px-3 py-1.5 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                    >
                      <option value="">Selectionner un compte...</option>
                      {comptes?.map((c: CompteBancaire) => (
                        <option key={c.id} value={c.id}>{c.banque} ({TYPE_COMPTE_LABELS[c.type]})</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                {selectedCompteId && (
                  <button
                    onClick={() => setShowMouvementDialog(true)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Nouveau mouvement
                  </button>
                )}
              </div>

              {!selectedCompteId ? (
                <div className="flex flex-col items-center py-12">
                  <ArrowDownUp className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
                  <p className="mt-3 text-gray-500 dark:text-zinc-400">Selectionnez un compte pour voir ses mouvements</p>
                </div>
              ) : loadingMouvements ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : !mouvements || mouvements.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <ArrowDownUp className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
                  <p className="mt-3 text-gray-500 dark:text-zinc-400">Aucun mouvement enregistre</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Date</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Libelle</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Montant</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Categorie</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Reference</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Rapproche</th>
                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mouvements.map((mouvement: MouvementBancaire) => (
                        <tr key={mouvement.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30">
                          <td className="px-4 py-3 text-gray-900 dark:text-white">
                            {new Date(mouvement.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{mouvement.libelle}</td>
                          <td className={`px-4 py-3 font-medium ${TYPE_MOUVEMENT_COLORS[mouvement.type]}`}>
                            {mouvement.type === 'credit' ? '+' : '-'}
                            {Number(mouvement.montant).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{mouvement.categorie || '\u2014'}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{mouvement.reference || '\u2014'}</td>
                          <td className="px-4 py-3">
                            {mouvement.rapproche ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-300 dark:text-zinc-600" />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setEditingMouvement(mouvement); setShowMouvementDialog(true) }}
                                className="rounded p-1 text-gray-400 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Supprimer ce mouvement ?')) deleteMouvement.mutate(mouvement.id)
                                }}
                                className="rounded p-1 text-gray-400 hover:text-red-600"
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
