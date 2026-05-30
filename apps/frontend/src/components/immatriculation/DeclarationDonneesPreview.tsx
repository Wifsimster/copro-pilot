import { FileText, Building2, Landmark, Banknote, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FormSection } from '@/components/ui/form-section'
import type { DonneesDeclarees } from '@/types'

const DIAG_STATUT_COLORS: Record<string, string> = {
  valide: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expire: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  a_renouveler: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

const DIAG_STATUT_LABELS: Record<string, string> = {
  valide: 'Valide',
  expire: 'Expire',
  a_renouveler: 'A renouveler',
}

const formatCurrency = (value: number) =>
  Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

interface DeclarationDonneesPreviewProps {
  donnees: DonneesDeclarees
}

export function DeclarationDonneesPreview({ donnees }: DeclarationDonneesPreviewProps) {
  return (
    <FormSection icon={FileText} label="Donnees declarees">
      <Tabs defaultValue="identification" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="identification" className="flex items-center gap-1.5">
            <Building2 className="size-3.5" />
            Identification
          </TabsTrigger>
          <TabsTrigger value="patrimoine" className="flex items-center gap-1.5">
            <Landmark className="size-3.5" />
            Patrimoine
          </TabsTrigger>
          <TabsTrigger value="finances" className="flex items-center gap-1.5">
            <Banknote className="size-3.5" />
            Finances
          </TabsTrigger>
          <TabsTrigger value="organisation" className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            Organisation
          </TabsTrigger>
        </TabsList>

        {/* Tab: Identification + Gouvernance */}
        <TabsContent value="identification" className="mt-4 space-y-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm dark:border-stone-700 dark:bg-stone-800/50">
            <h4 className="font-medium text-stone-900 dark:text-white">Identification</h4>
            <p className="mt-1 text-stone-600 dark:text-stone-400">
              {donnees.identification.nom} - {donnees.identification.adresse}, {donnees.identification.code_postal} {donnees.identification.ville}
            </p>
            {donnees.identification.numero_immatriculation && (
              <p className="text-stone-600 dark:text-stone-400">
                N° immatriculation : {donnees.identification.numero_immatriculation}
              </p>
            )}
            <p className="text-stone-600 dark:text-stone-400">
              {donnees.identification.nombre_batiments} batiment(s), {donnees.identification.nombre_ascenseurs} ascenseur(s)
            </p>
            {donnees.identification.periode_construction && (
              <p className="text-stone-600 dark:text-stone-400">
                Periode de construction : {donnees.identification.periode_construction}
              </p>
            )}
            {donnees.identification.type_chauffage && (
              <p className="text-stone-600 dark:text-stone-400">
                Chauffage : {donnees.identification.type_chauffage}
                {donnees.identification.energie_chauffage && ` (${donnees.identification.energie_chauffage})`}
              </p>
            )}
          </div>

          {donnees.gouvernance && (
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm dark:border-stone-700 dark:bg-stone-800/50">
              <h4 className="font-medium text-stone-900 dark:text-white">Gouvernance - Syndic</h4>
              <p className="mt-1 text-stone-600 dark:text-stone-400">
                {donnees.gouvernance.syndic_nom}
              </p>
              <p className="text-stone-600 dark:text-stone-400">
                Contrat du {new Date(donnees.gouvernance.contrat_date_debut).toLocaleDateString('fr-FR')} au {new Date(donnees.gouvernance.contrat_date_fin).toLocaleDateString('fr-FR')}
              </p>
              {donnees.gouvernance.remuneration_forfait != null && (
                <p className="text-stone-600 dark:text-stone-400">
                  Remuneration forfaitaire : {formatCurrency(donnees.gouvernance.remuneration_forfait)}
                </p>
              )}
              <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                donnees.gouvernance.contrat_statut === 'en_cours'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
              }`}>
                {donnees.gouvernance.contrat_statut === 'en_cours' ? 'En cours' : donnees.gouvernance.contrat_statut}
              </span>
            </div>
          )}

          {!donnees.gouvernance && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm dark:border-orange-900/50 dark:bg-orange-900/20">
              <p className="text-orange-700 dark:text-orange-400">Aucun contrat de syndic actif</p>
            </div>
          )}
        </TabsContent>

        {/* Tab: Patrimoine (Lots + Diagnostics) */}
        <TabsContent value="patrimoine" className="mt-4 space-y-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm dark:border-stone-700 dark:bg-stone-800/50">
            <h4 className="font-medium text-stone-900 dark:text-white">Lots</h4>
            <p className="mt-1 text-stone-600 dark:text-stone-400">
              {donnees.lots.total} lot(s) - {donnees.lots.total_tantiemes} tantiemes - {donnees.lots.nombre_coproprietaires} coproprietaire(s)
            </p>
            {donnees.lots.par_type.length > 0 && (
              <p className="text-stone-500 dark:text-stone-500">
                {donnees.lots.par_type.map(t => `${t.type}: ${t.count}`).join(', ')}
              </p>
            )}
          </div>

          {donnees.diagnostics && donnees.diagnostics.length > 0 ? (
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm dark:border-stone-700 dark:bg-stone-800/50">
              <h4 className="font-medium text-stone-900 dark:text-white">Diagnostics</h4>
              <div className="mt-2 space-y-2">
                {donnees.diagnostics.map((d) => (
                  <div key={d.type} className="flex items-center justify-between">
                    <span className="text-stone-600 dark:text-stone-400 uppercase text-xs font-medium">
                      {d.type}
                    </span>
                    <div className="flex items-center gap-2">
                      {d.date_validite && (
                        <span className="text-xs text-stone-500 dark:text-stone-500">
                          Valide jusqu'au {new Date(d.date_validite).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${DIAG_STATUT_COLORS[d.statut] || 'bg-stone-100 text-stone-700'}`}>
                        {DIAG_STATUT_LABELS[d.statut] || d.statut}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm dark:border-stone-700 dark:bg-stone-800/50">
              <h4 className="font-medium text-stone-900 dark:text-white">Diagnostics</h4>
              <p className="mt-1 text-stone-500 dark:text-stone-500">Aucun diagnostic enregistre</p>
            </div>
          )}
        </TabsContent>

        {/* Tab: Finances + Procedures */}
        <TabsContent value="finances" className="mt-4 space-y-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm dark:border-stone-700 dark:bg-stone-800/50">
            <h4 className="font-medium text-stone-900 dark:text-white">Finances</h4>
            {donnees.finances.budget_montant != null ? (
              <p className="mt-1 text-stone-600 dark:text-stone-400">
                Budget {donnees.finances.budget_annee} : {formatCurrency(donnees.finances.budget_montant)} ({donnees.finances.budget_statut})
              </p>
            ) : (
              <p className="mt-1 text-stone-500 dark:text-stone-500">Aucun budget pour cette annee</p>
            )}
            <p className="text-stone-600 dark:text-stone-400">
              Appels de fonds : {donnees.finances.appels_fonds_nombre} ({formatCurrency(donnees.finances.appels_fonds_montant)})
            </p>
            {donnees.finances.fonds_travaux_solde != null && (
              <p className="text-stone-600 dark:text-stone-400">
                Fonds travaux : {formatCurrency(donnees.finances.fonds_travaux_solde)}
              </p>
            )}
            {donnees.finances.total_impayes != null && (
              <p className={donnees.finances.total_impayes > 0
                ? 'font-medium text-red-600 dark:text-red-400'
                : 'text-stone-600 dark:text-stone-400'
              }>
                Impayes : {formatCurrency(donnees.finances.total_impayes)}
              </p>
            )}
          </div>

          {donnees.procedures && (
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm dark:border-stone-700 dark:bg-stone-800/50">
              <h4 className="font-medium text-stone-900 dark:text-white">Procedures judiciaires</h4>
              {donnees.procedures.nombre_actives > 0 ? (
                <>
                  <p className="mt-1 text-stone-600 dark:text-stone-400">
                    {donnees.procedures.nombre_actives} procedure(s) active(s)
                  </p>
                  <p className="text-stone-600 dark:text-stone-400">
                    Montant total reclame : {formatCurrency(donnees.procedures.montant_total_reclame)}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-green-600 dark:text-green-400">Aucune procedure active</p>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tab: Organisation (AG + Personnel) */}
        <TabsContent value="organisation" className="mt-4 space-y-4">
          {donnees.assemblee_generale ? (
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm dark:border-stone-700 dark:bg-stone-800/50">
              <h4 className="font-medium text-stone-900 dark:text-white">Derniere assemblee generale</h4>
              <p className="mt-1 text-stone-600 dark:text-stone-400">
                {new Date(donnees.assemblee_generale.derniere_ag_date).toLocaleDateString('fr-FR')} - {donnees.assemblee_generale.derniere_ag_type === 'ordinaire' ? 'Ordinaire' : 'Extraordinaire'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm dark:border-orange-900/50 dark:bg-orange-900/20">
              <p className="text-orange-700 dark:text-orange-400">Aucune assemblee generale terminee</p>
            </div>
          )}

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm dark:border-stone-700 dark:bg-stone-800/50">
            <h4 className="font-medium text-stone-900 dark:text-white">Personnel</h4>
            {donnees.personnel.nombre_employes > 0 ? (
              <p className="mt-1 text-stone-600 dark:text-stone-400">
                {donnees.personnel.nombre_employes} employe(s) : {donnees.personnel.employes.map(e => `${e.prenom} ${e.nom} (${e.poste})`).join(', ')}
              </p>
            ) : (
              <p className="mt-1 text-stone-500 dark:text-stone-500">Aucun employe</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </FormSection>
  )
}
