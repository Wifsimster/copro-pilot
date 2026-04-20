import { autoRelanceService } from '../services/AutoRelanceService.js'
import logger from '../logger.js'

export class AutoRelanceController {
  static async generate(req, res) {
    try {
      const { coproprieteId } = req.params
      if (!coproprieteId) {
        return res
          .status(400)
          .json({ error: 'Le parametre coproprieteId est obligatoire' })
      }

      const relances =
        await autoRelanceService.generateOverdueRelances(
          Number(coproprieteId)
        )

      res.status(201).json({
        data: relances,
        message: `${relances.length} relance(s) générée(s)`,
      })
    } catch (error) {
      logger.error(
        `[AutoRelanceController] Error generating relances: ${error.message}`
      )
      res.status(500).json({
        error: 'Impossible de generer les relances automatiques',
      })
    }
  }
}
