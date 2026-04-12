import { Router } from 'express'
import { CoproprieteController } from '../controllers/CoproprieteController.js'
import { FicheSynthetiqueController } from '../controllers/FicheSynthetiqueController.js'
import { LoiAlurComplianceController } from '../controllers/LoiAlurComplianceController.js'
import { AutoRelanceController } from '../controllers/AutoRelanceController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'
import { requireCoproprieteQuota } from '../middleware/requireQuota.js'
import { validate } from '../middleware/validate.js'
import { coproprieteSchema } from '../schemas/index.js'

const router = Router()

router.get('/', requireAuth(), CoproprieteController.getAll)
router.get(
  '/:coproprieteId/compliance',
  requireAuth(),
  LoiAlurComplianceController.check
)
router.get(
  '/:id/fiche-synthetique',
  requireAuth(),
  FicheSynthetiqueController.get
)
router.get('/:id', requireAuth(), CoproprieteController.getById)
router.post(
  '/',
  requireAuth(),
  requireCoproprieteQuota(),
  validate(coproprieteSchema),
  CoproprieteController.create
)
router.put('/:id', requireAuth(), validate(coproprieteSchema), CoproprieteController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, CoproprieteController.delete)

// Auto-relances
router.post('/:coproprieteId/auto-relances', requireAuth(), AutoRelanceController.generate)

export default router
