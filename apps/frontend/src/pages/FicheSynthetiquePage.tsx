import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useFicheSynthetique } from '@/hooks/useCoproprietes'
import { NoCoproprieteSelected } from '@/components/layout/NoCoproprieteSelected'
import {
  Building2,
  Home,
  Users,
  Receipt,
  ClipboardCheck,
  AlertTriangle,
  Thermometer,
  FileText,
} from 'lucide-react'

const TYPE_LOT_LABELS: Record<string, string> = {
  appartement: 'Appartement',
  cave: 'Cave',
  parking: 'Parking',
  commerce: 'Commerce',
  bureau: 'Bureau',
  autre: 'Autre',
}

const TYPE_CHAUFFAGE_LABELS: Record<string, string> = {
  individuel: 'Individuel',
  collectif: 'Collectif',
  mixte: 'Mixte',
}

const ENERGIE_LABELS: Record<string, string> = {
  gaz: 'Gaz',
  electricite: 'Electricite',
  fioul: 'Fioul',
  bois: 'Bois',
  pompe_chaleur: 'Pompe a chaleur',
  reseau_chaleur: 'Reseau de chaleur',
  autre: 'Autre',
}

const DIAGNOSTIC_LABELS: Record<string, string> = {
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

const STATUT_BUDGET_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  vote: 'Vote',
  approuve: 'Approuve',
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-700/50 last:border-0">
      <span className="text-sm text-stone-500 dark:text-stone-400">{label}</span>
      <span className="text-sm font-medium text-stone-900 dark:text-white">{value ?? '—'}</span>
    </div>
  )
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center gap-2 border-b border-stone-200 px-5 py-4 dark:border-stone-700">
        <Icon className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
        <h2 className="text-base font-semibold text-stone-900 dark:text-white">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

export default function FicheSynthetiquePage() {
  const selectedId = useCoproprieteStore((s) => s.selectedCoproprieteId)
  const { data: fiche, isLoading: loadingFiche } = useFicheSynthetique(selectedId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Fiche synthetique</h1>
        <p className="text-stone-500 dark:text-stone-400">
          Document reglementaire (decret du 28 juin 2016)
        </p>
      </div>

      {!selectedId ? (
        <NoCoproprieteSelected />
      ) : loadingFiche ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      ) : !fiche ? (
        <div className="flex flex-col items-center py-16">
          <AlertTriangle className="h-12 w-12 text-orange-400" />
          <p className="mt-4 text-stone-500 dark:text-stone-400">Impossible de charger la fiche synthetique</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Identification */}
          <SectionCard title="Identification" icon={Building2}>
            <InfoRow label="Nom" value={fiche.identification.nom} />
            <InfoRow label="Adresse" value={`${fiche.identification.adresse}, ${fiche.identification.code_postal} ${fiche.identification.ville}`} />
            <InfoRow label="N° immatriculation" value={fiche.identification.numero_immatriculation} />
            <InfoRow label="Date de creation" value={fiche.identification.date_creation ? new Date(fiche.identification.date_creation).toLocaleDateString('fr-FR') : null} />
            <InfoRow label="Nombre de batiments" value={fiche.identification.nombre_batiments} />
            <InfoRow label="Nombre d'ascenseurs" value={fiche.identification.nombre_ascenseurs} />
            <InfoRow label="Periode de construction" value={fiche.identification.periode_construction} />
          </SectionCard>

          {/* Chauffage */}
          <SectionCard title="Chauffage" icon={Thermometer}>
            <InfoRow label="Type de chauffage" value={fiche.identification.type_chauffage ? TYPE_CHAUFFAGE_LABELS[fiche.identification.type_chauffage] || fiche.identification.type_chauffage : null} />
            <InfoRow label="Energie utilisee" value={fiche.identification.energie_chauffage ? ENERGIE_LABELS[fiche.identification.energie_chauffage] || fiche.identification.energie_chauffage : null} />
          </SectionCard>

          {/* Lots */}
          <SectionCard title="Repartition des lots" icon={Home}>
            <InfoRow label="Nombre total de lots" value={fiche.lots.total} />
            <InfoRow label="Total tantiemes" value={fiche.lots.total_tantiemes} />
            <InfoRow label="Nombre de coproprietaires" value={fiche.lots.nombre_coproprietaires} />
            {fiche.lots.par_type.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Par type</p>
                {fiche.lots.par_type.map((lt) => (
                  <div key={lt.type} className="flex justify-between py-1">
                    <span className="text-sm text-stone-600 dark:text-stone-300">{TYPE_LOT_LABELS[lt.type] || lt.type}</span>
                    <span className="text-sm font-medium text-stone-900 dark:text-white">{lt.count}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Coproprietaires */}
          <SectionCard title="Coproprietaires" icon={Users}>
            <InfoRow label="Nombre de coproprietaires" value={fiche.lots.nombre_coproprietaires} />
          </SectionCard>

          {/* Finances */}
          <SectionCard title="Donnees financieres" icon={Receipt}>
            {fiche.finances.budget_previsionnel ? (
              <>
                <InfoRow label={`Budget previsionnel ${fiche.finances.budget_previsionnel.annee}`} value={`${fiche.finances.budget_previsionnel.montant_total.toLocaleString('fr-FR')} EUR`} />
                <InfoRow label="Statut du budget" value={STATUT_BUDGET_LABELS[fiche.finances.budget_previsionnel.statut] || fiche.finances.budget_previsionnel.statut} />
              </>
            ) : (
              <p className="text-sm text-stone-500 dark:text-stone-400 py-2">Aucun budget previsionnel</p>
            )}
            <InfoRow label="Impayes" value={`${fiche.finances.impayes.toLocaleString('fr-FR')} EUR`} />
            <InfoRow label="Fonds travaux" value={`${fiche.finances.fonds_travaux.toLocaleString('fr-FR')} EUR`} />

            {fiche.finances.postes_depenses.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">Postes de depenses</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 dark:border-stone-700">
                        <th className="py-2 text-left font-medium text-stone-500 dark:text-stone-400">Poste</th>
                        <th className="py-2 text-right font-medium text-stone-500 dark:text-stone-400">Prevu</th>
                        <th className="py-2 text-right font-medium text-stone-500 dark:text-stone-400">Reel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fiche.finances.postes_depenses.map((p, i) => (
                        <tr key={i} className="border-b border-stone-100 dark:border-stone-700/50">
                          <td className="py-2 text-stone-900 dark:text-white">{p.nom}</td>
                          <td className="py-2 text-right text-stone-600 dark:text-stone-300">{p.montant_prevu.toLocaleString('fr-FR')} EUR</td>
                          <td className="py-2 text-right text-stone-600 dark:text-stone-300">{p.montant_reel ? `${p.montant_reel.toLocaleString('fr-FR')} EUR` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Diagnostics */}
          <SectionCard title="Diagnostics techniques" icon={ClipboardCheck}>
            {fiche.diagnostics.length === 0 ? (
              <p className="text-sm text-stone-500 dark:text-stone-400 py-2">Aucun diagnostic enregistre</p>
            ) : (
              <div className="space-y-2">
                {fiche.diagnostics.map((d, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-700/50 last:border-0">
                    <div>
                      <span className="text-sm font-medium text-stone-900 dark:text-white">
                        {DIAGNOSTIC_LABELS[d.type] || d.type}
                      </span>
                      <span className="ml-2 text-xs text-stone-500 dark:text-stone-400">
                        {new Date(d.date_realisation).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_DIAGNOSTIC_STYLES[d.statut] || ''}`}>
                      {STATUT_DIAGNOSTIC_LABELS[d.statut] || d.statut}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Contentieux & AG */}
          <SectionCard title="Contentieux & Assemblees" icon={AlertTriangle}>
            <InfoRow label="Incidents en cours" value={fiche.contentieux.incidents_en_cours} />
            {fiche.prochaine_ag ? (
              <>
                <InfoRow label="Prochaine AG" value={new Date(fiche.prochaine_ag.date).toLocaleDateString('fr-FR')} />
                <InfoRow label="Type" value={fiche.prochaine_ag.type === 'ordinaire' ? 'Ordinaire' : 'Extraordinaire'} />
              </>
            ) : (
              <InfoRow label="Prochaine AG" value="Aucune planifiee" />
            )}
          </SectionCard>
        </div>
      )}
    </div>
  )
}
