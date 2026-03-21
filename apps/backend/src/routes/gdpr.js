import { Router } from 'express'
import { GdprConsentController } from '../controllers/GdprConsentController.js'
import { GdprExportController } from '../controllers/GdprExportController.js'
import { GdprErasureController } from '../controllers/GdprErasureController.js'
import { AuditLogController } from '../controllers/AuditLogController.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { requirePlan } from '../middleware/requirePlan.js'

const router = Router()

// Consent management — free for all (legal requirement)
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

// Data portability (Art. 20) — free for all (legal requirement)
router.get(
  '/export',
  requireAuth(),
  GdprExportController.exportMyData
)

// Right to erasure (Art. 17) — free for all (legal requirement)
router.post(
  '/erasure',
  requireAuth(),
  GdprErasureController.requestErasure
)

// Audit log (admin only) — requires Entreprise plan
router.get(
  '/audit-log',
  requireAuth(),
  requireAdmin,
  requirePlan('entreprise'),
  AuditLogController.query
)

export default router
