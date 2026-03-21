import { Router } from 'express'
import { OrdreServiceController } from '../controllers/OrdreServiceController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), OrdreServiceController.getAllByCopropriete)
router.get('/incident/:incidentId', requireAuth(), OrdreServiceController.getAllByIncident)
router.get('/:id', requireAuth(), OrdreServiceController.getById)
router.post('/', requireAuth(), OrdreServiceController.create)
router.put('/:id', requireAuth(), OrdreServiceController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, OrdreServiceController.delete)

export default router
