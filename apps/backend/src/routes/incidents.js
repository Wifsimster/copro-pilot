import { Router } from 'express'
import { IncidentController } from '../controllers/IncidentController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), IncidentController.getAllByCopropriete)
router.get('/:id', requireAuth(), IncidentController.getById)
router.post('/', requireAuth(), IncidentController.create)
router.put('/:id', requireAuth(), IncidentController.update)
router.delete('/:id', requireAuth(), IncidentController.delete)

export default router
