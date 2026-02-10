import { Router } from 'express'
import { CompteBancaireController } from '../controllers/CompteBancaireController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), CompteBancaireController.getAllByCopropriete)
router.get('/solde/:coproprieteId', requireAuth(), CompteBancaireController.getSoldeTotal)
router.get('/:id', requireAuth(), CompteBancaireController.getById)
router.post('/', requireAuth(), CompteBancaireController.create)
router.put('/:id', requireAuth(), CompteBancaireController.update)
router.delete('/:id', requireAuth(), CompteBancaireController.delete)

export default router
