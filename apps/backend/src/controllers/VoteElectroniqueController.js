import knexDatabase from '../config/knex-database.js'
import { voteElectroniqueService } from '../services/VoteElectroniqueService.js'
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

export class VoteElectroniqueController {
  static async castVote(req, res) {
    try {
      const { resolution_id, coproprietaire_id, vote, mode } = req.body
      if (!resolution_id || !vote || !mode) {
        return res
          .status(400)
          .json({
            error: 'Les champs resolution_id, vote et mode sont obligatoires',
          })
      }

      let targetCoproId = coproprietaire_id

      // If the caller is a syndic/admin, they can vote on behalf of a copro.
      // Otherwise, the caller must be a copro and vote on their own behalf.
      if (isSyndicOrAdmin(req.user)) {
        if (!targetCoproId) {
          return res
            .status(400)
            .json({
              error:
                'coproprietaire_id est obligatoire lorsque le vote est saisi par un syndic/admin',
            })
        }
      } else {
        const copro = await getCoproprietaireByUserId(req.user.id)
        if (!copro) {
          return res
            .status(403)
            .json({
              error: 'Accès réservé aux copropriétaires ou aux syndics',
            })
        }
        // Forbid voting on behalf of others
        if (
          targetCoproId &&
          Number(targetCoproId) !== Number(copro.id)
        ) {
          return res
            .status(403)
            .json({
              error: 'Vous ne pouvez voter que pour votre propre compte',
            })
        }
        targetCoproId = copro.id
      }

      const ipAddress =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        null

      const result = await voteElectroniqueService.castVote({
        resolutionId: resolution_id,
        coproprietaireId: targetCoproId,
        vote,
        mode,
        ipAddress,
      })

      res
        .status(201)
        .json({ data: result, message: 'Vote enregistré avec succès' })
    } catch (error) {
      logger.error(`[VoteElectroniqueController] Error casting vote: ${error.message}`)
      const status = error.status || 500
      res.status(status).json({
        error: status === 500 ? 'Impossible d\'enregistrer le vote' : error.message,
      })
    }
  }

  static async getTally(req, res) {
    try {
      const { id } = req.params
      const tally = await voteElectroniqueService.getTally(id)
      res.json({ data: tally })
    } catch (error) {
      logger.error(`[VoteElectroniqueController] Error getting tally: ${error.message}`)
      const status = error.status || 500
      res.status(status).json({
        error: status === 500 ? 'Impossible de récupérer le dépouillement' : error.message,
      })
    }
  }

  static async getByResolution(req, res) {
    try {
      const { id } = req.params
      const votes = await voteElectroniqueService.getByResolution(id)
      res.json({ data: votes })
    } catch (error) {
      logger.error(`[VoteElectroniqueController] Error getting votes: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer les votes' })
    }
  }

  static async getMyVotes(req, res) {
    try {
      const { agId } = req.query
      if (!agId) {
        return res.status(400).json({ error: 'Le paramètre agId est obligatoire' })
      }
      const copro = await getCoproprietaireByUserId(req.user.id)
      if (!copro) {
        return res.status(403).json({ error: 'Accès réservé aux copropriétaires' })
      }
      const votes = await voteElectroniqueService.getByCoproprietaire(
        copro.id,
        agId
      )
      res.json({ data: votes })
    } catch (error) {
      logger.error(`[VoteElectroniqueController] Error getting my votes: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer vos votes' })
    }
  }
}
