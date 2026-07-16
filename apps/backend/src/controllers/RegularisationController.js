import { regularisationService } from '../services/RegularisationService.js'
import logger from '../logger.js'

export class RegularisationController {
  static async getAllByCopropriete(req, res) {
    try {
      const coproprieteId = Number(req.params.coproprieteId)
      const data =
        await regularisationService.getAllByCopropriete(coproprieteId)
      res.json({ data })
    } catch (error) {
      logger.error(
        `[RegularisationController] Error listing: ${error.message}`
      )
      res
        .status(500)
        .json({ error: 'Impossible de récupérer les régularisations' })
    }
  }

  static async getById(req, res) {
    try {
      const data = await regularisationService.getById(Number(req.params.id))
      if (!data) {
        return res.status(404).json({ error: 'Régularisation introuvable' })
      }
      res.json({ data })
    } catch (error) {
      logger.error(
        `[RegularisationController] Error fetching: ${error.message}`
      )
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }

  /**
   * POST /api/regularisations — recomputes server-side from the copro's lots
   * and persists the annual-close régularisation.
   */
  static async create(req, res) {
    try {
      const data = await regularisationService.create(req.body)
      res.status(201).json({ data })
    } catch (error) {
      logger.error(
        `[RegularisationController] Error creating: ${error.message}`
      )
      // Domain errors (no lots, bad amounts) are client faults.
      const clientFault =
        /tantièmes|Aucun lot|positifs|montants/.test(error.message)
      res
        .status(clientFault ? 400 : 500)
        .json({ error: error.message })
    }
  }

  /**
   * POST /api/regularisations/:id/generer-appel — generate the complementary
   * appel de fonds (débiteurs called, créditeurs credited) and mark validée.
   */
  static async genererAppel(req, res) {
    try {
      const data = await regularisationService.genererAppel(
        Number(req.params.id)
      )
      res.status(201).json({ data })
    } catch (error) {
      logger.error(
        `[RegularisationController] Error generating appel: ${error.message}`
      )
      const clientFault = /introuvable|existe déjà/.test(error.message)
      res
        .status(clientFault ? (/introuvable/.test(error.message) ? 404 : 409) : 500)
        .json({ error: error.message })
    }
  }
}
