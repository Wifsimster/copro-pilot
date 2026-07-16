import { analyticsService } from '../services/AnalyticsService.js'
import logger from '../logger.js'

export class AnalyticsController {
  /**
   * GET /api/analytics/funnel?from=ISO&to=ISO
   * Returns the acquisition funnel (signups → activations → conversions →
   * churn by cause) over the given window. Staff-only.
   */
  static async getFunnel(req, res) {
    try {
      const from = req.query.from ? new Date(req.query.from) : undefined
      const to = req.query.to ? new Date(req.query.to) : undefined

      if (from && Number.isNaN(from.getTime())) {
        return res.status(400).json({ error: 'Paramètre "from" invalide' })
      }
      if (to && Number.isNaN(to.getTime())) {
        return res.status(400).json({ error: 'Paramètre "to" invalide' })
      }

      const data = await analyticsService.getFunnel({ from, to })
      res.json({ data })
    } catch (error) {
      logger.error(
        `[AnalyticsController] Error fetching funnel: ${error.message}`
      )
      res
        .status(500)
        .json({ error: 'Impossible de récupérer le funnel' })
    }
  }
}
