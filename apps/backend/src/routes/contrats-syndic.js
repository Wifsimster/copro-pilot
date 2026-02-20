import { Router } from 'express'
import { ContratSyndicController } from '../controllers/ContratSyndicController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), ContratSyndicController.getAllByCopropriete)
router.get('/:id', requireAuth(), ContratSyndicController.getById)
router.post('/', requireAuth(), ContratSyndicController.create)
router.put('/:id', requireAuth(), ContratSyndicController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, ContratSyndicController.delete)

export default router
