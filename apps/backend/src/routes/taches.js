import { Router } from 'express'
import { TacheController } from '../controllers/TacheController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth(), TacheController.getAllByUser)
router.get('/copropriete/:coproprieteId', requireAuth(), TacheController.getAllByCopropriete)
router.get('/overdue', requireAuth(), TacheController.getOverdue)
router.get('/:id', requireAuth(), TacheController.getById)
router.post('/', requireAuth(), TacheController.create)
router.put('/:id', requireAuth(), TacheController.update)
router.delete('/:id', requireAuth(), TacheController.delete)

export default router
