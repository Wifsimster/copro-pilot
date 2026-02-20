import crypto from 'crypto'
import { AuditLogModel } from '../models/AuditLog.js'
import logger from '../logger.js'

class AuditService {
  hashIp(ip) {
    if (!ip) return null
    return crypto
      .createHash('sha256')
      .update(ip)
      .digest('hex')
      .substring(0, 16)
  }

  async log(entry) {
    try {
      await AuditLogModel.create({
        ...entry,
        ip_hash: entry.ip ? this.hashIp(entry.ip) : null,
      })
    } catch (error) {
      // Audit logging should never break the main flow
      logger.error(
        `[AuditService] Failed to log audit entry: ${error.message}`
      )
    }
  }

  async query(filters) {
    try {
      return await AuditLogModel.query(filters)
    } catch (error) {
      logger.error(
        `[AuditService] Error querying audit log: ${error.message}`
      )
      throw error
    }
  }
}

export const auditService = new AuditService()
