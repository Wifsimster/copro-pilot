import { Router } from 'express'
import { ContratSyndicController } from '../controllers/ContratSyndicController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), ContratSyndicController.getAllByCopropriete)
router.get('/:id', requireAuth(), ContratSyndicController.getById)
router.post('/', requireAuth(), ContratSyndicController.create)
router.put('/:id', requireAuth(), ContratSyndicController.update)
router.delete('/:id', requireAuth(), ContratSyndicController.delete)

export default router
