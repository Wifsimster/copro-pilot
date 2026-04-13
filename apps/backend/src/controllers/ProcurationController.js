import knexDatabase from '../config/knex-database.js'
import { procurationService } from '../services/ProcurationService.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

const isSyndicOrAdmin = user => {
  const role = user?.role?.toLowerCase?.()
  return role === 'admin' || role === 'syndic'
}

const getCoproprietaireByUserId = async userId => {
  const db = getDb()
  return db('coproprietaires').where('user_id', userId).first()
}

export class ProcurationController {
  static async create(req, res) {
    try {
      const { ag_id, mandant_id, mandataire_id, signature_data, date_signature } =
        req.body
      if (!ag_id || !mandataire_id) {
        return res
          .status(400)
          .json({ error: 'Les champs ag_id et mandataire_id sont obligatoires' })
      }

      let targetMandantId = mandant_id
      if (isSyndicOrAdmin(req.user)) {
        if (!targetMandantId) {
          return res.status(400).json({
            error:
              'mandant_id est obligatoire lorsque la procuration est saisie par un syndic/admin',
          })
        }
      } else {
        const copro = await getCoproprietaireByUserId(req.user.id)
        if (!copro) {
          return res
            .status(403)
            .json({ error: 'Accès réservé aux copropriétaires' })
        }
        if (
          targetMandantId &&
          Number(targetMandantId) !== Number(copro.id)
        ) {
          return res.status(403).json({
            error:
              'Vous ne pouvez donner procuration que pour votre propre compte',
          })
        }
        targetMandantId = copro.id
      }

      const result = await procurationService.createProcuration({
        agId: ag_id,
        mandantId: targetMandantId,
        mandataireId: mandataire_id,
        signatureData: signature_data,
        dateSignature: date_signature,
      })

      res
        .status(201)
        .json({ data: result, message: 'Procuration créée avec succès' })
    } catch (error) {
      logger.error(`[ProcurationController] Error creating: ${error.message}`)
      const status = error.status || 500
      res.status(status).json({
        error:
          status === 500 ? 'Impossible de créer la procuration' : error.message,
      })
    }
  }

  static async revoke(req, res) {
    try {
      const { id } = req.params

      let coproId
      if (isSyndicOrAdmin(req.user)) {
        // Syndic/admin can revoke on behalf of the mandant: load procuration to get its mandant
        const db = getDb()
        const proc = await db('procurations').where('id', id).first()
        if (!proc) {
          return res.status(404).json({ error: 'Procuration non trouvée' })
        }
        coproId = proc.mandant_id
      } else {
        const copro = await getCoproprietaireByUserId(req.user.id)
        if (!copro) {
          return res
            .status(403)
            .json({ error: 'Accès réservé aux copropriétaires' })
        }
        coproId = copro.id
      }

      const result = await procurationService.revokeProcuration(id, coproId)
      res.json({ data: result, message: 'Procuration révoquée avec succès' })
    } catch (error) {
      logger.error(`[ProcurationController] Error revoking: ${error.message}`)
      const status = error.status || 500
      res.status(status).json({
        error:
          status === 500
            ? 'Impossible de révoquer la procuration'
            : error.message,
      })
    }
  }

  static async getByAg(req, res) {
    try {
      const { agId } = req.params
      const procurations = await procurationService.getByAg(agId)
      res.json({ data: procurations })
    } catch (error) {
      logger.error(`[ProcurationController] Error getting by AG: ${error.message}`)
      res
        .status(500)
        .json({ error: 'Impossible de récupérer les procurations' })
    }
  }

  static async getMine(req, res) {
    try {
      const { agId } = req.params
      const copro = await getCoproprietaireByUserId(req.user.id)
      if (!copro) {
        return res
          .status(403)
          .json({ error: 'Accès réservé aux copropriétaires' })
      }
      const procurations =
        await procurationService.getMyProcurationsAsMandataire(copro.id, agId)
      res.json({ data: procurations })
    } catch (error) {
      logger.error(`[ProcurationController] Error getting mine: ${error.message}`)
      res
        .status(500)
        .json({ error: 'Impossible de récupérer vos procurations' })
    }
  }
}
