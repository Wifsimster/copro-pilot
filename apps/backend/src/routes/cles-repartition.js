import { Router } from 'express'
import { CleRepartitionController } from '../controllers/CleRepartitionController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), CleRepartitionController.getAllByCopropriete)
router.get('/:id', requireAuth(), CleRepartitionController.getById)
router.post('/', requireAuth(), CleRepartitionController.create)
router.put('/:id', requireAuth(), CleRepartitionController.update)
router.delete('/:id', requireAuth(), CleRepartitionController.delete)
router.put('/lot/:lotId/cle/:cleId', requireAuth(), CleRepartitionController.setLotQuotePart)
router.delete('/lot/:lotId/cle/:cleId', requireAuth(), CleRepartitionController.removeLotQuotePart)

export default router
