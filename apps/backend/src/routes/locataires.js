import { Router } from 'express'
import { LocataireController } from '../controllers/LocataireController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/lot/:lotId', requireAuth(), LocataireController.getAllByLot)
router.get('/:id', requireAuth(), LocataireController.getById)
router.post('/', requireAuth(), LocataireController.create)
router.put('/:id', requireAuth(), LocataireController.update)
router.delete('/:id', requireAuth(), LocataireController.delete)

export default router
