import { Router } from 'express'
import { PaiementController } from '../controllers/PaiementController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/coproprietaire/:coproprietaireId', requireAuth(), PaiementController.getAllByCoproprietaire)
router.get('/appel-fonds/:appelFondsId', requireAuth(), PaiementController.getAllByAppelFonds)
router.get('/solde/:coproprietaireId', requireAuth(), PaiementController.getSoldeCoproprietaire)
router.get('/:id', requireAuth(), PaiementController.getById)
router.post('/', requireAuth(), PaiementController.create)
router.put('/:id', requireAuth(), PaiementController.update)
router.delete('/:id', requireAuth(), PaiementController.delete)

export default router
