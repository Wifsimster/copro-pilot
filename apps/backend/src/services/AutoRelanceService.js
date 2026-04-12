import knexDatabase from '../config/knex-database.js'
import { eventDispatchService } from './EventDispatchService.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

class AutoRelanceService {
  /**
   * Generate overdue relances for a given copropriete.
   *
   * Rules:
   * - 30+ days overdue with no existing relance -> create 'amiable'
   * - 60+ days overdue with only 'amiable' relance -> create 'mise_en_demeure'
   *
   * @param {number} coproprieteId
   * @returns {Promise<Array>} created relances
   */
  async generateOverdueRelances(coproprieteId) {
    const db = getDb()
    const today = new Date().toISOString().split('T')[0]
    const createdRelances = []

    try {
      // 1. Find all appels_fonds with echeance < today and statut 'emis' (not cloture)
      const overdueAppels = await db('appels_fonds')
        .where('copropriete_id', coproprieteId)
        .where('statut', 'emis')
        .where('date_echeance', '<', today)
        .orderBy('date_echeance', 'asc')

      for (const appel of overdueAppels) {
        const daysOverdue = Math.floor(
          (new Date(today) - new Date(appel.date_echeance)) / 86400000
        )

        // 2. Get all lignes for this appel (grouped by coproprietaire)
        const lignes = await db('appels_fonds_lignes')
          .select(
            'coproprietaire_id',
            db.raw('SUM(montant) as total_du')
          )
          .where('appel_fonds_id', appel.id)
          .whereNotNull('coproprietaire_id')
          .groupBy('coproprietaire_id')

        for (const ligne of lignes) {
          if (!ligne.coproprietaire_id) continue

          // Calculate total already paid by this coproprietaire for this appel
          const [paidResult] = await db('paiements')
            .where('coproprietaire_id', ligne.coproprietaire_id)
            .where('appel_fonds_id', appel.id)
            .sum('montant as total_paye')

          const totalDu = parseFloat(ligne.total_du || 0)
          const totalPaye = parseFloat(paidResult?.total_paye || 0)
          const unpaidBalance = totalDu - totalPaye

          // Skip if fully paid
          if (unpaidBalance <= 0) continue

          // 3. Check existing relances for this coproprietaire & copropriete
          const existingRelances = await db('relances')
            .where('copropriete_id', coproprieteId)
            .where('coproprietaire_id', ligne.coproprietaire_id)
            .orderBy('created_at', 'desc')

          const hasAmiable = existingRelances.some(r => r.type === 'amiable')
          const hasMiseEnDemeure = existingRelances.some(
            r => r.type === 'mise_en_demeure'
          )

          let relanceToCreate = null

          // 4. 30+ days overdue, no relance -> create 'amiable'
          if (daysOverdue >= 30 && !hasAmiable) {
            relanceToCreate = {
              copropriete_id: coproprieteId,
              coproprietaire_id: ligne.coproprietaire_id,
              type: 'amiable',
              date_relance: today,
              montant_du: unpaidBalance,
              statut: 'envoyee',
              notes: `Relance automatique — appel de fonds T${appel.trimestre} ${appel.annee}, ${daysOverdue} jours de retard`,
            }
          }

          // 5. 60+ days overdue, only amiable exists -> create 'mise_en_demeure'
          if (daysOverdue >= 60 && hasAmiable && !hasMiseEnDemeure) {
            relanceToCreate = {
              copropriete_id: coproprieteId,
              coproprietaire_id: ligne.coproprietaire_id,
              type: 'mise_en_demeure',
              date_relance: today,
              montant_du: unpaidBalance,
              statut: 'envoyee',
              notes: `Mise en demeure automatique — appel de fonds T${appel.trimestre} ${appel.annee}, ${daysOverdue} jours de retard`,
            }
          }

          if (relanceToCreate) {
            const [created] = await db('relances')
              .insert(relanceToCreate)
              .returning('*')

            createdRelances.push(created)

            // Dispatch notification for the relance
            eventDispatchService
              .notifyRelanceSent(created)
              .catch(err =>
                logger.error(
                  `[AutoRelanceService] EventDispatch error: ${err.message}`
                )
              )
          }
        }
      }

      logger.info(
        `[AutoRelanceService] Generated ${createdRelances.length} relance(s) for copropriete ${coproprieteId}`
      )
      return createdRelances
    } catch (error) {
      logger.error(
        `[AutoRelanceService] Error generating relances for copropriete ${coproprieteId}: ${error.message}`
      )
      throw error
    }
  }
}

export const autoRelanceService = new AutoRelanceService()
