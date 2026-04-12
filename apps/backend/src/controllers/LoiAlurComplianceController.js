import { loiAlurComplianceService } from '../services/LoiAlurComplianceService.js'
import logger from '../logger.js'

export class LoiAlurComplianceController {
  static async check(req, res) {
    try {
      const { coproprieteId } = req.params
      const report =
        await loiAlurComplianceService.checkCompliance(coproprieteId)

      if (!report) {
        return res
          .status(404)
          .json({ error: 'Copropriete non trouvee' })
      }

      res.json({ data: report })
    } catch (error) {
      logger.error(
        `[LoiAlurComplianceController] Error: ${error.message}`
      )
      res.status(500).json({
        error:
          'Impossible de verifier la conformite Loi ALUR',
      })
    }
  }
}
