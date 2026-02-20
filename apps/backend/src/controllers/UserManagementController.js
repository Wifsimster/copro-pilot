import { UserManagementService } from '../services/UserManagementService.js'
import logger from '../logger.js'

export class UserManagementController {
  static async listCoproprietaireUsers(req, res) {
    try {
      const users =
        await UserManagementService.listCoproprietaireUsers(req.user)
      res.json({ data: users })
    } catch (error) {
      logger.error(
        `[UserManagement] listCoproprietaireUsers error: ${error.message}`
      )
      res
        .status(error.status || 500)
        .json({ error: error.message })
    }
  }

  static async getUserDetails(req, res) {
    try {
      const user = await UserManagementService.getUserDetails(
        req.user,
        req.params.userId
      )
      res.json({ data: user })
    } catch (error) {
      logger.error(
        `[UserManagement] getUserDetails error: ${error.message}`
      )
      res
        .status(error.status || 500)
        .json({ error: error.message })
    }
  }

  static async triggerPasswordReset(req, res) {
    try {
      const { userId } = req.body
      if (!userId) {
        return res
          .status(400)
          .json({ error: 'userId est requis' })
      }
      const result =
        await UserManagementService.triggerPasswordReset(
          req.user,
          userId
        )
      res.json(result)
    } catch (error) {
      logger.error(
        `[UserManagement] triggerPasswordReset error: ${error.message}`
      )
      res
        .status(error.status || 500)
        .json({ error: error.message })
    }
  }

  static async setPasswordDirectly(req, res) {
    try {
      const { userId, newPassword } = req.body
      if (!userId || !newPassword) {
        return res
          .status(400)
          .json({ error: 'userId et newPassword sont requis' })
      }
      const result =
        await UserManagementService.setPasswordDirectly(
          req.user,
          userId,
          newPassword
        )
      res.json(result)
    } catch (error) {
      logger.error(
        `[UserManagement] setPasswordDirectly error: ${error.message}`
      )
      res
        .status(error.status || 500)
        .json({ error: error.message })
    }
  }
}
