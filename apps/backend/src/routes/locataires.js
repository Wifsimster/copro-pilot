import { Router } from 'express'
import { LocataireController } from '../controllers/LocataireController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/lot/:lotId', requireAuth(), LocataireController.getAllByLot)
router.get('/:id', requireAuth(), LocataireController.getById)
router.post('/', requireAuth(), LocataireController.create)
router.put('/:id', requireAuth(), LocataireController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, LocataireController.delete)

export default router
