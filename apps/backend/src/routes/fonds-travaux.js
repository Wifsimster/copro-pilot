import { Router } from 'express'
import { FondsTravauxController } from '../controllers/FondsTravauxController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), FondsTravauxController.getAllByCopropriete)
router.get('/:id', requireAuth(), FondsTravauxController.getById)
router.post('/', requireAuth(), FondsTravauxController.create)
router.put('/:id', requireAuth(), FondsTravauxController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, FondsTravauxController.delete)

export default router
