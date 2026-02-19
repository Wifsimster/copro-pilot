import { Router } from 'express'
import { LotController } from '../controllers/LotController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), LotController.getAllByCopropriete)
router.get('/:id', requireAuth(), LotController.getById)
router.get('/:id/cles-repartition', requireAuth(), LotController.getClesRepartition)
router.post('/', requireAuth(), LotController.create)
router.put('/:id', requireAuth(), LotController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, LotController.delete)

export default router
