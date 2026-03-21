import { Router } from 'express'
import { ReconciliationController } from '../controllers/ReconciliationController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get(
  '/compte/:compteBancaireId/suggestions',
  requireAuth(),
  ReconciliationController.getSuggestedMatches
)
router.post(
  '/confirmer',
  requireAuth(),
  ReconciliationController.confirmMatch
)

export default router
