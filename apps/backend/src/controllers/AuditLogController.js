import { auditService } from '../services/AuditService.js'
import logger from '../logger.js'

export class AuditLogController {
  static async query(req, res) {
    try {
      const {
        userId,
        action,
        entityType,
        from,
        to,
        page,
        limit,
      } = req.query
      const result = await auditService.query({
        userId,
        action,
        entityType,
        from,
        to,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
      })
      res.json(result)
    } catch (error) {
      logger.error(
        `[AuditLogController] Error: ${error.message}`
      )
      res.status(500).json({
        error:
          "Impossible de recuperer le journal d'audit",
      })
    }
  }
}
