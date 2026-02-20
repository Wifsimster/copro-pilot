import { Router } from 'express'
import { DeclarationRegistreController } from '../controllers/DeclarationRegistreController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), DeclarationRegistreController.getAllByCopropriete)
router.get('/copropriete/:coproprieteId/preparer/:annee', requireAuth(), DeclarationRegistreController.preparerDonnees)
router.get('/:id', requireAuth(), DeclarationRegistreController.getById)
router.post('/', requireAuth(), DeclarationRegistreController.create)
router.put('/:id', requireAuth(), DeclarationRegistreController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, DeclarationRegistreController.delete)

export default router
