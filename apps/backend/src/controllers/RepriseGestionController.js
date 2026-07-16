import { validateBalance } from '../services/RepriseGestionService.js'
import logger from '../logger.js'

export class RepriseGestionController {
  /**
   * POST /api/reprise-gestion/valider-balance
   * Validates an imported trial balance (débit/crédit equilibrium, well-formed
   * lines, duplicate accounts) before it is applied. Read-only — does not
   * persist anything yet.
   */
  static async validerBalance(req, res) {
    try {
      const result = validateBalance(req.body.lignes)
      res.json({ data: result })
    } catch (error) {
      logger.error(
        `[RepriseGestionController] Error validating balance: ${error.message}`
      )
      res
        .status(500)
        .json({ error: 'Impossible de valider la balance' })
    }
  }
}
