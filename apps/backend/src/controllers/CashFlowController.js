import { cashFlowService } from '../services/CashFlowService.js'
import logger from '../logger.js'

export class CashFlowController {
  static async getForecast(req, res) {
    try {
      const { coproprieteId } = req.params
      if (!coproprieteId) {
        return res.status(400).json({
          error: 'Le parametre coproprieteId est obligatoire',
        })
      }

      const forecast =
        await cashFlowService.getForecast(coproprieteId)

      res.json({ data: forecast })
    } catch (error) {
      logger.error(
        `[CashFlowController] Error: ${error.message}`
      )
      res.status(500).json({
        error:
          'Impossible de generer les previsions de tresorerie',
      })
    }
  }
}
