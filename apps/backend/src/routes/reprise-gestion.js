import { Router } from 'express'
import { RepriseGestionController } from '../controllers/RepriseGestionController.js'
import { requireAuth } from '../middleware/auth.js'
import { requirePlan } from '../middleware/requirePlan.js'
import { validate } from '../middleware/validate.js'
import { balanceImportSchema } from '../schemas/index.js'

const router = Router()

// Reprise de gestion (import balance) — accounting feature, Essentiel+.
router.post(
  '/valider-balance',
  requireAuth(),
  requirePlan('essentiel'),
  validate(balanceImportSchema),
  RepriseGestionController.validerBalance
)

export default router
