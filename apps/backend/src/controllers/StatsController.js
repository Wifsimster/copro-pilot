import { statsService } from '../services/StatsService.js'
import logger from '../logger.js'

export class StatsController {
  static async getDashboard(req, res) {
    try {
      const data = await statsService.getDashboardOverview()
      res.json({ data })
    } catch (error) {
      logger.error(
        `[StatsController] Error fetching dashboard stats: ${error.message}`
      )
      res
        .status(500)
        .json({ error: 'Impossible de récupérer les statistiques' })
    }
  }

  static async getSyndicDashboard(req, res) {
    try {
      const coproprieteId = req.query.copropriete_id
        ? Number(req.query.copropriete_id)
        : null
      const data = await statsService.getSyndicDashboard(coproprieteId)
      res.json({ data })
    } catch (error) {
      logger.error(
        `[StatsController] Error fetching syndic dashboard: ${error.message}`
      )
      res
        .status(500)
        .json({ error: 'Impossible de recuperer le tableau de bord' })
    }
  }
}
