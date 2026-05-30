import type { DonneesDeclarees } from '@/types'

const formatCurrency = (value: number) =>
  Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

export function ExpandedDonnees({ donnees }: { donnees: DonneesDeclarees }) {
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
          <p className="text-red-600 dark:text-red-400 font-medium">Impayes : {formatCurrency(donnees.finances.total_impayes)}</p>
        )}
        {donnees.finances.fonds_travaux_solde != null && (
          <p className="text-stone-500 dark:text-stone-500">Fonds travaux : {formatCurrency(donnees.finances.fonds_travaux_solde)}</p>
        )}
      </div>
      <div className="rounded-lg bg-stone-50 p-3 dark:bg-stone-800/50">
        <h5 className="font-medium text-stone-900 dark:text-white mb-1">Diagnostics & AG</h5>
        {donnees.diagnostics && donnees.diagnostics.length > 0 ? (
          <p className="text-stone-600 dark:text-stone-400">
            {donnees.diagnostics.filter(d => d.statut === 'valide').length} valide(s), {donnees.diagnostics.filter(d => d.statut !== 'valide').length} expire(s)
          </p>
        ) : (
          <p className="text-stone-500 dark:text-stone-500">Aucun diagnostic</p>
        )}
        {donnees.assemblee_generale ? (
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Derniere AG : {new Date(donnees.assemblee_generale.derniere_ag_date).toLocaleDateString('fr-FR')}
          </p>
        ) : (
          <p className="text-stone-500 dark:text-stone-500 mt-1">Aucune AG</p>
        )}
      </div>
      <div className="rounded-lg bg-stone-50 p-3 dark:bg-stone-800/50">
        <h5 className="font-medium text-stone-900 dark:text-white mb-1">Organisation</h5>
        <p className="text-stone-600 dark:text-stone-400">{donnees.personnel.nombre_employes} employe(s)</p>
        {donnees.procedures && donnees.procedures.nombre_actives > 0 ? (
          <p className="text-stone-600 dark:text-stone-400">{donnees.procedures.nombre_actives} procedure(s)</p>
        ) : (
          <p className="text-stone-500 dark:text-stone-500">Aucune procedure</p>
        )}
      </div>
    </div>
  )
}
