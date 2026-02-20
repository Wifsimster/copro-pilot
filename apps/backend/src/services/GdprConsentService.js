import { GdprConsentModel } from '../models/GdprConsent.js'
import logger from '../logger.js'

class GdprConsentService {
  async getUserConsents(userId) {
    try {
      return await GdprConsentModel.getByUserId(userId)
    } catch (error) {
      logger.error(
        `[GdprConsentService] Error getting consents: ${error.message}`
      )
      throw error
    }
  }

  async recordConsent(userId, consentType, granted, metadata = {}) {
    try {
      const result = await GdprConsentModel.record({
        user_id: userId,
        consent_type: consentType,
        granted,
        version: metadata.version || '1.0',
      })
      logger.info(
        `[GdprConsentService] Consent recorded: type=${consentType}, granted=${granted}`
      )
      return result
    } catch (error) {
      logger.error(
        `[GdprConsentService] Error recording consent: ${error.message}`
      )
      throw error
    }
  }

  async hasRequiredConsents(userId) {
    try {
      const required = [
        'terms_of_service',
        'privacy_policy',
        'data_processing',
      ]
      const consents = await GdprConsentModel.getByUserId(userId)
      return required.every(type =>
        consents.some(c => c.consent_type === type && c.granted)
      )
    } catch (error) {
      logger.error(
        `[GdprConsentService] Error checking consents: ${error.message}`
      )
      throw error
    }
  }

  async revokeAllConsents(userId) {
    try {
      await GdprConsentModel.revokeAll(userId)
      logger.info(
        '[GdprConsentService] All consents revoked'
      )
    } catch (error) {
      logger.error(
        `[GdprConsentService] Error revoking consents: ${error.message}`
      )
      throw error
    }
  }
}

export const gdprConsentService = new GdprConsentService()
