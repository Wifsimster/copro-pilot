import { Router } from 'express'
import { EmployeSyndicatController } from '../controllers/EmployeSyndicatController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), EmployeSyndicatController.getAllByCopropriete)
router.get('/:id', requireAuth(), EmployeSyndicatController.getById)
router.post('/', requireAuth(), EmployeSyndicatController.create)
router.put('/:id', requireAuth(), EmployeSyndicatController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, EmployeSyndicatController.delete)

export default router
