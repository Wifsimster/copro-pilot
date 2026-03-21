import { Router } from 'express'
import { RegularisationController } from '../controllers/RegularisationController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post(
  '/budget-from-ag',
  requireAuth(),
  RegularisationController.generatePostAgBudget
)
router.post(
  '/appels-from-budget',
  requireAuth(),
  RegularisationController.generateAppelsFondsSchedule
)

export default router
