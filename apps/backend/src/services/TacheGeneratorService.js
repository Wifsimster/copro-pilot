import knexDatabase from '../config/knex-database.js'
import { TacheModel } from '../models/Tache.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

class TacheGeneratorService {
  async generateAll() {
    logger.info('[TacheGenerator] Starting auto-generation checks...')
    const results = await Promise.allSettled([
      this._checkContratsExpiring(),
      this._checkDiagnosticsExpiring(),
      this._checkAgWithoutConvocation(),
      this._checkAssurancesExpiring(),
    ])
    const created = results.reduce((sum, r) => {
      if (r.status === 'fulfilled') return sum + r.value
      return sum
    }, 0)
    logger.info(
      `[TacheGenerator] Auto-generation completed: ${created} tache(s) created`
    )
    return created
  }

  async _hasOpenTache(entiteType, entiteId) {
    const existing = await TacheModel.getByEntity(entiteType, entiteId)
    return existing.some(
      t => ['a_faire', 'en_cours'].includes(t.statut)
    )
  }

  async _checkContratsExpiring() {
    let count = 0
    try {
      const db = getDb()
      const contrats = await db('contrats')
        .select(
          'contrats.id',
          'contrats.objet',
          'contrats.date_fin',
          'contrats.copropriete_id'
        )
        .where('contrats.statut', 'actif')
        .whereNotNull('contrats.date_fin')
        .whereRaw(
          "contrats.date_fin BETWEEN NOW() AND NOW() + INTERVAL '60 days'"
        )

      for (const contrat of contrats) {
        const hasOpen = await this._hasOpenTache(
          'contrat',
          contrat.id
        )
        if (hasOpen) continue

        await TacheModel.create({
          copropriete_id: contrat.copropriete_id,
          titre: `Renouvellement contrat: ${contrat.objet}`,
          priorite: 'haute',
          date_echeance: contrat.date_fin,
          entite_type: 'contrat',
          entite_id: contrat.id,
          auto_generated: true,
        })
        count++
        logger.info(
          `[TacheGenerator] Created tache for contrat ${contrat.id}: ${contrat.objet}`
        )
      }
    } catch (error) {
      logger.error(
        `[TacheGenerator] checkContratsExpiring error: ${error.message}`
      )
    }
    return count
  }

  async _checkDiagnosticsExpiring() {
    let count = 0
    try {
      const db = getDb()
      const diagnostics = await db('diagnostics')
        .select(
          'diagnostics.id',
          'diagnostics.type',
          'diagnostics.date_validite',
          'diagnostics.copropriete_id'
        )
        .where('diagnostics.statut', 'valide')
        .whereNotNull('diagnostics.date_validite')
        .whereRaw(
          "diagnostics.date_validite BETWEEN NOW() AND NOW() + INTERVAL '90 days'"
        )

      for (const diag of diagnostics) {
        const hasOpen = await this._hasOpenTache(
          'diagnostic',
          diag.id
        )
        if (hasOpen) continue

        await TacheModel.create({
          copropriete_id: diag.copropriete_id,
          titre: `Renouvellement diagnostic: ${diag.type}`,
          priorite: 'normale',
          date_echeance: diag.date_validite,
          entite_type: 'diagnostic',
          entite_id: diag.id,
          auto_generated: true,
        })
        count++
        logger.info(
          `[TacheGenerator] Created tache for diagnostic ${diag.id}: ${diag.type}`
        )
      }
    } catch (error) {
      logger.error(
        `[TacheGenerator] checkDiagnosticsExpiring error: ${error.message}`
      )
    }
    return count
  }

  async _checkAgWithoutConvocation() {
    let count = 0
    try {
      const db = getDb()
      const ags = await db('assemblees_generales')
        .select(
          'assemblees_generales.id',
          'assemblees_generales.date',
          'assemblees_generales.copropriete_id'
        )
        .whereIn('assemblees_generales.statut', ['planifiee'])
        .whereRaw(
          "assemblees_generales.date BETWEEN NOW() AND NOW() + INTERVAL '30 days'"
        )

      for (const ag of ags) {
        const hasOpen = await this._hasOpenTache('ag', ag.id)
        if (hasOpen) continue

        const dateAg = new Date(ag.date)
        const dateEcheance = new Date(dateAg)
        dateEcheance.setDate(dateEcheance.getDate() - 21)
        const formattedDate = dateAg.toLocaleDateString('fr-FR')

        await TacheModel.create({
          copropriete_id: ag.copropriete_id,
          titre: `Preparer convocations AG du ${formattedDate}`,
          priorite: 'urgente',
          date_echeance: dateEcheance.toISOString().split('T')[0],
          entite_type: 'ag',
          entite_id: ag.id,
          auto_generated: true,
        })
        count++
        logger.info(
          `[TacheGenerator] Created tache for AG ${ag.id}: ${formattedDate}`
        )
      }
    } catch (error) {
      logger.error(
        `[TacheGenerator] checkAgWithoutConvocation error: ${error.message}`
      )
    }
    return count
  }

  async _checkAssurancesExpiring() {
    let count = 0
    try {
      const db = getDb()
      const assurances = await db('assurances')
        .select(
          'assurances.id',
          'assurances.type',
          'assurances.date_fin',
          'assurances.copropriete_id'
        )
        .where('assurances.statut', 'actif')
        .whereNotNull('assurances.date_fin')
        .whereRaw(
          "assurances.date_fin BETWEEN NOW() AND NOW() + INTERVAL '60 days'"
        )

      for (const assurance of assurances) {
        const hasOpen = await this._hasOpenTache(
          'assurance',
          assurance.id
        )
        if (hasOpen) continue

        await TacheModel.create({
          copropriete_id: assurance.copropriete_id,
          titre: `Renouvellement assurance: ${assurance.type}`,
          priorite: 'haute',
          date_echeance: assurance.date_fin,
          entite_type: 'assurance',
          entite_id: assurance.id,
          auto_generated: true,
        })
        count++
        logger.info(
          `[TacheGenerator] Created tache for assurance ${assurance.id}: ${assurance.type}`
        )
      }
    } catch (error) {
      logger.error(
        `[TacheGenerator] checkAssurancesExpiring error: ${error.message}`
      )
    }
    return count
  }
}

export const tacheGeneratorService =
  new TacheGeneratorService()
