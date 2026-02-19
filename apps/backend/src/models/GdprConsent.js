import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class GdprConsentModel {
  static async getByUserId(userId) {
    const db = getDb()
    return db('gdpr_consents')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
  }

  static async getLatestByType(userId, consentType) {
    const db = getDb()
    return db('gdpr_consents')
      .where({ user_id: userId, consent_type: consentType })
      .orderBy('created_at', 'desc')
      .first()
  }

  static async record(data) {
    const db = getDb()
    const [result] = await db('gdpr_consents')
      .insert({
        user_id: data.user_id,
        consent_type: data.consent_type,
        granted: data.granted,
        version: data.version || '1.0',
      })
      .onConflict(['user_id', 'consent_type', 'version'])
      .merge({ granted: data.granted, updated_at: db.fn.now() })
      .returning('*')
    return result
  }

  static async revokeAll(userId) {
    const db = getDb()
    return db('gdpr_consents')
      .where('user_id', userId)
      .update({ granted: false, updated_at: db.fn.now() })
  }
}
