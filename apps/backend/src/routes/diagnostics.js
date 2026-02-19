import { Router } from 'express'
import { DiagnosticController } from '../controllers/DiagnosticController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), DiagnosticController.getAllByCopropriete)
router.get('/:id', requireAuth(), DiagnosticController.getById)
router.post('/', requireAuth(), DiagnosticController.create)
router.put('/:id', requireAuth(), DiagnosticController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, DiagnosticController.delete)

export default router
