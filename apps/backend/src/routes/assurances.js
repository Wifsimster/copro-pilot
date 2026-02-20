import { Router } from 'express'
import { AssuranceController } from '../controllers/AssuranceController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), AssuranceController.getAllByCopropriete)
router.get('/:id', requireAuth(), AssuranceController.getById)
router.post('/', requireAuth(), AssuranceController.create)
router.put('/:id', requireAuth(), AssuranceController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, AssuranceController.delete)

export default router
