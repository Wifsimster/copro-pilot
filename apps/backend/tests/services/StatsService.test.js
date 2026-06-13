import { describe, it, expect } from 'vitest'
import {
  buildAlerts,
  buildTasks,
  buildActivity,
  buildMetrics,
} from '../../src/services/StatsService.js'

/**
 * Unit tests for the pure transform functions extracted from the former
 * monolithic stats route handler. They turn raw query datasets into the
 * dashboard's alerts / tasks / activity / metrics shapes.
 */

// Empty dataset matching the StatsModel.getSyndicDashboardData() contract.
function emptyData(overrides = {}) {
  return {
    criticalIncidents: [],
    agsSansConvocation: [],
    expiringContrats: [],
    expiringAssurances: [],
    expiringDiagnostics: [],
    impayesCount: { count: 0 },
    expiringSyndicContrats: [],
    upcomingInterventions: [],
    weekAGs: [],
    overdueTaches: [],
    draftAppels: [],
    pendingRelances: [],
    countCoproprietes: { count: 0 },
    countIncidentsOuverts: { count: 0 },
    countIncidentsCritiques: { count: 0 },
    sumImpayes: { total: 0 },
    countProchainAG: { count: 0 },
    countContratsExpirant: { count: 0 },
    countProceduresActives: { count: 0 },
    countSinistresOuverts: { count: 0 },
    recentIncidents: [],
    recentPaiements: [],
    recentInterventions: [],
    recentDocuments: [],
    tauxRecouvrementData: { total_appele: 0, total_paye: 0 },
    impayesEvolution: [],
    incidentsParStatut: [],
    prochainEcheances: [],
    ...overrides,
  }
}

const inDays = n => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

describe('buildAlerts', () => {
  it('returns an empty array for empty data', () => {
    expect(buildAlerts(emptyData())).toEqual([])
  })

  it('maps a critical incident to a critique alert', () => {
    const alerts = buildAlerts(
      emptyData({
        criticalIncidents: [
          {
            id: 7,
            titre: 'Fuite',
            urgence: 'critique',
            statut: 'ouvert',
            copropriete_id: 3,
            copropriete_nom: 'Résidence A',
          },
        ],
      })
    )
    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toMatchObject({
      id: 'incident-7',
      severity: 'critique',
      category: 'incident',
      title: 'Fuite',
      link: '/travaux?copropriete=3',
    })
  })

  it('flags an AG within 21 days as critique (legal deadline missed)', () => {
    const [alert] = buildAlerts(
      emptyData({
        agsSansConvocation: [
          { id: 1, date: inDays(10), type: 'ordinaire', copropriete_nom: 'A' },
        ],
      })
    )
    expect(alert.severity).toBe('critique')
    expect(alert.description).toContain('delai legal depasse')
  })

  it('flags an AG more than 21 days out as haute', () => {
    const [alert] = buildAlerts(
      emptyData({
        agsSansConvocation: [
          { id: 1, date: inDays(28), type: 'ordinaire', copropriete_nom: 'A' },
        ],
      })
    )
    expect(alert.severity).toBe('haute')
    expect(alert.description).not.toContain('delai legal depasse')
  })

  it('adds an impayes alert only when there are overdue calls', () => {
    expect(buildAlerts(emptyData({ impayesCount: { count: 0 } }))).toEqual([])
    const alerts = buildAlerts(emptyData({ impayesCount: { count: 4 } }))
    expect(alerts).toHaveLength(1)
    expect(alerts[0].id).toBe('impayes-overdue')
  })

  it('sorts critique alerts before haute and moyenne', () => {
    const alerts = buildAlerts(
      emptyData({
        expiringContrats: [
          {
            id: 1,
            objet: 'Ascenseur',
            date_fin: inDays(25),
            copropriete_nom: 'A',
          },
        ],
        criticalIncidents: [
          {
            id: 2,
            titre: 'X',
            urgence: 'critique',
            statut: 'ouvert',
            copropriete_id: 1,
            copropriete_nom: 'A',
          },
        ],
      })
    )
    expect(alerts.map(a => a.severity)).toEqual(['critique', 'moyenne'])
  })
})

describe('buildTasks', () => {
  it('returns an empty array for empty data', () => {
    expect(buildTasks(emptyData())).toEqual([])
  })

  it('orders haute-priority tasks before normale', () => {
    const tasks = buildTasks(
      emptyData({
        draftAppels: [
          {
            id: 1,
            trimestre: 1,
            annee: 2026,
            montant_total: 1000,
            copropriete_nom: 'A',
          },
        ],
        pendingRelances: [
          {
            id: 2,
            type: 'contentieux',
            montant_du: 500,
            date_relance: inDays(-2),
            statut: 'envoyee',
            coproprietaire_nom: 'Doe',
            coproprietaire_prenom: 'Jane',
            copropriete_nom: 'A',
          },
        ],
      })
    )
    expect(tasks[0].priority).toBe('haute')
    expect(tasks[0].type).toBe('relance')
  })
})

describe('buildActivity', () => {
  it('merges sources and keeps the 10 most recent, newest first', () => {
    const recentIncidents = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      titre: `Incident ${i}`,
      copropriete_id: 1,
      copropriete_nom: 'A',
      date: inDays(-i),
    }))
    const activity = buildActivity(emptyData({ recentIncidents }))
    expect(activity).toHaveLength(10)
    // Newest (smallest negative offset) first
    expect(activity[0].id).toBe('act-incident-0')
  })
})

describe('buildMetrics', () => {
  it('computes taux de recouvrement as a rounded percentage', () => {
    const metrics = buildMetrics(
      emptyData({
        tauxRecouvrementData: { total_appele: 1000, total_paye: 750 },
      })
    )
    expect(metrics.taux_recouvrement).toBe(75)
  })

  it('returns 0 recouvrement when nothing has been called', () => {
    const metrics = buildMetrics(
      emptyData({ tauxRecouvrementData: { total_appele: 0, total_paye: 0 } })
    )
    expect(metrics.taux_recouvrement).toBe(0)
  })

  it('folds incidents_par_statut rows into a keyed map', () => {
    const metrics = buildMetrics(
      emptyData({
        incidentsParStatut: [
          { statut: 'ouvert', count: '3' },
          { statut: 'resolu', count: '5' },
        ],
      })
    )
    expect(metrics.incidents_par_statut).toEqual({ ouvert: 3, resolu: 5 })
  })

  it('coerces counter rows to numbers', () => {
    const metrics = buildMetrics(
      emptyData({
        countCoproprietes: { count: '12' },
        sumImpayes: { total: '3400.5' },
      })
    )
    expect(metrics.coproprietes).toBe(12)
    expect(metrics.impayes).toBe(3400.5)
  })
})
