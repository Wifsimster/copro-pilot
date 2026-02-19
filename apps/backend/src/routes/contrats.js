import { Router } from 'express'
import { ContratController } from '../controllers/ContratController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), ContratController.getAllByCopropriete)
router.get('/prestataire/:prestataireId', requireAuth(), ContratController.getByPrestataire)
router.get('/echeances/:coproprieteId', requireAuth(), ContratController.getExpiringSoon)
router.get('/:id', requireAuth(), ContratController.getById)
router.post('/', requireAuth(), ContratController.create)
router.put('/:id', requireAuth(), ContratController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, ContratController.delete)

export default router
