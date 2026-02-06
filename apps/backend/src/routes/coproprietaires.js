import { Router } from 'express'
import { CoproprietaireController } from '../controllers/CoproprietaireController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/search', requireAuth(), CoproprietaireController.search)
router.get('/', requireAuth(), CoproprietaireController.getAll)
router.get('/:id', requireAuth(), CoproprietaireController.getById)
router.post('/', requireAuth(), CoproprietaireController.create)
router.put('/:id', requireAuth(), CoproprietaireController.update)
router.delete('/:id', requireAuth(), CoproprietaireController.delete)

export default router
