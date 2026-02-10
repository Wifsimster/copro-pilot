import { Router } from 'express'
import { RelanceController } from '../controllers/RelanceController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), RelanceController.getAllByCopropriete)
router.get('/:id', requireAuth(), RelanceController.getById)
router.post('/', requireAuth(), RelanceController.create)
router.put('/:id', requireAuth(), RelanceController.update)
router.delete('/:id', requireAuth(), RelanceController.delete)

export default router
