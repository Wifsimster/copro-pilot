import { StatsModel } from '../models/Stats.js'
import logger from '../logger.js'

const eur = (maximumFractionDigits = 2) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits,
  })

const daysUntil = date => Math.ceil((new Date(date) - new Date()) / 86400000)

const isToday = date =>
  new Date(date).toDateString() === new Date().toDateString()

const SEVERITY_ORDER = { critique: 0, haute: 1, moyenne: 2, info: 3 }

/**
 * Build the prioritised alerts list from the raw syndic-dashboard datasets.
 * Pure function — no DB access — so it can be unit tested in isolation.
 */
export function buildAlerts(data) {
  const alerts = []

  for (const inc of data.criticalIncidents) {
    alerts.push({
      id: `incident-${inc.id}`,
      severity: inc.urgence === 'critique' ? 'critique' : 'haute',
      category: 'incident',
      title: inc.titre,
      description: `Incident ${inc.statut === 'en_cours' ? 'en cours' : 'ouvert'}`,
      link: `/travaux?copropriete=${inc.copropriete_id}`,
      copropriete_nom: inc.copropriete_nom,
    })
  }

  for (const ag of data.agsSansConvocation) {
    const d = daysUntil(ag.date)
    alerts.push({
      id: `ag-conv-${ag.id}`,
      severity: d <= 21 ? 'critique' : 'haute',
      category: 'ag',
      title: `AG ${ag.type} sans convocation`,
      description: `Dans ${d} jours${d <= 21 ? ' — delai legal depasse' : ''}`,
      link: `/assemblees/${ag.id}`,
      copropriete_nom: ag.copropriete_nom,
      date_echeance: ag.date,
    })
  }

  for (const c of data.expiringContrats) {
    const d = daysUntil(c.date_fin)
    alerts.push({
      id: `contrat-${c.id}`,
      severity: d <= 15 ? 'haute' : 'moyenne',
      category: 'contrat',
      title: `Contrat "${c.objet}" expire bientot`,
      description: `Expire dans ${d} jours`,
      link: '/contrats',
      copropriete_nom: c.copropriete_nom,
      date_echeance: c.date_fin,
    })
  }

  for (const a of data.expiringAssurances) {
    const d = daysUntil(a.date_fin)
    alerts.push({
      id: `assurance-${a.id}`,
      severity: d <= 15 ? 'haute' : 'moyenne',
      category: 'assurance',
      title: `Assurance ${a.type} expire bientot`,
      description: `${a.compagnie} — expire dans ${d} jours`,
      link: '/assurances',
      copropriete_nom: a.copropriete_nom,
      date_echeance: a.date_fin,
    })
  }

  for (const diag of data.expiringDiagnostics) {
    const d = daysUntil(diag.date_validite)
    alerts.push({
      id: `diagnostic-${diag.id}`,
      severity: d <= 15 ? 'haute' : 'moyenne',
      category: 'diagnostic',
      title: `Diagnostic ${diag.type.toUpperCase()} expire bientot`,
      description: `Expire dans ${d} jours`,
      link: `/coproprietes/${diag.copropriete_id}`,
      copropriete_nom: diag.copropriete_nom,
      date_echeance: diag.date_validite,
    })
  }

  if (Number(data.impayesCount?.count || 0) > 0) {
    alerts.push({
      id: 'impayes-overdue',
      severity: 'haute',
      category: 'impaye',
      title: `${data.impayesCount.count} appel(s) de fonds impaye(s)`,
      description: 'Charges impayees depuis plus de 30 jours',
      link: '/charges',
    })
  }

  for (const cs of data.expiringSyndicContrats) {
    const d = daysUntil(cs.date_fin)
    alerts.push({
      id: `contrat-syndic-${cs.id}`,
      severity: d <= 60 ? 'haute' : 'moyenne',
      category: 'contrat_syndic',
      title: `Contrat syndic ${cs.syndic_nom} expire bientot`,
      description: `Expire dans ${Math.ceil(d / 30)} mois — pensez a la mise en concurrence`,
      link: '/contrats-syndic',
      copropriete_nom: cs.copropriete_nom,
      date_echeance: cs.date_fin,
    })
  }

  alerts.sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  )

  return alerts
}

/**
 * Build the prioritised tasks list from the raw syndic-dashboard datasets.
 */
export function buildTasks(data) {
  const tasks = []

  for (const intv of data.upcomingInterventions) {
    tasks.push({
      id: `intervention-${intv.id}`,
      type: 'intervention',
      title: intv.description || 'Intervention planifiee',
      description: intv.statut === 'en_cours' ? 'En cours' : 'Planifiee',
      link: '/travaux',
      copropriete_nom: intv.copropriete_nom,
      date: intv.date_prevue,
      priority: isToday(intv.date_prevue) ? 'haute' : 'normale',
    })
  }

  for (const ag of data.weekAGs) {
    tasks.push({
      id: `ag-${ag.id}`,
      type: 'ag',
      title: `AG ${ag.type}${ag.heure ? ` a ${ag.heure}` : ''}`,
      description: new Date(ag.date).toLocaleDateString('fr-FR'),
      link: `/assemblees/${ag.id}`,
      copropriete_nom: ag.copropriete_nom,
      date: ag.date,
      priority: isToday(ag.date) ? 'haute' : 'normale',
    })
  }

  for (const t of data.overdueTaches) {
    tasks.push({
      id: `cycle-${t.id}`,
      type: 'cycle_annuel',
      title: t.tache_label,
      description: 'Tache en retard',
      link: `/coproprietes/${t.copropriete_id}`,
      copropriete_nom: t.copropriete_nom,
      date: t.date_echeance,
      priority: 'haute',
    })
  }

  for (const af of data.draftAppels) {
    tasks.push({
      id: `appel-${af.id}`,
      type: 'appel_fonds',
      title: `Appel de fonds T${af.trimestre} ${af.annee}`,
      description: `${eur(0).format(af.montant_total)} — brouillon`,
      link: '/charges',
      copropriete_nom: af.copropriete_nom,
      priority: 'normale',
    })
  }

  for (const r of data.pendingRelances) {
    tasks.push({
      id: `relance-${r.id}`,
      type: 'relance',
      title: `Relance ${r.type} — ${r.coproprietaire_nom} ${r.coproprietaire_prenom}`,
      description: `${eur().format(r.montant_du)} — ${r.statut}`,
      link: '/contentieux',
      copropriete_nom: r.copropriete_nom,
      date: r.date_relance,
      priority: r.type === 'contentieux' ? 'haute' : 'normale',
    })
  }

  tasks.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority === 'haute' ? -1 : 1
    }
    if (a.date && b.date) {
      return new Date(a.date) - new Date(b.date)
    }
    return 0
  })

  return tasks
}

/**
 * Build the recent-activity feed (top 10, most recent first).
 */
export function buildActivity(data) {
  const items = []

  for (const inc of data.recentIncidents) {
    items.push({
      id: `act-incident-${inc.id}`,
      type: 'incident',
      title: inc.titre,
      description: 'Incident signale',
      link: `/travaux?copropriete=${inc.copropriete_id}`,
      copropriete_nom: inc.copropriete_nom,
      date: inc.date,
    })
  }

  for (const p of data.recentPaiements) {
    items.push({
      id: `act-paiement-${p.id}`,
      type: 'paiement',
      title: `Paiement de ${p.coproprietaire_nom} ${p.coproprietaire_prenom}`,
      description: eur().format(p.montant),
      link: '/charges',
      date: p.date,
    })
  }

  for (const intv of data.recentInterventions) {
    items.push({
      id: `act-intervention-${intv.id}`,
      type: 'intervention',
      title: intv.description || 'Intervention terminee',
      description: 'Intervention realisee',
      link: '/travaux',
      copropriete_nom: intv.copropriete_nom,
      date: intv.date,
    })
  }

  for (const doc of data.recentDocuments) {
    items.push({
      id: `act-document-${doc.id}`,
      type: 'document',
      title: doc.nom,
      description: `Document ${doc.categorie}`,
      link: '/documents',
      copropriete_nom: doc.copropriete_nom,
      date: doc.date,
    })
  }

  items.sort((a, b) => new Date(b.date) - new Date(a.date))
  return items.slice(0, 10)
}

/**
 * Build the metrics object (counters, taux de recouvrement, evolutions).
 */
export function buildMetrics(data) {
  const totalAppele = data.tauxRecouvrementData.total_appele
  const totalPaye = data.tauxRecouvrementData.total_paye
  const tauxRecouvrement =
    totalAppele > 0 ? Math.round((totalPaye / totalAppele) * 10000) / 100 : 0

  const incidentsParStatutMap = {}
  for (const row of data.incidentsParStatut) {
    incidentsParStatutMap[row.statut] = Number(row.count)
  }

  return {
    coproprietes: Number(data.countCoproprietes?.count || 0),
    incidents_ouverts: Number(data.countIncidentsOuverts?.count || 0),
    incidents_critiques: Number(data.countIncidentsCritiques?.count || 0),
    impayes: Number(data.sumImpayes?.total || 0),
    prochaines_ag: Number(data.countProchainAG?.count || 0),
    contrats_expirant: Number(data.countContratsExpirant?.count || 0),
    procedures_actives: Number(data.countProceduresActives?.count || 0),
    sinistres_ouverts: Number(data.countSinistresOuverts?.count || 0),
    taux_recouvrement: tauxRecouvrement,
    impayes_evolution: data.impayesEvolution.map(row => ({
      mois: row.mois,
      impayes: parseFloat(row.impayes || 0),
    })),
    incidents_par_statut: incidentsParStatutMap,
    prochaines_echeances: data.prochainEcheances,
  }
}

class StatsService {
  async getDashboardOverview() {
    try {
      return await StatsModel.getDashboardOverview()
    } catch (error) {
      logger.error(
        `[StatsService] Error fetching dashboard stats: ${error.message}`
      )
      throw error
    }
  }

  async getSyndicDashboard(coproprieteId = null) {
    try {
      const data = await StatsModel.getSyndicDashboardData(coproprieteId)
      return {
        alerts: buildAlerts(data),
        tasks: buildTasks(data),
        metrics: buildMetrics(data),
        activity: buildActivity(data),
      }
    } catch (error) {
      logger.error(
        `[StatsService] Error fetching syndic dashboard: ${error.message}`
      )
      throw error
    }
  }
}

export const statsService = new StatsService()
