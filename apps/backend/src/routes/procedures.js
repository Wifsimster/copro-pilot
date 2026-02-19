import { Router } from 'express'
import { ProcedureController } from '../controllers/ProcedureController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), ProcedureController.getAllByCopropriete)
router.get('/:id', requireAuth(), ProcedureController.getById)
router.post('/', requireAuth(), ProcedureController.create)
router.put('/:id', requireAuth(), ProcedureController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, ProcedureController.delete)

export default router
