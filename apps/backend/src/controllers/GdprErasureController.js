import { gdprErasureService } from '../services/GdprErasureService.js'
import logger from '../logger.js'

export class GdprErasureController {
  static async requestErasure(req, res) {
    try {
      const { confirmation } = req.body

      if (confirmation !== 'SUPPRIMER MON COMPTE') {
        return res.status(400).json({
          error:
            'Veuillez confirmer en tapant exactement "SUPPRIMER MON COMPTE"',
        })
      }

      await gdprErasureService.requestErasure(req.user.id)

      res.clearCookie('better-auth.session_token')
      res.json({
        message: 'Votre compte a été supprimé avec succès',
      })
    } catch (error) {
      logger.error(
        `[GdprErasureController] Error: ${error.message}`
      )
      res.status(500).json({
        error: 'Impossible de supprimer votre compte',
      })
    }
  }
}
