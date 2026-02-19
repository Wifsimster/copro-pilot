import { Router } from 'express'
import { CleRepartitionController } from '../controllers/CleRepartitionController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), CleRepartitionController.getAllByCopropriete)
router.get('/:id', requireAuth(), CleRepartitionController.getById)
router.post('/', requireAuth(), CleRepartitionController.create)
router.put('/:id', requireAuth(), CleRepartitionController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, CleRepartitionController.delete)
router.put('/lot/:lotId/cle/:cleId', requireAuth(), CleRepartitionController.setLotQuotePart)
router.delete('/lot/:lotId/cle/:cleId', requireAuth(), requireAdminForDelete, CleRepartitionController.removeLotQuotePart)

export default router
