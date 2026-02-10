import { Router } from 'express'
import { SinistreController } from '../controllers/SinistreController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), SinistreController.getAllByCopropriete)
router.get('/assurance/:assuranceId', requireAuth(), SinistreController.getAllByAssurance)
router.get('/:id', requireAuth(), SinistreController.getById)
router.post('/', requireAuth(), SinistreController.create)
router.put('/:id', requireAuth(), SinistreController.update)
router.delete('/:id', requireAuth(), SinistreController.delete)

export default router
