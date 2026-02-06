import { Router } from 'express'
import { MutationController } from '../controllers/MutationController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/lot/:lotId', requireAuth(), MutationController.getAllByLot)
router.post('/', requireAuth(), MutationController.create)
router.delete('/:id', requireAuth(), MutationController.delete)

export default router
