import { Router } from 'express'
import { CoproprieteController } from '../controllers/CoproprieteController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth(), CoproprieteController.getAll)
router.get('/:id', requireAuth(), CoproprieteController.getById)
router.post('/', requireAuth(), CoproprieteController.create)
router.put('/:id', requireAuth(), CoproprieteController.update)
router.delete('/:id', requireAuth(), CoproprieteController.delete)

export default router
