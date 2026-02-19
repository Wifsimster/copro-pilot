import { Router } from 'express'
import { PropositionSyndicController } from '../controllers/PropositionSyndicController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), PropositionSyndicController.getAllByCopropriete)
router.get('/:id', requireAuth(), PropositionSyndicController.getById)
router.post('/', requireAuth(), PropositionSyndicController.create)
router.put('/:id', requireAuth(), PropositionSyndicController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, PropositionSyndicController.delete)

export default router
