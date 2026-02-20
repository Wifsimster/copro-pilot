import knexDatabase from '../config/knex-database.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

class DataRetentionService {
  async cleanExpiredSessions() {
    const db = getDb()
    const deleted = await db('session')
      .where('expiresAt', '<', db.fn.now())
      .del()
    if (deleted > 0) {
      logger.info(
        `[DataRetention] Purged ${deleted} expired sessions`
      )
    }
    return deleted
  }

  async cleanOldNotifications(daysToKeep = 365) {
    const db = getDb()
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - daysToKeep)

    const deleted = await db('notifications')
      .where('created_at', '<', cutoff.toISOString())
      .where('lu', true)
      .del()
    if (deleted > 0) {
      logger.info(
        `[DataRetention] Purged ${deleted} old read notifications`
      )
    }
    return deleted
  }

  async cleanOldAuditLogs(yearsToKeep = 3) {
    const db = getDb()
    const cutoff = new Date()
    cutoff.setFullYear(cutoff.getFullYear() - yearsToKeep)

    const deleted = await db('audit_log')
      .where('created_at', '<', cutoff.toISOString())
      .del()
    if (deleted > 0) {
      logger.info(
        `[DataRetention] Purged ${deleted} old audit log entries`
      )
    }
    return deleted
  }

  async runAll() {
    await this.cleanExpiredSessions()
    await this.cleanOldNotifications()
    await this.cleanOldAuditLogs()
  }
}

export const dataRetentionService = new DataRetentionService()
