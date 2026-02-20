import { Router } from 'express'
import { InterventionController } from '../controllers/InterventionController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), InterventionController.getAllByCopropriete)
router.get('/incident/:incidentId', requireAuth(), InterventionController.getAllByIncident)
router.get('/:id', requireAuth(), InterventionController.getById)
router.post('/', requireAuth(), InterventionController.create)
router.put('/:id', requireAuth(), InterventionController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, InterventionController.delete)

export default router
