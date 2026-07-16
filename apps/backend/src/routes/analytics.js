import { Router } from 'express'
import { AnalyticsController } from '../controllers/AnalyticsController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireStaff } from '../middleware/authorization.js'

const router = Router()

// Funnel analytics are internal reporting — staff only.
router.get('/funnel', requireAuth(), requireStaff, AnalyticsController.getFunnel)

export default router
