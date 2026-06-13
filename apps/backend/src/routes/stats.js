import { Router } from 'express'
import { StatsController } from '../controllers/StatsController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/dashboard', requireAuth(), StatsController.getDashboard)
router.get(
  '/syndic-dashboard',
  requireAuth(),
  StatsController.getSyndicDashboard
)

export default router
