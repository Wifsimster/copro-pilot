import { Router } from 'express'
import { MutationController } from '../controllers/MutationController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/lot/:lotId', requireAuth(), MutationController.getAllByLot)
router.get('/:id', requireAuth(), MutationController.getById)
router.post('/', requireAuth(), MutationController.create)
router.put('/:id', requireAuth(), MutationController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, MutationController.delete)

export default router
