import { Router } from 'express'
import { PartieCommuneController } from '../controllers/PartieCommuneController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), PartieCommuneController.getAllByCopropriete)
router.get('/:id', requireAuth(), PartieCommuneController.getById)
router.post('/', requireAuth(), PartieCommuneController.create)
router.put('/:id', requireAuth(), PartieCommuneController.update)
router.delete('/:id', requireAuth(), PartieCommuneController.delete)

export default router
