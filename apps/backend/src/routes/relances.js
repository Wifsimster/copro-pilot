import { Router } from 'express'
import { RelanceController } from '../controllers/RelanceController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'
import { validate } from '../middleware/validate.js'
import { relanceSchema } from '../schemas/index.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), RelanceController.getAllByCopropriete)
router.get('/:id', requireAuth(), RelanceController.getById)
router.post('/', requireAuth(), validate(relanceSchema), RelanceController.create)
router.put('/:id', requireAuth(), validate(relanceSchema), RelanceController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, RelanceController.delete)

export default router
