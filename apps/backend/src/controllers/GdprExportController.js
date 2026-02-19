import { gdprExportService } from '../services/GdprExportService.js'
import logger from '../logger.js'

export class GdprExportController {
  static async exportMyData(req, res) {
    try {
      const data = await gdprExportService.exportUserData(
        req.user.id
      )
      const dateStr = new Date().toISOString().split('T')[0]
      res.setHeader('Content-Type', 'application/json')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="copropilot-donnees-personnelles-${dateStr}.json"`
      )
      res.json(data)
    } catch (error) {
      logger.error(
        `[GdprExportController] Error: ${error.message}`
      )
      res.status(500).json({
        error: "Impossible d'exporter vos donnees",
      })
    }
  }
}
