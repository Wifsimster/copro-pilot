import { Router } from 'express'
import { AuditLogModel } from '../models/AuditLog.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import logger from '../logger.js'

const router = Router()

/**
 * GET /api/audit/verify-chain
 *
 * Admin-only endpoint that walks the full audit_log hash
 * chain and verifies that every row's stored hash matches
 * its canonical content and links correctly to its
 * predecessor. Returns 200 if the chain is intact, 500 if
 * any tampering is detected.
 */
router.get(
  '/verify-chain',
  requireAuth(),
  requireAdmin,
  async (req, res) => {
    try {
      const result = await AuditLogModel.verifyChain()

      if (!result.valid) {
        logger.error(
          '[AuditRoute] Audit log hash chain verification failed',
          {
            brokenAt: result.brokenAt,
            message: result.message,
          }
        )
        return res.status(500).json({
          valid: false,
          brokenAt: result.brokenAt,
          message: result.message,
          total_entries: result.total,
        })
      }

      return res.status(200).json({
        valid: true,
        total_entries: result.total,
      })
    } catch (error) {
      logger.error(
        `[AuditRoute] Error verifying chain: ${error.message}`
      )
      return res.status(500).json({
        valid: false,
        error: 'Impossible de vérifier la chaîne d\'audit',
      })
    }
  }
)

export default router
