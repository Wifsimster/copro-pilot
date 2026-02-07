import { Router } from 'express'
import { DocumentController } from '../controllers/DocumentController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), DocumentController.getAllByCopropriete)
router.get('/:id', requireAuth(), DocumentController.getById)
router.post('/', requireAuth(), DocumentController.create)
router.put('/:id', requireAuth(), DocumentController.update)
router.delete('/:id', requireAuth(), DocumentController.delete)

export default router
