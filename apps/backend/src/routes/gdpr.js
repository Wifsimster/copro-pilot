import { Router } from 'express'
import { GdprConsentController } from '../controllers/GdprConsentController.js'
import { GdprExportController } from '../controllers/GdprExportController.js'
import { GdprErasureController } from '../controllers/GdprErasureController.js'
import { AuditLogController } from '../controllers/AuditLogController.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// Consent management
router.get(
  '/consents',
  requireAuth(),
  GdprConsentController.getMyConsents
)
router.post(
  '/consents',
  requireAuth(),
  GdprConsentController.recordConsent
)
router.delete(
  '/consents',
  requireAuth(),
  GdprConsentController.revokeAll
)

// Data portability (Art. 20)
router.get(
  '/export',
  requireAuth(),
  GdprExportController.exportMyData
)

// Right to erasure (Art. 17)
router.post(
  '/erasure',
  requireAuth(),
  GdprErasureController.requestErasure
)

// Audit log (admin only)
router.get(
  '/audit-log',
  requireAuth(),
  requireAdmin,
  AuditLogController.query
)

export default router
