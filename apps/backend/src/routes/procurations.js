import { Router } from 'express'
import { ProcurationController } from '../controllers/ProcurationController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/', requireAuth(), ProcurationController.create)
router.delete('/:id', requireAuth(), ProcurationController.revoke)
router.get('/ag/:agId', requireAuth(), ProcurationController.getByAg)
router.get('/my/:agId', requireAuth(), ProcurationController.getMine)

export default router
