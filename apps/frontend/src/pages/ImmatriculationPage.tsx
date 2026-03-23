import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useCoproprietes } from '@/hooks/useCoproprietes'
import {
  useDeclarationsRegistreByCopropriete,
  useCreateDeclarationRegistre,
  useUpdateDeclarationRegistre,
  useDeleteDeclarationRegistre,
} from '@/hooks/useDeclarationsRegistre'
import { declarationsRegistreApi } from '@/api/declarations-registre'
import { DeclarationFormDialog } from '@/components/immatriculation/DeclarationFormDialog'
import type { DeclarationRegistre, DonneesDeclarees } from '@/types'
import {
  ClipboardList, Plus, Trash2, Pencil, FileSearch, Building2, CalendarDays,
  ChevronDown, ChevronRight, Shield, AlertTriangle, Scale, Stethoscope, Users2,
} from 'lucide-react'

const STATUT_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  soumis: 'Soumis',
  valide: 'Validé',
}

const STATUT_COLORS: Record<string, string> = {
  brouillon: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  soumis: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  valide: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const formatCurrency = (value: number) =>
  Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

export default function ImmatriculationPage() {
  const [searchParams] = useSearchParams()
  const { selectedCoproprieteId: selectedCoproId, setSelectedCoproprieteId } = useCoproprieteStore()

  useEffect(() => {
    const param = searchParams.get('copropriete')
    if (param) setSelectedCoproprieteId(parseInt(param))
  }, [searchParams, setSelectedCoproprieteId])

  const [showDialog, setShowDialog] = useState(false)
  const [editingDeclaration, setEditingDeclaration] = useState<DeclarationRegistre | null>(null)
  const [donneesPreparees, setDonneesPreparees] = useState<DonneesDeclarees | null>(null)
  const [isPreparating, setIsPreparating] = useState(false)
  const [complianceData, setComplianceData] = useState<DonneesDeclarees | null>(null)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const { data: coproprietes } = useCoproprietes()
  const { data: declarations, isLoading } = useDeclarationsRegistreByCopropriete(selectedCoproId)
  const createDeclaration = useCreateDeclarationRegistre()
  const updateDeclaration = useUpdateDeclarationRegistre()
  const deleteDeclaration = useDeleteDeclarationRegistre()

  const selectedCopropriete = coproprietes?.find(c => c.id === selectedCoproId)

  // Fetch compliance data for current year
  useEffect(() => {
    if (!selectedCoproId) {
      setComplianceData(null)
      return
    }
    const annee = new Date().getFullYear()
    declarationsRegistreApi.preparerDonnees(selectedCoproId, annee)
      .then(res => setComplianceData(res.data))
      .catch(() => setComplianceData(null))
  }, [selectedCoproId])

  const handlePreparer = async () => {
    if (!selectedCoproId) return
    const annee = new Date().getFullYear()
    setIsPreparating(true)
    try {
      const response = await declarationsRegistreApi.preparerDonnees(selectedCoproId, annee)
      setDonneesPreparees(response.data)
      setEditingDeclaration(null)
      setShowDialog(true)
    } catch {
      // Error handled by API layer
    } finally {
      setIsPreparating(false)
    }
  }

  const diagCounts = complianceData?.diagnostics
    ? {
        valides: complianceData.diagnostics.filter(d => d.statut === 'valide').length,
        expires: complianceData.diagnostics.filter(d => d.statut !== 'valide').length,
      }
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Immatriculation</h1>
          <p className="text-stone-500 dark:text-stone-400">Registre national des coproprietes</p>
        </div>
      </div>

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
          <ClipboardList className="h-12 w-12 text-stone-400 dark:text-stone-500" />
          <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">Aucune copropriété sélectionnée</h3>
          <p className="mt-2 text-stone-500 dark:text-stone-400">Sélectionnez une copropriété dans le menu latéral.</p>
        </div>
      ) : (
        <>
          {/* Info card */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Informations d'immatriculation</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-stone-500 dark:text-stone-400">Numéro d'immatriculation</p>
                <p className="font-medium text-stone-900 dark:text-white">
                  {selectedCopropriete?.numero_immatriculation || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-500 dark:text-stone-400">Date d'immatriculation</p>
                <p className="font-medium text-stone-900 dark:text-white">
                  {selectedCopropriete?.date_immatriculation
                    ? new Date(selectedCopropriete.date_immatriculation).toLocaleDateString('fr-FR')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-500 dark:text-stone-400">Dernière mise à jour registre</p>
                <p className="font-medium text-stone-900 dark:text-white">
                  {selectedCopropriete?.date_derniere_maj_registre
                    ? new Date(selectedCopropriete.date_derniere_maj_registre).toLocaleDateString('fr-FR')
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Compliance dashboard */}
          {complianceData && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {/* Syndic */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Syndic</span>
                </div>
                {complianceData.gouvernance ? (
                  <p className="text-sm font-medium text-stone-900 dark:text-white truncate">
                    {complianceData.gouvernance.syndic_nom}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Aucun contrat</p>
                )}
              </div>

              {/* Impayes */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Impayés</span>
                </div>
                <p className={`text-sm font-medium ${
                  (complianceData.finances.total_impayes || 0) > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-stone-900 dark:text-white'
                }`}>
                  {formatCurrency(complianceData.finances.total_impayes || 0)}
                </p>
              </div>

              {/* Diagnostics */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Diagnostics</span>
                </div>
                {diagCounts ? (
                  <p className="text-sm font-medium text-stone-900 dark:text-white">
                    <span className="text-green-600 dark:text-green-400">{diagCounts.valides}</span>
                    {' '}valide(s)
                    {diagCounts.expires > 0 && (
                      <span className="text-red-600 dark:text-red-400"> / {diagCounts.expires} expire(s)</span>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-stone-500 dark:text-stone-400">Aucun</p>
                )}
              </div>

              {/* Dernière AG */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
                <div className="flex items-center gap-2 mb-2">
                  <Users2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Dernière AG</span>
                </div>
                {complianceData.assemblee_generale ? (
                  <p className="text-sm font-medium text-stone-900 dark:text-white">
                    {new Date(complianceData.assemblee_generale.derniere_ag_date).toLocaleDateString('fr-FR')}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Aucune</p>
                )}
              </div>

              {/* Procedures */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Procédures</span>
                </div>
                {complianceData.procedures && complianceData.procedures.nombre_actives > 0 ? (
                  <p className="text-sm font-medium text-stone-900 dark:text-white">
                    {complianceData.procedures.nombre_actives} active(s)
                  </p>
                ) : (
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Aucune</p>
                )}
              </div>
            </div>
          )}

          {/* Declarations table */}
          <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
            <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Déclarations annuelles</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePreparer}
                  disabled={isPreparating}
                  className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-700"
                >
                  <FileSearch className="h-4 w-4" />
                  {isPreparating ? 'Préparation...' : 'Préparer déclaration'}
                </button>
                <button
                  onClick={() => { setDonneesPreparees(null); setEditingDeclaration(null); setShowDialog(true) }}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle déclaration
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
              </div>
            ) : !declarations || declarations.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <CalendarDays className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune déclaration enregistrée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                      <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400 w-8"></th>
                      <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Année</th>
                      <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date de déclaration</th>
                      <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                      <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Notes</th>
                      <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {declarations.map((decl: DeclarationRegistre) => (
                      <>
                        <tr
                          key={decl.id}
                          className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30 cursor-pointer"
                          onClick={() => setExpandedRow(expandedRow === decl.id ? null : decl.id)}
                        >
                          <td className="px-4 py-3 text-stone-400">
                            {decl.donnees_declarees ? (
                              expandedRow === decl.id
                                ? <ChevronDown className="h-4 w-4" />
                                : <ChevronRight className="h-4 w-4" />
                            ) : null}
                          </td>
                          <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{decl.annee}</td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {decl.date_declaration
                              ? new Date(decl.date_declaration).toLocaleDateString('fr-FR')
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_COLORS[decl.statut]}`}>
                              {STATUT_LABELS[decl.statut]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300 max-w-xs truncate">
                            {decl.notes || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => { setDonneesPreparees(null); setEditingDeclaration(decl); setShowDialog(true) }}
                                className="rounded p-1 text-stone-400 hover:text-emerald-700"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Supprimer cette déclaration ?')) deleteDeclaration.mutate(decl.id)
                                }}
                                className="rounded p-1 text-stone-400 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedRow === decl.id && decl.donnees_declarees && (
                          <tr key={`${decl.id}-detail`} className="border-b border-stone-100 dark:border-stone-700/50">
                            <td colSpan={6} className="px-4 py-3">
                              <ExpandedDonnees donnees={decl.donnees_declarees} />
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <DeclarationFormDialog
              open={showDialog}
              onOpenChange={(open) => { setShowDialog(open); if (!open) { setEditingDeclaration(null); setDonneesPreparees(null) } }}
              coproprieteId={selectedCoproId}
              defaultValues={editingDeclaration || undefined}
              title={editingDeclaration ? 'Modifier la déclaration' : 'Nouvelle déclaration'}
              donneesPreparees={donneesPreparees}
              onSubmit={async (data) => {
                if (editingDeclaration) {
                  await updateDeclaration.mutateAsync({ id: editingDeclaration.id, data })
                } else {
                  await createDeclaration.mutateAsync(data)
                }
                setShowDialog(false)
                setEditingDeclaration(null)
                setDonneesPreparees(null)
              }}
              isLoading={editingDeclaration ? updateDeclaration.isPending : createDeclaration.isPending}
            />
          </div>
        </>
      )}
    </div>
  )
}

function ExpandedDonnees({ donnees }: { donnees: DonneesDeclarees }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
      <div className="rounded-lg bg-stone-50 p-3 dark:bg-stone-800/50">
        <h5 className="font-medium text-stone-900 dark:text-white mb-1">Identification</h5>
        <p className="text-stone-600 dark:text-stone-400">{donnees.identification.nom}</p>
        <p className="text-stone-500 dark:text-stone-500">{donnees.lots.total} lots, {donnees.lots.nombre_coproprietaires} copro.</p>
        {donnees.gouvernance && (
          <p className="text-stone-500 dark:text-stone-500 mt-1">Syndic : {donnees.gouvernance.syndic_nom}</p>
        )}
      </div>
      <div className="rounded-lg bg-stone-50 p-3 dark:bg-stone-800/50">
        <h5 className="font-medium text-stone-900 dark:text-white mb-1">Finances</h5>
        {donnees.finances.budget_montant != null && (
          <p className="text-stone-600 dark:text-stone-400">Budget : {formatCurrency(donnees.finances.budget_montant)}</p>
        )}
        {donnees.finances.total_impayes != null && donnees.finances.total_impayes > 0 && (
          <p className="text-red-600 dark:text-red-400 font-medium">Impayés : {formatCurrency(donnees.finances.total_impayes)}</p>
        )}
        {donnees.finances.fonds_travaux_solde != null && (
          <p className="text-stone-500 dark:text-stone-500">Fonds travaux : {formatCurrency(donnees.finances.fonds_travaux_solde)}</p>
        )}
      </div>
      <div className="rounded-lg bg-stone-50 p-3 dark:bg-stone-800/50">
        <h5 className="font-medium text-stone-900 dark:text-white mb-1">Diagnostics & AG</h5>
        {donnees.diagnostics && donnees.diagnostics.length > 0 ? (
          <p className="text-stone-600 dark:text-stone-400">
            {donnees.diagnostics.filter(d => d.statut === 'valide').length} valide(s), {donnees.diagnostics.filter(d => d.statut !== 'valide').length} expiré(s)
          </p>
        ) : (
          <p className="text-stone-500 dark:text-stone-500">Aucun diagnostic</p>
        )}
        {donnees.assemblee_generale ? (
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Dernière AG : {new Date(donnees.assemblee_generale.derniere_ag_date).toLocaleDateString('fr-FR')}
          </p>
        ) : (
          <p className="text-stone-500 dark:text-stone-500 mt-1">Aucune AG</p>
        )}
      </div>
      <div className="rounded-lg bg-stone-50 p-3 dark:bg-stone-800/50">
        <h5 className="font-medium text-stone-900 dark:text-white mb-1">Organisation</h5>
        <p className="text-stone-600 dark:text-stone-400">{donnees.personnel.nombre_employes} employé(s)</p>
        {donnees.procedures && donnees.procedures.nombre_actives > 0 ? (
          <p className="text-stone-600 dark:text-stone-400">{donnees.procedures.nombre_actives} procédure(s)</p>
        ) : (
          <p className="text-stone-500 dark:text-stone-500">Aucune procédure</p>
        )}
      </div>
    </div>
  )
}
