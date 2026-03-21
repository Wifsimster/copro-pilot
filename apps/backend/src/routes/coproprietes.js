import { Router } from 'express'
import { CoproprieteController } from '../controllers/CoproprieteController.js'
import { FicheSynthetiqueController } from '../controllers/FicheSynthetiqueController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'
import { requireCoproprieteQuota } from '../middleware/requireQuota.js'

const router = Router()

router.get('/', requireAuth(), CoproprieteController.getAll)
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
  CoproprieteController.create
)
router.put('/:id', requireAuth(), CoproprieteController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, CoproprieteController.delete)

export default router
