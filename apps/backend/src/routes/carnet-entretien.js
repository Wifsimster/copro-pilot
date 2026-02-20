import { Router } from 'express'
import { CarnetEntretienController } from '../controllers/CarnetEntretienController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), CarnetEntretienController.getAllByCopropriete)
router.get('/:id', requireAuth(), CarnetEntretienController.getById)
router.post('/', requireAuth(), CarnetEntretienController.create)
router.put('/:id', requireAuth(), CarnetEntretienController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, CarnetEntretienController.delete)

export default router
