import { Router } from 'express'
import { PaiementController } from '../controllers/PaiementController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), PaiementController.getAllByCopropriete)
router.get('/coproprietaire/:coproprietaireId', requireAuth(), PaiementController.getAllByCoproprietaire)
router.get('/appel-fonds/:appelFondsId', requireAuth(), PaiementController.getAllByAppelFonds)
router.get('/solde/:coproprietaireId', requireAuth(), PaiementController.getSoldeCoproprietaire)
router.get('/:id', requireAuth(), PaiementController.getById)
router.post('/', requireAuth(), PaiementController.create)
router.put('/:id', requireAuth(), PaiementController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, PaiementController.delete)

export default router
