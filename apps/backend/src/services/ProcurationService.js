import knexDatabase from '../config/knex-database.js'
import { ProcurationModel } from '../models/Procuration.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

const MAX_PROCURATIONS_PAR_MANDATAIRE = 3

class ProcurationService {
  async getByAg(agId) {
    try {
      return await ProcurationModel.getByAg(agId)
    } catch (error) {
      logger.error(
        `[ProcurationService] Error getting procurations by AG: ${error.message}`
      )
      throw error
    }
  }

  async getMyProcurationsAsMandataire(coproprietaireId, agId) {
    try {
      return await ProcurationModel.getByMandataire(coproprietaireId, agId)
    } catch (error) {
      logger.error(
        `[ProcurationService] Error getting procurations as mandataire: ${error.message}`
      )
      throw error
    }
  }

  async createProcuration({
    agId,
    mandantId,
    mandataireId,
    signatureData,
    dateSignature,
  }) {
    try {
      if (!agId || !mandantId || !mandataireId) {
        const err = new Error(
          'Les champs ag_id, mandant_id et mandataire_id sont obligatoires'
        )
        err.status = 400
        throw err
      }
      if (Number(mandantId) === Number(mandataireId)) {
        const err = new Error(
          'Un copropriétaire ne peut pas se donner procuration à lui-même'
        )
        err.status = 400
        throw err
      }

      const db = getDb()

      // 1. Verify AG exists and get copropriete
      const ag = await db('assemblees_generales').where('id', agId).first()
      if (!ag) {
        const err = new Error('Assemblée générale non trouvée')
        err.status = 404
        throw err
      }

      // Verify both coproprietaires own lots in the AG's copropriete
      const [mandantLots, mandataireLots] = await Promise.all([
        db('lots')
          .where({
            copropriete_id: ag.copropriete_id,
            coproprietaire_id: mandantId,
          })
          .first(),
        db('lots')
          .where({
            copropriete_id: ag.copropriete_id,
            coproprietaire_id: mandataireId,
          })
          .first(),
      ])

      if (!mandantLots) {
        const err = new Error(
          'Le mandant n\'appartient pas à cette copropriété'
        )
        err.status = 400
        throw err
      }
      if (!mandataireLots) {
        const err = new Error(
          'Le mandataire n\'appartient pas à cette copropriété'
        )
        err.status = 400
        throw err
      }

      // 2. Verify mandant hasn't already given a procuration for this AG
      const existing = await ProcurationModel.getActiveByMandant(
        mandantId,
        agId
      )
      if (existing) {
        const err = new Error(
          'Ce copropriétaire a déjà donné procuration pour cette AG'
        )
        err.status = 409
        throw err
      }

      // 3. Verify mandataire isn't already holding 3+ procurations
      const currentCount = await ProcurationModel.countActiveForMandataire(
        mandataireId,
        agId
      )
      if (currentCount >= MAX_PROCURATIONS_PAR_MANDATAIRE) {
        const err = new Error(
          `Le mandataire a déjà atteint la limite légale de ${MAX_PROCURATIONS_PAR_MANDATAIRE} procurations`
        )
        err.status = 409
        throw err
      }

      // 4. Create procuration
      const result = await ProcurationModel.create({
        ag_id: agId,
        mandant_id: mandantId,
        mandataire_id: mandataireId,
        date_signature: dateSignature || new Date(),
        signature_data: signatureData || null,
      })

      logger.info(
        `[ProcurationService] Procuration créée: AG ${agId}, mandant ${mandantId} → mandataire ${mandataireId}`
      )
      return result
    } catch (error) {
      logger.error(
        `[ProcurationService] Error creating procuration: ${error.message}`
      )
      throw error
    }
  }

  async revokeProcuration(id, coproprietaireId) {
    try {
      const procuration = await ProcurationModel.getById(id)
      if (!procuration) {
        const err = new Error('Procuration non trouvée')
        err.status = 404
        throw err
      }
      if (Number(procuration.mandant_id) !== Number(coproprietaireId)) {
        const err = new Error(
          'Seul le mandant peut révoquer cette procuration'
        )
        err.status = 403
        throw err
      }
      if (procuration.statut !== 'active') {
        const err = new Error(
          'Cette procuration n\'est plus active et ne peut pas être révoquée'
        )
        err.status = 400
        throw err
      }
      const result = await ProcurationModel.revoke(id)
      logger.info(
        `[ProcurationService] Procuration révoquée (ID: ${id}) par copro ${coproprietaireId}`
      )
      return result
    } catch (error) {
      logger.error(
        `[ProcurationService] Error revoking procuration: ${error.message}`
      )
      throw error
    }
  }
}

export const procurationService = new ProcurationService()
