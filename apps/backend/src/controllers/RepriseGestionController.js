import {
  validateBalance,
  repriseGestionService,
} from '../services/RepriseGestionService.js'
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

  /**
   * POST /api/reprise-gestion/importer-balance
   * Persists a validated closing balance as the exercise's à-nouveaux
   * (opening position) in the accounting module.
   */
  static async importerBalance(req, res) {
    try {
      const data = await repriseGestionService.importerBalance(req.body)
      res.status(201).json({ data })
    } catch (error) {
      if (error.code === 'INVALID_BALANCE') {
        return res
          .status(400)
          .json({ error: error.message, validation: error.validation })
      }
      if (error.code === 'ALREADY_IMPORTED') {
        return res.status(409).json({ error: error.message })
      }
      logger.error(
        `[RepriseGestionController] Error importing balance: ${error.message}`
      )
      res.status(500).json({ error: "Impossible d'importer la balance" })
    }
  }
}
