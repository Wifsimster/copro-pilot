import { Router } from 'express'
import { MouvementBancaireController } from '../controllers/MouvementBancaireController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/compte/:compteId', requireAuth(), MouvementBancaireController.getAllByCompte)
router.get('/solde/:compteId', requireAuth(), MouvementBancaireController.getSoldeCompte)
router.get('/:id', requireAuth(), MouvementBancaireController.getById)
router.post('/', requireAuth(), MouvementBancaireController.create)
router.put('/:id', requireAuth(), MouvementBancaireController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, MouvementBancaireController.delete)

export default router
