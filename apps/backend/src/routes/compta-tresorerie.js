import { Router } from 'express'
import { ComptaTresorerieController } from '../controllers/ComptaTresorerieController.js'
import { requireAuth } from '../middleware/auth.js'
import { requirePlan } from '../middleware/requirePlan.js'

const router = Router()

// Comptabilité de trésorerie simplifiée — accounting feature, Essentiel+.
router.get(
  '/compte/:compteId',
  requireAuth(),
  requirePlan('essentiel'),
  ComptaTresorerieController.getStatement
)

export default router
