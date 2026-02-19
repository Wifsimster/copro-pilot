import { gdprConsentService } from '../services/GdprConsentService.js'
import logger from '../logger.js'

export class GdprConsentController {
  static async getMyConsents(req, res) {
    try {
      const consents = await gdprConsentService.getUserConsents(
        req.user.id
      )
      res.json({ data: consents })
    } catch (error) {
      logger.error(
        `[GdprConsentController] Error: ${error.message}`
      )
      res.status(500).json({
        error: 'Impossible de recuperer les consentements',
      })
    }
  }

  static async recordConsent(req, res) {
    try {
      const { consent_type, granted, version } = req.body
      if (!consent_type || granted === undefined) {
        return res.status(400).json({
          error: 'consent_type et granted sont requis',
        })
      }
      const result = await gdprConsentService.recordConsent(
        req.user.id,
        consent_type,
        granted,
        { version: version || '1.0' }
      )
      res.status(201).json({ data: result })
    } catch (error) {
      logger.error(
        `[GdprConsentController] Error recording: ${error.message}`
      )
      res.status(500).json({
        error: "Impossible d'enregistrer le consentement",
      })
    }
  }

  static async revokeAll(req, res) {
    try {
      await gdprConsentService.revokeAllConsents(req.user.id)
      res.json({
        message: 'Tous les consentements ont ete revoques',
      })
    } catch (error) {
      logger.error(
        `[GdprConsentController] Error revoking: ${error.message}`
      )
      res.status(500).json({
        error: 'Impossible de revoquer les consentements',
      })
    }
  }
}
