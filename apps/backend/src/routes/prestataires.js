import { Router } from 'express'
import { PrestataireController } from '../controllers/PrestataireController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth(), PrestataireController.getAll)
router.get('/:id', requireAuth(), PrestataireController.getById)
router.post('/', requireAuth(), PrestataireController.create)
router.put('/:id', requireAuth(), PrestataireController.update)
router.delete('/:id', requireAuth(), PrestataireController.delete)

export default router
