import { Router } from 'express'
import { ConseilSyndicalController } from '../controllers/ConseilSyndicalController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), ConseilSyndicalController.getAllByCopropriete)
router.get('/:id', requireAuth(), ConseilSyndicalController.getById)
router.post('/', requireAuth(), ConseilSyndicalController.create)
router.put('/:id', requireAuth(), ConseilSyndicalController.update)
router.delete('/:id', requireAuth(), ConseilSyndicalController.delete)

export default router
