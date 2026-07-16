import { comptaTresorerieService } from '../services/ComptaTresorerieService.js'
import logger from '../logger.js'

export class ComptaTresorerieController {
  /**
   * GET /api/compta-tresorerie/compte/:compteId?from=YYYY-MM-DD&to=YYYY-MM-DD
   * Cash-basis statement (recettes / dépenses / solde + breakdown) for an
   * account. For small copros dispensed from double-entry accounting.
   */
  static async getStatement(req, res) {
    try {
      const compteId = Number(req.params.compteId)
      if (!Number.isInteger(compteId) || compteId <= 0) {
        return res.status(400).json({ error: 'compteId invalide' })
      }
      const { from, to } = req.query
      const data = await comptaTresorerieService.getStatementForCompte(
        compteId,
        { from, to }
      )
      res.json({ data })
    } catch (error) {
      logger.error(
        `[ComptaTresorerieController] Error building statement: ${error.message}`
      )
      res
        .status(500)
        .json({ error: 'Impossible de calculer la trésorerie' })
    }
  }
}
