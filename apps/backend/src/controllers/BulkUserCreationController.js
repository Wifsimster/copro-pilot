import { BulkUserCreationService } from '../services/BulkUserCreationService.js'
import logger from '../logger.js'

export class BulkUserCreationController {
  static async getBulkCreationPreview(req, res) {
    try {
      const { coproprieteId } = req.params
      const preview =
        await BulkUserCreationService.getPreview(
          req.user,
          parseInt(coproprieteId, 10)
        )
      res.json({ data: preview })
    } catch (error) {
      logger.error(
        `[BulkCreate] Preview error: ${error.message}`
      )
      res
        .status(error.status || 500)
        .json({ error: error.message })
    }
  }

  static async bulkCreate(req, res) {
    try {
      const { coproprieteId } = req.params
      const results =
        await BulkUserCreationService.createUsersForCopropriete(
          req.user,
          parseInt(coproprieteId, 10)
        )
      res.json({
        data: results,
        message: 'Création en masse terminée',
      })
    } catch (error) {
      logger.error(
        `[BulkCreate] Bulk create error: ${error.message}`
      )
      res
        .status(error.status || 500)
        .json({ error: error.message })
    }
  }

  static async setInitialPassword(req, res) {
    try {
      const { newPassword } = req.body
      if (!newPassword) {
        return res
          .status(400)
          .json({ error: 'newPassword est requis' })
      }
      const result =
        await BulkUserCreationService.setInitialPassword(
          req.user,
          newPassword
        )
      res.json(result)
    } catch (error) {
      logger.error(
        `[BulkCreate] Set initial password error: ${error.message}`
      )
      res
        .status(error.status || 500)
        .json({ error: error.message })
    }
  }
}
