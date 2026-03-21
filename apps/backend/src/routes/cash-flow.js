import { Router } from 'express'
import { CashFlowController } from '../controllers/CashFlowController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get(
  '/copropriete/:coproprieteId',
  requireAuth(),
  CashFlowController.getForecast
)

export default router
