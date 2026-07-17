import { Router } from 'express'
import { RepriseGestionController } from '../controllers/RepriseGestionController.js'
import { requireAuth } from '../middleware/auth.js'
import { requirePlan } from '../middleware/requirePlan.js'
import { validate } from '../middleware/validate.js'
import {
  balanceImportSchema,
  balanceRepriseImportSchema,
  soldesInitiauxSchema,
} from '../schemas/index.js'

const router = Router()

// Reprise de gestion (import balance) — accounting feature, Essentiel+.
router.post(
  '/valider-balance',
  requireAuth(),
  requirePlan('essentiel'),
  validate(balanceImportSchema),
  RepriseGestionController.validerBalance
)
router.post(
  '/importer-balance',
  requireAuth(),
  requirePlan('essentiel'),
  validate(balanceRepriseImportSchema),
  RepriseGestionController.importerBalance
)
router.post(
  '/soldes',
  requireAuth(),
  requirePlan('essentiel'),
  validate(soldesInitiauxSchema),
  RepriseGestionController.saveSoldes
)
router.get(
  '/soldes/:coproprieteId/:annee',
  requireAuth(),
  requirePlan('essentiel'),
  RepriseGestionController.getSoldes
)

export default router
