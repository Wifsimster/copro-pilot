import { Router } from 'express'
import { CoproprietaireController } from '../controllers/CoproprietaireController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'
import { validate } from '../middleware/validate.js'
import { coproprietaireSchema } from '../schemas/index.js'

const router = Router()

router.get('/search', requireAuth(), CoproprietaireController.search)
router.get('/', requireAuth(), CoproprietaireController.getAll)
router.get('/:id', requireAuth(), CoproprietaireController.getById)
router.post('/', requireAuth(), validate(coproprietaireSchema), CoproprietaireController.create)
router.put('/:id', requireAuth(), validate(coproprietaireSchema), CoproprietaireController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, CoproprietaireController.delete)

export default router
