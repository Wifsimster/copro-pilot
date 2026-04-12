import { Router } from 'express'
import { IncidentController } from '../controllers/IncidentController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'
import { validate } from '../middleware/validate.js'
import { incidentSchema } from '../schemas/index.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), IncidentController.getAllByCopropriete)
router.get('/:id', requireAuth(), IncidentController.getById)
router.post('/', requireAuth(), validate(incidentSchema), IncidentController.create)
router.put('/:id', requireAuth(), validate(incidentSchema), IncidentController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, IncidentController.delete)

export default router
